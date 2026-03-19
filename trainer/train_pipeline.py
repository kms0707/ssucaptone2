from pathlib import Path
import json


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "processed" / "merged_dataset.json"


def main():
    if not DATASET_PATH.exists():
        print("[train_pipeline] dataset not found. run build_dataset.py first.")
        return

    with DATASET_PATH.open("r", encoding="utf-8") as f:
        rows = json.load(f)

    print(f"[train_pipeline] loaded rows = {len(rows)}")

    normal_count = 0
    anomaly_count = 0

    for row in rows:
        result = row.get("result", {})
        is_anomaly = result.get("isAnomaly")
        if is_anomaly is True:
            anomaly_count += 1
        elif is_anomaly is False:
            normal_count += 1

    print(f"[train_pipeline] normal_count={normal_count}, anomaly_count={anomaly_count}")
    print("[train_pipeline] TODO: connect OCSVM / TCN training here")


if __name__ == "__main__":
    main()