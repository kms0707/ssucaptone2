package com.capstone.flowids.controller;

import com.capstone.flowids.common.ApiResponse;
import com.capstone.flowids.dto.ProjectCreateRequest;
import com.capstone.flowids.dto.ProjectResponse;
import com.capstone.flowids.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            Authentication authentication,
            @Valid @RequestBody ProjectCreateRequest request) {
        Long memberId = (Long) authentication.getPrincipal();
        ProjectResponse response = projectService.createProject(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getMyProjects(Authentication authentication) {
        Long memberId = (Long) authentication.getPrincipal();
        List<ProjectResponse> response = projectService.getMyProjects(memberId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/api-key/reissue")
    public ResponseEntity<ApiResponse<ProjectResponse>> reissueApiKey(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(defaultValue = "수동 재발급") String reason) {
        Long memberId = (Long) authentication.getPrincipal();
        ProjectResponse response = projectService.reissueApiKey(id, memberId, reason);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
