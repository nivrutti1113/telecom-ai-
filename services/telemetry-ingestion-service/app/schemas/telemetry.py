from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class MetricSchema(BaseModel):
    tower_id: str
    timestamp: datetime
    metrics: Dict[str, float]
    metadata: Optional[Dict[str, Any]] = None

class IngestionResponse(BaseModel):
    status: str
    message: str
    correlation_id: str
