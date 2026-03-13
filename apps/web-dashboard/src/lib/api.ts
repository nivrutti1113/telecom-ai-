/**
 * Telecom AI — API Client
 * ========================
 * Central API client for communicating with the FastAPI prediction backend.
 * All endpoints use typed request/response schemas.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NetworkMetrics {
  tower_id: string;
  latency_ms: number;
  packet_loss_pct: number;
  bandwidth_usage_mbps: number;
  user_count: number;
  cpu_usage_pct: number;
  memory_usage_pct: number;
}

export interface AnomalyPrediction {
  tower_id: string;
  is_anomaly: boolean;
  anomaly_score: number;
  confidence: number;
  model_scores: Record<string, number>;
  timestamp: string;
}

export interface BatchAnomalyResponse {
  predictions: AnomalyPrediction[];
  total: number;
  anomalies_detected: number;
}

export interface TrafficForecastRequest {
  tower_id?: string;
  metric: "bandwidth" | "latency";
  periods: number;
}

export interface TrafficForecastPoint {
  timestamp: string;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
}

export interface TrafficForecastResponse {
  tower_id: string;
  metric: string;
  forecast: TrafficForecastPoint[];
  model_metadata: Record<string, any>;
}

export interface UploadResponse {
  filename: string;
  rows_processed: number;
  columns: string[];
  anomaly_summary?: {
    total_rows_analyzed: number;
    anomalies_found: number;
    anomaly_rate: number;
  };
  upload_id: string;
}

export interface ModelStatus {
  anomaly_models_loaded: boolean;
  prophet_models_loaded: Record<string, boolean>;
  scaler_loaded: boolean;
  config?: Record<string, any>;
}

// ─── API Functions ─────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Predict if a single measurement is anomalous (PyOD ensemble).
 */
export async function predictAnomaly(
  metrics: NetworkMetrics
): Promise<AnomalyPrediction> {
  return apiFetch<AnomalyPrediction>("/predict-anomaly", {
    method: "POST",
    body: JSON.stringify(metrics),
  });
}

/**
 * Batch anomaly prediction for multiple measurements.
 */
export async function predictAnomalyBatch(
  metrics: NetworkMetrics[]
): Promise<BatchAnomalyResponse> {
  return apiFetch<BatchAnomalyResponse>("/predict-anomaly/batch", {
    method: "POST",
    body: JSON.stringify({ metrics }),
  });
}

/**
 * Forecast bandwidth or latency using Prophet.
 */
export async function predictTraffic(
  request: TrafficForecastRequest
): Promise<TrafficForecastResponse> {
  return apiFetch<TrafficForecastResponse>("/predict-traffic", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Upload a CSV file of network logs.
 */
export async function uploadData(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload-data`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Upload error: ${res.status}`);
  }

  return res.json();
}

/**
 * Get model status/health.
 */
export async function getModelStatus(): Promise<ModelStatus> {
  return apiFetch<ModelStatus>("/models/status");
}

/**
 * Health check.
 */
export async function healthCheck(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health");
}
