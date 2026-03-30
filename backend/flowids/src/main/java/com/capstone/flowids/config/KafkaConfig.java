package com.capstone.flowids.config;

// TODO: Kafka 기반 비동기 AI 파이프라인 전환 시 활성화
//import com.capstone.flowids.dto.AiResultMessage;
//import org.apache.kafka.clients.consumer.ConsumerConfig;
//import org.apache.kafka.common.serialization.StringDeserializer;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
//import org.springframework.kafka.core.ConsumerFactory;
//import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
//import org.springframework.kafka.support.serializer.JsonDeserializer;

import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    // TODO: Kafka 기반 비동기 AI 파이프라인 전환 시 아래 Bean들을 활성화
    //
    // @Value("${spring.kafka.bootstrap-servers}")
    // private String bootstrapServers;
    //
    // @Bean
    // public ConsumerFactory<String, AiResultMessage> aiResultConsumerFactory() {
    //     Map<String, Object> props = new HashMap<>();
    //     props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    //     props.put(ConsumerConfig.GROUP_ID_CONFIG, "netsentry-ai-results-group");
    //     props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    //     props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
    //     props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.capstone.flowids.dto");
    //     props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, AiResultMessage.class.getName());
    //     props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
    //     return new DefaultKafkaConsumerFactory<>(props);
    // }
    //
    // @Bean
    // public ConcurrentKafkaListenerContainerFactory<String, AiResultMessage> aiResultListenerContainerFactory() {
    //     ConcurrentKafkaListenerContainerFactory<String, AiResultMessage> factory =
    //             new ConcurrentKafkaListenerContainerFactory<>();
    //     factory.setConsumerFactory(aiResultConsumerFactory());
    //     return factory;
    // }
}
