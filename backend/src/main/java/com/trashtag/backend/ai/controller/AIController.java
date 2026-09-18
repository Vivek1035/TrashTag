package com.trashtag.backend.ai.controller;

import com.trashtag.backend.ai.dto.ClassificationOverrideRequest;
import com.trashtag.backend.ai.dto.ImageClassificationResponse;
import com.trashtag.backend.ai.dto.PreventionResponse;
import com.trashtag.backend.ai.service.AIAnalysisService;
import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.security.services.UserDetailsImpl;
import com.trashtag.backend.trashtag.entity.TrashTag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIAnalysisService aiAnalysisService;

    /**
     * FEATURE 1: Image Classification
     * POST /api/ai/trash-tags/{id}/classify
     */
    @PostMapping("/trash-tags/{id}/classify")
    public ResponseEntity<ApiResponse<ImageClassificationResponse>> classifyTrashTag(@PathVariable("id") UUID id) {
        ImageClassificationResponse response = aiAnalysisService.classifyTrashTag(id);
        return ResponseEntity.ok(ApiResponse.ok("Image classification analysis generated successfully", response));
    }

    /**
     * FEATURE 2: Prevention Recommendation
     * POST /api/ai/trash-tags/{id}/prevention
     * Only available after RECOVERY_VERIFIED.
     */
    @PostMapping("/trash-tags/{id}/prevention")
    public ResponseEntity<ApiResponse<PreventionResponse>> generatePreventionRecommendations(@PathVariable("id") UUID id) {
        try {
            PreventionResponse response = aiAnalysisService.generatePreventionRecommendations(id);
            return ResponseEntity.ok(ApiResponse.ok("Prevention recommendations generated successfully", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.<PreventionResponse>builder().success(false).message(e.getMessage()).build());
        }
    }

    /**
     * USER CLASSIFICATION OVERRIDE
     * POST /api/ai/trash-tags/{id}/override
     */
    @PostMapping("/trash-tags/{id}/override")
    public ResponseEntity<ApiResponse<TrashTag>> overrideClassification(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ClassificationOverrideRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        UUID actorId = currentUser != null ? currentUser.getId() : UUID.randomUUID();
        TrashTag tag = aiAnalysisService.overrideClassification(id, request, actorId);
        return ResponseEntity.ok(ApiResponse.ok("TrashTag classification overridden successfully", tag));
    }
}

