import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "processed" / "merged_dataset.json"


def is_valid_feature_row(row: dict) -> bool:
    # 최소한 이 정도만 있으면 유효하다고 보자
    if row.get("inBytes") is None:
        return False
    if row.get("inPkts") is None:
        return False
    if row.get("flowDuration") is None:
        return False
    return True


def main():
    if not DATASET_PATH.exists():
        print("[train_pipeline] dataset not found. run build_dataset.py first.")
        return

    with DATASET_PATH.open("r", encoding="utf-8") as f:
        rows = json.load(f)

    print(f"[train_pipeline] loaded rows = {len(rows)}")

    valid_rows = [row for row in rows if is_valid_feature_row(row)]
    print(f"[train_pipeline] valid feature rows = {len(valid_rows)}")

    normal_rows = [row for row in valid_rows if row.get("isAnomaly") is False]
    anomaly_rows = [row for row in valid_rows if row.get("isAnomaly") is True]
    unlabeled_rows = [row for row in valid_rows if row.get("isAnomaly") is None]

    print(f"[train_pipeline] normal_count={len(normal_rows)}")
    print(f"[train_pipeline] anomaly_count={len(anomaly_rows)}")
    print(f"[train_pipeline] unlabeled_count={len(unlabeled_rows)}")

    normal_output = BASE_DIR / "data" / "processed" / "normal_dataset.json"
    with normal_output.open("w", encoding="utf-8") as f:
        json.dump(normal_rows, f, ensure_ascii=False, indent=2)

    anomaly_output = BASE_DIR / "data" / "processed" / "anomaly_dataset.json"
    with anomaly_output.open("w", encoding="utf-8") as f:
        json.dump(anomaly_rows, f, ensure_ascii=False, indent=2)

    print(f"[train_pipeline] saved normal dataset to {normal_output}")
    print(f"[train_pipeline] saved anomaly dataset to {anomaly_output}")
    print("[train_pipeline] TODO: connect real OCSVM / TCN retraining here")


if __name__ == "__main__":
    main()