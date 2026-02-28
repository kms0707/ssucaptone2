# model-service/main.py
import os
import json
import time
import traceback
from typing import Dict, Any, List

from kafka import KafkaConsumer, KafkaProducer

from src.svm_tcn_hybrid import SVMTCNHybrid


# ---- 환경변수 ----
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "kafka:29092")
TOPIC_IN = os.getenv("TOPIC_IN", "ai-flow-features")
TOPIC_OUT = os.getenv("TOPIC_OUT", "ai-results")
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "flowids-model-service")

MODEL_VERSION = os.getenv("MODEL_VERSION", "svm+tcn-hybrid-v1")

OCSVM_BUNDLE = os.getenv("OCSVM_BUNDLE", "/app/artifacts/ocsvm_bundle.joblib")
TCN_STATE = os.getenv("TCN_STATE", "/app/artifacts/tcn_state_dict.pt")
TCN_META = os.getenv("TCN_META", "/app/artifacts/tcn_meta.joblib")

MICROBATCH_SECONDS = float(os.getenv("MICROBATCH_SECONDS", "2.0"))
AUTO_OFFSET_RESET = os.getenv("AUTO_OFFSET_RESET", "latest")


# ---- util: camelCase → UPPER_SNAKE ----
def camel_to_upper_snake(name: str) -> str:
    # srcIp -> SRC_IP (근데 preprocess는 SRC_IP 안 쓸 수도 있음)
    out = []
    for ch in name:
        if ch.isupper():
            out.append("_")
            out.append(ch)
        else:
            out.append(ch.upper())
    s = "".join(out).lstrip("_")
    return s

def _get(obj, key, default=None):
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)

    v = getattr(obj, key, default)
    # 메서드면 호출해서 값을 얻기
    if callable(v):
        try:
            return v()
        except Exception:
            return default
    return v

def normalize_flowlog_message(msg: Dict[str, Any]) -> Dict[str, Any]:
    # 1) 원본 복사(원본 key 유지)
    norm = dict(msg)

    # 2) camelCase -> UPPER_SNAKE 보조(기존 유지하고 싶으면)
    for k, v in msg.items():
        norm[camel_to_upper_snake(k)] = v

    # 3) ★ 5-tuple alias (이게 중요)
    if "IPV4_SRC_ADDR" in norm and "srcIp" not in norm:
        norm["srcIp"] = norm["IPV4_SRC_ADDR"]
    if "IPV4_DST_ADDR" in norm and "dstIp" not in norm:
        norm["dstIp"] = norm["IPV4_DST_ADDR"]
    if "L4_SRC_PORT" in norm and "srcPort" not in norm:
        norm["srcPort"] = norm["L4_SRC_PORT"]
    if "L4_DST_PORT" in norm and "dstPort" not in norm:
        norm["dstPort"] = norm["L4_DST_PORT"]
    if "PROTOCOL" in norm and "protocol" not in norm:
        norm["protocol"] = norm["PROTOCOL"]

    # duration alias (있으면)
    if "FLOW_DURATION_MILLISECONDS" in norm and "flowDuration" not in norm:
        norm["flowDuration"] = norm["FLOW_DURATION_MILLISECONDS"]

    return norm



def main():
    # 1) 모델 로드 (컨테이너 시작 시 1회)
    model = SVMTCNHybrid(
        ocsvm_bundle_path=OCSVM_BUNDLE,
        tcn_state_dict_path=TCN_STATE,
        tcn_meta_path=TCN_META,
        key_mode="5tuple",
        device="cpu",
        enable_diag=False,
    )

    # 2) Kafka consumer / producer
    consumer = KafkaConsumer(
        TOPIC_IN,
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id=GROUP_ID,
        enable_auto_commit=False,
        auto_offset_reset=AUTO_OFFSET_RESET,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        key_deserializer=lambda m: m.decode("utf-8") if m else None,
        consumer_timeout_ms=1000,  # poll loop가 영원히 막히지 않게
    )

    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP,
        value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode("utf-8"),
        key_serializer=lambda k: str(k).encode("utf-8") if k is not None else None,
        linger_ms=50,
    )

    buffer: List[Dict[str, Any]] = []
    last_flush = time.time()

    print(f"[model-service] started. KAFKA={KAFKA_BOOTSTRAP}, IN={TOPIC_IN}, OUT={TOPIC_OUT}")

    try:
        while True:
            # 3) 메시지 수집
            for record in consumer:
                buffer.append(record.value)

            now = time.time()
            if (now - last_flush) < MICROBATCH_SECONDS:
                continue

            if not buffer:
                last_flush = now
                continue

            batch = buffer
            buffer = []
            last_flush = now

            # 4) 배치 처리
            for msg in batch:
                try:
                    document_id = msg.get("documentId") or msg.get("document_id")
                    project_id = msg.get("projectId") or msg.get("project_id")

                    # 디버그: 들어오는 msg 형태 확인
                    print("[ms] got msg keys:", list(msg.keys())[:15], "doc=", document_id)
                    print("[ms] tuple raw:", msg.get("IPV4_SRC_ADDR"), msg.get("L4_SRC_PORT"), msg.get("PROTOCOL"))

                    flow = normalize_flowlog_message(msg)

                    # 디버그: alias 적용 후 5tuple 값 확인
                    print("[ms] tuple normalized:", flow.get("srcIp"), flow.get("srcPort"), flow.get("dstIp"), flow.get("dstPort"), flow.get("protocol"))

                    res = model.process_flow(flow)
                    print("[ms] sample features:", {k: flow.get(k) for k in ["IN_BYTES","OUT_BYTES","IN_PKTS","OUT_PKTS","FLOW_DURATION_MILLISECONDS","SRC_TO_DST_AVG_THROUGHPUT"]})

                    # 디버그: 모델 리턴 구조 확인
                    print("[ms] result:", res)

                    is_anomaly = bool(_get(res, "final_is_attack", False))
                    score = _get(res, "tcn_attack_prob", None)
                    if score is None:
                        score = _get(res, "svm_attack_score", 0.0)
                    score = float(score)

                    stage = _get(res, "stage", "unknown")
                    reason = _get(res, "reason", "")
                    
                    out = {
                        "documentId": document_id,
                        "isAnomaly": is_anomaly,
                        "anomalyScore": score,
                        "modelVersion": MODEL_VERSION,
                        "stage": stage,
                        "reason": reason,
                    }

                    producer.send(TOPIC_OUT, key=str(project_id) if project_id else None, value=out)

                except Exception:
                    traceback.print_exc()
                    
            producer.flush()
            consumer.commit()

    finally:
        consumer.close()
        producer.close()


if __name__ == "__main__":
    main()
