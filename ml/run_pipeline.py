"""
ML Pipeline Orchestrator
========================
Single script to generate data → train all models → validate outputs.

Usage:
    python run_pipeline.py

This is the entry point for the entire ML lifecycle.
Can be scheduled via cron or Airflow for automated retraining.
"""

import os
import subprocess
import sys
from datetime import datetime


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data", "output")
ANOMALY_DIR = os.path.join(BASE_DIR, "anomaly-detection")
FORECAST_DIR = os.path.join(BASE_DIR, "traffic-forecasting")
ANOMALY_MODELS = os.path.join(ANOMALY_DIR, "saved_models")
PROPHET_MODELS = os.path.join(FORECAST_DIR, "saved_models")


def run_step(name: str, cmd: list, cwd: str):
    """Run a pipeline step and handle errors."""
    print(f"\n{'='*60}")
    print(f"  STEP: {name}")
    print(f"  TIME: {datetime.utcnow().isoformat()}")
    print(f"{'='*60}\n")

    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=False,
    )

    if result.returncode != 0:
        print(f"\n❌ FAILED: {name}")
        sys.exit(1)
    else:
        print(f"\n✅ PASSED: {name}")


def main():
    print("""
    ╔══════════════════════════════════════════════════╗
    ║    Telecom AI — ML Pipeline Orchestrator        ║
    ║    Generating Data → Training → Validating      ║
    ╚══════════════════════════════════════════════════╝
    """)

    # Step 1: Generate synthetic data
    run_step(
        "Generate Synthetic Data",
        [
            sys.executable,
            os.path.join(BASE_DIR, "data", "generate_synthetic_data.py"),
            "--rows", "50000",
            "--output_dir", DATA_DIR,
        ],
        cwd=BASE_DIR,
    )

    data_path = os.path.join(DATA_DIR, "network_performance.csv")

    # Step 2: Train PyOD anomaly detectors
    run_step(
        "Train PyOD Anomaly Detectors",
        [
            sys.executable,
            os.path.join(ANOMALY_DIR, "train_anomaly_detector.py"),
            "--data_path", data_path,
            "--model_dir", ANOMALY_MODELS,
        ],
        cwd=ANOMALY_DIR,
    )

    # Step 3: Train Prophet forecasters
    run_step(
        "Train Prophet Traffic Forecasters",
        [
            sys.executable,
            os.path.join(FORECAST_DIR, "train_prophet_forecaster.py"),
            "--data_path", data_path,
            "--model_dir", PROPHET_MODELS,
        ],
        cwd=FORECAST_DIR,
    )

    # Step 4: Validate all model files exist
    print(f"\n{'='*60}")
    print("  STEP: Validate Artifacts")
    print(f"{'='*60}\n")

    expected_files = [
        os.path.join(ANOMALY_MODELS, "anomaly_iforest.joblib"),
        os.path.join(ANOMALY_MODELS, "anomaly_lof.joblib"),
        os.path.join(ANOMALY_MODELS, "anomaly_ocsvm.joblib"),
        os.path.join(ANOMALY_MODELS, "scaler.joblib"),
        os.path.join(ANOMALY_MODELS, "model_config.json"),
        os.path.join(PROPHET_MODELS, "prophet_bandwidth_ALL_TOWERS.joblib"),
        os.path.join(PROPHET_MODELS, "prophet_latency_ALL_TOWERS.joblib"),
    ]

    all_exist = True
    for f in expected_files:
        exists = os.path.exists(f)
        status = "✅" if exists else "❌"
        print(f"  {status} {os.path.basename(f)}")
        if not exists:
            all_exist = False

    if all_exist:
        print("\n✅ All artifacts validated. Pipeline complete!")
    else:
        print("\n⚠️  Some artifacts are missing. Check errors above.")
        sys.exit(1)

    print(f"\n  Anomaly models: {ANOMALY_MODELS}")
    print(f"  Prophet models: {PROPHET_MODELS}")
    print(f"  Completed at:   {datetime.utcnow().isoformat()}")


if __name__ == "__main__":
    main()
