from fastapi import FastAPI, Depends, BackgroundTasks
import uuid
from app.schemas.telemetry import MetricSchema, IngestionResponse
from app.services.kafka_producer import kafka_manager
from app.config import settings
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
async def startup_event():
    await kafka_manager.start()
    Instrumentator().instrument(app).expose(app)

@app.on_event("shutdown")
async def shutdown_event():
    await kafka_manager.stop()

@app.post("/ingest", response_model=IngestionResponse)
async def ingest_metrics(metric: MetricSchema):
    correlation_id = str(uuid.uuid4())
    
    # Send to Kafka
    data = metric.dict()
    data["correlation_id"] = correlation_id
    
    await kafka_manager.send_telemetry(data)
    
    return IngestionResponse(
        status="success",
        message="Metrics queued for processing",
        correlation_id=correlation_id
    )

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
