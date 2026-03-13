import mlflow.pyfunc
import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

class InferenceService:
    def __init__(self):
        self.model = None
        self.model_uri = os.getenv("MODEL_URI", "models:/isolation_forest_prod/Production")
        
    def load_model(self):
        try:
            self.model = mlflow.pyfunc.load_model(self.model_uri)
            logger.info(f"Model loaded from {self.model_uri}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            # Fallback to local or mock for dev
            self.model = None

    def predict(self, data: dict):
        if self.model is None:
            # Mock prediction for demo/dev if model not available
            return {"is_anomaly": False, "score": 0.0}
            
        df = pd.DataFrame([data])
        prediction = self.model.predict(df)
        score = self.model.decision_function(df)
        
        return {
            "is_anomaly": bool(prediction[0] == -1),
            "score": float(score[0])
        }

inference_service = InferenceService()
