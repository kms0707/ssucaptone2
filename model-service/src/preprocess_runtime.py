# src/preprocess_runtime.py
from __future__ import annotations
from typing import Dict, Any
from src.preprocess_online import preprocess_row as _preprocess_online_row

# 학습/모델 입력 순서 고정용 (네 runtime 버전 FEATURE_COLS 유지)
FEATURE_COLS = [
    'IN_BYTES','OUT_BYTES','IN_PKTS','OUT_PKTS','FLOW_DURATION_MILLISECONDS',
    'SRC_TO_DST_AVG_THROUGHPUT','DST_TO_SRC_AVG_THROUGHPUT',
    'SRC_TO_DST_IAT_MIN','SRC_TO_DST_IAT_MAX','SRC_TO_DST_IAT_AVG','SRC_TO_DST_IAT_STDDEV',
    'DST_TO_SRC_IAT_MIN','DST_TO_SRC_IAT_MAX','DST_TO_SRC_IAT_AVG','DST_TO_SRC_IAT_STDDEV',
    'SRC_TO_DST_SECOND_BYTES','DST_TO_SRC_SECOND_BYTES',
    'LONGEST_FLOW_PKT','SHORTEST_FLOW_PKT','MIN_IP_PKT_LEN','MAX_IP_PKT_LEN',
    'TOTAL_BYTES','TOTAL_PKTS','IN_OUT_BYTES_RATIO','IN_OUT_PKTS_RATIO'
]

def preprocess_row(flow: Dict[str, Any]) -> Dict[str, Any]:
    """
    1) preprocess_online로 숫자화/clip/log1p/ratio/total 처리
    2) 모델이 기대하는 FEATURE_COLS만 남기고 누락은 0으로 채움
    """
    out = _preprocess_online_row(flow)
    return {k: float(out.get(k, 0.0)) for k in FEATURE_COLS}
