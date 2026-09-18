package com.trashtag.backend.trashtag.controller;

import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.timeline.dto.TimelineEventResponse;
import com.trashtag.backend.trashtag.dto.CreateTrashTagRequest;
import com.trashtag.backend.trashtag.dto.TrashTagResponse;
import com.trashtag.backend.trashtag.dto.VerifyRecoveryRequest;
import com.trashtag.backend.trashtag.service.TrashTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trash-tags")
@RequiredArgsConstructor
public class TrashTagController {

    private final TrashTagService trashTagService;

    /**
     * POST /api/trash-tags/{id}/verify
     * Verify a reported hotspot. Restricted to VERIFIER and ADMIN roles.
     */
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('VERIFIER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TrashTagResponse>> verifyTrashTag(
            @PathVariable String id) {
        TrashTagResponse response = trashTagService.verifyTrashTag(id);
        return ResponseEntity.ok(ApiResponse.ok("TrashTag hotspot verified successfully.", response));
    }

    /**
     * POST /api/trash-tags/{id}/recovery/verify
     * Verify clean site recovery for a TrashTag. Restricted to VERIFIER and ADMIN roles.
     */
    @PostMapping("/{id}/recovery/verify")
    @PreAuthorize("hasAnyRole('VERIFIER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TrashTagResponse>> verifyRecovery(
            @PathVariable String id,
            @RequestBody(required = false) VerifyRecoveryRequest request) {
        TrashTagResponse response = trashTagService.verifyRecovery(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Hotspot recovery evidence verified successfully.", response));
    }

    /**
     * POST /api/trash-tags
     * Report a new TrashTag hotspot. Requires authentication.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TrashTagResponse>> createTrashTag(
            @Valid @RequestBody CreateTrashTagRequest request) {
        TrashTagResponse response = trashTagService.createTrashTag(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("TrashTag hotspot reported successfully.", response));
    }

    /**
     * GET /api/trash-tags
     * Retrieve paginated TrashTags with optional status, wasteType, and severity filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TrashTagResponse>>> getTrashTags(
            @RequestParam(required = false) RecoveryStatus status,
            @RequestParam(required = false) WasteType wasteType,
            @RequestParam(required = false) Severity severity,
            @PageableDefault(size = 10, sort = "reportedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TrashTagResponse> response = trashTagService.getTrashTags(status, wasteType, severity, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * GET /api/trash-tags/{id}
     * Retrieve details for a specific TrashTag by UUID or TagCode (e.g. TT-1001).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrashTagResponse>> getTrashTagById(
            @PathVariable String id) {
        TrashTagResponse response = trashTagService.getTrashTagById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * GET /api/trash-tags/{id}/timeline
     * Retrieve chronological events for a TrashTag.
     */
    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<Page<TimelineEventResponse>>> getTrashTagTimeline(
            @PathVariable String id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<TimelineEventResponse> response = trashTagService.getTrashTagTimeline(id, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
