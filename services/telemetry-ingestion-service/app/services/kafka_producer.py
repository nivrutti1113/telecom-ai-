from aiokafka import AIOKafkaProducer
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class KafkaManager:
    def __init__(self):
        self.producer = None

    async def start(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8')
        )
        await self.producer.start()
        logger.info("Kafka Producer started")

    async def stop(self):
        if self.producer:
            await self.producer.stop()
            logger.info("Kafka Producer stopped")

    async def send_telemetry(self, data: dict):
        if not self.producer:
            raise Exception("Kafka Producer not started")
        await self.producer.send_and_wait(settings.KAFKA_TOPIC, data)

kafka_manager = KafkaManager()
