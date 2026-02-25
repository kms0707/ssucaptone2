package com.capstone.flowids.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class AiResultMessage {

    private String documentId;
    private Long projectId;
    private Boolean isAnomaly;
    private Double anomalyScore;
    private String modelVersion;
}
