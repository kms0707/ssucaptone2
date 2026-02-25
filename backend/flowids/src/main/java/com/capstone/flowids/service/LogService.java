package com.capstone.flowids.service;

import com.capstone.flowids.common.InvalidApiKeyException;
import com.capstone.flowids.db.FlowLogRepository;
import com.capstone.flowids.db.ProjectRepository;
import com.capstone.flowids.dto.FlowLogMessage;
import com.capstone.flowids.dto.FlowLogRequest;
import com.capstone.flowids.dto.FlowLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LogService {

    private static final String KAFKA_TOPIC = "raw-flow-logs";
    private static final String KAFKA_TOPIC_AI = "ai-flow-features";
    private static final String REDIS_KEY_PREFIX = "APIKey:";
    private static final long API_KEY_CACHE_TTL_HOURS = 1;

    private final ProjectRepository projectRepository;
    private final FlowLogRepository flowLogRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void ingest(String apiKey, List<FlowLogRequest> logs) {
        Long projectId = resolveProjectId(apiKey);
        String ingestedAt = Instant.now().toString();

        for (FlowLogRequest log : logs) {
            String documentId = UUID.randomUUID().toString();
            FlowLogMessage message = FlowLogMessage.builder()
                    .documentId(documentId)
                    .projectId(projectId)
                    .ingestedAt(ingestedAt)
                    .srcIp(log.getSrcIp())
                    .dstIp(log.getDstIp())
                    .srcPort(log.getSrcPort())
                    .dstPort(log.getDstPort())
                    .protocol(log.getProtocol())
                    .inBytes(log.getInBytes())
                    .inPkts(log.getInPkts())
                    .outBytes(log.getOutBytes())
                    .outPkts(log.getOutPkts())
                    .tcpFlags(log.getTcpFlags())
                    .clientTcpFlags(log.getClientTcpFlags())
                    .serverTcpFlags(log.getServerTcpFlags())
                    .flowDuration(log.getFlowDuration())
                    .durationIn(log.getDurationIn())
                    .durationOut(log.getDurationOut())
                    .minTtl(log.getMinTtl())
                    .maxTtl(log.getMaxTtl())
                    .longestFlowPkt(log.getLongestFlowPkt())
                    .shortestFlowPkt(log.getShortestFlowPkt())
                    .minIpPktLen(log.getMinIpPktLen())
                    .maxIpPktLen(log.getMaxIpPktLen())
                    .srcToDstSecondBytes(log.getSrcToDstSecondBytes())
                    .dstToSrcSecondBytes(log.getDstToSrcSecondBytes())
                    .retransmittedInBytes(log.getRetransmittedInBytes())
                    .retransmittedInPkts(log.getRetransmittedInPkts())
                    .retransmittedOutBytes(log.getRetransmittedOutBytes())
                    .retransmittedOutPkts(log.getRetransmittedOutPkts())
                    .srcToDstAvgThroughput(log.getSrcToDstAvgThroughput())
                    .dstToSrcAvgThroughput(log.getDstToSrcAvgThroughput())
                    .numPktsUpTo128Bytes(log.getNumPktsUpTo128Bytes())
                    .numPkts128To256Bytes(log.getNumPkts128To256Bytes())
                    .numPkts256To512Bytes(log.getNumPkts256To512Bytes())
                    .numPkts512To1024Bytes(log.getNumPkts512To1024Bytes())
                    .numPkts1024To1514Bytes(log.getNumPkts1024To1514Bytes())
                    .tcpWinMaxIn(log.getTcpWinMaxIn())
                    .tcpWinMaxOut(log.getTcpWinMaxOut())
                    .icmpType(log.getIcmpType())
                    .icmpIpv4Type(log.getIcmpIpv4Type())
                    .dnsQueryId(log.getDnsQueryId())
                    .dnsQueryType(log.getDnsQueryType())
                    .dnsTtlAnswer(log.getDnsTtlAnswer())
                    .ftpCommandRetCode(log.getFtpCommandRetCode())
                    .srcToDstIatMin(log.getSrcToDstIatMin())
                    .srcToDstIatMax(log.getSrcToDstIatMax())
                    .srcToDstIatAvg(log.getSrcToDstIatAvg())
                    .srcToDstIatStddev(log.getSrcToDstIatStddev())
                    .dstToSrcIatMin(log.getDstToSrcIatMin())
                    .dstToSrcIatMax(log.getDstToSrcIatMax())
                    .dstToSrcIatAvg(log.getDstToSrcIatAvg())
                    .dstToSrcIatStddev(log.getDstToSrcIatStddev())
                    .build();

            kafkaTemplate.send(KAFKA_TOPIC, String.valueOf(projectId), message);
            kafkaTemplate.send(KAFKA_TOPIC_AI, String.valueOf(projectId), message);
        }
    }

    public Page<FlowLogResponse> getLogs(Long memberId, Long projectId, Boolean onlyAnomalies, int page, int size) {
        // 요청한 멤버의 프로젝트인지 검증
        projectRepository.findByIdAndMember_Id(projectId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없는 프로젝트입니다"));

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "ingestedAt"));
        String projectIdStr = String.valueOf(projectId);

        if (Boolean.TRUE.equals(onlyAnomalies)) {
            return flowLogRepository.findByProjectIdAndIsAnomaly(projectIdStr, true, pageable)
                    .map(FlowLogResponse::new);
        }
        return flowLogRepository.findByProjectId(projectIdStr, pageable)
                .map(FlowLogResponse::new);
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
