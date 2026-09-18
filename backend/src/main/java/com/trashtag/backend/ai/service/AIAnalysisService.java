package com.trashtag.backend.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.ai.document.AIAnalysisDocument;
import com.trashtag.backend.ai.dto.*;
import com.trashtag.backend.ai.repository.AIAnalysisRepository;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final AIService aiService;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final TrashTagRepository trashTagRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final ObjectMapper objectMapper;

    /**
     * FEATURE 1: Image Classification
     * Analyzes TrashTag evidence photo, stores MongoDB AI analysis document, returns AI response.
     */
    public ImageClassificationResponse classifyTrashTag(UUID trashTagId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        String imageUrl = tag.getPrimaryImageUrl() != null ? tag.getPrimaryImageUrl() : "https://images.unsplash.com/default-dump.jpg";

        ImageClassificationResponse response = aiService.classifyImage(imageUrl, trashTagId);

        // Store AI response in MongoDB
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("wasteCategories", response.getWasteCategories());
            metadata.put("severitySuggestion", response.getSeveritySuggestion().name());
            metadata.put("confidence", response.getConfidence());
            metadata.put("detectedObjects", response.getDetectedObjects());
            metadata.put("explanation", response.getExplanation());
            metadata.put("disclaimer", response.getDisclaimer());

            AIAnalysisDocument doc = AIAnalysisDocument.builder()
                    .trashTagId(trashTagId)
                    .provider(response.getProvider())
                    .prompt("Classify waste evidence image: " + imageUrl)
                    .rawResponse(objectMapper.writeValueAsString(response))
                    .detectedWasteCategories(new ArrayList<>(response.getWasteCategories().keySet()))
                    .metadata(metadata)
                    .createdAt(Instant.now())
                    .build();

            aiAnalysisRepository.save(doc);
            log.info("Saved AI classification document to MongoDB for TrashTag {}", trashTagId);
        } catch (Exception e) {
            log.error("Failed to save AI classification document to MongoDB: {}", e.getMessage());
        }

        return response;
    }

    /**
     * FEATURE 2: Prevention Recommendation
     * Only available after RECOVERY_VERIFIED.
     */
    public PreventionResponse generatePreventionRecommendations(UUID trashTagId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        // Enforce lifecycle check: Only available after RECOVERY_VERIFIED
        if (!isAtLeastRecoveryVerified(tag.getStatus())) {
            throw new IllegalStateException("Prevention recommendations are only available for TrashTags with status RECOVERY_VERIFIED or later. Current status: " + tag.getStatus());
        }

        List<TrashTag> previousReports = trashTagRepository.findAll().stream()
                .filter(t -> !t.getId().equals(trashTagId))
                .limit(5)
                .collect(Collectors.toList());

        PreventionResponse response = aiService.generatePreventionStrategies(tag, previousReports);

        // Store complete response in MongoDB
        try {
            List<String> strategyNames = response.getStrategies().stream()
                    .map(PreventionStrategy::getName)
                    .collect(Collectors.toList());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("strategies", response.getStrategies());
            metadata.put("disclaimer", response.getDisclaimer());

            AIAnalysisDocument doc = AIAnalysisDocument.builder()
                    .trashTagId(trashTagId)
                    .provider(response.getProvider())
                    .prompt("Generate prevention strategies for verified site: " + tag.getTitle())
                    .rawResponse(objectMapper.writeValueAsString(response))
                    .preventionRecommendations(strategyNames)
                    .metadata(metadata)
                    .createdAt(Instant.now())
                    .build();

            aiAnalysisRepository.save(doc);
            log.info("Saved AI prevention recommendations document to MongoDB for TrashTag {}", trashTagId);

            // Log TRANSFORMATION_RECOMMENDED TimelineEvent
            TimelineEvent timelineEvent = TimelineEvent.builder()
                    .trashTagId(trashTagId)
                    .actorId(tag.getReporterId() != null ? tag.getReporterId() : UUID.fromString("00000000-0000-0000-0000-000000000000"))
                    .eventType("TRANSFORMATION_RECOMMENDED")
                    .title("AI Prevention Plan Generated")
                    .description("Generated " + response.getStrategies().size() + " prevention recommendations for site transformation.")
                    .build();
            timelineEventRepository.save(timelineEvent);
        } catch (Exception e) {
            log.error("Failed to save AI prevention document to MongoDB: {}", e.getMessage());
        }

        return response;
    }

    /**
     * Allows user to override the AI classification (wasteType and severity).
     */
    @Transactional
    public TrashTag overrideClassification(UUID trashTagId, ClassificationOverrideRequest request, UUID actorId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        tag.setWasteType(request.getWasteType());
        tag.setSeverity(request.getSeverity());
        TrashTag saved = trashTagRepository.save(tag);

        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trashTagId(trashTagId)
                .actorId(actorId)
                .eventType("CLASSIFICATION_OVERRIDDEN")
                .title("AI Classification Overridden")
                .description(String.format("User updated classification to WasteType: %s, Severity: %s. Notes: %s",
                        request.getWasteType(), request.getSeverity(), request.getNotes() != null ? request.getNotes() : "Manual override"))
                .build();
        timelineEventRepository.save(timelineEvent);

        return saved;
    }

    private boolean isAtLeastRecoveryVerified(RecoveryStatus status) {
        return status == RecoveryStatus.RECOVERY_VERIFIED
                || status == RecoveryStatus.TRANSFORMATION_PLANNED
                || status == RecoveryStatus.TRANSFORMED
                || status == RecoveryStatus.MONITORING
                || status == RecoveryStatus.SUSTAINED;
    }
}

