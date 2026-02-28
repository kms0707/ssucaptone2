package com.capstone.flowids.service;

import com.capstone.flowids.db.FlowLogRepository;
import com.capstone.flowids.domain.FlowLogDocument;
import com.capstone.flowids.dto.FlowLogMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlowLogConsumer {

    private final FlowLogRepository flowLogRepository;

    @KafkaListener(topics = "raw-flow-logs", groupId = "netsentry-group")
    public void consume(FlowLogMessage message) {
        try {
            FlowLogDocument document = FlowLogDocument.builder()
                    .id(message.getDocumentId())
                    .projectId(String.valueOf(message.getProjectId()))
                    .ingestedAt(message.getIngestedAt())
                    .srcIp(message.getSrcIp())
                    .dstIp(message.getDstIp())
                    .srcPort(message.getSrcPort())
                    .dstPort(message.getDstPort())
                    .protocol(message.getProtocol())
                    .inBytes(message.getInBytes())
                    .inPkts(message.getInPkts())
                    .outBytes(message.getOutBytes())
                    .outPkts(message.getOutPkts())
                    .tcpFlags(message.getTcpFlags())
                    .clientTcpFlags(message.getClientTcpFlags())
                    .serverTcpFlags(message.getServerTcpFlags())
                    .flowDuration(message.getFlowDuration())
                    .durationIn(message.getDurationIn())
                    .durationOut(message.getDurationOut())
                    .minTtl(message.getMinTtl())
                    .maxTtl(message.getMaxTtl())
                    .longestFlowPkt(message.getLongestFlowPkt())
                    .shortestFlowPkt(message.getShortestFlowPkt())
                    .minIpPktLen(message.getMinIpPktLen())
                    .maxIpPktLen(message.getMaxIpPktLen())
                    .srcToDstSecondBytes(message.getSrcToDstSecondBytes())
                    .dstToSrcSecondBytes(message.getDstToSrcSecondBytes())
                    .retransmittedInBytes(message.getRetransmittedInBytes())
                    .retransmittedInPkts(message.getRetransmittedInPkts())
                    .retransmittedOutBytes(message.getRetransmittedOutBytes())
                    .retransmittedOutPkts(message.getRetransmittedOutPkts())
                    .srcToDstAvgThroughput(message.getSrcToDstAvgThroughput())
                    .dstToSrcAvgThroughput(message.getDstToSrcAvgThroughput())
                    .numPktsUpTo128Bytes(message.getNumPktsUpTo128Bytes())
                    .numPkts128To256Bytes(message.getNumPkts128To256Bytes())
                    .numPkts256To512Bytes(message.getNumPkts256To512Bytes())
                    .numPkts512To1024Bytes(message.getNumPkts512To1024Bytes())
                    .numPkts1024To1514Bytes(message.getNumPkts1024To1514Bytes())
                    .tcpWinMaxIn(message.getTcpWinMaxIn())
                    .tcpWinMaxOut(message.getTcpWinMaxOut())
                    .icmpType(message.getIcmpType())
                    .icmpIpv4Type(message.getIcmpIpv4Type())
                    .dnsQueryId(message.getDnsQueryId())
                    .dnsQueryType(message.getDnsQueryType())
                    .dnsTtlAnswer(message.getDnsTtlAnswer())
                    .ftpCommandRetCode(message.getFtpCommandRetCode())
                    .srcToDstIatMin(message.getSrcToDstIatMin())
                    .srcToDstIatMax(message.getSrcToDstIatMax())
                    .srcToDstIatAvg(message.getSrcToDstIatAvg())
                    .srcToDstIatStddev(message.getSrcToDstIatStddev())
                    .dstToSrcIatMin(message.getDstToSrcIatMin())
                    .dstToSrcIatMax(message.getDstToSrcIatMax())
                    .dstToSrcIatAvg(message.getDstToSrcIatAvg())
                    .dstToSrcIatStddev(message.getDstToSrcIatStddev())
                    .isAnomaly(false)
                    .anomalyScore(0.0)
                    .modelVersion("none")
                    .agentVersion(null)
                    .build();

            flowLogRepository.save(document);
            log.info("Flow log saved to Elasticsearch. projectId={}, src={}:{}",
                    message.getProjectId(), message.getSrcIp(), message.getSrcPort());
        } catch (Exception e) {
            log.error("Failed to save flow log to Elasticsearch. projectId={}, error={}",
                    message.getProjectId(), e.getMessage());
        }
    }
}
