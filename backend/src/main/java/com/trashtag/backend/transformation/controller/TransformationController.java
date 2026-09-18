package com.trashtag.backend.transformation.controller;

import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.security.services.UserDetailsImpl;
import com.trashtag.backend.transformation.dto.CompleteTransformationRequest;
import com.trashtag.backend.transformation.dto.SelectStrategyRequest;
import com.trashtag.backend.transformation.dto.TransformationResponse;
import com.trashtag.backend.transformation.service.TransformationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transformation")
@RequiredArgsConstructor
public class TransformationController {

    private final TransformationService transformationService;

    /**
     * Phase 1: Select AI Prevention Strategy
     * POST /api/transformation/{trashTagId}/plan
     */
    @PostMapping("/{trashTagId}/plan")
    public ResponseEntity<ApiResponse<TransformationResponse>> planTransformation(
            @PathVariable("trashTagId") UUID trashTagId,
            @Valid @RequestBody SelectStrategyRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        try {
            UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
            TransformationResponse response = transformationService.planTransformation(trashTagId, request, userId);
            return ResponseEntity.ok(ApiResponse.ok("Transformation strategy selected successfully", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.<TransformationResponse>builder().success(false).message(e.getMessage()).build());
        }
    }

    /**
     * Phase 2: Complete Transformation & Upload Evidence
     * POST /api/transformation/{trashTagId}/complete
     */
    @PostMapping("/{trashTagId}/complete")
    public ResponseEntity<ApiResponse<TransformationResponse>> completeTransformation(
            @PathVariable("trashTagId") UUID trashTagId,
            @Valid @RequestBody CompleteTransformationRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        try {
            UUID userId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
            TransformationResponse response = transformationService.completeTransformation(trashTagId, request, userId);
            return ResponseEntity.ok(ApiResponse.ok("Transformation completed successfully with monitoring checkpoints", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.<TransformationResponse>builder().success(false).message(e.getMessage()).build());
        }
    }

    /**
     * GET /api/transformation/{trashTagId}
     */
    @GetMapping("/{trashTagId}")
    public ResponseEntity<ApiResponse<TransformationResponse>> getTransformationDetails(
            @PathVariable("trashTagId") UUID trashTagId) {

        TransformationResponse response = transformationService.getTransformationDetails(trashTagId);
        return ResponseEntity.ok(ApiResponse.ok("Transformation details retrieved successfully", response));
    }
}

