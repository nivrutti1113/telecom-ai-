import flwr as fl
import torch
import torch.nn as nn
import numpy as np

# Use the same model architecture as anomaly detection
class SimplePredictor(nn.Module):
    def __init__(self):
        super(SimplePredictor, self).__init__()
        self.fc = nn.Linear(10, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        return self.sigmoid(self.fc(x))

model = SimplePredictor()
criterion = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

class TelecomClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        # Dummy training on local telecom operator data
        for _ in range(1):
             x = torch.randn(32, 10)
             y = torch.randint(0, 2, (32, 1)).float()
             optimizer.zero_grad()
             loss = criterion(model(x), y)
             loss.backward()
             optimizer.step()
        return self.get_parameters(config={}), 32, {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        x = torch.randn(10, 10)
        y = torch.randint(0, 2, (10, 1)).float()
        with torch.no_grad():
            loss = criterion(model(x), y)
        return float(loss), 10, {"accuracy": 0.9}

if __name__ == "__main__":
    fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=TelecomClient())
