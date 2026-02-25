import logging
import threading
from datetime import datetime, timezone
from typing import Optional

from scapy.layers.dns import DNS, DNSQR, DNSRR
from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.sendrecv import sniff

from config import INTERFACE
from flow import FlowTable

logger = logging.getLogger(__name__)

_FTP_PORT = 21


def _extract_ftp_ret_code(pkt) -> Optional[int]:
    """FTP 응답 코드 추출 (예: '220 FTP server ready' → 220)."""
    if TCP not in pkt:
        return None
    tcp = pkt[TCP]
    if _FTP_PORT not in (tcp.sport, tcp.dport):
        return None
    payload = bytes(tcp.payload)
    if not payload:
        return None
    try:
        text = payload.decode("ascii", errors="ignore")
        code_str = text[:3]
        if code_str.isdigit():
            return int(code_str)
    except Exception:
        pass
    return None


def _make_callback(flow_table: FlowTable):
    def _packet_callback(pkt) -> None:
        if IP not in pkt:
            return

        ip = pkt[IP]
        src_ip: str = ip.src
        dst_ip: str = ip.dst
        ttl: int = ip.ttl
        size: int = len(pkt)
        proto: int = ip.proto  # IANA 프로토콜 번호
        timestamp = datetime.now(tz=timezone.utc)

        flags: int = 0
        tcp_win: Optional[int] = None
        icmp_type: Optional[int] = None
        icmp_ipv4_type: Optional[int] = None

        if TCP in pkt:
            src_port: int = pkt[TCP].sport
            dst_port: int = pkt[TCP].dport
            flags = int(pkt[TCP].flags)
            tcp_win = pkt[TCP].window
        elif UDP in pkt:
            src_port = pkt[UDP].sport
            dst_port = pkt[UDP].dport
        elif ICMP in pkt:
            src_port = 0
            dst_port = 0
            # nProbe 방식: type * 256 + code
            icmp_type = pkt[ICMP].type * 256 + pkt[ICMP].code
            icmp_ipv4_type = pkt[ICMP].type
        else:
            return

        # DNS (UDP/TCP 포트 53)
        dns_query_id: Optional[int] = None
        dns_query_type: Optional[int] = None
        dns_ttl_answer: Optional[int] = None
        if DNS in pkt:
            dns = pkt[DNS]
            dns_query_id = dns.id
            if dns.qdcount > 0 and DNSQR in pkt:
                dns_query_type = pkt[DNSQR].qtype
            if dns.ancount > 0 and DNSRR in pkt:
                dns_ttl_answer = pkt[DNSRR].ttl

        # FTP
        ftp_ret_code = _extract_ftp_ret_code(pkt)

        flow_table.add_packet(
            src_ip=src_ip,
            dst_ip=dst_ip,
            src_port=src_port,
            dst_port=dst_port,
            protocol=proto,
            size=size,
            flags=flags,
            ttl=ttl,
            tcp_win=tcp_win,
            timestamp=timestamp,
            icmp_type=icmp_type,
            icmp_ipv4_type=icmp_ipv4_type,
            dns_query_id=dns_query_id,
            dns_query_type=dns_query_type,
            dns_ttl_answer=dns_ttl_answer,
            ftp_ret_code=ftp_ret_code,
        )

    return _packet_callback


def start_capture(flow_table: FlowTable) -> threading.Thread:
    """백그라운드 스레드에서 패킷 캡처를 시작합니다."""

    def _run():
        logger.info("패킷 캡처 시작 (interface=%s)", INTERFACE)
        sniff(
            iface=INTERFACE,
            prn=_make_callback(flow_table),
            store=False,
            filter="tcp or udp or icmp",
        )

    t = threading.Thread(target=_run, name="capture-thread", daemon=True)
    t.start()
    return t
