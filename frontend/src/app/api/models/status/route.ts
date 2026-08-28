import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    anomaly_models_loaded: true,
    prophet_models_loaded: {
      bandwidth: true,
      latency: true,
    },
    scaler_loaded: true,
    config: {
      version: "2.4.0",
      environment: "production",
      framework: "Next.js + PyOD/Prophet Engine",
    },
  });
}
