package com.capstone.flowids.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_key_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApiKeyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String apiKey;

    @Column(nullable = false)
    private LocalDateTime revokedAt;

    @Column(length = 200)
    private String reason;

    public ApiKeyHistory(Project project, String apiKey, LocalDateTime revokedAt, String reason) {
        this.project = project;
        this.apiKey = apiKey;
        this.revokedAt = revokedAt;
        this.reason = reason;
    }
}
