package com.capstone.flowids.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FlowLogRequest {

    @NotBlank(message = "timestamp는 필수입니다")
    private String timestamp;

    @NotBlank(message = "srcIp는 필수입니다")
    private String srcIp;

    @NotBlank(message = "dstIp는 필수입니다")
    private String dstIp;

    @NotNull(message = "srcPort는 필수입니다")
    private Integer srcPort;

    @NotNull(message = "dstPort는 필수입니다")
    private Integer dstPort;

    @NotBlank(message = "protocol은 필수입니다")
    private String protocol;

    private String tcpFlags;
    private Long flowDuration;
    private Integer packetCount;
    private Long byteCount;
    private String agentVersion;
}
