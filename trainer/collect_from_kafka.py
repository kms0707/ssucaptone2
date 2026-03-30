import json
import shutil
from datetime import datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
INCOMING_DIR = BASE_DIR / "incoming"
DATA_DIR = BASE_DIR / "data"

TOPIC_FILES = {
    "raw-flow-logs": "raw-flow-logs.jsonl",
    "ai-flow-features": "ai-flow-features.jsonl",
    "ai-result": "ai-result.jsonl",
}


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def get_output_path(topic: str) -> Path:
    today = datetime.now().strftime("%Y-%m-%d")
    topic_dir = DATA_DIR / topic / today
    ensure_dir(topic_dir)
    return topic_dir / f"{topic}.jsonl"


def append_jsonl(src: Path, dst: Path):
    with src.open("r", encoding="utf-8") as rf, dst.open("a", encoding="utf-8") as wf:
        count = 0
        for line in rf:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                wf.write(json.dumps(obj, ensure_ascii=False) + "\n")
                count += 1
            except json.JSONDecodeError:
                print(f"[collector] skip invalid json line in {src.name}")
        return count


def main():
    ensure_dir(INCOMING_DIR)
    ensure_dir(DATA_DIR)

    print(f"[collector] file mode started. incoming={INCOMING_DIR}")

    found_any = False

    for topic, filename in TOPIC_FILES.items():
        src = INCOMING_DIR / filename
        if not src.exists():
            print(f"[collector] no input file for topic={topic}: {src}")
            continue

        found_any = True
        dst = get_output_path(topic)
        count = append_jsonl(src, dst)
        print(f"[collector] imported topic={topic}, rows={count}, saved={dst}")

        # 처리 후 백업 이동
        archive_dir = INCOMING_DIR / "archived"
        ensure_dir(archive_dir)
        archived_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        shutil.move(str(src), str(archive_dir / archived_name))
        print(f"[collector] moved source to archive: {archive_dir / archived_name}")

    if not found_any:
        print("[collector] no incoming files found.")


if __name__ == "__main__":
    main()