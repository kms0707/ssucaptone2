package com.capstone.flowids.dto;

import com.capstone.flowids.domain.Project;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProjectResponse {

    private final Long id;
    private final String name;
    private final String description;
    private final String apiKey;
    private final String apiKeyStatus;
    private final LocalDateTime apiKeyCreatedAt;
    private final LocalDateTime createdAt;

    public ProjectResponse(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.apiKey = project.getApiKey();
        this.apiKeyStatus = project.getApiKeyStatus();
        this.apiKeyCreatedAt = project.getApiKeyCreatedAt();
        this.createdAt = project.getCreatedAt();
    }
}
