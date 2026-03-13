from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uuid

app = FastAPI(title="Federated Learning Management Service")

class FLRound(BaseModel):
    id: str
    target_accuracy: float
    participating_nodes: int
    status: str # "queued", "running", "completed"

rounds = []

@app.post("/rounds/create")
async def create_round(accuracy: float, nodes: int):
    new_round = FLRound(
        id=str(uuid.uuid4())[:8],
        target_accuracy=accuracy,
        participating_nodes=nodes,
        status="queued"
    )
    rounds.append(new_round)
    return new_round

@app.get("/rounds")
async def get_rounds():
    return rounds

@app.post("/rounds/{round_id}/start")
async def start_round(round_id: str):
    for r in rounds:
        if r.id == round_id:
            r.status = "running"
            # Logic to trigger Flower server/clients
            return {"status": "started", "round": r}
    return {"error": "round not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
