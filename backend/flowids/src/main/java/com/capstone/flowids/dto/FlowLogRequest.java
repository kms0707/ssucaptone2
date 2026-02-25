package com.capstone.flowids.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FlowLogRequest {

    @NotBlank(message = "srcIp는 필수입니다")
    private String srcIp;

    @NotBlank(message = "dstIp는 필수입니다")
    private String dstIp;

    @NotNull(message = "srcPort는 필수입니다")
    private Integer srcPort;

    @NotNull(message = "dstPort는 필수입니다")
    private Integer dstPort;

    @NotNull(message = "protocol은 필수입니다")
    private Integer protocol;

    @NotNull(message = "inBytes는 필수입니다")
    private Long inBytes;

    @NotNull(message = "inPkts는 필수입니다")
    private Long inPkts;

    private Long outBytes;
    private Long outPkts;
    private Integer tcpFlags;
    private Integer clientTcpFlags;
    private Integer serverTcpFlags;
    private Long flowDuration;
    private Long durationIn;
    private Long durationOut;
    private Integer minTtl;
    private Integer maxTtl;
    private Integer longestFlowPkt;
    private Integer shortestFlowPkt;
    private Integer minIpPktLen;
    private Integer maxIpPktLen;
    private Double srcToDstSecondBytes;
    private Double dstToSrcSecondBytes;
    private Long retransmittedInBytes;
    private Long retransmittedInPkts;
    private Long retransmittedOutBytes;
    private Long retransmittedOutPkts;
    private Double srcToDstAvgThroughput;
    private Double dstToSrcAvgThroughput;
    private Integer numPktsUpTo128Bytes;
    private Integer numPkts128To256Bytes;
    private Integer numPkts256To512Bytes;
    private Integer numPkts512To1024Bytes;
    private Integer numPkts1024To1514Bytes;
    private Integer tcpWinMaxIn;
    private Integer tcpWinMaxOut;
    private Integer icmpType;
    private Integer icmpIpv4Type;
    private Integer dnsQueryId;
    private Integer dnsQueryType;
    private Long dnsTtlAnswer;
    private Integer ftpCommandRetCode;
    private Long srcToDstIatMin;
    private Long srcToDstIatMax;
    private Double srcToDstIatAvg;
    private Double srcToDstIatStddev;
    private Long dstToSrcIatMin;
    private Long dstToSrcIatMax;
    private Double dstToSrcIatAvg;
    private Double dstToSrcIatStddev;
}
