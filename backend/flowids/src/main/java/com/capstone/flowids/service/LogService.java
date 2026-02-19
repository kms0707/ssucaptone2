package com.capstone.flowids.service;

import com.capstone.flowids.common.InvalidApiKeyException;
import com.capstone.flowids.db.ProjectRepository;
import com.capstone.flowids.dto.FlowLogMessage;
import com.capstone.flowids.dto.FlowLogRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LogService {

    private static final String KAFKA_TOPIC = "raw-flow-logs";
    private static final String REDIS_KEY_PREFIX = "APIKey:";
    private static final long API_KEY_CACHE_TTL_HOURS = 1;

    private final ProjectRepository projectRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void ingest(String apiKey, List<FlowLogRequest> logs) {
        Long projectId = resolveProjectId(apiKey);
        String ingestedAt = Instant.now().toString();

        for (FlowLogRequest log : logs) {
            FlowLogMessage message = FlowLogMessage.builder()
                    .projectId(projectId)
                    .ingestedAt(ingestedAt)
                    .timestamp(log.getTimestamp())
                    .srcIp(log.getSrcIp())
                    .dstIp(log.getDstIp())
                    .srcPort(log.getSrcPort())
                    .dstPort(log.getDstPort())
                    .protocol(log.getProtocol())
                    .tcpFlags(log.getTcpFlags())
                    .flowDuration(log.getFlowDuration())
                    .packetCount(log.getPacketCount())
                    .byteCount(log.getByteCount())
                    .agentVersion(log.getAgentVersion())
                    .build();

            kafkaTemplate.send(KAFKA_TOPIC, String.valueOf(projectId), message);
        }
    }

    private Long resolveProjectId(String apiKey) {
        String redisKey = REDIS_KEY_PREFIX + apiKey;
        String cached = redisTemplate.opsForValue().get(redisKey);

        if (cached != null) {
            return Long.parseLong(cached);
        }

        Long projectId = projectRepository.findByApiKeyAndApiKeyStatus(apiKey, "ACTIVE")
                .orElseThrow(() -> new InvalidApiKeyException("유효하지 않은 API Key입니다"))
                .getId();

        redisTemplate.opsForValue().set(redisKey, String.valueOf(projectId), API_KEY_CACHE_TTL_HOURS, TimeUnit.HOURS);
        return projectId;
    }
}
