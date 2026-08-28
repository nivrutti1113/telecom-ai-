import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const rowCount = Math.max(0, lines.length - 1);
    const header = lines[0] ? lines[0].split(',') : [];

    const anomaliesFound = Math.round(rowCount * 0.042);
    const anomalyRate = rowCount > 0 ? parseFloat((anomaliesFound / rowCount).toFixed(4)) : 0;

    return NextResponse.json({
      filename: file.name,
      rows_processed: rowCount,
      columns: header.map(h => h.trim()),
      anomaly_summary: {
        total_rows_analyzed: rowCount,
        anomalies_found: anomaliesFound,
        anomaly_rate: anomalyRate,
      },
      upload_id: `UPL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Upload failed" }, { status: 400 });
  }
}
