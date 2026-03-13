"""
Digital Twin Simulation Service (FastAPI)
==========================================
Simulates real-time network topology, traffic flows, and anomalies 
for the 3D Digital Twin dashboard. 

Uses WebSockets to stream high-frequency updates.
"""

import asyncio
import json
import logging
import random
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── Structured Logging ────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("twin-service")


# ─── Simulation Schemas ────────────────────────────────────────────────────────

class SimulationConfig(BaseModel):
    """Configuration for a specific simulation instance."""
    simulation_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    tower_count: int = Field(50, ge=1, le=500)
    traffic_intensity: float = Field(1.0, ge=0.1, le=5.0)
    failure_probability: float = Field(0.01, ge=0, le=1.0)
    update_interval_ms: int = Field(1000, ge=100, le=5000)


class TowerState(BaseModel):
    """Dynamic state of a single tower in the twin."""
    id: str
    position: List[float]  # [x, y, z]
    load: float           # 0-100%
    status: str           # "online", "warning", "offline"
    connections: List[str] # IDs of connected towers


# ─── Simulation Engine ─────────────────────────────────────────────────────────

class NetworkSimulator:
    """
    Maintains the state of the digital twin and simulates physics/traffic.
    """

    def __init__(self, config: SimulationConfig):
        self.config = config
        self.towers: Dict[str, TowerState] = {}
        self._initialize_topology()

    def _initialize_topology(self):
        """Generate a random but connected network topology."""
        for i in range(self.config.tower_count):
            tid = f"TOWER-{str(i+1).zfill(4)}"
            # Random position in a 20x20 area
            pos = [
                random.uniform(-10, 10),
                random.uniform(-10, 10),
                random.uniform(-10, 10)
            ]
            self.towers[tid] = TowerState(
                id=tid,
                position=pos,
                load=random.uniform(20, 40),
                status="online",
                connections=[]
            )

        # Connect towers to their nearest neighbors (mesh topology)
        tower_ids = list(self.towers.keys())
        for tid in tower_ids:
            tower = self.towers[tid]
            # Find 3 nearest neighbors
            others = [t for t in tower_ids if t != tid]
            nearest = sorted(others, key=lambda x: self._dist(tower.position, self.towers[x].position))[:3]
            tower.connections = nearest

    def _dist(self, p1, p2):
        return sum((a - b)**2 for a, b in zip(p1, p2))**0.5

    def step(self):
        """Advance the simulation by one time step."""
        for tower in self.towers.values():
            # Update load based on intensity and slight randomness
            change = random.uniform(-5, 5) * self.config.traffic_intensity
            tower.load = max(0, min(100, tower.load + change))

            # Simulate failures
            if random.random() < self.config.failure_probability:
                tower.status = "offline" if random.random() > 0.5 else "warning"
            elif tower.load > 90:
                tower.status = "warning"
            else:
                # 10% chance to recover per step
                if tower.status != "online" and random.random() < 0.1:
                    tower.status = "online"

    def get_state(self):
        """Return the current snapshot of the entire network."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "simulation_id": self.config.simulation_id,
            "metrics": {
                "avg_load": sum(t.load for t in self.towers.values()) / len(self.towers),
                "active_nodes": sum(1 for t in self.towers.values() if t.status == "online"),
                "critical_nodes": sum(1 for t in self.towers.values() if t.status == "offline"),
            },
            "nodes": [t.dict() for t in self.towers.values()]
        }


# ─── Connection Manager ────────────────────────────────────────────────────────

class ConnectionManager:
    """Handles WebSocket subscribers."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket): # Renamed from city_connect to be concise
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New twin subscriber. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Twin subscriber disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Use json dumps for efficiency
        data = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                # Connection might be stale, skip it
                continue


# ─── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(title="Digital Twin Simulation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
current_sim: Optional[NetworkSimulator] = None
sim_task: Optional[asyncio.Task] = None


async def run_simulation_loop(sim: NetworkSimulator):
    """Background task that runs the simulation and broadcasts state."""
    logger.info(f"Simulation {sim.config.simulation_id} started loop.")
    try:
        while True:
            sim.step()
            state = sim.get_state()
            await manager.broadcast(state)
            await asyncio.sleep(sim.config.update_interval_ms / 1000.0)
    except asyncio.CancelledError:
        logger.info(f"Simulation {sim.config.simulation_id} cancelled.")


@app.post("/simulate/start", response_model=SimulationConfig)
async def start_simulation(config: SimulationConfig):
    """
    Start a new simulation with the given configuration.
    Cancels any existing simulation.
    """
    global current_sim, sim_task
    
    if sim_task:
        sim_task.cancel()
        await asyncio.sleep(0.1)

    current_sim = NetworkSimulator(config)
    sim_task = asyncio.create_task(run_simulation_loop(current_sim))
    
    return config


@app.get("/simulate/status")
async def get_sim_status():
    """Get metadata about the current running simulation."""
    if not current_sim:
        return {"status": "idle"}
    return {
        "status": "running",
        "config": current_sim.config,
        "nodes_loaded": len(current_sim.towers)
    }


@app.websocket("/ws/network-state")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time twin state streaming.
    """
    await manager.connect(websocket)
    try:
        # Keep connection alive while broadcasting happens in background task
        while True:
            # Optionally listen for control messages from the client
            data = await websocket.receive_text()
            logger.info(f"Received msg from twin subscriber: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    # Default to 8003 as in docker-compose
    uvicorn.run(app, host="0.0.0.0", port=8003)
