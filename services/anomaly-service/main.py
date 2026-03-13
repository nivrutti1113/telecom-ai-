"""
Telecom AI — Prediction Service (FastAPI)
==========================================
Production-ready API for anomaly detection and traffic forecasting.

Endpoints:
    POST /predict-anomaly   → PyOD ensemble inference
    POST /predict-traffic   → Prophet bandwidth/latency forecast
    POST /upload-data       → Upload CSV network logs
    GET  /health            → Service health check
    GET  /models/status     → Loaded model metadata
"""

import io
import json
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel, Field

# ─── Structured Logging ────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
)
logger = logging.getLogger("prediction-service")


# ─── Pydantic Schemas ──────────────────────────────────────────────────────────

class NetworkMetrics(BaseModel):
    """Input schema for a single network measurement."""
    tower_id: str = Field(..., example="TOWER-0001")
    latency_ms: float = Field(..., ge=0, example=25.4)
    packet_loss_pct: float = Field(..., ge=0, le=100, example=0.12)
    bandwidth_usage_mbps: float = Field(..., ge=0, example=420.5)
    user_count: int = Field(..., ge=0, example=350)
    cpu_usage_pct: float = Field(..., ge=0, le=100, example=42.3)
    memory_usage_pct: float = Field(..., ge=0, le=100, example=55.1)


class AnomalyPrediction(BaseModel):
    """Output schema for anomaly detection."""
    tower_id: str
    is_anomaly: bool
    anomaly_score: float
    confidence: float
    model_scores: Dict[str, float]
    timestamp: str


class BatchAnomalyRequest(BaseModel):
    """Batch request for multiple network metric inputs."""
    metrics: List[NetworkMetrics]


class BatchAnomalyResponse(BaseModel):
    """Batch response for anomaly predictions."""
    predictions: List[AnomalyPrediction]
    total: int
    anomalies_detected: int


class TrafficForecastRequest(BaseModel):
    """Input for traffic forecasting."""
    tower_id: Optional[str] = None
    metric: str = Field("bandwidth", pattern="^(bandwidth|latency)$")
    periods: int = Field(24, ge=1, le=720)


class TrafficForecastPoint(BaseModel):
    """Single forecast point."""
    timestamp: str
    predicted_value: float
    lower_bound: float
    upper_bound: float


class TrafficForecastResponse(BaseModel):
    """Response for traffic forecasting."""
    tower_id: str
    metric: str
    forecast: List[TrafficForecastPoint]
    model_metadata: Dict


class UploadResponse(BaseModel):
    """Response for data upload."""
    filename: str
    rows_processed: int
    columns: List[str]
    anomaly_summary: Optional[Dict] = None
    upload_id: str


class ModelStatus(BaseModel):
    """Model metadata."""
    anomaly_models_loaded: bool
    prophet_models_loaded: Dict[str, bool]
    scaler_loaded: bool
    config: Optional[Dict] = None


# ─── Model Registry ───────────────────────────────────────────────────────────

class ModelRegistry:
    """
    Manages loading, caching, and serving ML models.
    Supports hot-reloading of models without service restart.
    """

    def __init__(self):
        self.anomaly_models: Dict = {}
        self.scaler = None
        self.prophet_models: Dict = {}
        self.config: Dict = {}
        self.feature_columns: List[str] = []
        self.models_dir = os.getenv(
            "MODELS_DIR", 
            os.path.join(os.path.dirname(__file__), "..", "ml", "anomaly-detection", "saved_models")
        )
        self.prophet_dir = os.getenv(
            "PROPHET_DIR",
            os.path.join(os.path.dirname(__file__), "..", "ml", "traffic-forecasting", "saved_models")
        )

    def load_anomaly_models(self):
        """Load PyOD anomaly detection models from disk."""
        try:
            model_dir = self.models_dir
            for model_name in ["iforest", "lof", "ocsvm"]:
                path = os.path.join(model_dir, f"anomaly_{model_name}.joblib")
                if os.path.exists(path):
                    self.anomaly_models[model_name] = joblib.load(path)
                    logger.info(f"Loaded anomaly model: {model_name}")

            scaler_path = os.path.join(model_dir, "scaler.joblib")
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                logger.info("Loaded scaler")

            config_path = os.path.join(model_dir, "model_config.json")
            if os.path.exists(config_path):
                with open(config_path) as f:
                    self.config = json.load(f)
                self.feature_columns = self.config.get("feature_columns", [])
                logger.info(f"Loaded config: {self.config.get('trained_at', 'unknown')}")
        except Exception as e:
            logger.warning(f"Could not load anomaly models: {e}")

    def load_prophet_models(self):
        """Load Prophet forecasting models from disk."""
        try:
            model_dir = self.prophet_dir
            for metric in ["bandwidth", "latency"]:
                # Try ALL_TOWERS variant first
                for suffix in ["ALL_TOWERS"]:
                    path = os.path.join(model_dir, f"prophet_{metric}_{suffix}.joblib")
                    if os.path.exists(path):
                        self.prophet_models[metric] = joblib.load(path)
                        logger.info(f"Loaded Prophet model: {metric} ({suffix})")
                        break
        except Exception as e:
            logger.warning(f"Could not load Prophet models: {e}")

    def predict_anomaly(self, metrics: NetworkMetrics) -> AnomalyPrediction:
        """Run anomaly detection inference on a single input."""
        if not self.anomaly_models:
            raise HTTPException(
                status_code=503,
                detail="Anomaly models not loaded. Train models first."
            )

        # Build feature vector
        feature_values = [
            metrics.latency_ms,
            metrics.packet_loss_pct,
            metrics.bandwidth_usage_mbps,
            metrics.user_count,
            metrics.cpu_usage_pct,
            metrics.memory_usage_pct,
        ]
        X = np.array([feature_values])

        if self.scaler:
            X = self.scaler.transform(X)

        # Get scores from each model
        model_scores = {}
        raw_scores = []
        for name, model in self.anomaly_models.items():
            score = float(model.decision_function(X)[0])
            model_scores[name] = round(score, 4)
            raw_scores.append(score)

        # Ensemble: average scores
        avg_score = float(np.mean(raw_scores))
        # PyOD convention: higher score = more anomalous
        # Threshold: score > 0 typically indicates anomaly
        is_anomaly = avg_score > 0
        confidence = min(1.0, abs(avg_score) / 2.0)  # Normalize to 0-1

        return AnomalyPrediction(
            tower_id=metrics.tower_id,
            is_anomaly=is_anomaly,
            anomaly_score=round(avg_score, 4),
            confidence=round(confidence, 4),
            model_scores=model_scores,
            timestamp=datetime.utcnow().isoformat(),
        )

    def predict_traffic(self, request: TrafficForecastRequest) -> TrafficForecastResponse:
        """Run traffic forecast using Prophet."""
        metric = request.metric
        if metric not in self.prophet_models:
            raise HTTPException(
                status_code=503,
                detail=f"Prophet model for '{metric}' not loaded. Train models first."
            )

        model = self.prophet_models[metric]
        future = model.make_future_dataframe(periods=request.periods, freq="h")
        forecast = model.predict(future)

        # Return only the forecasted periods (not historical)
        forecast_points = []
        for _, row in forecast.tail(request.periods).iterrows():
            forecast_points.append(TrafficForecastPoint(
                timestamp=row["ds"].isoformat(),
                predicted_value=round(float(row["yhat"]), 2),
                lower_bound=round(float(row["yhat_lower"]), 2),
                upper_bound=round(float(row["yhat_upper"]), 2),
            ))

        return TrafficForecastResponse(
            tower_id=request.tower_id or "ALL_TOWERS",
            metric=metric,
            forecast=forecast_points,
            model_metadata={
                "model_type": "Prophet",
                "periods_forecasted": request.periods,
                "generated_at": datetime.utcnow().isoformat(),
            },
        )


# ─── Application Lifecycle ────────────────────────────────────────────────────

registry = ModelRegistry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, cleanup on shutdown."""
    logger.info("🚀 Starting Prediction Service...")
    registry.load_anomaly_models()
    registry.load_prophet_models()
    logger.info("✅ Service ready")
    yield
    logger.info("🛑 Shutting down Prediction Service")


# ─── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Telecom AI Prediction Service",
    description="Production anomaly detection (PyOD) and traffic forecasting (Prophet) API.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Service health and readiness probe."""
    return {
        "status": "healthy",
        "service": "prediction-service",
        "timestamp": datetime.utcnow().isoformat(),
        "models": {
            "anomaly": bool(registry.anomaly_models),
            "prophet": {k: True for k in registry.prophet_models},
        },
    }


@app.get("/models/status", response_model=ModelStatus)
async def model_status():
    """Get loaded model metadata."""
    return ModelStatus(
        anomaly_models_loaded=bool(registry.anomaly_models),
        prophet_models_loaded={k: True for k in registry.prophet_models},
        scaler_loaded=registry.scaler is not None,
        config=registry.config,
    )


@app.post("/predict-anomaly", response_model=AnomalyPrediction)
async def predict_anomaly(metrics: NetworkMetrics):
    """
    Predict if a single network measurement is anomalous.

    Uses an ensemble of Isolation Forest, LOF, and One-Class SVM.
    Returns an anomaly score, boolean flag, and per-model scores.
    """
    return registry.predict_anomaly(metrics)


@app.post("/predict-anomaly/batch", response_model=BatchAnomalyResponse)
async def predict_anomaly_batch(request: BatchAnomalyRequest):
    """
    Batch anomaly prediction for multiple network measurements.
    """
    predictions = [registry.predict_anomaly(m) for m in request.metrics]
    anomalies = sum(1 for p in predictions if p.is_anomaly)

    return BatchAnomalyResponse(
        predictions=predictions,
        total=len(predictions),
        anomalies_detected=anomalies,
    )


@app.post("/predict-traffic", response_model=TrafficForecastResponse)
async def predict_traffic(request: TrafficForecastRequest):
    """
    Forecast future bandwidth or latency using Prophet.

    Supports 1 to 720 hour forecasts (up to 30 days).
    Returns predicted values with confidence intervals.
    """
    return registry.predict_traffic(request)


@app.post("/upload-data", response_model=UploadResponse)
async def upload_data(file: UploadFile = File(...)):
    """
    Upload a CSV file containing network performance logs.

    Expected columns:
        timestamp, tower_id, latency_ms, packet_loss_pct,
        bandwidth_usage_mbps, user_count, cpu_usage_pct, memory_usage_pct

    File is validated, stored, and optionally analyzed for anomalies.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")

    # Validate required columns
    required_cols = [
        "timestamp", "tower_id", "latency_ms", "packet_loss_pct",
        "bandwidth_usage_mbps", "user_count", "cpu_usage_pct", "memory_usage_pct"
    ]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns: {missing}"
        )

    # Save uploaded file
    upload_id = str(uuid.uuid4())[:8]
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    upload_path = os.path.join(upload_dir, f"{upload_id}_{file.filename}")
    with open(upload_path, "wb") as f:
        f.write(contents)

    # Quick anomaly analysis if models are loaded
    anomaly_summary = None
    if registry.anomaly_models:
        anomaly_count = 0
        for _, row in df.iterrows():
            try:
                m = NetworkMetrics(
                    tower_id=str(row["tower_id"]),
                    latency_ms=float(row["latency_ms"]),
                    packet_loss_pct=float(row["packet_loss_pct"]),
                    bandwidth_usage_mbps=float(row["bandwidth_usage_mbps"]),
                    user_count=int(row["user_count"]),
                    cpu_usage_pct=float(row["cpu_usage_pct"]),
                    memory_usage_pct=float(row["memory_usage_pct"]),
                )
                pred = registry.predict_anomaly(m)
                if pred.is_anomaly:
                    anomaly_count += 1
            except Exception:
                continue
        anomaly_summary = {
            "total_rows_analyzed": len(df),
            "anomalies_found": anomaly_count,
            "anomaly_rate": round(anomaly_count / max(1, len(df)), 4),
        }

    return UploadResponse(
        filename=file.filename,
        rows_processed=len(df),
        columns=list(df.columns),
        anomaly_summary=anomaly_summary,
        upload_id=upload_id,
    )


# ─── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
