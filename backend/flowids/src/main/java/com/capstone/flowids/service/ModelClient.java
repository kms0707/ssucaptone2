package com.capstone.flowids.service;

import com.capstone.flowids.dto.FlowLogMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class ModelClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${model.server.url}")
    private String modelServerUrl;

    public ModelPredictResponse predict(FlowLogMessage message) {
        try {
            return webClientBuilder.build()
                    .post()
                    .uri(modelServerUrl + "/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(message)
                    .retrieve()
                    .bodyToMono(ModelPredictResponse.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Model server call failed", e);
        }
    }
}