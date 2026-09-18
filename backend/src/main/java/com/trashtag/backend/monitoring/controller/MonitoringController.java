package com.trashtag.backend.monitoring.controller;

import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.monitoring.dto.CompleteMonitoringRequest;
import com.trashtag.backend.monitoring.dto.MonitoringCheckpointResponse;
import com.trashtag.backend.monitoring.service.MonitoringService;
import com.trashtag.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MonitoringController {

    private final MonitoringService monitoringService;

    /**
     * GET /api/monitoring
     * List monitoring checkpoints & dashboard metrics
     */
    @GetMapping("/api/monitoring")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonitoringDashboard(
            @RequestParam(value = "checkpointDays", required = false) Integer checkpointDays,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search) {

        Map<String, Object> data = monitoringService.getMonitoringDashboard(checkpointDays, status, search);
        return ResponseEntity.ok(ApiResponse.ok("Monitoring dashboard retrieved successfully", data));
    }

    /**
     * POST /api/trash-tags/{id}/monitoring
     * Initialize monitoring schedule for TrashTag
     */
    @PostMapping("/api/trash-tags/{id}/monitoring")
    public ResponseEntity<ApiResponse<List<MonitoringCheckpointResponse>>> initializeMonitoring(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
        List<MonitoringCheckpointResponse> checkpoints = monitoringService.initializeMonitoringForTag(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Monitoring checkpoints initialized successfully", checkpoints));
    }

    /**
     * POST /api/monitoring/{id}/complete
     * Submit monitoring inspection record
     */
    @PostMapping("/api/monitoring/{id}/complete")
    public ResponseEntity<ApiResponse<MonitoringCheckpointResponse>> completeMonitoringInspection(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CompleteMonitoringRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        try {
            UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
            MonitoringCheckpointResponse response = monitoringService.completeMonitoringInspection(id, request, userId);
            return ResponseEntity.ok(ApiResponse.ok("Monitoring inspection submitted successfully", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.<MonitoringCheckpointResponse>builder().success(false).message(e.getMessage()).build());
        }
    }
}

