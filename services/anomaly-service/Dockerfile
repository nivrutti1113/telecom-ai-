FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Prophet (requires C++ compiler)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create directories for uploads and model artifacts
RUN mkdir -p /app/uploads /app/models

ENV PYTHONPATH=/app
ENV MODELS_DIR=/app/models/anomaly
ENV PROPHET_DIR=/app/models/prophet

EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]
