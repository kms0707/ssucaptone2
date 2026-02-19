package com.capstone.flowids.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FlowLogMessage {

    private Long projectId;
    private String ingestedAt;

    // from FlowLogRequest
    private String timestamp;
    private String srcIp;
    private String dstIp;
    private Integer srcPort;
    private Integer dstPort;
    private String protocol;
    private String tcpFlags;
    private Long flowDuration;
    private Integer packetCount;
    private Long byteCount;
    private String agentVersion;
}
