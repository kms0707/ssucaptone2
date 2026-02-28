package com.capstone.flowids.controller;

import com.capstone.flowids.common.ApiResponse;
import com.capstone.flowids.dto.FlowLogRequest;
import com.capstone.flowids.dto.FlowLogResponse;
import com.capstone.flowids.service.LogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/logs")
public class LogController {

    private final LogService logService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> ingest(
            @RequestHeader("X-API-KEY") String apiKey,
            @RequestBody @Valid List<FlowLogRequest> logs) {
        logService.ingest(apiKey, logs);
        return ResponseEntity.accepted().body(new ApiResponse<>(202, "accepted", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FlowLogResponse>>> getLogs(
            Authentication authentication,
            @RequestParam Long projectId,
            @RequestParam(defaultValue = "false") Boolean onlyAnomalies,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long memberId = (Long) authentication.getPrincipal();
        Page<FlowLogResponse> result = logService.getLogs(memberId, projectId, onlyAnomalies, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
