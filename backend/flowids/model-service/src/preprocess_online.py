# preprocess_online.py
from __future__ import annotations

import math
from typing import Dict, Any, Iterable


# 너희가 말한 log1p 후보 + 운영 feature(25개)에서 실제로 큰 스케일인 값들 포함
LOG1P_COLS = {
    "IN_BYTES",
    "OUT_BYTES",
    "TOTAL_BYTES",
    "SRC_TO_DST_AVG_THROUGHPUT",
    "DST_TO_SRC_AVG_THROUGHPUT",
    "SRC_TO_DST_SECOND_BYTES",
    "DST_TO_SRC_SECOND_BYTES",
}

# 기본적으로 음수가 나오면 이상한 컬럼들(지표상 0 이상 기대)
NONNEG_COLS = {
    "IN_BYTES", "OUT_BYTES", "IN_PKTS", "OUT_PKTS", "FLOW_DURATION_MILLISECONDS",
    "SRC_TO_DST_AVG_THROUGHPUT", "DST_TO_SRC_AVG_THROUGHPUT",
    "SRC_TO_DST_IAT_MIN", "SRC_TO_DST_IAT_MAX", "SRC_TO_DST_IAT_AVG", "SRC_TO_DST_IAT_STDDEV",
    "DST_TO_SRC_IAT_MIN", "DST_TO_SRC_IAT_MAX", "DST_TO_SRC_IAT_AVG", "DST_TO_SRC_IAT_STDDEV",
    "SRC_TO_DST_SECOND_BYTES", "DST_TO_SRC_SECOND_BYTES",
    "LONGEST_FLOW_PKT", "SHORTEST_FLOW_PKT", "MIN_IP_PKT_LEN", "MAX_IP_PKT_LEN",
    "TOTAL_BYTES", "TOTAL_PKTS",
}

RATIO_COLS = {"IN_OUT_BYTES_RATIO", "IN_OUT_PKTS_RATIO"}


def _is_finite(x: float) -> bool:
    return not (math.isinf(x) or math.isnan(x))


def _to_float(x: Any, default: float = 0.0) -> float:
    try:
        if x is None:
            return default
        if isinstance(x, str) and x in ("", "-", "(empty)"):
            return default
        return float(x)
    except Exception:
        return default


def preprocess_row(flow: Dict[str, Any], clip_abs: float = 1e12) -> Dict[str, Any]:
    """
    - numeric cast
    - nan/inf -> 0
    - clip abs
    - enforce non-negative (optional)
    - log1p on selected cols
    - recompute totals/ratios if missing (safe)
    """
    out = dict(flow)

    # 1) numeric normalize
    for k, v in list(out.items()):
        # meta 컬럼(SRC_IP 등)은 건드리지 않음
        if isinstance(v, (int, float)):
            fv = float(v)
        else:
            # 숫자로 변환 가능한 값만 변환
            # 숫자 컬럼 후보들만 변환하도록 (운영 feature 25개 + ratio)
            if k in NONNEG_COLS or k in RATIO_COLS:
                fv = _to_float(v, 0.0)
            else:
                continue

        if not _is_finite(fv):
            fv = 0.0

        # clip
        if fv > clip_abs:
            fv = clip_abs
        if fv < -clip_abs:
            fv = -clip_abs

        # non-negative enforce
        if k in NONNEG_COLS and fv < 0:
            fv = 0.0

        out[k] = fv

    # 2) recompute totals if absent or inconsistent
    in_b = _to_float(out.get("IN_BYTES", 0.0), 0.0)
    out_b = _to_float(out.get("OUT_BYTES", 0.0), 0.0)
    in_p = _to_float(out.get("IN_PKTS", 0.0), 0.0)
    out_p = _to_float(out.get("OUT_PKTS", 0.0), 0.0)

    out["TOTAL_BYTES"] = in_b + out_b
    out["TOTAL_PKTS"] = in_p + out_p

    # ratios (safe)
    out["IN_OUT_BYTES_RATIO"] = (in_b / out_b) if out_b != 0 else 0.0
    out["IN_OUT_PKTS_RATIO"] = (in_p / out_p) if out_p != 0 else 0.0

    # 3) log1p
    for c in LOG1P_COLS:
        if c in out:
            x = _to_float(out.get(c), 0.0)
            if x < 0:
                x = 0.0
            out[c] = math.log1p(x)

    return out