import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent / "data"
OUTPUT_DIR = BASE_DIR / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_jsonl_files(topic_dir: Path):
    rows = []
    if not topic_dir.exists():
        return rows

    for file in topic_dir.rglob("*.jsonl"):
        with file.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                rows.append(json.loads(line))
    return rows


def main():
    feature_rows = load_jsonl_files(BASE_DIR / "ai-flow-features")
    result_rows = load_jsonl_files(BASE_DIR / "ai-result")

    result_map = {row.get("documentId"): row for row in result_rows}

    merged = []
    for feat in feature_rows:
        doc_id = feat.get("documentId")
        result = result_map.get(doc_id, {})

        merged.append({
            "documentId": doc_id,
            "projectId": feat.get("projectId"),
            "ingestedAt": feat.get("ingestedAt"),
            "feature": feat,
            "result": result,
        })

    output_path = OUTPUT_DIR / "merged_dataset.json"
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"[build_dataset] merged rows = {len(merged)}")
    print(f"[build_dataset] saved to {output_path}")


if __name__ == "__main__":
    main()