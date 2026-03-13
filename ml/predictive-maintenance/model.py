import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestRegressor
import numpy as np

class MaintenanceLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_layers=2):
        super(MaintenanceLSTM, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, 1) # Predict RUL (Remaining Useful Life)

    def forward(self, x):
        h0 = torch.zeros(2, x.size(0), 64).to(x.device)
        c0 = torch.zeros(2, x.size(0), 64).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class HybridMaintenanceModel:
    def __init__(self):
        self.rf = RandomForestRegressor(n_estimators=100)
        self.lstm = MaintenanceLSTM(input_dim=10, hidden_dim=64)
        
    def fit(self, static_data, temporal_data, target):
        # static_data: [tower_age, manufacturer_id, etc]
        # temporal_data: [vibration_seq, temp_seq, power_seq]
        
        # Train RF on static
        self.rf.fit(static_data, target)
        
        # Train LSTM on temporal
        # (Simplified training loop omitted for brevity)
        print("Hybrid Model Trained: RF + LSTM")

    def predict(self, static_data, temporal_data):
        rf_pred = self.rf.predict(static_data)
        
        # LSTM prediction
        self.lstm.eval()
        with torch.no_grad():
            lstm_pred = self.lstm(torch.FloatTensor(temporal_data)).numpy().flatten()
            
        # Weighted average or stacking
        return 0.4 * rf_pred + 0.6 * lstm_pred

if __name__ == "__main__":
    model = HybridMaintenanceModel()
    # Dummy data
    static = np.random.rand(10, 5)
    temporal = np.random.rand(10, 20, 10) # 10 samples, 20 time steps, 10 features
    target = np.random.rand(10)
    
    model.fit(static, temporal, target)
    print("Prediction:", model.predict(static, temporal))
    
    # Save LSTM part
    torch.save(model.lstm.state_dict(), "maintenance_lstm.pth")
