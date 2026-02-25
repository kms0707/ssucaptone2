package com.capstone.flowids.service;

import com.capstone.flowids.dto.AiResultMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiResultConsumer {

    private final ElasticsearchOperations elasticsearchOperations;

    @KafkaListener(
            topics = "ai-results",
            groupId = "netsentry-ai-results-group",
            containerFactory = "aiResultListenerContainerFactory"
    )
    public void consume(AiResultMessage message) {
        try {
            Document updateDoc = Document.create();
            updateDoc.put("isAnomaly", message.getIsAnomaly());
            updateDoc.put("anomalyScore", message.getAnomalyScore());
            updateDoc.put("modelVersion", message.getModelVersion());

            UpdateQuery updateQuery = UpdateQuery.builder(message.getDocumentId())
                    .withDocument(updateDoc)
                    .build();

            elasticsearchOperations.update(updateQuery, IndexCoordinates.of("flow-logs"));

            log.info("AI result updated. documentId={}, isAnomaly={}, score={}",
                    message.getDocumentId(), message.getIsAnomaly(), message.getAnomalyScore());
        } catch (Exception e) {
            log.error("Failed to update AI result. documentId={}, error={}",
                    message.getDocumentId(), e.getMessage());
        }
    }
}
