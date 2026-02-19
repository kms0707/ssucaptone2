package com.capstone.flowids.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ProjectCreateRequest {

    @NotBlank(message = "프로젝트 이름은 필수입니다")
    @Size(max = 100, message = "프로젝트 이름은 100자 이하여야 합니다")
    private String name;

    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    private String description;
}
