import random
import math
from datetime import datetime

class TowerSimulator:
    def __init__(self, tower_id: str):
        self.tower_id = tower_id
        self.base_load = random.uniform(20, 50) # Percentage
        
    def simulate_performance(self):
        # Time-based oscillation (diurnal pattern)
        hour = datetime.utcnow().hour
        time_factor = math.sin((hour - 8) * math.pi / 12) * 20 # Peak at 2 PM, low at 2 AM
        
        noise = random.uniform(-5, 5)
        load = max(0, min(100, self.base_load + time_factor + noise))
        
        # Predict congestion
        is_congested = load > 85
        
        return {
            "tower_id": self.tower_id,
            "timestamp": datetime.utcnow().isoformat(),
            "cpu_usage": load * 0.8,
            "memory_usage": 40 + (load * 0.2),
            "active_users": int(load * 10),
            "throughput_mbps": load * 5,
            "is_congested": is_congested
        }

def get_tower_status(tower_id: str):
    sim = TowerSimulator(tower_id)
    return sim.simulate_performance()
