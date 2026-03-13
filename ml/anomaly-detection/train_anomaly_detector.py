"""
PyOD Anomaly Detection Training Pipeline
==========================================
Trains an ensemble of anomaly detectors (Isolation Forest + LOF + OCSVM)
on telecom network performance data.

Usage:
    python train_anomaly_detector.py --data_path ../data/output/network_performance.csv --model_dir ./saved_models

Output:
    - Trained PyOD model (joblib serialized)
    - Scaler (StandardScaler)
    - Training metrics JSON
"""

import argparse
import json
import os
import warnings
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    precision_score,
    recall_score,
    f1_score,
)

# PyOD models
from pyod.models.iforest import IForest
from pyod.models.lof import LOF
from pyod.models.ocsvm import OCSVM
from pyod.models.combination import average as pyod_average

warnings.filterwarnings("ignore")


# ─── Feature Engineering ───────────────────────────────────────────────────────

FEATURE_COLS = [
    "latency_ms",
    "packet_loss_pct",
    "bandwidth_usage_mbps",
    "user_count",
    "cpu_usage_pct",
    "memory_usage_pct",
]


def preprocess(df: pd.DataFrame) -> tuple:
    """
    Clean and prepare features for anomaly detection.
    Returns: (X_scaled, y_true, scaler, feature_names)
    """
    data = df.copy()
    data = data.dropna(subset=FEATURE_COLS)

    X = data[FEATURE_COLS].values
    y = data["anomaly_label"].values if "anomaly_label" in data.columns else None

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler, FEATURE_COLS


# ─── Training ──────────────────────────────────────────────────────────────────

def train_ensemble(X_train: np.ndarray, contamination: float = 0.05):
    """
    Train an ensemble of 3 anomaly detectors and combine their scores.

    Models:
        1. Isolation Forest — tree-based isolation of anomalies
        2. LOF (Local Outlier Factor) — density-based local deviation
        3. One-Class SVM — kernel-based novelty detection

    Returns: dict of trained models
    """
    print("  🌲 Training Isolation Forest...")
    iforest = IForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
        behaviour="new",
    )
    iforest.fit(X_train)

    print("  📊 Training LOF (Local Outlier Factor)...")
    lof = LOF(
        n_neighbors=20,
        contamination=contamination,
    )
    lof.fit(X_train)

    print("  🔮 Training One-Class SVM...")
    ocsvm = OCSVM(
        kernel="rbf",
        contamination=contamination,
    )
    ocsvm.fit(X_train)

    return {
        "iforest": iforest,
        "lof": lof,
        "ocsvm": ocsvm,
    }


def ensemble_predict(models: dict, X: np.ndarray) -> tuple:
    """
    Get ensemble anomaly predictions by averaging decision scores.
    Returns: (labels, scores)
      - labels: 0 = normal, 1 = anomaly
      - scores: averaged anomaly score (higher = more anomalous)
    """
    scores_list = []
    for name, model in models.items():
        scores_list.append(model.decision_function(X))

    # Average the scores and threshold at 0 (PyOD convention)
    avg_scores = np.mean(scores_list, axis=0)
    labels = (avg_scores > np.percentile(avg_scores, 95)).astype(int)

    return labels, avg_scores


# ─── Evaluation ────────────────────────────────────────────────────────────────

def evaluate(y_true, y_pred, scores):
    """Calculate and print metrics."""
    metrics = {
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_true, y_pred, zero_division=0), 4),
        "anomalies_detected": int(y_pred.sum()),
        "total_samples": int(len(y_true)),
        "anomaly_rate": round(float(y_pred.mean()), 4),
    }
    print("\n─── Evaluation Metrics ───────────────────────")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
    print("──────────────────────────────────────────────")
    return metrics


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train PyOD anomaly detection models")
    parser.add_argument("--data_path", type=str, required=True)
    parser.add_argument("--model_dir", type=str, default="./saved_models")
    parser.add_argument("--contamination", type=float, default=0.05)
    parser.add_argument("--test_size", type=float, default=0.2)
    args = parser.parse_args()

    os.makedirs(args.model_dir, exist_ok=True)

    # 1. Load data
    print(f"📂 Loading data from {args.data_path}...")
    df = pd.read_csv(args.data_path)
    print(f"   Loaded {len(df)} rows, {df['anomaly_label'].sum()} anomalies")

    # 2. Preprocess
    print("⚙️  Preprocessing features...")
    X, y, scaler, features = preprocess(df)

    # 3. Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, stratify=y, random_state=42
    )
    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    # 4. Train
    print("\n🚀 Training anomaly detection ensemble...")
    models = train_ensemble(X_train, contamination=args.contamination)

    # 5. Evaluate
    y_pred, scores = ensemble_predict(models, X_test)
    metrics = evaluate(y_test, y_pred, scores)

    # 6. Save artifacts
    print("\n💾 Saving models and artifacts...")

    for name, model in models.items():
        path = os.path.join(args.model_dir, f"anomaly_{name}.joblib")
        joblib.dump(model, path)
        print(f"   Saved {path}")

    scaler_path = os.path.join(args.model_dir, "scaler.joblib")
    joblib.dump(scaler, scaler_path)
    print(f"   Saved {scaler_path}")

    # Save feature column names
    config = {
        "feature_columns": features,
        "contamination": args.contamination,
        "trained_at": datetime.utcnow().isoformat(),
        "training_samples": len(X_train),
        "metrics": metrics,
    }
    config_path = os.path.join(args.model_dir, "model_config.json")
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"   Saved {config_path}")

    print("\n✅ Training complete!")


if __name__ == "__main__":
    main()
