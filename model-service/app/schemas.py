from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class FlowPredictRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    documentId: str
    projectId: int
    ingestedAt: str

    srcIp: str = Field(alias="IPV4_SRC_ADDR")
    dstIp: str = Field(alias="IPV4_DST_ADDR")
    srcPort: int = Field(alias="L4_SRC_PORT")
    dstPort: int = Field(alias="L4_DST_PORT")
    protocol: int = Field(alias="PROTOCOL")

    inBytes: int = Field(alias="IN_BYTES")
    inPkts: int = Field(alias="IN_PKTS")
    outBytes: Optional[int] = Field(default=0, alias="OUT_BYTES")
    outPkts: Optional[int] = Field(default=0, alias="OUT_PKTS")
    flowDuration: Optional[int] = Field(default=0, alias="FLOW_DURATION_MILLISECONDS")

    tcpFlags: Optional[int] = Field(default=0, alias="TCP_FLAGS")
    clientTcpFlags: Optional[int] = Field(default=0, alias="CLIENT_TCP_FLAGS")
    serverTcpFlags: Optional[int] = Field(default=0, alias="SERVER_TCP_FLAGS")
    durationIn: Optional[int] = Field(default=0, alias="DURATION_IN")
    durationOut: Optional[int] = Field(default=0, alias="DURATION_OUT")
    minTtl: Optional[int] = Field(default=0, alias="MIN_TTL")
    maxTtl: Optional[int] = Field(default=0, alias="MAX_TTL")
    longestFlowPkt: Optional[int] = Field(default=0, alias="LONGEST_FLOW_PKT")
    shortestFlowPkt: Optional[int] = Field(default=0, alias="SHORTEST_FLOW_PKT")
    minIpPktLen: Optional[int] = Field(default=0, alias="MIN_IP_PKT_LEN")
    maxIpPktLen: Optional[int] = Field(default=0, alias="MAX_IP_PKT_LEN")
    srcToDstSecondBytes: Optional[float] = Field(default=0, alias="SRC_TO_DST_SECOND_BYTES")
    dstToSrcSecondBytes: Optional[float] = Field(default=0, alias="DST_TO_SRC_SECOND_BYTES")
    retransmittedInBytes: Optional[int] = Field(default=0, alias="RETRANSMITTED_IN_BYTES")
    retransmittedInPkts: Optional[int] = Field(default=0, alias="RETRANSMITTED_IN_PKTS")
    retransmittedOutBytes: Optional[int] = Field(default=0, alias="RETRANSMITTED_OUT_BYTES")
    retransmittedOutPkts: Optional[int] = Field(default=0, alias="RETRANSMITTED_OUT_PKTS")
    srcToDstAvgThroughput: Optional[float] = Field(default=0, alias="SRC_TO_DST_AVG_THROUGHPUT")
    dstToSrcAvgThroughput: Optional[float] = Field(default=0, alias="DST_TO_SRC_AVG_THROUGHPUT")
    numPktsUpTo128Bytes: Optional[int] = Field(default=0, alias="NUM_PKTS_UP_TO_128_BYTES")
    numPkts128To256Bytes: Optional[int] = Field(default=0, alias="NUM_PKTS_128_TO_256_BYTES")
    numPkts256To512Bytes: Optional[int] = Field(default=0, alias="NUM_PKTS_256_TO_512_BYTES")
    numPkts512To1024Bytes: Optional[int] = Field(default=0, alias="NUM_PKTS_512_TO_1024_BYTES")
    numPkts1024To1514Bytes: Optional[int] = Field(default=0, alias="NUM_PKTS_1024_TO_1514_BYTES")
    tcpWinMaxIn: Optional[int] = Field(default=0, alias="TCP_WIN_MAX_IN")
    tcpWinMaxOut: Optional[int] = Field(default=0, alias="TCP_WIN_MAX_OUT")
    icmpType: Optional[int] = Field(default=0, alias="ICMP_TYPE")
    icmpIpv4Type: Optional[int] = Field(default=0, alias="ICMP_IPV4_TYPE")
    dnsQueryId: Optional[int] = Field(default=0, alias="DNS_QUERY_ID")
    dnsQueryType: Optional[int] = Field(default=0, alias="DNS_QUERY_TYPE")
    dnsTtlAnswer: Optional[int] = Field(default=0, alias="DNS_TTL_ANSWER")
    ftpCommandRetCode: Optional[int] = Field(default=0, alias="FTP_COMMAND_RET_CODE")
    srcToDstIatMin: Optional[int] = Field(default=0, alias="SRC_TO_DST_IAT_MIN")
    srcToDstIatMax: Optional[int] = Field(default=0, alias="SRC_TO_DST_IAT_MAX")
    srcToDstIatAvg: Optional[float] = Field(default=0, alias="SRC_TO_DST_IAT_AVG")
    srcToDstIatStddev: Optional[float] = Field(default=0, alias="SRC_TO_DST_IAT_STDDEV")
    dstToSrcIatMin: Optional[int] = Field(default=0, alias="DST_TO_SRC_IAT_MIN")
    dstToSrcIatMax: Optional[int] = Field(default=0, alias="DST_TO_SRC_IAT_MAX")
    dstToSrcIatAvg: Optional[float] = Field(default=0, alias="DST_TO_SRC_IAT_AVG")
    dstToSrcIatStddev: Optional[float] = Field(default=0, alias="DST_TO_SRC_IAT_STDDEV")


class FlowPredictResponse(BaseModel):
    documentId: str
    isAnomaly: bool
    anomalyScore: float
    modelVersion: str
    stage: Optional[str] = None
    svmRaw: Optional[float] = None
    tcnProb: Optional[float] = None
    reason: Optional[str] = None