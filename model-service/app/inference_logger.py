from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict


class InferenceLogger:
    def __init__(self, base_dir: str | Path):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

        self.input_path = self.base_dir / "inference_input.jsonl"
        self.result_path = self.base_dir / "inference_result.jsonl"
        self.merged_path = self.base_dir / "inference_merged.jsonl"

        self._lock = Lock()

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    def _append_jsonl(self, path: Path, payload: Dict[str, Any]) -> None:
        line = json.dumps(payload, ensure_ascii=False)
        with self._lock:
            with path.open("a", encoding="utf-8") as f:
                f.write(line + "\n")

    def log_input(self, request_id: str, payload: Dict[str, Any]) -> None:
        self._append_jsonl(
            self.input_path,
            {
                "loggedAt": self._now_iso(),
                "requestId": request_id,
                "input": payload,
            },
        )

    def log_result(self, request_id: str, payload: Dict[str, Any]) -> None:
        self._append_jsonl(
            self.result_path,
            {
                "loggedAt": self._now_iso(),
                "requestId": request_id,
                "result": payload,
            },
        )

    def log_merged(
        self,
        request_id: str,
        input_payload: Dict[str, Any],
        result_payload: Dict[str, Any],
    ) -> None:
        self._append_jsonl(
            self.merged_path,
            {
                "loggedAt": self._now_iso(),
                "requestId": request_id,
                "input": input_payload,
                "result": result_payload,
            },
        )