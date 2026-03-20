package com.capstone.flowids.domain;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "flow-logs")
@Getter
@Builder
public class FlowLogDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String projectId;

    @Field(type = FieldType.Date)
    private String ingestedAt;

    @Field(type = FieldType.Keyword)
    private String srcIp;

    @Field(type = FieldType.Keyword)
    private String dstIp;

    @Field(type = FieldType.Integer)
    private Integer srcPort;

    @Field(type = FieldType.Integer)
    private Integer dstPort;

    @Field(type = FieldType.Integer)
    private Integer protocol;

    @Field(type = FieldType.Long)
    private Long inBytes;

    @Field(type = FieldType.Long)
    private Long inPkts;

    @Field(type = FieldType.Long)
    private Long outBytes;

    @Field(type = FieldType.Long)
    private Long outPkts;

    @Field(type = FieldType.Integer)
    private Integer tcpFlags;

    @Field(type = FieldType.Integer)
    private Integer clientTcpFlags;

    @Field(type = FieldType.Integer)
    private Integer serverTcpFlags;

    @Field(type = FieldType.Long)
    private Long flowDuration;

    @Field(type = FieldType.Long)
    private Long durationIn;

    @Field(type = FieldType.Long)
    private Long durationOut;

    @Field(type = FieldType.Integer)
    private Integer minTtl;

    @Field(type = FieldType.Integer)
    private Integer maxTtl;

    @Field(type = FieldType.Integer)
    private Integer longestFlowPkt;

    @Field(type = FieldType.Integer)
    private Integer shortestFlowPkt;

    @Field(type = FieldType.Integer)
    private Integer minIpPktLen;

    @Field(type = FieldType.Integer)
    private Integer maxIpPktLen;

    @Field(type = FieldType.Double)
    private Double srcToDstSecondBytes;

    @Field(type = FieldType.Double)
    private Double dstToSrcSecondBytes;

    @Field(type = FieldType.Long)
    private Long retransmittedInBytes;

    @Field(type = FieldType.Long)
    private Long retransmittedInPkts;

    @Field(type = FieldType.Long)
    private Long retransmittedOutBytes;

    @Field(type = FieldType.Long)
    private Long retransmittedOutPkts;

    @Field(type = FieldType.Double)
    private Double srcToDstAvgThroughput;

    @Field(type = FieldType.Double)
    private Double dstToSrcAvgThroughput;

    @Field(type = FieldType.Integer)
    private Integer numPktsUpTo128Bytes;

    @Field(type = FieldType.Integer)
    private Integer numPkts128To256Bytes;

    @Field(type = FieldType.Integer)
    private Integer numPkts256To512Bytes;

    @Field(type = FieldType.Integer)
    private Integer numPkts512To1024Bytes;

    @Field(type = FieldType.Integer)
    private Integer numPkts1024To1514Bytes;

    @Field(type = FieldType.Integer)
    private Integer tcpWinMaxIn;

    @Field(type = FieldType.Integer)
    private Integer tcpWinMaxOut;

    @Field(type = FieldType.Integer)
    private Integer icmpType;

    @Field(type = FieldType.Integer)
    private Integer icmpIpv4Type;

    @Field(type = FieldType.Integer)
    private Integer dnsQueryId;

    @Field(type = FieldType.Integer)
    private Integer dnsQueryType;

    @Field(type = FieldType.Long)
    private Long dnsTtlAnswer;

    @Field(type = FieldType.Integer)
    private Integer ftpCommandRetCode;

    @Field(type = FieldType.Long)
    private Long srcToDstIatMin;

    @Field(type = FieldType.Long)
    private Long srcToDstIatMax;

    @Field(type = FieldType.Double)
    private Double srcToDstIatAvg;

    @Field(type = FieldType.Double)
    private Double srcToDstIatStddev;

    @Field(type = FieldType.Long)
    private Long dstToSrcIatMin;

    @Field(type = FieldType.Long)
    private Long dstToSrcIatMax;

    @Field(type = FieldType.Double)
    private Double dstToSrcIatAvg;

    @Field(type = FieldType.Double)
    private Double dstToSrcIatStddev;

    @Field(type = FieldType.Boolean)
    private Boolean isAnomaly;

    @Field(type = FieldType.Double)
    private Double anomalyScore;

    @Field(type = FieldType.Keyword)
    private String modelVersion;

    @Field(type = FieldType.Keyword)
    private String agentVersion;

    @Field(type = FieldType.Keyword)
    private String stage;

    @Field(type = FieldType.Double)
    private Double svmRaw;

    @Field(type = FieldType.Double)
    private Double tcnProb;

    @Field(type = FieldType.Text)
    private String reason;
}
