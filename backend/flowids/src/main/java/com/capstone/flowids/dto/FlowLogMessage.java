package com.capstone.flowids.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class FlowLogMessage {

    private String documentId;
    private Long projectId;
    private String ingestedAt;

    @JsonProperty("IPV4_SRC_ADDR")
    private String srcIp;

    @JsonProperty("IPV4_DST_ADDR")
    private String dstIp;

    @JsonProperty("L4_SRC_PORT")
    private Integer srcPort;

    @JsonProperty("L4_DST_PORT")
    private Integer dstPort;

    @JsonProperty("PROTOCOL")
    private Integer protocol;

    @JsonProperty("IN_BYTES")
    private Long inBytes;

    @JsonProperty("IN_PKTS")
    private Long inPkts;

    @JsonProperty("OUT_BYTES")
    private Long outBytes;

    @JsonProperty("OUT_PKTS")
    private Long outPkts;

    @JsonProperty("TCP_FLAGS")
    private Integer tcpFlags;

    @JsonProperty("CLIENT_TCP_FLAGS")
    private Integer clientTcpFlags;

    @JsonProperty("SERVER_TCP_FLAGS")
    private Integer serverTcpFlags;

    @JsonProperty("FLOW_DURATION_MILLISECONDS")
    private Long flowDuration;

    @JsonProperty("DURATION_IN")
    private Long durationIn;

    @JsonProperty("DURATION_OUT")
    private Long durationOut;

    @JsonProperty("MIN_TTL")
    private Integer minTtl;

    @JsonProperty("MAX_TTL")
    private Integer maxTtl;

    @JsonProperty("LONGEST_FLOW_PKT")
    private Integer longestFlowPkt;

    @JsonProperty("SHORTEST_FLOW_PKT")
    private Integer shortestFlowPkt;

    @JsonProperty("MIN_IP_PKT_LEN")
    private Integer minIpPktLen;

    @JsonProperty("MAX_IP_PKT_LEN")
    private Integer maxIpPktLen;

    @JsonProperty("SRC_TO_DST_SECOND_BYTES")
    private Double srcToDstSecondBytes;

    @JsonProperty("DST_TO_SRC_SECOND_BYTES")
    private Double dstToSrcSecondBytes;

    @JsonProperty("RETRANSMITTED_IN_BYTES")
    private Long retransmittedInBytes;

    @JsonProperty("RETRANSMITTED_IN_PKTS")
    private Long retransmittedInPkts;

    @JsonProperty("RETRANSMITTED_OUT_BYTES")
    private Long retransmittedOutBytes;

    @JsonProperty("RETRANSMITTED_OUT_PKTS")
    private Long retransmittedOutPkts;

    @JsonProperty("SRC_TO_DST_AVG_THROUGHPUT")
    private Double srcToDstAvgThroughput;

    @JsonProperty("DST_TO_SRC_AVG_THROUGHPUT")
    private Double dstToSrcAvgThroughput;

    @JsonProperty("NUM_PKTS_UP_TO_128_BYTES")
    private Integer numPktsUpTo128Bytes;

    @JsonProperty("NUM_PKTS_128_TO_256_BYTES")
    private Integer numPkts128To256Bytes;

    @JsonProperty("NUM_PKTS_256_TO_512_BYTES")
    private Integer numPkts256To512Bytes;

    @JsonProperty("NUM_PKTS_512_TO_1024_BYTES")
    private Integer numPkts512To1024Bytes;

    @JsonProperty("NUM_PKTS_1024_TO_1514_BYTES")
    private Integer numPkts1024To1514Bytes;

    @JsonProperty("TCP_WIN_MAX_IN")
    private Integer tcpWinMaxIn;

    @JsonProperty("TCP_WIN_MAX_OUT")
    private Integer tcpWinMaxOut;

    @JsonProperty("ICMP_TYPE")
    private Integer icmpType;

    @JsonProperty("ICMP_IPV4_TYPE")
    private Integer icmpIpv4Type;

    @JsonProperty("DNS_QUERY_ID")
    private Integer dnsQueryId;

    @JsonProperty("DNS_QUERY_TYPE")
    private Integer dnsQueryType;

    @JsonProperty("DNS_TTL_ANSWER")
    private Long dnsTtlAnswer;

    @JsonProperty("FTP_COMMAND_RET_CODE")
    private Integer ftpCommandRetCode;

    @JsonProperty("SRC_TO_DST_IAT_MIN")
    private Long srcToDstIatMin;

    @JsonProperty("SRC_TO_DST_IAT_MAX")
    private Long srcToDstIatMax;

    @JsonProperty("SRC_TO_DST_IAT_AVG")
    private Double srcToDstIatAvg;

    @JsonProperty("SRC_TO_DST_IAT_STDDEV")
    private Double srcToDstIatStddev;

    @JsonProperty("DST_TO_SRC_IAT_MIN")
    private Long dstToSrcIatMin;

    @JsonProperty("DST_TO_SRC_IAT_MAX")
    private Long dstToSrcIatMax;

    @JsonProperty("DST_TO_SRC_IAT_AVG")
    private Double dstToSrcIatAvg;

    @JsonProperty("DST_TO_SRC_IAT_STDDEV")
    private Double dstToSrcIatStddev;
}
