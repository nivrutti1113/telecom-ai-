from sklearn.ensemble import IsolationForest
import pandas as pd
import mlflow
import mlflow.sklearn
import numpy as np
import os

class AnomalyTrainingService:
    def __init__(self):
        self.tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")
        mlflow.set_tracking_uri(self.tracking_uri)
        mlflow.set_experiment("Telecom_Anomaly_Detection")

    def train_isolation_forest(self, data: pd.DataFrame, model_name: str = "isolation_forest_v1"):
        with mlflow.start_run():
            # Basic preprocessing
            X = data.select_dtypes(include=[np.number])
            
            # Model definition
            model = IsolationForest(contamination=0.1, random_state=42)
            
            # Training
            model.fit(X)
            
            # Log params and model
            mlflow.log_param("contamination", 0.1)
            mlflow.sklearn.log_model(model, "model")
            
            # In production, we'd register the model
            # mlflow.register_model(f"runs:/{mlflow.active_run().info.run_id}/model", model_name)
            
            return mlflow.active_run().info.run_id

training_service = AnomalyTrainingService()
