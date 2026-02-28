package com.capstone.flowids.dto;

import com.capstone.flowids.domain.FlowLogDocument;
import lombok.Getter;

@Getter
public class FlowLogResponse {

    private final String id;
    private final String projectId;
    private final String ingestedAt;

    private final String srcIp;
    private final String dstIp;
    private final Integer srcPort;
    private final Integer dstPort;
    private final Integer protocol;

    private final Long inBytes;
    private final Long inPkts;
    private final Long outBytes;
    private final Long outPkts;
    private final Long flowDuration;
    private final Integer tcpFlags;

    private final Boolean isAnomaly;
    private final Double anomalyScore;

    public FlowLogResponse(FlowLogDocument doc) {
        this.id = doc.getId();
        this.projectId = doc.getProjectId();
        this.ingestedAt = doc.getIngestedAt();
        this.srcIp = doc.getSrcIp();
        this.dstIp = doc.getDstIp();
        this.srcPort = doc.getSrcPort();
        this.dstPort = doc.getDstPort();
        this.protocol = doc.getProtocol();
        this.inBytes = doc.getInBytes();
        this.inPkts = doc.getInPkts();
        this.outBytes = doc.getOutBytes();
        this.outPkts = doc.getOutPkts();
        this.flowDuration = doc.getFlowDuration();
        this.tcpFlags = doc.getTcpFlags();
        this.isAnomaly = doc.getIsAnomaly();
        this.anomalyScore = doc.getAnomalyScore();
    }
}
