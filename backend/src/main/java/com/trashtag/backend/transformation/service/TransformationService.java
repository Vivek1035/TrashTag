package com.trashtag.backend.transformation.service;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.transformation.dto.*;
import com.trashtag.backend.transformation.entity.Transformation;
import com.trashtag.backend.transformation.repository.TransformationRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.trashtag.service.TrashTagStateMachine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransformationService {

    private final TrashTagRepository trashTagRepository;
    private final TransformationRepository transformationRepository;
    private final MonitoringCheckpointRepository monitoringCheckpointRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final TrashTagStateMachine stateMachine;

    /**
     * Phase 1: Select AI Prevention Strategy
     * Transition: RECOVERY_VERIFIED → TRANSFORMATION_PLANNED
     */
    @Transactional
    public TransformationResponse planTransformation(UUID trashTagId, SelectStrategyRequest request, UUID userId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        if (tag.getStatus() != RecoveryStatus.RECOVERY_VERIFIED) {
            throw new IllegalStateException("Transformation planning is only allowed for TrashTags with status RECOVERY_VERIFIED. Current status: " + tag.getStatus());
        }

        // Validate state machine transition
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.TRANSFORMATION_PLANNED);
        tag.setStatus(RecoveryStatus.TRANSFORMATION_PLANNED);
        tag.setLastStatusChangedAt(Instant.now());
        trashTagRepository.save(tag);

        Transformation transformation = transformationRepository.findByTrashTagId(trashTagId)
                .orElseGet(() -> Transformation.builder()
                        .trashTagId(trashTagId)
                        .beforeImageUrl(tag.getPrimaryImageUrl())
                        .build());

        transformation.setPreventionStrategy(request.getStrategyName());
        transformation.setTransformationType(request.getStrategyName());
        transformation.setSubmittedBy(userId);
        if (request.getStrategyReason() != null) {
            transformation.setDescription("Strategy Reason: " + request.getStrategyReason());
        }

        Transformation savedTransformation = transformationRepository.save(transformation);

        // Timeline Event
        TimelineEvent event = TimelineEvent.builder()
                .trashTagId(trashTagId)
                .actorId(userId)
                .eventType("TRANSFORMATION_PLANNED")
                .title("Transformation Strategy Selected: " + request.getStrategyName())
                .description("Selected prevention strategy: " + request.getStrategyName() + ". Site advanced to TRANSFORMATION_PLANNED.")
                .build();
        timelineEventRepository.save(event);

        return buildTransformationResponse(tag, savedTransformation, Collections.emptyList());
    }

    /**
     * Phase 2: Complete Transformation Evidence & Auto-Create Monitoring Checkpoints
     * Transition: TRANSFORMATION_PLANNED → TRANSFORMED → MONITORING
     */
    @Transactional
    public TransformationResponse completeTransformation(UUID trashTagId, CompleteTransformationRequest request, UUID userId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        if (tag.getStatus() != RecoveryStatus.TRANSFORMATION_PLANNED) {
            throw new IllegalStateException("Transformation completion is only allowed for TrashTags with status TRANSFORMATION_PLANNED. Current status: " + tag.getStatus());
        }

        Instant now = Instant.now();

        // 1. Transition: TRANSFORMATION_PLANNED → TRANSFORMED
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.TRANSFORMED);
        tag.setStatus(RecoveryStatus.TRANSFORMED);
        tag.setLastStatusChangedAt(now);
        trashTagRepository.save(tag);

        Transformation transformation = transformationRepository.findByTrashTagId(trashTagId)
                .orElseGet(() -> Transformation.builder()
                        .trashTagId(trashTagId)
                        .beforeImageUrl(tag.getPrimaryImageUrl())
                        .build());

        transformation.setTransformationType(request.getTransformationType());
        transformation.setDescription(request.getDescription());
        transformation.setAfterImageUrl(request.getAfterImageUrl());
        transformation.setTransformedAt(now);
        transformation.setSubmittedBy(userId);

        Transformation savedTransformation = transformationRepository.save(transformation);

        // Timeline Event for TRANSFORMED
        TimelineEvent transformedEvent = TimelineEvent.builder()
                .trashTagId(trashTagId)
                .actorId(userId)
                .eventType("TRANSFORMED")
                .title("Site Transformation Completed")
                .description("Transformation completed as " + request.getTransformationType() + ". Evidence uploaded.")
                .imageUrl(request.getAfterImageUrl())
                .build();
        timelineEventRepository.save(transformedEvent);

        // 2. Automatically create 3 monitoring checkpoints (30, 60, 90 days)
        List<MonitoringCheckpoint> checkpoints = new ArrayList<>();
        int[] days = {30, 60, 90};
        for (int day : days) {
            MonitoringCheckpoint cp = MonitoringCheckpoint.builder()
                    .trashTagId(trashTagId)
                    .checkpointDays(day)
                    .scheduledDate(now.plus(day, ChronoUnit.DAYS))
                    .status("PENDING")
                    .notes("Automated " + day + "-day monitoring checkpoint created upon site transformation completion.")
                    .build();
            checkpoints.add(cp);
        }
        List<MonitoringCheckpoint> savedCheckpoints = monitoringCheckpointRepository.saveAll(checkpoints);

        // 3. Transition: TRANSFORMED → MONITORING
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.MONITORING);
        tag.setStatus(RecoveryStatus.MONITORING);
        tag.setLastStatusChangedAt(now);
        trashTagRepository.save(tag);

        // Timeline Event for MONITORING
        TimelineEvent monitoringEvent = TimelineEvent.builder()
                .trashTagId(trashTagId)
                .actorId(userId)
                .eventType("MONITORING_STARTED")
                .title("Site Monitoring Phase Initiated")
                .description("Automated 30, 60, and 90-day monitoring checkpoints scheduled.")
                .build();
        timelineEventRepository.save(monitoringEvent);

        return buildTransformationResponse(tag, savedTransformation, savedCheckpoints);
    }

    /**
     * Get details of transformation and monitoring checkpoints
     */
    @Transactional(readOnly = true)
    public TransformationResponse getTransformationDetails(UUID trashTagId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        Transformation transformation = transformationRepository.findByTrashTagId(trashTagId)
                .orElseGet(() -> Transformation.builder()
                        .trashTagId(trashTagId)
                        .beforeImageUrl(tag.getPrimaryImageUrl())
                        .transformationType("Pending")
                        .build());

        List<MonitoringCheckpoint> checkpoints = monitoringCheckpointRepository.findByTrashTagIdOrderByCheckpointDaysAsc(trashTagId);

        return buildTransformationResponse(tag, transformation, checkpoints);
    }

    private TransformationResponse buildTransformationResponse(TrashTag tag, Transformation transform, List<MonitoringCheckpoint> checkpoints) {
        List<MonitoringCheckpointDTO> checkpointDTOs = checkpoints.stream()
                .map(cp -> MonitoringCheckpointDTO.builder()
                        .id(cp.getId())
                        .trashTagId(cp.getTrashTagId())
                        .checkpointDays(cp.getCheckpointDays())
                        .scheduledDate(cp.getScheduledDate())
                        .status(cp.getStatus())
                        .notes(cp.getNotes())
                        .verifiedBy(cp.getVerifiedBy())
                        .verifiedAt(cp.getVerifiedAt())
                        .createdAt(cp.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return TransformationResponse.builder()
                .id(transform.getId())
                .trashTagId(tag.getId())
                .tagCode(tag.getTagCode())
                .title(tag.getTitle())
                .status(tag.getStatus())
                .transformationType(transform.getTransformationType())
                .description(transform.getDescription())
                .preventionStrategy(transform.getPreventionStrategy())
                .beforeImageUrl(transform.getBeforeImageUrl() != null ? transform.getBeforeImageUrl() : tag.getPrimaryImageUrl())
                .afterImageUrl(transform.getAfterImageUrl())
                .estimatedWeightKg(tag.getEstimatedWeightKg())
                .recoveredWeightKg(tag.getRecoveredWeightKg())
                .submittedBy(transform.getSubmittedBy())
                .transformedAt(transform.getTransformedAt())
                .checkpoints(checkpointDTOs)
                .createdAt(transform.getCreatedAt())
                .updatedAt(transform.getUpdatedAt())
                .build();
    }
}

