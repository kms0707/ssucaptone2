package com.capstone.flowids.service;

import com.capstone.flowids.dto.FlowLogMessage;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class ModelClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${model.server.url}")
    private String modelServerUrl;

    private WebClient webClient;

    @PostConstruct
    void init() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10));

        this.webClient = webClientBuilder
                .baseUrl(modelServerUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    public ModelPredictResponse predict(FlowLogMessage message) {
        try {
            return webClient
                    .post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(message)
                    .retrieve()
                    .bodyToMono(ModelPredictResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Model server call failed for documentId={}: {}",
                    message.getDocumentId(), e.getMessage());
            throw new RuntimeException("Model server call failed", e);
        }
    }
}