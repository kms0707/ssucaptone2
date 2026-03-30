package com.capstone.flowids.service;

import com.capstone.flowids.common.InvalidApiKeyException;
import com.capstone.flowids.db.FlowLogRepository;
import com.capstone.flowids.db.ProjectRepository;
import com.capstone.flowids.domain.FlowLogDocument;
// import com.capstone.flowids.dto.AiResultMessage; // TODO: Kafka 비동기 AI 파이프라인 전환 시 활성화
import com.capstone.flowids.dto.FlowLogMessage;
import com.capstone.flowids.dto.FlowLogRequest;
import com.capstone.flowids.dto.FlowLogResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogService {

    private static final String REDIS_KEY_PREFIX = "APIKey:";
    private static final long API_KEY_CACHE_TTL_HOURS = 1;

    private final ProjectRepository projectRepository;
    private final FlowLogRepository flowLogRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ModelClient modelClient;

    public void ingest(String apiKey, List<FlowLogRequest> logs) {
        Long projectId = resolveProjectId(apiKey);
        String ingestedAt = Instant.now().toString();

        for (FlowLogRequest req : logs) {
            String documentId = UUID.randomUUID().toString();

            FlowLogMessage message = FlowLogMessage.builder()
                    .documentId(documentId)
                    .projectId(projectId)
                    .ingestedAt(ingestedAt)
                    .srcIp(req.getSrcIp())
                    .dstIp(req.getDstIp())
                    .srcPort(req.getSrcPort())
                    .dstPort(req.getDstPort())
                    .protocol(req.getProtocol())
                    .inBytes(req.getInBytes())
                    .inPkts(req.getInPkts())
                    .outBytes(req.getOutBytes())
                    .outPkts(req.getOutPkts())
                    .tcpFlags(req.getTcpFlags())
                    .clientTcpFlags(req.getClientTcpFlags())
                    .serverTcpFlags(req.getServerTcpFlags())
                    .flowDuration(req.getFlowDuration())
                    .durationIn(req.getDurationIn())
                    .durationOut(req.getDurationOut())
                    .minTtl(req.getMinTtl())
                    .maxTtl(req.getMaxTtl())
                    .longestFlowPkt(req.getLongestFlowPkt())
                    .shortestFlowPkt(req.getShortestFlowPkt())
                    .minIpPktLen(req.getMinIpPktLen())
                    .maxIpPktLen(req.getMaxIpPktLen())
                    .srcToDstSecondBytes(req.getSrcToDstSecondBytes())
                    .dstToSrcSecondBytes(req.getDstToSrcSecondBytes())
                    .retransmittedInBytes(req.getRetransmittedInBytes())
                    .retransmittedInPkts(req.getRetransmittedInPkts())
                    .retransmittedOutBytes(req.getRetransmittedOutBytes())
                    .retransmittedOutPkts(req.getRetransmittedOutPkts())
                    .srcToDstAvgThroughput(req.getSrcToDstAvgThroughput())
                    .dstToSrcAvgThroughput(req.getDstToSrcAvgThroughput())
                    .numPktsUpTo128Bytes(req.getNumPktsUpTo128Bytes())
                    .numPkts128To256Bytes(req.getNumPkts128To256Bytes())
                    .numPkts256To512Bytes(req.getNumPkts256To512Bytes())
                    .numPkts512To1024Bytes(req.getNumPkts512To1024Bytes())
                    .numPkts1024To1514Bytes(req.getNumPkts1024To1514Bytes())
                    .tcpWinMaxIn(req.getTcpWinMaxIn())
                    .tcpWinMaxOut(req.getTcpWinMaxOut())
                    .icmpType(req.getIcmpType())
                    .icmpIpv4Type(req.getIcmpIpv4Type())
                    .dnsQueryId(req.getDnsQueryId())
                    .dnsQueryType(req.getDnsQueryType())
                    .dnsTtlAnswer(req.getDnsTtlAnswer())
                    .ftpCommandRetCode(req.getFtpCommandRetCode())
                    .srcToDstIatMin(req.getSrcToDstIatMin())
                    .srcToDstIatMax(req.getSrcToDstIatMax())
                    .srcToDstIatAvg(req.getSrcToDstIatAvg())
                    .srcToDstIatStddev(req.getSrcToDstIatStddev())
                    .dstToSrcIatMin(req.getDstToSrcIatMin())
                    .dstToSrcIatMax(req.getDstToSrcIatMax())
                    .dstToSrcIatAvg(req.getDstToSrcIatAvg())
                    .dstToSrcIatStddev(req.getDstToSrcIatStddev())
                    .build();

            // 1) model-service HTTP API로 실시간 추론
            ModelPredictResponse prediction = null;
            try {
                prediction = modelClient.predict(message);
            } catch (Exception e) {
                log.error("AI prediction failed for documentId={}, saving log without prediction: {}",
                        documentId, e.getMessage());
            }

            // 2) ES 저장 (AI 추론 실패 시에도 원본 로그는 저장)
            FlowLogDocument.FlowLogDocumentBuilder docBuilder = FlowLogDocument.builder()
                    .id(documentId)
                    .projectId(String.valueOf(projectId))
                    .ingestedAt(ingestedAt)
                    .srcIp(req.getSrcIp())
                    .dstIp(req.getDstIp())
                    .srcPort(req.getSrcPort())
                    .dstPort(req.getDstPort())
                    .protocol(req.getProtocol())
                    .inBytes(req.getInBytes())
                    .inPkts(req.getInPkts())
                    .outBytes(req.getOutBytes())
                    .outPkts(req.getOutPkts())
                    .tcpFlags(req.getTcpFlags())
                    .clientTcpFlags(req.getClientTcpFlags())
                    .serverTcpFlags(req.getServerTcpFlags())
                    .flowDuration(req.getFlowDuration())
                    .durationIn(req.getDurationIn())
                    .durationOut(req.getDurationOut())
                    .minTtl(req.getMinTtl())
                    .maxTtl(req.getMaxTtl())
                    .longestFlowPkt(req.getLongestFlowPkt())
                    .shortestFlowPkt(req.getShortestFlowPkt())
                    .minIpPktLen(req.getMinIpPktLen())
                    .maxIpPktLen(req.getMaxIpPktLen())
                    .srcToDstSecondBytes(req.getSrcToDstSecondBytes())
                    .dstToSrcSecondBytes(req.getDstToSrcSecondBytes())
                    .retransmittedInBytes(req.getRetransmittedInBytes())
                    .retransmittedInPkts(req.getRetransmittedInPkts())
                    .retransmittedOutBytes(req.getRetransmittedOutBytes())
                    .retransmittedOutPkts(req.getRetransmittedOutPkts())
                    .srcToDstAvgThroughput(req.getSrcToDstAvgThroughput())
                    .dstToSrcAvgThroughput(req.getDstToSrcAvgThroughput())
                    .numPktsUpTo128Bytes(req.getNumPktsUpTo128Bytes())
                    .numPkts128To256Bytes(req.getNumPkts128To256Bytes())
                    .numPkts256To512Bytes(req.getNumPkts256To512Bytes())
                    .numPkts512To1024Bytes(req.getNumPkts512To1024Bytes())
                    .numPkts1024To1514Bytes(req.getNumPkts1024To1514Bytes())
                    .tcpWinMaxIn(req.getTcpWinMaxIn())
                    .tcpWinMaxOut(req.getTcpWinMaxOut())
                    .icmpType(req.getIcmpType())
                    .icmpIpv4Type(req.getIcmpIpv4Type())
                    .dnsQueryId(req.getDnsQueryId())
                    .dnsQueryType(req.getDnsQueryType())
                    .dnsTtlAnswer(req.getDnsTtlAnswer())
                    .ftpCommandRetCode(req.getFtpCommandRetCode())
                    .srcToDstIatMin(req.getSrcToDstIatMin())
                    .srcToDstIatMax(req.getSrcToDstIatMax())
                    .srcToDstIatAvg(req.getSrcToDstIatAvg())
                    .srcToDstIatStddev(req.getSrcToDstIatStddev())
                    .dstToSrcIatMin(req.getDstToSrcIatMin())
                    .dstToSrcIatMax(req.getDstToSrcIatMax())
                    .dstToSrcIatAvg(req.getDstToSrcIatAvg())
                    .dstToSrcIatStddev(req.getDstToSrcIatStddev());

            if (prediction != null) {
                docBuilder
                        .isAnomaly(prediction.getIsAnomaly())
                        .anomalyScore(prediction.getAnomalyScore())
                        .modelVersion(prediction.getModelVersion())
                        .stage(prediction.getStage())
                        .svmRaw(prediction.getSvmRaw())
                        .tcnProb(prediction.getTcnProb())
                        .reason(prediction.getReason());
            }

            flowLogRepository.save(docBuilder.build());
        }
    }

    public Page<FlowLogResponse> getLogs(
            Long memberId,
            Long projectId,
            Boolean onlyAnomalies,
            int page,
            int size
    ) {
        projectRepository.findByIdAndMember_Id(projectId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Project access denied"));

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "ingestedAt")
        );
        String projectIdStr = String.valueOf(projectId);

        if (Boolean.TRUE.equals(onlyAnomalies)) {
            return flowLogRepository.findByProjectIdAndIsAnomaly(
                    projectIdStr,
                    true,
                    pageable
            ).map(FlowLogResponse::new);
        }

        return flowLogRepository.findByProjectId(projectIdStr, pageable)
                .map(FlowLogResponse::new);
    }

    public FlowLogResponse getLogDetail(Long memberId, Long projectId, String logId) {
        projectRepository.findByIdAndMember_Id(projectId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Project access denied"));

        String projectIdStr = String.valueOf(projectId);

        return flowLogRepository.findById(logId)
                .filter(flowLog -> projectIdStr.equals(flowLog.getProjectId()))
                .map(FlowLogResponse::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flow log not found"));
    }

    private Long resolveProjectId(String apiKey) {
        String redisKey = REDIS_KEY_PREFIX + apiKey;
        String cached = redisTemplate.opsForValue().get(redisKey);

        if (cached != null) {
            return Long.parseLong(cached);
        }

        Long projectId = projectRepository.findByApiKeyAndApiKeyStatus(apiKey, "ACTIVE")
                .orElseThrow(() -> new InvalidApiKeyException("Invalid API key"))
                .getId();

        redisTemplate.opsForValue().set(
                redisKey,
                String.valueOf(projectId),
                API_KEY_CACHE_TTL_HOURS,
                TimeUnit.HOURS
        );
        return projectId;
    }
}