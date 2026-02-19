package com.capstone.flowids.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, unique = true)
    private String apiKey;

    @Column(nullable = false, length = 20)
    private String apiKeyStatus;

    @Column(nullable = false)
    private LocalDateTime apiKeyCreatedAt;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Builder
    public Project(Member member, String name, String description,
                   String apiKey, String apiKeyStatus, LocalDateTime apiKeyCreatedAt) {
        this.member = member;
        this.name = name;
        this.description = description;
        this.apiKey = apiKey;
        this.apiKeyStatus = apiKeyStatus;
        this.apiKeyCreatedAt = apiKeyCreatedAt;
    }

    public void updateApiKey(String newApiKey) {
        this.apiKey = newApiKey;
        this.apiKeyCreatedAt = LocalDateTime.now();
        this.apiKeyStatus = "ACTIVE";
    }
}
