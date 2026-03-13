from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Telecom Telemetry Ingestion"
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC: str = "telecom_metrics"
    
    LOG_LEVEL: str = "INFO"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://tempo:4317"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
