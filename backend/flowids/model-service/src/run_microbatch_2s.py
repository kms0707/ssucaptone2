# run_microbatch_2s.py
from __future__ import annotations

import argparse
import os
import time
from collections import deque
from dataclasses import asdict
from typing import Dict, Any, List, Optional, Tuple

from svm_tcn_hybrid import SVMTCNHybrid  # 너희 기존 코드
from feature_builder_zeek import ZeekConnTailer, FeatureState, build_features_from_zeek_conn
from preprocess_online import preprocess_row


def chunk_every_2s(buf: deque, now: float, batch_sec: float) -> List[Dict[str, Any]]:
    """buf items: (event_ts, zeek_row_dict). Collect those with event_ts <= now - batch_sec? NO.
    We do: flush periodically every batch_sec using wall clock; but keep event order.
    """
    out: List[Dict[str, Any]] = []
    while buf:
        out.append(buf.popleft())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--conn_log", required=True, help="Zeek conn.log path (ASCII TSV)")
    ap.add_argument("--ocsvm", required=True, help="ocsvm bundle joblib")
    ap.add_argument("--tcn", required=True, help="tcn stage2 pt")
    ap.add_argument("--tcn_meta", required=True, help="tcn meta joblib")
    ap.add_argument("--svm_raw_threshold", type=float, default=9.0, help="SVM gate raw<thr => outlier")
    ap.add_argument("--batch_sec", type=float, default=2.0, help="microbatch window (sec)")
    ap.add_argument("--max_queue", type=int, default=200000, help="max in-memory queued zeek events")
    ap.add_argument("--report_every", type=int, default=1000, help="print every N processed")
    ap.add_argument("--key_mode", default="5tuple", choices=["5tuple", "src_ip"])
    ap.add_argument("--clip", type=float, default=1e12)
    ap.add_argument("--diag", action="store_true", help="enable hybrid diag (heavy)")

    # (옵션) 결과를 파일(JSONL)로 남기기
    ap.add_argument("--out_jsonl", default="", help="append results to JSONL (optional)")
    args = ap.parse_args()

    # Hybrid engine
    engine = SVMTCNHybrid(
        ocsvm_bundle_path=args.ocsvm,
        tcn_state_dict_path=args.tcn,
        tcn_meta_path=args.tcn_meta,
        key_mode=args.key_mode,
        device=None,
        clip_abs=args.clip,
        enable_diag=args.diag,
        # 아래 두 줄은 너희 hybrid 코드가 args를 받도록 수정했을 때만 유효.
        # 혹시 안 받는 구조면 hybrid 내부에서 threshold override만 반영되게 바꿔둬야 함.
        args=args,
    )

    # Zeek tailer + online feature state
    tailer = ZeekConnTailer(args.conn_log)
    state = FeatureState()

    q: deque = deque()
    last_flush = time.time()
    processed = 0

    fout = None
    if args.out_jsonl:
        os.makedirs(os.path.dirname(args.out_jsonl) or ".", exist_ok=True)
        fout = open(args.out_jsonl, "a", encoding="utf-8")

    print(f"[RUN] tailing {args.conn_log} | microbatch={args.batch_sec}s | svm_thr={args.svm_raw_threshold}")
    try:
        while True:
            zeek_row = tailer.read_next(timeout=0.2)  # dict or None
            now = time.time()

            if zeek_row is not None:
                if len(q) >= args.max_queue:
                    # 과부하 보호: 가장 오래된 것 드랍
                    q.popleft()
                q.append(zeek_row)

            # flush every batch_sec
            if now - last_flush >= args.batch_sec:
                batch = chunk_every_2s(q, now, args.batch_sec)
                last_flush = now
                if not batch:
                    continue

                for zr in batch:
                    # 1) Zeek raw → model feature dict (25개 스키마)
                    feat = build_features_from_zeek_conn(zr, state)

                    # 2) preprocess (nan/inf/clip/log1p/ratio 등)
                    feat = preprocess_row(feat, clip_abs=args.clip)

                    # 3) inference
                    res = engine.process_flow(feat)
                    processed += 1

                    if processed % args.report_every == 0:
                        print(f"[{processed}] stage={res.stage} final={int(res.final_is_attack)} "
                              f"svm_raw={res.svm_raw_score:.4f} tcn_prob={res.tcn_attack_prob}")

                    if fout is not None:
                        d = asdict(res)
                        # res에 dict 직렬화가 안 되는 값이 있으면 여기서 정리 필요
                        fout.write(str(d) + "\n")
                        fout.flush()

            # CPU 쉬기
            time.sleep(0.01)

    except KeyboardInterrupt:
        print("\n[STOP] bye")
    finally:
        if fout is not None:
            fout.close()


if __name__ == "__main__":
    main()