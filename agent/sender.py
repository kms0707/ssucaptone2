import logging
import threading
import time

import requests

from config import API_KEY, BACKEND_URL, SEND_INTERVAL
from flow import FlowTable

logger = logging.getLogger(__name__)

_ERROR_LOG = "agent_error.log"
_MAX_RETRIES = 3
_ENDPOINT = f"{BACKEND_URL}/api/v1/logs"


def _log_failure(flows: list[dict], reason: str) -> None:
    with open(_ERROR_LOG, "a", encoding="utf-8") as f:
        f.write(
            f"[{time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}] "
            f"전송 실패({reason}): {len(flows)}개 Flow 버림\n"
        )


def send_batch(flow_table: FlowTable) -> None:
    """FlowTable 스냅샷을 획득해 백엔드에 배치 전송합니다."""
    flows = flow_table.snapshot_and_reset()
    if not flows:
        logger.debug("전송할 Flow 없음, 스킵")
        return

    logger.info("배치 전송 시도: %d개 Flow", len(flows))
    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
    }

    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            resp = requests.post(
                _ENDPOINT,
                json=flows,
                headers=headers,
                timeout=10,
            )
            resp.raise_for_status()
            logger.info("전송 성공 (HTTP %d)", resp.status_code)
            return
        except requests.RequestException as exc:
            wait = 2 ** (attempt - 1)  # 1s, 2s, 4s
            logger.warning(
                "전송 실패 (시도 %d/%d): %s — %ds 후 재시도",
                attempt,
                _MAX_RETRIES,
                exc,
                wait,
            )
            if attempt < _MAX_RETRIES:
                time.sleep(wait)

    reason = f"{_MAX_RETRIES}회 재시도 초과"
    logger.error("배치 전송 포기: %s", reason)
    _log_failure(flows, reason)


def start_sender(flow_table: FlowTable) -> None:
    """SEND_INTERVAL 초마다 send_batch를 반복 실행하는 타이머를 시작합니다."""

    def _loop():
        send_batch(flow_table)
        # 다음 실행을 예약 (에이전트가 종료되기 전까지 반복)
        t = threading.Timer(SEND_INTERVAL, _loop)
        t.daemon = True
        t.name = "sender-timer"
        t.start()

    t = threading.Timer(SEND_INTERVAL, _loop)
    t.daemon = True
    t.name = "sender-timer"
    t.start()
    logger.info("배치 전송 스케줄러 시작 (간격=%ds)", SEND_INTERVAL)
