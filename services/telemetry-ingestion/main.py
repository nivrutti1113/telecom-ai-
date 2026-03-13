from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import logging
import json
from datetime import datetime

app = FastAPI(title="Telemetry Ingestion Service")

class TelemetryPayload(BaseModel):
    tower_id: str
    metrics: dict
    timestamp: datetime = datetime.now()

@app.post("/ingest")
async def ingest_data(payload: TelemetryPayload, background_tasks: BackgroundTasks):
    # Logic to push to Kafka Topic
    # producer.send('telemetry', value=payload.dict())
    
    logging.info(f"Ingested data from {payload.tower_id}")
    return {"status": "success", "message": "Data queued for processing"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
