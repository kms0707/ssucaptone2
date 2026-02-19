package com.capstone.flowids.controller;

import com.capstone.flowids.common.ApiResponse;
import com.capstone.flowids.dto.FlowLogRequest;
import com.capstone.flowids.service.LogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
