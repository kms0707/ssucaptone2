#!/usr/bin/env python3
"""NetSentry AI - Flow Log Agent 진입점"""

import logging
import signal
import sys

from config import AGENT_VERSION, INTERFACE, SEND_INTERVAL
from flow import FlowTable
from capture import start_capture
from sender import start_sender

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger("agent")


def main() -> None:
    logger.info(
        "NetSentry AI Agent v%s 시작 (interface=%s, interval=%ds)",
        AGENT_VERSION,
        INTERFACE,
        SEND_INTERVAL,
    )

    flow_table = FlowTable()

    def _shutdown(signum, frame):
        logger.info("종료 시그널 수신 (%d), 에이전트를 종료합니다.", signum)
        sys.exit(0)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    start_capture(flow_table)
    start_sender(flow_table)

    logger.info("에이전트 실행 중 (Ctrl+C로 종료)")
    signal.pause()


if __name__ == "__main__":
    main()
