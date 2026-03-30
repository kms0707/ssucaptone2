package com.capstone.flowids.service;

// TODO: Kafka 도입 시 활성화
// 현재는 LogService에서 model-service HTTP API를 직접 호출하여 ES에 저장합니다.

//import com.capstone.flowids.db.FlowLogRepository;
//import com.capstone.flowids.domain.FlowLogDocument;
//import com.capstone.flowids.dto.FlowLogMessage;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Service;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class FlowLogConsumer {
//
//    private final FlowLogRepository flowLogRepository;
//
//    @KafkaListener(topics = "raw-flow-logs", groupId = "netsentry-group")
//    public void consume(FlowLogMessage message) {
//        // ...
//    }
//}
