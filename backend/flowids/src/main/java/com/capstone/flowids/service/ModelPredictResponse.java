package com.capstone.flowids.service;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModelPredictResponse {
    private String documentId;
    private Boolean isAnomaly;
    private Double anomalyScore;
    private String modelVersion;
}