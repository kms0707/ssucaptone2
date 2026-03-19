import json
import os
from datetime import datetime
from pathlib import Path

from kafka import KafkaConsumer


KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "localhost:9092")
TOPICS = ["raw-flow-logs", "ai-flow-features", "ai-result"]
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "trainer-collector")
BASE_DIR = Path(__file__).resolve().parent / "data"


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def get_output_path(topic: str) -> Path:
    today = datetime.now().strftime("%Y-%m-%d")
    topic_dir = BASE_DIR / topic / today
    ensure_dir(topic_dir)
    return topic_dir / f"{topic}.jsonl"


def main():
    consumer = KafkaConsumer(
        *TOPICS,
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id=GROUP_ID,
        auto_offset_reset="latest",
        enable_auto_commit=True,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        key_deserializer=lambda m: m.decode("utf-8") if m else None,
    )

    print(f"[collector] started. bootstrap={KAFKA_BOOTSTRAP}, topics={TOPICS}")

    try:
        for record in consumer:
            topic = record.topic
            value = record.value
            output_path = get_output_path(topic)

            with output_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(value, ensure_ascii=False) + "\n")

            print(f"[collector] saved topic={topic} offset={record.offset}")
    finally:
        consumer.close()


if __name__ == "__main__":
    main()