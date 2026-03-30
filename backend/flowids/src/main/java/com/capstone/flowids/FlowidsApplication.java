package com.capstone.flowids;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(exclude = KafkaAutoConfiguration.class)
@EnableJpaAuditing
public class FlowidsApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlowidsApplication.class, args);
	}

}
