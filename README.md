# Telecom AI Platform
### Production-Grade Network Intelligence with ML

A full-stack, enterprise-grade platform for telecom network monitoring, anomaly detection, and traffic forecasting. Built with **FastAPI**, **Next.js**, **PyOD**, and **Facebook Prophet**.

---

## 🏗️ Architecture Overview

```
telecom-ai-platform/
│
├── services/                    # Microservices (FastAPI)
│   ├── anomaly-service/         # PyOD + Prophet prediction API
│   ├── auth-service/            # JWT + RBAC authentication
│   ├── telemetry-ingestion/     # Kafka-based metrics ingestion
│   └── ...                      # Other microservices
│
├── apps/
│   └── web-dashboard/           # Next.js + Tailwind frontend
│
├── ml/                          # ML Training Pipelines
│   ├── data/                    # Synthetic data generator
│   ├── anomaly-detection/       # PyOD training scripts
│   ├── traffic-forecasting/     # Prophet training scripts
│   └── run_pipeline.py          # Full pipeline orchestrator
│
├── infrastructure/              # Deployment configs
│   ├── nginx/                   # API gateway
│   ├── kubernetes/              # K8s manifests
│   └── terraform/               # Cloud infrastructure
│
└── docker-compose.yml           # Local development stack
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional, for containerized deployment)

### 1. Generate Synthetic Data
```bash
cd ml/data
pip install pandas numpy
python generate_synthetic_data.py --rows 50000 --output_dir ./output
```
This creates:
- `output/network_performance.csv` — 50K rows of network metrics with 5% anomaly injection
- `output/event_logs.csv` — Correlated event/failure logs

### 2. Train ML Models
```bash
# Install ML dependencies
cd ml
pip install -r requirements.txt

# Run the full pipeline (data → train PyOD → train Prophet → validate)
python run_pipeline.py
```

Or train individually:
```bash
# PyOD anomaly detection
cd ml/anomaly-detection
python train_anomaly_detector.py --data_path ../data/output/network_performance.csv --model_dir ./saved_models

# Prophet forecasting
cd ml/traffic-forecasting
python train_prophet_forecaster.py --data_path ../data/output/network_performance.csv --model_dir ./saved_models
```

### 3. Start the Prediction API
```bash
cd services/anomaly-service
pip install -r requirements.txt

# Set model paths (update to your actual paths)
export MODELS_DIR=../../ml/anomaly-detection/saved_models
export PROPHET_DIR=../../ml/traffic-forecasting/saved_models

uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
API docs available at: http://localhost:8001/docs

### 4. Start the Frontend
```bash
cd apps/web-dashboard
npm install
npm run dev
```
Dashboard at: http://localhost:3000

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/predict-anomaly` | POST | Single measurement anomaly detection (PyOD ensemble) |
| `/predict-anomaly/batch` | POST | Batch anomaly detection |
| `/predict-traffic` | POST | Bandwidth/latency forecast (Prophet) |
| `/upload-data` | POST | Upload CSV network logs with auto-analysis |
| `/health` | GET | Service health & model status |
| `/models/status` | GET | Loaded model metadata |

### Example: Predict Anomaly
```bash
curl -X POST http://localhost:8001/predict-anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "tower_id": "TOWER-0001",
    "latency_ms": 250.0,
    "packet_loss_pct": 15.5,
    "bandwidth_usage_mbps": 950.0,
    "user_count": 900,
    "cpu_usage_pct": 95.0,
    "memory_usage_pct": 88.0
  }'
```

### Example: Forecast Traffic
```bash
curl -X POST http://localhost:8001/predict-traffic \
  -H "Content-Type: application/json" \
  -d '{"metric": "bandwidth", "periods": 24}'
```

---

## 🤖 ML Models

### Anomaly Detection (PyOD Ensemble)
Three models run in parallel; their scores are averaged:

| Model | Type | Strength |
|---|---|---|
| **Isolation Forest** | Tree-based | Fast, handles high-dimensional data |
| **LOF** | Density-based | Detects local deviations |
| **One-Class SVM** | Kernel-based | Robust boundary learning |

**Features used:** `latency_ms`, `packet_loss_pct`, `bandwidth_usage_mbps`, `user_count`, `cpu_usage_pct`, `memory_usage_pct`

### Traffic Forecasting (Prophet)
Separate models for bandwidth and latency:
- Daily seasonality (diurnal traffic patterns)
- Weekly seasonality (weekday vs weekend)
- Automatic changepoint detection
- 95% prediction intervals

---

## 🐳 Docker Deployment

### Full Stack (docker-compose)
```bash
docker-compose up --build
```

### Individual Services
```bash
# Build prediction service
docker build -t telecom-ai/anomaly-service ./services/anomaly-service

# Build frontend
docker build -t telecom-ai/web-dashboard ./apps/web-dashboard
```

---

## 🔄 Automated Retraining

Schedule `ml/run_pipeline.py` via cron for periodic retraining:

```bash
# Retrain every 7 days at midnight
0 0 */7 * * cd /path/to/ml && python run_pipeline.py >> /var/log/ml-pipeline.log 2>&1
```

---

## 📊 Replacing Synthetic Data with Real Data

1. Prepare your CSV with the same columns:
   ```
   timestamp, tower_id, latency_ms, packet_loss_pct,
   bandwidth_usage_mbps, user_count, cpu_usage_pct, memory_usage_pct
   ```

2. Run training scripts with `--data_path` pointing to your real data:
   ```bash
   python train_anomaly_detector.py --data_path /path/to/real_data.csv
   python train_prophet_forecaster.py --data_path /path/to/real_data.csv
   ```

3. Restart the prediction service to load new models.

---

## 🧩 Adding New ML Models

The architecture is modular. To add a new model (e.g., digital twin, edge AI):

1. Create a new directory under `ml/` with training scripts
2. Add a new `predict-*` endpoint in `services/anomaly-service/main.py`
3. Register the model in `ModelRegistry`
4. Add a frontend component to visualize results

---

## 📁 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.11 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Anomaly Detection | PyOD (Isolation Forest, LOF, OCSVM) |
| Forecasting | Facebook Prophet |
| Charts | Recharts, Three.js |
| Animations | Framer Motion |
| Infrastructure | Docker, Kubernetes, Nginx |
| Monitoring | Prometheus, Grafana |
| Streaming | Kafka |
| Database | PostgreSQL, Redis |

---

## 📄 License

Proprietary — TelcomAI Corp. All rights reserved.
