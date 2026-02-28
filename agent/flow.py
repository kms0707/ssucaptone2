import math
import threading
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

# IANA Protocol Numbers
PROTO_ICMP = 1
PROTO_TCP = 6
PROTO_UDP = 17


def _compute_iat_stats(
    timestamps: list,
) -> tuple[Optional[int], Optional[int], Optional[float], Optional[float]]:
    """IAT min/max/avg/stddev (마이크로초). 패킷 2개 미만이면 (None, None, None, None)."""
    if len(timestamps) < 2:
        return None, None, None, None

    iats = [
        (timestamps[i] - timestamps[i - 1]).total_seconds() * 1_000_000
        for i in range(1, len(timestamps))
    ]
    n = len(iats)
    iat_min = int(min(iats))
    iat_max = int(max(iats))
    iat_avg = sum(iats) / n
    iat_var = sum((x - iat_avg) ** 2 for x in iats) / n
    iat_stddev = math.sqrt(iat_var)
    return iat_min, iat_max, iat_avg, iat_stddev


@dataclass
class FlowEntry:
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: int       # IANA number (TCP=6, UDP=17, ICMP=1)
    first_seen: datetime
    last_seen: datetime

    # Bidirectional counters
    in_bytes: int = 0   # src→dst
    in_pkts: int = 0
    out_bytes: int = 0  # dst→src
    out_pkts: int = 0

    # TCP flags (bitmask integers)
    tcp_flags: int = 0
    client_tcp_flags: int = 0
    server_tcp_flags: int = 0

    # Per-direction timing
    first_seen_in: Optional[datetime] = None
    last_seen_in: Optional[datetime] = None
    first_seen_out: Optional[datetime] = None
    last_seen_out: Optional[datetime] = None

    # TTL
    min_ttl: Optional[int] = None
    max_ttl: Optional[int] = None

    # Packet size stats
    longest_flow_pkt: Optional[int] = None
    shortest_flow_pkt: Optional[int] = None
    min_ip_pkt_len: Optional[int] = None
    max_ip_pkt_len: Optional[int] = None

    # Packet size distribution
    num_pkts_up_to_128: int = 0
    num_pkts_128_256: int = 0
    num_pkts_256_512: int = 0
    num_pkts_512_1024: int = 0
    num_pkts_1024_1514: int = 0

    # TCP window max per direction
    tcp_win_max_in: Optional[int] = None
    tcp_win_max_out: Optional[int] = None

    # ICMP
    icmp_type: Optional[int] = None
    icmp_ipv4_type: Optional[int] = None

    # DNS
    dns_query_id: Optional[int] = None
    dns_query_type: Optional[int] = None
    dns_ttl_answer: Optional[int] = None

    # FTP
    ftp_command_ret_code: Optional[int] = None

    # IAT timestamp lists (내부용, 전송 안 함)
    _iat_in_ts: list = field(default_factory=list)
    _iat_out_ts: list = field(default_factory=list)

    # ── 내부 헬퍼 ──────────────────────────────────────────────────────

    def _update_ttl(self, ttl: Optional[int]) -> None:
        if ttl is None:
            return
        if self.min_ttl is None or ttl < self.min_ttl:
            self.min_ttl = ttl
        if self.max_ttl is None or ttl > self.max_ttl:
            self.max_ttl = ttl

    def _update_pkt_size(self, size: int) -> None:
        if self.longest_flow_pkt is None or size > self.longest_flow_pkt:
            self.longest_flow_pkt = size
        if self.shortest_flow_pkt is None or size < self.shortest_flow_pkt:
            self.shortest_flow_pkt = size
        if self.min_ip_pkt_len is None or size < self.min_ip_pkt_len:
            self.min_ip_pkt_len = size
        if self.max_ip_pkt_len is None or size > self.max_ip_pkt_len:
            self.max_ip_pkt_len = size

        if size <= 128:
            self.num_pkts_up_to_128 += 1
        elif size <= 256:
            self.num_pkts_128_256 += 1
        elif size <= 512:
            self.num_pkts_256_512 += 1
        elif size <= 1024:
            self.num_pkts_512_1024 += 1
        elif size <= 1514:
            self.num_pkts_1024_1514 += 1

    # ── 패킷 추가 ──────────────────────────────────────────────────────

    def add_forward(
        self,
        size: int,
        flags: int,
        ttl: Optional[int],
        tcp_win: Optional[int],
        timestamp: datetime,
        icmp_type: Optional[int] = None,
        icmp_ipv4_type: Optional[int] = None,
        dns_query_id: Optional[int] = None,
        dns_query_type: Optional[int] = None,
        dns_ttl_answer: Optional[int] = None,
        ftp_ret_code: Optional[int] = None,
    ) -> None:
        """src→dst 방향 패킷 추가."""
        self.last_seen = timestamp
        self.in_pkts += 1
        self.in_bytes += size
        self.tcp_flags |= flags
        self.client_tcp_flags |= flags

        if self.first_seen_in is None:
            self.first_seen_in = timestamp
        self.last_seen_in = timestamp
        self._iat_in_ts.append(timestamp)

        self._update_pkt_size(size)
        self._update_ttl(ttl)

        if tcp_win is not None and (
            self.tcp_win_max_in is None or tcp_win > self.tcp_win_max_in
        ):
            self.tcp_win_max_in = tcp_win

        if icmp_type is not None:
            self.icmp_type = icmp_type
        if icmp_ipv4_type is not None:
            self.icmp_ipv4_type = icmp_ipv4_type
        if dns_query_id is not None:
            self.dns_query_id = dns_query_id
        if dns_query_type is not None:
            self.dns_query_type = dns_query_type
        if dns_ttl_answer is not None:
            self.dns_ttl_answer = dns_ttl_answer
        if ftp_ret_code is not None:
            self.ftp_command_ret_code = ftp_ret_code

    def add_reverse(
        self,
        size: int,
        flags: int,
        ttl: Optional[int],
        tcp_win: Optional[int],
        timestamp: datetime,
        dns_ttl_answer: Optional[int] = None,
    ) -> None:
        """dst→src 방향 패킷 추가."""
        self.last_seen = timestamp
        self.out_pkts += 1
        self.out_bytes += size
        self.tcp_flags |= flags
        self.server_tcp_flags |= flags

        if self.first_seen_out is None:
            self.first_seen_out = timestamp
        self.last_seen_out = timestamp
        self._iat_out_ts.append(timestamp)

        self._update_pkt_size(size)
        self._update_ttl(ttl)

        if tcp_win is not None and (
            self.tcp_win_max_out is None or tcp_win > self.tcp_win_max_out
        ):
            self.tcp_win_max_out = tcp_win

        if dns_ttl_answer is not None:
            self.dns_ttl_answer = dns_ttl_answer

    # ── 직렬화 ────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        flow_dur = int((self.last_seen - self.first_seen).total_seconds() * 1000)

        dur_in = None
        if self.first_seen_in and self.last_seen_in:
            dur_in = int(
                (self.last_seen_in - self.first_seen_in).total_seconds() * 1000
            )

        dur_out = None
        if self.first_seen_out and self.last_seen_out:
            dur_out = int(
                (self.last_seen_out - self.first_seen_out).total_seconds() * 1000
            )

        # 초당 바이트 수 (bytes per second)
        src_to_dst_bps = (
            self.in_bytes / (dur_in / 1000.0) if dur_in else None
        )
        dst_to_src_bps = (
            self.out_bytes / (dur_out / 1000.0) if dur_out else None
        )

        iat_in = _compute_iat_stats(self._iat_in_ts)
        iat_out = _compute_iat_stats(self._iat_out_ts)

        return {
            "srcIp": self.src_ip,
            "dstIp": self.dst_ip,
            "srcPort": self.src_port,
            "dstPort": self.dst_port,
            "protocol": self.protocol,
            "inBytes": self.in_bytes,
            "inPkts": self.in_pkts,
            "outBytes": self.out_bytes if self.out_pkts > 0 else None,
            "outPkts": self.out_pkts if self.out_pkts > 0 else None,
            "tcpFlags": self.tcp_flags if self.tcp_flags else None,
            "clientTcpFlags": self.client_tcp_flags if self.client_tcp_flags else None,
            "serverTcpFlags": self.server_tcp_flags if self.server_tcp_flags else None,
            "flowDuration": flow_dur,
            "durationIn": dur_in,
            "durationOut": dur_out,
            "minTtl": self.min_ttl,
            "maxTtl": self.max_ttl,
            "longestFlowPkt": self.longest_flow_pkt,
            "shortestFlowPkt": self.shortest_flow_pkt,
            "minIpPktLen": self.min_ip_pkt_len,
            "maxIpPktLen": self.max_ip_pkt_len,
            "srcToDstSecondBytes": src_to_dst_bps,
            "dstToSrcSecondBytes": dst_to_src_bps,
            "retransmittedInBytes": None,
            "retransmittedInPkts": None,
            "retransmittedOutBytes": None,
            "retransmittedOutPkts": None,
            "srcToDstAvgThroughput": src_to_dst_bps,
            "dstToSrcAvgThroughput": dst_to_src_bps,
            "numPktsUpTo128Bytes": self.num_pkts_up_to_128,
            "numPkts128To256Bytes": self.num_pkts_128_256,
            "numPkts256To512Bytes": self.num_pkts_256_512,
            "numPkts512To1024Bytes": self.num_pkts_512_1024,
            "numPkts1024To1514Bytes": self.num_pkts_1024_1514,
            "tcpWinMaxIn": self.tcp_win_max_in,
            "tcpWinMaxOut": self.tcp_win_max_out,
            "icmpType": self.icmp_type,
            "icmpIpv4Type": self.icmp_ipv4_type,
            "dnsQueryId": self.dns_query_id,
            "dnsQueryType": self.dns_query_type,
            "dnsTtlAnswer": self.dns_ttl_answer,
            "ftpCommandRetCode": self.ftp_command_ret_code,
            "srcToDstIatMin": iat_in[0],
            "srcToDstIatMax": iat_in[1],
            "srcToDstIatAvg": iat_in[2],
            "srcToDstIatStddev": iat_in[3],
            "dstToSrcIatMin": iat_out[0],
            "dstToSrcIatMax": iat_out[1],
            "dstToSrcIatAvg": iat_out[2],
            "dstToSrcIatStddev": iat_out[3],
        }


class FlowTable:
    def __init__(self) -> None:
        self._table: dict[tuple, FlowEntry] = {}
        self._lock = threading.Lock()

    def add_packet(
        self,
        src_ip: str,
        dst_ip: str,
        src_port: int,
        dst_port: int,
        protocol: int,
        size: int,
        flags: int,
        ttl: Optional[int],
        tcp_win: Optional[int],
        timestamp: datetime,
        icmp_type: Optional[int] = None,
        icmp_ipv4_type: Optional[int] = None,
        dns_query_id: Optional[int] = None,
        dns_query_type: Optional[int] = None,
        dns_ttl_answer: Optional[int] = None,
        ftp_ret_code: Optional[int] = None,
    ) -> None:
        fwd_key = (src_ip, dst_ip, src_port, dst_port, protocol)
        rev_key = (dst_ip, src_ip, dst_port, src_port, protocol)

        with self._lock:
            if fwd_key in self._table:
                self._table[fwd_key].add_forward(
                    size, flags, ttl, tcp_win, timestamp,
                    icmp_type, icmp_ipv4_type,
                    dns_query_id, dns_query_type, dns_ttl_answer,
                    ftp_ret_code,
                )
            elif rev_key in self._table:
                self._table[rev_key].add_reverse(size, flags, ttl, tcp_win, timestamp, dns_ttl_answer)
            else:
                entry = FlowEntry(
                    src_ip=src_ip,
                    dst_ip=dst_ip,
                    src_port=src_port,
                    dst_port=dst_port,
                    protocol=protocol,
                    first_seen=timestamp,
                    last_seen=timestamp,
                )
                entry.add_forward(
                    size, flags, ttl, tcp_win, timestamp,
                    icmp_type, icmp_ipv4_type,
                    dns_query_id, dns_query_type, dns_ttl_answer,
                    ftp_ret_code,
                )
                self._table[fwd_key] = entry

    def snapshot_and_reset(self) -> list[dict]:
        with self._lock:
            snapshot = list(self._table.values())
            self._table.clear()
        return [entry.to_dict() for entry in snapshot]
