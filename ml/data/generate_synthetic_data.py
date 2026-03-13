"""
Synthetic Telecom Network Performance Data Generator
=====================================================
Generates realistic network performance logs and event/failure logs
for training ML models (PyOD, Prophet).

Usage:
    python generate_synthetic_data.py --rows 50000 --output_dir ./output

Output files:
    - network_performance.csv: Main performance metrics per tower per timestamp
    - event_logs.csv: Failure/event records with severity levels
"""

import argparse
import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta


# ─── Configuration ──────────────────────────────────────────────────────────────

TOWER_IDS = [f"TOWER-{str(i).zfill(4)}" for i in range(1, 51)]  # 50 towers

EVENT_TYPES = [
    "hardware_failure", "power_outage", "congestion_spike",
    "signal_degradation", "firmware_crash", "overheating",
    "packet_storm", "ddos_attack", "fiber_cut", "antenna_misalignment"
]

SEVERITY_LEVELS = ["low", "medium", "high", "critical"]
SEVERITY_WEIGHTS = [0.4, 0.3, 0.2, 0.1]


# ─── Helpers ────────────────────────────────────────────────────────────────────

def _diurnal_factor(hour: int) -> float:
    """Simulate realistic diurnal (day/night) traffic pattern."""
    # Peak hours: 8-11 AM, 1-3 PM, 7-10 PM
    if 8 <= hour <= 11:
        return 0.7 + random.uniform(0, 0.3)
    elif 13 <= hour <= 15:
        return 0.75 + random.uniform(0, 0.25)
    elif 19 <= hour <= 22:
        return 0.8 + random.uniform(0, 0.2)
    elif 0 <= hour <= 5:
        return 0.1 + random.uniform(0, 0.15)
    else:
        return 0.4 + random.uniform(0, 0.3)


def _inject_anomaly(row: dict, anomaly_type: str) -> dict:
    """
    Inject realistic anomalous behavior into a single row.
    Returns the modified row with anomaly_label = 1.
    """
    if anomaly_type == "latency_spike":
        row["latency_ms"] = random.uniform(150, 500)
        row["packet_loss_pct"] = random.uniform(5, 25)
    elif anomaly_type == "cpu_overload":
        row["cpu_usage_pct"] = random.uniform(92, 100)
        row["memory_usage_pct"] = random.uniform(85, 99)
    elif anomaly_type == "bandwidth_saturation":
        row["bandwidth_usage_mbps"] = random.uniform(950, 1000)
        row["user_count"] = int(random.uniform(800, 1200))
    elif anomaly_type == "packet_loss":
        row["packet_loss_pct"] = random.uniform(10, 50)
        row["latency_ms"] = random.uniform(80, 200)
    row["anomaly_label"] = 1
    return row


# ─── Main Generator ────────────────────────────────────────────────────────────

def generate_network_performance(
    num_rows: int = 50000,
    start_date: str = "2025-01-01",
    anomaly_ratio: float = 0.05,
) -> pd.DataFrame:
    """
    Generate synthetic network performance logs.

    Each row represents a single measurement from one tower at one timestamp.

    Columns:
        timestamp, tower_id, latency_ms, packet_loss_pct,
        bandwidth_usage_mbps, user_count, cpu_usage_pct,
        memory_usage_pct, anomaly_label
    """
    np.random.seed(42)
    random.seed(42)

    start = datetime.strptime(start_date, "%Y-%m-%d")
    records = []

    anomaly_types = ["latency_spike", "cpu_overload", "bandwidth_saturation", "packet_loss"]

    for i in range(num_rows):
        # Random timestamp within a 90-day window, 5-min intervals
        offset_minutes = random.randint(0, 90 * 24 * 12) * 5
        ts = start + timedelta(minutes=offset_minutes)
        hour = ts.hour

        tower_id = random.choice(TOWER_IDS)
        factor = _diurnal_factor(hour)

        row = {
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "tower_id": tower_id,
            "latency_ms": round(max(1, np.random.normal(20, 8) * (1 + factor * 0.3)), 2),
            "packet_loss_pct": round(max(0, np.random.exponential(0.5) * factor), 4),
            "bandwidth_usage_mbps": round(max(0, min(1000, np.random.normal(400, 150) * factor)), 2),
            "user_count": int(max(0, np.random.normal(200, 80) * factor)),
            "cpu_usage_pct": round(max(0, min(100, np.random.normal(40, 15) + factor * 20)), 2),
            "memory_usage_pct": round(max(0, min(100, np.random.normal(50, 12) + factor * 10)), 2),
            "anomaly_label": 0,
        }

        # Inject anomalies at the configured rate
        if random.random() < anomaly_ratio:
            anomaly_type = random.choice(anomaly_types)
            row = _inject_anomaly(row, anomaly_type)

        records.append(row)

    df = pd.DataFrame(records)
    df = df.sort_values("timestamp").reset_index(drop=True)
    return df


def generate_event_logs(
    perf_df: pd.DataFrame,
    event_ratio: float = 0.02,
) -> pd.DataFrame:
    """
    Generate synthetic event/failure logs correlated with anomalies in perf_df.

    Columns:
        timestamp, tower_id, event_type, severity, description
    """
    random.seed(42)
    events = []

    # Events triggered by anomalies
    anomaly_rows = perf_df[perf_df["anomaly_label"] == 1]
    for _, row in anomaly_rows.iterrows():
        if random.random() < 0.7:  # 70% of anomalies produce an event
            event_type = random.choice(EVENT_TYPES)
            severity = random.choices(SEVERITY_LEVELS, weights=SEVERITY_WEIGHTS, k=1)[0]
            events.append({
                "timestamp": row["timestamp"],
                "tower_id": row["tower_id"],
                "event_type": event_type,
                "severity": severity,
                "description": f"Auto-detected {event_type.replace('_', ' ')} on {row['tower_id']}",
            })

    # Random background events (noise)
    normal_rows = perf_df[perf_df["anomaly_label"] == 0].sample(
        frac=event_ratio, random_state=42
    )
    for _, row in normal_rows.iterrows():
        events.append({
            "timestamp": row["timestamp"],
            "tower_id": row["tower_id"],
            "event_type": random.choice(EVENT_TYPES[:3]),  # less severe types
            "severity": random.choices(["low", "medium"], weights=[0.7, 0.3], k=1)[0],
            "description": f"Routine check event on {row['tower_id']}",
        })

    df = pd.DataFrame(events)
    df = df.sort_values("timestamp").reset_index(drop=True)
    return df


# ─── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic telecom data")
    parser.add_argument("--rows", type=int, default=50000, help="Number of performance rows")
    parser.add_argument("--anomaly_ratio", type=float, default=0.05, help="Fraction of anomalous rows")
    parser.add_argument("--output_dir", type=str, default="./output", help="Output directory")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    print(f"📡 Generating {args.rows} network performance rows...")
    perf_df = generate_network_performance(num_rows=args.rows, anomaly_ratio=args.anomaly_ratio)

    perf_path = os.path.join(args.output_dir, "network_performance.csv")
    perf_df.to_csv(perf_path, index=False)
    print(f"   ✅ Saved to {perf_path} ({len(perf_df)} rows)")

    print("📋 Generating correlated event logs...")
    event_df = generate_event_logs(perf_df)

    event_path = os.path.join(args.output_dir, "event_logs.csv")
    event_df.to_csv(event_path, index=False)
    print(f"   ✅ Saved to {event_path} ({len(event_df)} rows)")

    # Print summary
    print("\n─── Data Summary ─────────────────────────────")
    print(f"  Total performance rows: {len(perf_df)}")
    print(f"  Anomalous rows:         {perf_df['anomaly_label'].sum()} ({perf_df['anomaly_label'].mean()*100:.1f}%)")
    print(f"  Unique towers:          {perf_df['tower_id'].nunique()}")
    print(f"  Date range:             {perf_df['timestamp'].min()} → {perf_df['timestamp'].max()}")
    print(f"  Event log entries:      {len(event_df)}")
    print("───────────────────────────────────────────────")


if __name__ == "__main__":
    main()
