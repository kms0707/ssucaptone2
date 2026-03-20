from pathlib import Path
from types import SimpleNamespace

from app.svm_tcn_hybrid import SVMTCNHybrid


class Predictor:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent.parent
        artifacts_dir = base_dir / "artifacts"

        args = SimpleNamespace(
            svm_raw_threshold=-45.0,   # None이면 bundle에 저장된 threshold 사용
            svm_gray_threshold=-30.0,  # gray zone upper threshold
        )

        self.model = SVMTCNHybrid(
            ocsvm_bundle_path=str(artifacts_dir / "ocsvm_bundle.joblib"),
            tcn_state_dict_path=str(artifacts_dir / "tcn_state_dict.pt"),
            tcn_meta_path=str(artifacts_dir / "tcn_meta.joblib"),
            key_mode="5tuple",
            device="cpu",
            enable_diag=False,
            args=args,
        )

    def predict(self, flow: dict) -> dict:
        result = self.model.process_flow(flow)

        def _get(obj, key, default=None):
            if obj is None:
                return default
            if isinstance(obj, dict):
                return obj.get(key, default)
            v = getattr(obj, key, default)
            if callable(v):
                try:
                    return v()
                except Exception:
                    return default
            return v

        is_anomaly = bool(_get(result, "final_is_attack", False))

        score = _get(result, "tcn_attack_prob", None)
        if score is None:
            score = _get(result, "svm_attack_score", 0.0)

        return {
            "isAnomaly": is_anomaly,
            "anomalyScore": float(score),
            "stage": _get(result, "stage"),
            "svm_raw": _get(result, "svm_raw_score"),
            "tcn_prob": _get(result, "tcn_attack_prob"),
        }
    
    