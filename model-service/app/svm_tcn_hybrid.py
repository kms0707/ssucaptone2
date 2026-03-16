# svm_tcn_hybrid.py
from __future__ import annotations

import time
import math
import argparse
from dataclasses import dataclass
from collections import Counter, defaultdict, deque
from typing import Any, Deque, Dict, List, Optional, Tuple, DefaultDict

import numpy as np
import pandas as pd
import joblib
import torch
import torch.nn as nn
from pytorch_tcn import TCN
from app.preprocess_online import preprocess_row


LOG1P_COLS = {
    "RETRANSMITTED_IN_BYTES",
    "RETRANSMITTED_OUT_BYTES",
    "IN_BYTES",
    "OUT_BYTES",
    "SRC_TO_DST_AVG_THROUGHPUT",
    "DST_TO_SRC_AVG_THROUGHPUT",
    "DNS_TTL_ANSWER",
}

# Result schema
@dataclass
class HybridResult:
    ts: float
    key: str

    svm_raw_score: float
    svm_attack_score: float
    svm_is_attack: bool

    tcn_ready: bool
    tcn_attack_prob: Optional[float] = None

    final_is_attack: bool = False
    stage: str = ""   # svm_pass / svm_only / tcn_pass / tcn_alert
    reason: str = ""


# Utilities (safe numeric / sanitization)
def _to_float(v: Any, default: float = 0.0) -> float:
    try:
        if v is None:
            return float(default)
        # pandas NA
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return float(default)
        return float(v)
    except Exception:
        return float(default)


def _sanitize_vec(
    x: np.ndarray,
    clip_abs: float = 1e12,
    nan_value: float = 0.0,
    posinf_value: float = 0.0,
    neginf_value: float = 0.0,
) -> np.ndarray:
    """
    - float64로 올려서 안정화
    - nan/inf 제거
    - 너무 큰 값 clip
    """
    x = np.asarray(x, dtype=np.float64)
    x = np.nan_to_num(x, nan=nan_value, posinf=posinf_value, neginf=neginf_value)
    if clip_abs is not None and clip_abs > 0:
        x = np.clip(x, -clip_abs, clip_abs)
    return x


def _scaler_cols(scaler, fallback_cols: List[str]) -> List[str]:
    # scaler가 학습 시점의 컬럼명을 기억하면 그걸 최우선으로 사용
    if hasattr(scaler, "feature_names_in_"):
        return list(scaler.feature_names_in_)
    return list(fallback_cols)


def _transform_with_scaler(
    scaler,
    cols: List[str],
    x: np.ndarray,
) -> np.ndarray:
    """
    StandardScaler feature_names_in_가 있는 경우 DataFrame으로 transform하여
    - 경고 제거
    - 컬럼 순서/매핑 강제
    """
    if hasattr(scaler, "feature_names_in_"):
        Xdf = pd.DataFrame([x], columns=cols)
        out = scaler.transform(Xdf)[0]
    else:
        out = scaler.transform(x.reshape(1, -1))[0]
    return out


# TCN Model (same skeleton used at training)
class SessionTCN(nn.Module):
    def __init__(
        self,
        num_features: int,
        num_channels: List[int] = [32, 64],
        kernel_size: int = 3,
        dropout: float = 0.2,
    ):
        super().__init__()
        self.tcn = TCN(
            num_inputs=num_features,
            num_channels=num_channels,
            kernel_size=kernel_size,
            dropout=dropout,
            causal=True,
            input_shape="NCL",
            use_norm="weight_norm",
            activation="relu",
            use_skip_connections=True,
        )
        self.head = nn.Sequential(
            nn.AdaptiveAvgPool1d(1),
            nn.Flatten(),
            nn.Linear(num_channels[-1], 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.tcn(x)
        out = self.head(h)
        return out.squeeze(1)


# Session buffer (per key)
class SessionBuffer:
    def __init__(self, max_len: int):
        self.max_len = int(max_len)
        self.buf: DefaultDict[str, Deque[np.ndarray]] = defaultdict(lambda: deque(maxlen=self.max_len))

    def push(self, key: str, feat_vec: np.ndarray) -> None:
        self.buf[key].append(np.asarray(feat_vec, dtype=np.float32))

    def get_padded_ncl(self, key: str, F: int) -> Tuple[np.ndarray, int]:
        seq = list(self.buf[key])
        L = len(seq)
        if L == 0:
            return np.zeros((1, F, self.max_len), dtype=np.float32), 0

        X = np.stack(seq, axis=0)  # (L, F)

        if L > self.max_len:
            X = X[: self.max_len, :]
            L = self.max_len

        padded = np.zeros((1, F, self.max_len), dtype=np.float32)
        padded[0, :, :L] = X.T  # (1, F, L)
        return padded, L


# Diagnostics helper (optional)
class OnlineDiag:
    """
    스트리밍 처리 중에:
    - 컬럼별 nan/inf count, max_abs
    - svm score 상수 여부
    - tcn prob 0몰림/상수 여부
    - key 분포
    - 시간 측정
    를 누적한다.
    """
    def __init__(self, track_cols: List[str], topk: int = 15):
        self.cols = list(track_cols)
        self.topk = int(topk)

        self.nan_cnt = Counter()
        self.inf_cnt = Counter()
        self.max_abs = defaultdict(float)

        self.svm_scores = []
        self.tcn_probs = []
        self.stage_cnt = Counter()
        self.key_cnt = Counter()

        # timing
        self.t_svm = 0.0
        self.t_tcn = 0.0
        self.t_total = 0.0
        self.n = 0

    def update_row_raw(self, flow: Dict[str, Any]) -> None:
        # 원본 값 기준 nan/inf/max_abs 의심 컬럼 집계
        for c in self.cols:
            v = flow.get(c, 0.0)
            try:
                fv = float(v)
                if math.isnan(fv):
                    self.nan_cnt[c] += 1
                elif math.isinf(fv):
                    self.inf_cnt[c] += 1
                else:
                    a = abs(fv)
                    if a > self.max_abs[c]:
                        self.max_abs[c] = a
            except Exception:
                # 문자열 등 -> NaN 취급(의심)
                self.nan_cnt[c] += 1

    def update_result(
        self,
        key: str,
        stage: str,
        svm_raw: float,
        tcn_prob: Optional[float],
        dt_svm: float,
        dt_tcn: float,
        dt_total: float,
    ) -> None:
        self.n += 1
        self.key_cnt[key] += 1
        self.stage_cnt[stage] += 1
        self.svm_scores.append(float(svm_raw))
        if tcn_prob is not None:
            self.tcn_probs.append(float(tcn_prob))

        self.t_svm += float(dt_svm)
        self.t_tcn += float(dt_tcn)
        self.t_total += float(dt_total)

    def report(self) -> str:
        lines = []
        n = max(self.n, 1)

        lines.append("\n======================")
        lines.append("DIAGNOSTICS SUMMARY")
        lines.append("======================")
        lines.append(f"rows: {self.n}")
        lines.append(f"stage_cnt: {dict(self.stage_cnt)}")

        # key concentration
        if len(self.key_cnt) > 0:
            top_keys = self.key_cnt.most_common(3)
            uniq = len(self.key_cnt)
            lines.append(f"unique keys: {uniq}")
            lines.append("top keys: " + ", ".join([f"{k}({v})" for k, v in top_keys]))

        # timing
        lines.append("\n[TIMING]")
        lines.append(f"avg total per-row: {self.t_total/n*1000:.3f} ms")
        lines.append(f"avg svm   per-row: {self.t_svm/n*1000:.3f} ms")
        lines.append(f"avg tcn   per-row: {self.t_tcn/n*1000:.3f} ms")

        # svm raw const check
        if len(self.svm_scores) > 0:
            s = np.asarray(self.svm_scores, dtype=float)
            lines.append("\n[SVM SCORE CHECK]")
            lines.append(f"raw min/median/max: {float(np.min(s)):.6f} / {float(np.median(s)):.6f} / {float(np.max(s)):.6f}")
            if float(np.max(s) - np.min(s)) < 1e-9:
                lines.append("!! svm_raw_score looks CONSTANT -> feature mapping / scaling pipeline likely broken")

        # tcn prob check
        if len(self.tcn_probs) > 0:
            p = np.asarray(self.tcn_probs, dtype=float)
            lines.append("\n[TCN PROB CHECK]")
            lines.append(f"prob min/p50/p95/max: {float(np.min(p)):.6f} / {float(np.median(p)):.6f} / {float(np.percentile(p,95)):.6f} / {float(np.max(p)):.6f}")
            if float(np.max(p) - np.min(p)) < 1e-6:
                lines.append("!! tcn_prob looks CONSTANT -> inputs may be collapsed/constant, or model not receiving meaningful variation")

        # suspicious columns
        # score: inf_cnt, nan_cnt, max_abs
        susp = []
        for c in self.cols:
            infn = self.inf_cnt.get(c, 0)
            nann = self.nan_cnt.get(c, 0)
            mx = self.max_abs.get(c, 0.0)
            if infn > 0 or nann > 0:
                susp.append((infn, nann, mx, c))

        susp.sort(reverse=True, key=lambda t: (t[0], t[1], t[2]))
        lines.append("\n[TOP SUSPICIOUS COLUMNS (raw input)]")
        if len(susp) == 0:
            lines.append("- (none)")
        else:
            for infn, nann, mx, c in susp[: self.topk]:
                lines.append(f"- {c}: inf={infn}, nan/parse_fail={nann}, max_abs≈{mx}")

        return "\n".join(lines)


# Hybrid Engine
class SVMTCNHybrid:
    """
    Stage1: OCSVM gate
    Stage2: Session-based TCN
    + Safe featurization (nan/inf/clip)
    + Optional online diagnostics
    """
    def __init__(
        self,
        ocsvm_bundle_path: str,
        tcn_state_dict_path: str,
        tcn_meta_path: str,
        key_mode: str = "5tuple",
        device: Optional[str] = None,
        # safety
        clip_abs: float = 1e12,
        # diagnostics
        enable_diag: bool = False,
        diag_topk: int = 15,
        args=None,
    ):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)

        self.clip_abs = float(clip_abs)
        self.key_mode = key_mode

        self.args = args

        # OCSVM bundle load
        bundle = joblib.load(ocsvm_bundle_path)
        self.ocsvm = bundle["model"]
        self.svm_scaler = bundle["scaler"]
        self.svm_threshold = float(bundle["threshold"])
        self.svm_direction = str(bundle.get("direction", "HIGH raw_score => ATTACK"))

        # bundle 키 이름 호환
        if "features" in bundle:
            self.svm_feature_cols = list(bundle["features"])
        else:
            self.svm_feature_cols = list(bundle.get("feature_cols", []))

        if not self.svm_feature_cols:
            raise ValueError("OCSVM bundle에서 feature list를 찾지 못했습니다. (features/feature_cols 확인)")

        self.svm_cols = _scaler_cols(self.svm_scaler, self.svm_feature_cols)
        self.svm_num_features = len(self.svm_cols)

        # TCN meta load
        meta = joblib.load(tcn_meta_path)
        self.tcn_feature_cols = list(meta["feature_cols"])
        self.tcn_max_len = int(meta["max_len"])
        self.tcn_attack_threshold = float(meta["threshold"])
        self.tcn_scaler = meta["scaler"]

        self.tcn_cols = _scaler_cols(self.tcn_scaler, self.tcn_feature_cols)
        self.tcn_num_features = len(self.tcn_cols)

        # TCN state_dict load
        self.tcn = SessionTCN(num_features=self.tcn_num_features).to(self.device)
        sd = torch.load(tcn_state_dict_path, map_location="cpu")
        self.tcn.load_state_dict(sd, strict=True)
        self.tcn.eval()

        # session buffer
        self.session_buf = SessionBuffer(max_len=self.tcn_max_len)

        # diagnostics
        self.diag: Optional[OnlineDiag] = None
        if enable_diag:
            # raw 의심 컬럼은 “SVM + TCN 전체”로 잡아두면 원인 찾기 쉬움
            track_cols = sorted(list(set(self.svm_cols) | set(self.tcn_cols)))
            self.diag = OnlineDiag(track_cols=track_cols, topk=diag_topk)

    def make_key(self, flow: Dict[str, Any]) -> str:
        if self.key_mode == "src_ip":
            return str(flow.get("IPV4_SRC_ADDR", "unknown"))

        return (
            f'{flow.get("IPV4_SRC_ADDR","?")}-'
            f'{flow.get("L4_SRC_PORT","?")}-'
            f'{flow.get("IPV4_DST_ADDR","?")}-'
            f'{flow.get("L4_DST_PORT","?")}-'
            f'{flow.get("PROTOCOL","?")}'
        )

    # Featurize (safe)
    def svm_featurize(self, flow: Dict[str, Any]) -> np.ndarray:
        vals = [_to_float(flow.get(c, 0.0)) for c in self.svm_cols]
        x = _sanitize_vec(np.array(vals, dtype=np.float64), clip_abs=self.clip_abs).astype(np.float32)

        if x.shape[0] != self.svm_num_features:
            raise ValueError(f"SVM feature dim mismatch: got {x.shape[0]}, expected {self.svm_num_features}")
        return x

    def tcn_featurize(self, flow: Dict[str, Any]) -> np.ndarray:
        vals = [_to_float(flow.get(c, 0.0)) for c in self.tcn_cols]
        x = _sanitize_vec(np.array(vals, dtype=np.float64), clip_abs=self.clip_abs).astype(np.float32)

        if x.shape[0] != self.tcn_num_features:
            raise ValueError(f"TCN feature dim mismatch: got {x.shape[0]}, expected {self.tcn_num_features}")

        # scaler 적용 (DataFrame 사용 가능하면 사용)
        x_scaled = _transform_with_scaler(self.tcn_scaler, self.tcn_cols, x)
        x_scaled = _sanitize_vec(np.array(x_scaled, dtype=np.float64), clip_abs=self.clip_abs).astype(np.float32)
        return x_scaled

    def svm_stage(self, x_svm: np.ndarray, diag: bool = False):
        X = x_svm.reshape(1, -1)

        # scaler가 기억한 feature 순서 강제
        if hasattr(self.svm_scaler, "feature_names_in_"):
            cols = list(self.svm_scaler.feature_names_in_)
            X_in = pd.DataFrame(X, columns=cols)
            Xs = self.svm_scaler.transform(X_in)
        else:
            Xs = self.svm_scaler.transform(X)

        svm_raw = float(self.ocsvm.decision_function(Xs)[0])
        svm_attack_score = -svm_raw

        thr = getattr(self.args, "svm_raw_threshold", None)
        if thr is None: 
            thr = self.svm_threshold

        svm_is_attack = (svm_raw < thr)

        return svm_raw, svm_attack_score, bool(svm_is_attack)

    # Stage2: TCN inference
    @torch.no_grad()
    def tcn_stage(self, key: str) -> Tuple[bool, Optional[float]]:
        padded, L = self.session_buf.get_padded_ncl(key, F=self.tcn_num_features)
        if L == 0:
            return False, None
        x = torch.tensor(padded, dtype=torch.float32, device=self.device)
        logit = self.tcn(x)
        prob = torch.sigmoid(logit).item()
        return True, float(prob)

    # main
    def process_flow(self, flow: Dict[str, Any]) -> HybridResult:
        t0 = time.perf_counter()
        ts = time.time()
        key = self.make_key(flow)
        flow = preprocess_row(flow)

        if self.diag is not None:
            self.diag.update_row_raw(flow)

        # (A) TCN buffer update (항상)
        x_tcn = self.tcn_featurize(flow)
        self.session_buf.push(key, x_tcn)

        # (B) Stage1: SVM
        t1 = time.perf_counter()
        x_svm = self.svm_featurize(flow)
        svm_raw, svm_attack_score, svm_is_attack = self.svm_stage(x_svm, diag=self.diag)
        t2 = time.perf_counter()

        if not svm_is_attack:
            res = HybridResult(
                ts=ts, key=key,
                svm_raw_score=svm_raw,
                svm_attack_score=svm_attack_score,
                svm_is_attack=False,
                tcn_ready=False, tcn_attack_prob=None,
                final_is_attack=False,
                stage="svm_pass",
                reason="SVM inlier(pass)",
            )
            if self.diag is not None:
                self.diag.update_result(key, res.stage, svm_raw, None, dt_svm=(t2 - t1), dt_tcn=0.0, dt_total=(time.perf_counter() - t0))
            return res

        # (C) Stage2: TCN
        t3 = time.perf_counter()
        ready, tcn_prob = self.tcn_stage(key)
        t4 = time.perf_counter()

        if not ready:
            res = HybridResult(
                ts=ts, key=key,
                svm_raw_score=svm_raw,
                svm_attack_score=svm_attack_score,
                svm_is_attack=True,
                tcn_ready=False, tcn_attack_prob=None,
                final_is_attack=False,
                stage="svm_only",
                reason="SVM outlier but TCN session not ready",
            )
            if self.diag is not None:
                self.diag.update_result(key, res.stage, svm_raw, None, dt_svm=(t2 - t1), dt_tcn=(t4 - t3), dt_total=(time.perf_counter() - t0))
            return res

        if (tcn_prob is not None) and (tcn_prob >= self.tcn_attack_threshold):
            res = HybridResult(
                ts=ts, key=key,
                svm_raw_score=svm_raw,
                svm_attack_score=svm_attack_score,
                svm_is_attack=True,
                tcn_ready=True, tcn_attack_prob=tcn_prob,
                final_is_attack=True,
                stage="tcn_alert",
                reason=f"TCN attack_prob >= {self.tcn_attack_threshold}",
            )
            if self.diag is not None:
                self.diag.update_result(key, res.stage, svm_raw, tcn_prob, dt_svm=(t2 - t1), dt_tcn=(t4 - t3), dt_total=(time.perf_counter() - t0))
            return res

        res = HybridResult(
            ts=ts, key=key,
            svm_raw_score=svm_raw,
            svm_attack_score=svm_attack_score,
            svm_is_attack=True,
            tcn_ready=True, tcn_attack_prob=tcn_prob,
            final_is_attack=False,
            stage="tcn_pass",
            reason="TCN judged benign/low confidence",
        )
        if self.diag is not None:
            self.diag.update_result(key, res.stage, svm_raw, tcn_prob, dt_svm=(t2 - t1), dt_tcn=(t4 - t3), dt_total=(time.perf_counter() - t0))
        return res

    def diag_report(self) -> Optional[str]:
        if self.diag is None:
            return None
        return self.diag.report()


# run_checklist.py 호환용 별칭
HybridEngine = SVMTCNHybrid


# Optional CLI: quick smoke/diag
def _cli():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="CSV path (raw or prepared)")
    ap.add_argument("--ocsvm", required=True)
    ap.add_argument("--tcn", required=True)
    ap.add_argument("--tcn_meta", required=True)
    ap.add_argument("--limit", type=int, default=50000)
    ap.add_argument("--report_every", type=int, default=10000)
    ap.add_argument("--clip", type=float, default=1e12)
    ap.add_argument("--diag", action="store_true", help="enable online diagnostics")
    ap.add_argument("--key_mode", default="5tuple", choices=["5tuple", "src_ip"])

    ap.add_argument("--svm_raw_threshold", type=float, default=None,
                help="Override raw threshold: attack if raw < thr")
    ap.add_argument("--svm_use_predict", action="store_true",
                help="Use ocsvm.predict() instead of raw threshold")

    args = ap.parse_args()

    df = pd.read_csv(args.data, nrows=None if args.limit == 0 else args.limit)

    engine = SVMTCNHybrid(
        ocsvm_bundle_path=args.ocsvm,
        tcn_state_dict_path=args.tcn,
        tcn_meta_path=args.tcn_meta,
        key_mode=args.key_mode,
        device=None,
        clip_abs=args.clip,
        enable_diag=args.diag,
        args=args,
    )

    stage_cnt = Counter()
    t0 = time.perf_counter()
    for i, (_, row) in enumerate(df.iterrows(), start=1):
        res = engine.process_flow(row.to_dict())
        stage_cnt[res.stage] += 1
        if args.report_every and (i % args.report_every == 0):
            print(f"[{i}/{len(df)}] stage={dict(stage_cnt)}")

    dt = time.perf_counter() - t0
    print("\nDone.")
    print("rows:", len(df))
    print("total time:", dt, "sec")
    print("stage:", dict(stage_cnt))

    rep = engine.diag_report()
    if rep:
        print(rep)

if __name__ == "__main__":
    _cli()
