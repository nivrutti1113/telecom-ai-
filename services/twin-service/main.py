from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
import random
import json
from datetime import datetime

app = FastAPI(title="Digital Twin Simulation Service")

class SimulationConfig(BaseModel):
    tower_count: int = 100
    traffic_intensity: float = 1.0 # Multiplier
    active_anomalies: int = 0

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async city_connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.post("/simulate/start")
async def start_simulation(config: SimulationConfig):
    # Logic to initialize simulation state
    return {"status": "simulation_started", "config": config}

@app.websocket("/ws/network-state")
async def websocket_endpoint(websocket: WebSocket):
    await manager.city_connect(websocket)
    try:
        while True:
            # Send simulated real-time state every 2 seconds
            state = {
                "timestamp": datetime.now().isoformat(),
                "node_updates": [
                    {
                        "id": f"tower-{i}",
                        "load": random.uniform(0, 100),
                        "status": "online" if random.random() > 0.05 else "warning"
                    } for i in range(10) # Small sample for demo
                ]
            }
            await websocket.send_text(json.dumps(state))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
