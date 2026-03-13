"""
Prophet Traffic Forecasting Training Pipeline
===============================================
Trains Facebook Prophet models to forecast bandwidth and latency
per tower based on historical network performance data.

Usage:
    python train_prophet_forecaster.py --data_path ../data/output/network_performance.csv --model_dir ./saved_models

Output:
    - Serialized Prophet model per metric (bandwidth, latency)
    - Forecast configuration JSON
"""

import argparse
import json
import os
import warnings
from datetime import datetime

import joblib
import pandas as pd
from prophet import Prophet

warnings.filterwarnings("ignore")


# ─── Configuration ──────────────────────────────────────────────────────────────

FORECAST_METRICS = {
    "bandwidth": "bandwidth_usage_mbps",
    "latency": "latency_ms",
}

DEFAULT_FORECAST_PERIODS = 168  # 7 days of hourly data


# ─── Data Preparation ──────────────────────────────────────────────────────────

def prepare_prophet_data(
    df: pd.DataFrame,
    target_col: str,
    tower_id: str = None,
    freq: str = "h",  # hourly aggregation
) -> pd.DataFrame:
    """
    Prepare data in the format Prophet expects: columns 'ds' and 'y'.
    Aggregates by hour and optionally filters to a specific tower.
    """
    data = df.copy()
    data["timestamp"] = pd.to_datetime(data["timestamp"])

    if tower_id:
        data = data[data["tower_id"] == tower_id]

    # Aggregate by hour
    data = data.set_index("timestamp")
    hourly = data[target_col].resample(freq).mean().dropna()

    prophet_df = pd.DataFrame({
        "ds": hourly.index,
        "y": hourly.values,
    })

    return prophet_df


# ─── Training ──────────────────────────────────────────────────────────────────

def train_prophet_model(
    prophet_df: pd.DataFrame,
    yearly_seasonality: bool = False,
    weekly_seasonality: bool = True,
    daily_seasonality: bool = True,
) -> Prophet:
    """
    Train a Prophet model on prepared data.

    Includes:
        - Daily seasonality (captures diurnal traffic pattern)
        - Weekly seasonality (weekday vs weekend)
        - Changepoint detection for trend shifts
    """
    model = Prophet(
        yearly_seasonality=yearly_seasonality,
        weekly_seasonality=weekly_seasonality,
        daily_seasonality=daily_seasonality,
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
        interval_width=0.95,
    )

    model.fit(prophet_df)
    return model


def generate_forecast(model: Prophet, periods: int = DEFAULT_FORECAST_PERIODS):
    """
    Generate future predictions.
    Returns: DataFrame with ds, yhat, yhat_lower, yhat_upper
    """
    future = model.make_future_dataframe(periods=periods, freq="h")
    forecast = model.predict(future)
    return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train Prophet forecasters")
    parser.add_argument("--data_path", type=str, required=True)
    parser.add_argument("--model_dir", type=str, default="./saved_models")
    parser.add_argument("--tower_id", type=str, default=None,
                        help="Train for a specific tower. If None, trains on all towers aggregated.")
    parser.add_argument("--forecast_periods", type=int, default=DEFAULT_FORECAST_PERIODS)
    args = parser.parse_args()

    os.makedirs(args.model_dir, exist_ok=True)

    # 1. Load data
    print(f"📂 Loading data from {args.data_path}...")
    df = pd.read_csv(args.data_path)
    tower_label = args.tower_id or "ALL_TOWERS"
    print(f"   Training for: {tower_label}")

    models_trained = {}

    for metric_name, col_name in FORECAST_METRICS.items():
        print(f"\n🔮 Training Prophet for '{metric_name}' ({col_name})...")

        # 2. Prepare data
        prophet_df = prepare_prophet_data(
            df, target_col=col_name, tower_id=args.tower_id
        )
        print(f"   Data points: {len(prophet_df)}")

        if len(prophet_df) < 48:  # Need at least 2 days of hourly data
            print(f"   ⚠️  Not enough data for {metric_name}. Skipping.")
            continue

        # 3. Train
        model = train_prophet_model(prophet_df)

        # 4. Generate sample forecast
        forecast = generate_forecast(model, periods=args.forecast_periods)
        print(f"   Forecast generated: {len(forecast)} points")

        # 5. Save
        model_path = os.path.join(args.model_dir, f"prophet_{metric_name}_{tower_label}.joblib")
        joblib.dump(model, model_path)
        print(f"   💾 Saved model: {model_path}")

        # Save sample forecast
        forecast_path = os.path.join(args.model_dir, f"forecast_{metric_name}_{tower_label}.csv")
        forecast.tail(args.forecast_periods).to_csv(forecast_path, index=False)
        print(f"   📊 Saved forecast: {forecast_path}")

        models_trained[metric_name] = {
            "model_path": model_path,
            "data_points": len(prophet_df),
            "forecast_periods": args.forecast_periods,
        }

    # 6. Save config
    config = {
        "tower_id": tower_label,
        "metrics": models_trained,
        "trained_at": datetime.utcnow().isoformat(),
    }
    config_path = os.path.join(args.model_dir, f"prophet_config_{tower_label}.json")
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"\n✅ All models trained and saved to {args.model_dir}")


if __name__ == "__main__":
    main()
