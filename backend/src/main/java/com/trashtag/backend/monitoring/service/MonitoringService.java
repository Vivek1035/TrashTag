package com.trashtag.backend.monitoring.service;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.monitoring.dto.*;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
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
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final MonitoringCheckpointRepository monitoringCheckpointRepository;
    private final TrashTagRepository trashTagRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final TrashTagStateMachine stateMachine;

    /**
     * GET /api/monitoring
     * List checkpoints & calculate dashboard metrics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMonitoringDashboard(Integer checkpointDays, String statusFilter, String search) {
        List<MonitoringCheckpoint> allCheckpoints = monitoringCheckpointRepository.findAll();
        List<TrashTag> allTags = trashTagRepository.findAll();
        Map<UUID, TrashTag> tagMap = allTags.stream().collect(Collectors.toMap(TrashTag::getId, Function.identity(), (a, b) -> a));

        Instant now = Instant.now();

        // Calculate KPI Metrics across all checkpoints
        long dueCount = allCheckpoints.stream()
                .filter(cp -> "PENDING".equalsIgnoreCase(cp.getStatus()) && !cp.getScheduledDate().isBefore(now))
                .count();

        long overdueCount = allCheckpoints.stream()
                .filter(cp -> "PENDING".equalsIgnoreCase(cp.getStatus()) && cp.getScheduledDate().isBefore(now))
                .count();

        long completedCount = allCheckpoints.stream()
                .filter(cp -> "COMPLETED".equalsIgnoreCase(cp.getStatus()) || "SUSTAINED".equalsIgnoreCase(cp.getStatus()))
                .count();

        long sustainedCount = allTags.stream()
                .filter(t -> t.getStatus() == RecoveryStatus.SUSTAINED)
                .count();

        long reopenedCount = allTags.stream()
                .filter(t -> t.getStatus() == RecoveryStatus.REOPENED)
                .count();

        MonitoringDashboardMetrics metrics = MonitoringDashboardMetrics.builder()
                .dueCount(dueCount)
                .completedCount(completedCount)
                .overdueCount(overdueCount)
                .sustainedCount(sustainedCount)
                .reopenedCount(reopenedCount)
                .build();

        // Filter checkpoints
        List<MonitoringCheckpointResponse> checkpointResponses = allCheckpoints.stream()
                .filter(cp -> checkpointDays == null || cp.getCheckpointDays().equals(checkpointDays))
                .filter(cp -> statusFilter == null || statusFilter.isBlank() || "ALL".equalsIgnoreCase(statusFilter) || cp.getStatus().equalsIgnoreCase(statusFilter))
                .map(cp -> {
                    TrashTag tag = tagMap.get(cp.getTrashTagId());
                    String tagCode = tag != null ? tag.getTagCode() : "TT-0000";
                    String title = tag != null ? tag.getTitle() : "Unknown Site";
                    String address = tag != null ? tag.getAddress() : "";
                    String tagStatus = tag != null ? tag.getStatus().name() : "UNKNOWN";

                    return MonitoringCheckpointResponse.builder()
                            .id(cp.getId())
                            .trashTagId(cp.getTrashTagId())
                            .tagCode(tagCode)
                            .trashTagTitle(title)
                            .address(address)
                            .trashTagStatus(tagStatus)
                            .checkpointDays(cp.getCheckpointDays())
                            .scheduledDate(cp.getScheduledDate())
                            .completedDate(cp.getCompletedAt())
                            .image(cp.getEvidenceImageUrl())
                            .wasteDetected(cp.getWasteDetected())
                            .notes(cp.getNotes())
                            .status(cp.getStatus())
                            .verifiedBy(cp.getVerifiedBy())
                            .verifiedAt(cp.getVerifiedAt())
                            .createdAt(cp.getCreatedAt())
                            .build();
                })
                .filter(resp -> search == null || search.isBlank() ||
                        resp.getTagCode().toLowerCase().contains(search.toLowerCase()) ||
                        resp.getTrashTagTitle().toLowerCase().contains(search.toLowerCase()) ||
                        (resp.getAddress() != null && resp.getAddress().toLowerCase().contains(search.toLowerCase())))
                .sorted(Comparator.comparing(MonitoringCheckpointResponse::getScheduledDate))
                .collect(Collectors.toList());

        return Map.of(
                "metrics", metrics,
                "checkpoints", checkpointResponses
        );
    }

    /**
     * POST /api/trash-tags/{id}/monitoring
     * Generates or retrieves 30/60/90-day monitoring schedule for a TrashTag.
     */
    @Transactional
    public List<MonitoringCheckpointResponse> initializeMonitoringForTag(UUID trashTagId, UUID userId) {
        TrashTag tag = trashTagRepository.findById(trashTagId)
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + trashTagId));

        List<MonitoringCheckpoint> existing = monitoringCheckpointRepository.findByTrashTagIdOrderByCheckpointDaysAsc(trashTagId);

        if (existing.isEmpty()) {
            Instant now = Instant.now();
            List<MonitoringCheckpoint> created = new ArrayList<>();
            int[] days = {30, 60, 90};
            for (int day : days) {
                MonitoringCheckpoint cp = MonitoringCheckpoint.builder()
                        .trashTagId(trashTagId)
                        .checkpointDays(day)
                        .scheduledDate(now.plus(day, ChronoUnit.DAYS))
                        .status("PENDING")
                        .notes("Automated " + day + "-day monitoring checkpoint created.")
                        .build();
                created.add(cp);
            }
            existing = monitoringCheckpointRepository.saveAll(created);
        }

        return existing.stream()
                .map(cp -> MonitoringCheckpointResponse.builder()
                        .id(cp.getId())
                        .trashTagId(tag.getId())
                        .tagCode(tag.getTagCode())
                        .trashTagTitle(tag.getTitle())
                        .address(tag.getAddress())
                        .trashTagStatus(tag.getStatus().name())
                        .checkpointDays(cp.getCheckpointDays())
                        .scheduledDate(cp.getScheduledDate())
                        .completedDate(cp.getCompletedAt())
                        .image(cp.getEvidenceImageUrl())
                        .wasteDetected(cp.getWasteDetected())
                        .notes(cp.getNotes())
                        .status(cp.getStatus())
                        .verifiedBy(cp.getVerifiedBy())
                        .verifiedAt(cp.getVerifiedAt())
                        .createdAt(cp.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * POST /api/monitoring/{id}/complete
     * Submits monitoring inspection record and triggers lifecycle transitions.
     */
    @Transactional
    public MonitoringCheckpointResponse completeMonitoringInspection(UUID checkpointId, CompleteMonitoringRequest request, UUID userId) {
        MonitoringCheckpoint cp = monitoringCheckpointRepository.findById(checkpointId)
                .orElseThrow(() -> new ResourceNotFoundException("Monitoring checkpoint not found with id: " + checkpointId));

        TrashTag tag = trashTagRepository.findById(cp.getTrashTagId())
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag not found with id: " + cp.getTrashTagId()));

        Instant now = Instant.now();

        cp.setCompletedAt(now);
        cp.setEvidenceImageUrl(request.getEvidenceImageUrl());
        cp.setWasteDetected(request.getWasteDetected());
        cp.setNotes(request.getNotes());
        cp.setVerifiedBy(userId);
        cp.setVerifiedAt(now);

        // Inspection Logic: If waste returned (wasteDetected == true)
        if (Boolean.TRUE.equals(request.getWasteDetected())) {
            cp.setStatus("REOPENED");
            monitoringCheckpointRepository.save(cp);

            // Transition: MONITORING → REOPENED
            if (tag.getStatus() == RecoveryStatus.MONITORING) {
                stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.REOPENED);
                tag.setStatus(RecoveryStatus.REOPENED);
                tag.setLastStatusChangedAt(now);
                trashTagRepository.save(tag);
            }

            // Timeline Event: SITE_REOPENED
            TimelineEvent event = TimelineEvent.builder()
                    .trashTagId(tag.getId())
                    .actorId(userId)
                    .eventType("SITE_REOPENED")
                    .title("SITE REOPENED — Dumping Returned")
                    .description(String.format("Inspection at %d-day checkpoint confirmed waste dumping returned. Status changed to REOPENED; eligible for new recovery mission. Notes: %s",
                            cp.getCheckpointDays(), request.getNotes() != null ? request.getNotes() : "Dumping detected"))
                    .imageUrl(request.getEvidenceImageUrl())
                    .build();
            timelineEventRepository.save(event);

            log.warn("TrashTag {} reopened due to waste detection at {}-day checkpoint", tag.getTagCode(), cp.getCheckpointDays());

        } else {
            // Site remains clean (wasteDetected == false)
            cp.setStatus("COMPLETED");
            monitoringCheckpointRepository.save(cp);

            // Timeline Event: CHECKPOINT_COMPLETED
            TimelineEvent event = TimelineEvent.builder()
                    .trashTagId(tag.getId())
                    .actorId(userId)
                    .eventType("CHECKPOINT_COMPLETED")
                    .title(String.format("%d-Day Monitoring Checkpoint Passed", cp.getCheckpointDays()))
                    .description(String.format("Inspection confirmed site remains clean. Notes: %s",
                            request.getNotes() != null ? request.getNotes() : "Clean inspection"))
                    .imageUrl(request.getEvidenceImageUrl())
                    .build();
            timelineEventRepository.save(event);

            // Score Event (+20 pts for completing surveillance inspection, with duplicate protection)
            if (!scoreEventRepository.existsByUserIdAndTrashTagIdAndEventType(userId, tag.getId(), "MONITORING_COMPLETED")) {
                ScoreEvent scoreEvent = ScoreEvent.builder()
                        .userId(userId)
                        .trashTagId(tag.getId())
                        .eventType("MONITORING_COMPLETED")
                        .points(20)
                        .description("Earned 20 pts for conducting " + cp.getCheckpointDays() + "-day site surveillance inspection on " + tag.getTagCode())
                        .build();
                scoreEventRepository.save(scoreEvent);
            }

            // If 90-day checkpoint passes clean, transition to SUSTAINED
            if (cp.getCheckpointDays() == 90 || tag.getStatus() == RecoveryStatus.MONITORING) {
                List<MonitoringCheckpoint> allCheckpoints = monitoringCheckpointRepository.findByTrashTagIdOrderByCheckpointDaysAsc(tag.getId());
                boolean allClean = allCheckpoints.stream()
                        .allMatch(c -> "COMPLETED".equalsIgnoreCase(c.getStatus()) || Boolean.FALSE.equals(c.getWasteDetected()));

                if (cp.getCheckpointDays() == 90 && allClean) {
                    stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.SUSTAINED);
                    tag.setStatus(RecoveryStatus.SUSTAINED);
                    tag.setLastStatusChangedAt(now);
                    trashTagRepository.save(tag);

                    // Timeline Event: SITE_SUSTAINED
                    TimelineEvent sustainedEvent = TimelineEvent.builder()
                            .trashTagId(tag.getId())
                            .actorId(userId)
                            .eventType("SITE_SUSTAINED")
                            .title("SITE FULLY SUSTAINED (90-Day Audit Clean)")
                            .description("Site successfully maintained clean status for 90 days. Awarded sustainability certificate.")
                            .build();
                    timelineEventRepository.save(sustainedEvent);

                    // ScoreEvent: +100 XP
                    ScoreEvent score = ScoreEvent.builder()
                            .userId(userId)
                            .trashTagId(tag.getId())
                            .points(100)
                            .eventType("SITE_SUSTAINED")
                            .description("Awarded 100 XP for completing 90-day clean site monitoring audit.")
                            .build();

                    scoreEventRepository.save(score);

                    log.info("TrashTag {} successfully advanced to SUSTAINED status", tag.getTagCode());
                }
            }
        }

        return MonitoringCheckpointResponse.builder()
                .id(cp.getId())
                .trashTagId(tag.getId())
                .tagCode(tag.getTagCode())
                .trashTagTitle(tag.getTitle())
                .address(tag.getAddress())
                .trashTagStatus(tag.getStatus().name())
                .checkpointDays(cp.getCheckpointDays())
                .scheduledDate(cp.getScheduledDate())
                .completedDate(cp.getCompletedAt())
                .image(cp.getEvidenceImageUrl())
                .wasteDetected(cp.getWasteDetected())
                .notes(cp.getNotes())
                .status(cp.getStatus())
                .verifiedBy(cp.getVerifiedBy())
                .verifiedAt(cp.getVerifiedAt())
                .createdAt(cp.getCreatedAt())
                .build();
    }
}
