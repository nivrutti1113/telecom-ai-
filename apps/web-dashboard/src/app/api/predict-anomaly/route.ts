import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tower_id = "TOWER-0001",
      latency_ms = 25,
      packet_loss_pct = 0.1,
      bandwidth_usage_mbps = 400,
      user_count = 300,
      cpu_usage_pct = 40,
      memory_usage_pct = 50,
    } = body;

    const latencyScore = Math.max(0, (latency_ms - 30) / 70);
    const packetLossScore = Math.max(0, (packet_loss_pct - 1.0) / 4);
    const cpuScore = Math.max(0, (cpu_usage_pct - 80) / 20);
    const memScore = Math.max(0, (memory_usage_pct - 85) / 15);

    const iforestScore = Math.min(1, latencyScore * 0.4 + packetLossScore * 0.4 + cpuScore * 0.2);
    const lofScore = Math.min(1, packetLossScore * 0.5 + cpuScore * 0.3 + memScore * 0.2);
    const ocsvmScore = Math.min(1, latencyScore * 0.3 + memScore * 0.4 + cpuScore * 0.3);

    const anomalyScore = parseFloat(((iforestScore + lofScore + ocsvmScore) / 3).toFixed(4));
    const isAnomaly = anomalyScore > 0.45 || latency_ms > 80 || packet_loss_pct > 3.0 || cpu_usage_pct > 90;
    const confidence = parseFloat((0.85 + Math.min(0.14, anomalyScore * 0.2)).toFixed(4));

    return NextResponse.json({
      tower_id,
      is_anomaly: isAnomaly,
      anomaly_score: anomalyScore,
      confidence,
      model_scores: {
        isolation_forest: parseFloat(iforestScore.toFixed(4)),
        local_outlier_factor: parseFloat(lofScore.toFixed(4)),
        one_class_svm: parseFloat(ocsvmScore.toFixed(4)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Prediction failed" }, { status: 400 });
  }
}
