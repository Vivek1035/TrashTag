package com.trashtag.backend.trashtag.service;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.timeline.dto.TimelineEventResponse;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.dto.CreateTrashTagRequest;
import com.trashtag.backend.trashtag.dto.TrashTagResponse;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import com.trashtag.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrashTagService {

    private final TrashTagRepository trashTagRepository;
    private final TagCodeGeneratorService tagCodeGeneratorService;
    private final TrashTagStateMachine stateMachine;
    private final TimelineEventRepository timelineEventRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Verify a reported TrashTag hotspot. Requires VERIFIER or ADMIN role.
     */
    @Transactional
    public TrashTagResponse verifyTrashTag(String idOrTagCode) {
        User verifier = userService.getCurrentUser();
        TrashTag tag = findByIdOrTagCode(idOrTagCode);

        // Enforce state machine transition: REPORTED -> VERIFIED
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.VERIFIED);

        tag.setStatus(RecoveryStatus.VERIFIED);
        tag.setVerifiedAt(Instant.now());
        tag.setVerifiedBy(verifier.getId());
        tag.setLastStatusChangedAt(Instant.now());

        tag = trashTagRepository.save(tag);

        // Timeline Event
        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trashTagId(tag.getId())
                .actorId(verifier.getId())
                .eventType("HOTSPOT_VERIFIED")
                .title("Hotspot Verified")
                .description("Hotspot " + tag.getTagCode() + " verified by " + verifier.getDisplayName())
                .relatedEntityId(tag.getId())
                .relatedEntityType("TrashTag")
                .imageUrl(tag.getPrimaryImageUrl())
                .build();
        timelineEventRepository.save(timelineEvent);

        // Score Event (25 pts for verifier)
        ScoreEvent scoreEvent = ScoreEvent.builder()
                .userId(verifier.getId())
                .trashTagId(tag.getId())
                .eventType("HOTSPOT_VERIFIED")
                .points(25)
                .description("Earned 25 pts for verifying hotspot " + tag.getTagCode())
                .build();
        scoreEventRepository.save(scoreEvent);

        String reporterName = userRepository.findById(tag.getReporterId())
                .map(u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .orElse("Unknown");

        return toResponse(tag, reporterName);
    }

    /**
     * Create a new TrashTag hotspot report.
     * Initial status is enforced to REPORTED.
     */
    @Transactional
    public TrashTagResponse createTrashTag(CreateTrashTagRequest request) {
        User currentUser = userService.getCurrentUser();
        String tagCode = tagCodeGeneratorService.generateTagCode();

        TrashTag trashTag = TrashTag.builder()
                .tagCode(tagCode)
                .reporterId(currentUser.getId())
                .status(RecoveryStatus.REPORTED)
                .wasteType(request.getWasteType())
                .severity(request.getSeverity())
                .title(request.getTitle())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .estimatedWeightKg(request.getEstimatedWasteKg())
                .primaryImageUrl(request.getBeforeImageUrl())
                .lastStatusChangedAt(Instant.now())
                .build();

        trashTag = trashTagRepository.save(trashTag);

        // 2. Timeline Event
        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trashTagId(trashTag.getId())
                .actorId(currentUser.getId())
                .eventType("REPORT_CREATED")
                .title("Trash Hotspot Tagged")
                .description("Hotspot '" + trashTag.getTitle() + "' tagged with severity " + trashTag.getSeverity())
                .relatedEntityId(trashTag.getId())
                .relatedEntityType("TrashTag")
                .imageUrl(trashTag.getPrimaryImageUrl())
                .build();
        timelineEventRepository.save(timelineEvent);

        // 3. Score Event (50 pts for tagging a hotspot)
        ScoreEvent scoreEvent = ScoreEvent.builder()
                .userId(currentUser.getId())
                .trashTagId(trashTag.getId())
                .eventType("HOTSPOT_REPORTED")
                .points(50)
                .description("Earned 50 pts for tagging hotspot " + trashTag.getTagCode())
                .build();
        scoreEventRepository.save(scoreEvent);

        return toResponse(trashTag, currentUser.getDisplayName());
    }

    /**
     * Get paginated TrashTags with optional filters (status, wasteType, severity).
     */
    @Transactional(readOnly = true)
    public Page<TrashTagResponse> getTrashTags(
            RecoveryStatus status, WasteType wasteType, Severity severity, Pageable pageable) {

        Page<TrashTag> page = trashTagRepository.findByFilters(status, wasteType, severity, pageable);

        // Batch fetch reporter names for efficiency
        Map<UUID, String> userNames = userRepository.findAllById(
                page.getContent().stream().map(TrashTag::getReporterId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername()));

        return page.map(tag -> toResponse(tag, userNames.getOrDefault(tag.getReporterId(), "Unknown")));
    }

    /**
     * Get a single TrashTag by UUID or TagCode (e.g. TT-1001).
     */
    @Transactional(readOnly = true)
    public TrashTagResponse getTrashTagById(String idOrTagCode) {
        TrashTag tag = findByIdOrTagCode(idOrTagCode);
        String reporterName = userRepository.findById(tag.getReporterId())
                .map(u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .orElse("Unknown");
        return toResponse(tag, reporterName);
    }

    /**
     * Get chronological timeline events for a TrashTag.
     */
    @Transactional(readOnly = true)
    public Page<TimelineEventResponse> getTrashTagTimeline(String idOrTagCode, Pageable pageable) {
        TrashTag tag = findByIdOrTagCode(idOrTagCode);
        Page<TimelineEvent> page = timelineEventRepository.findByTrashTagIdOrderByCreatedAtAsc(tag.getId(), pageable);

        Map<UUID, String> userNames = userRepository.findAllById(
                page.getContent().stream().map(TimelineEvent::getActorId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername()));

        return page.map(ev -> TimelineEventResponse.builder()
                .id(ev.getId().toString())
                .trashTagId(ev.getTrashTagId().toString())
                .actorId(ev.getActorId().toString())
                .actorName(userNames.getOrDefault(ev.getActorId(), "Unknown"))
                .eventType(ev.getEventType())
                .title(ev.getTitle())
                .description(ev.getDescription())
                .relatedEntityId(ev.getRelatedEntityId() != null ? ev.getRelatedEntityId().toString() : null)
                .relatedEntityType(ev.getRelatedEntityType())
                .imageUrl(ev.getImageUrl())
                .createdAt(ev.getCreatedAt())
                .build());
    }

    public TrashTag findByIdOrTagCode(String idOrTagCode) {
        try {
            UUID uuid = UUID.fromString(idOrTagCode);
            return trashTagRepository.findById(uuid)
                    .orElseThrow(() -> new ResourceNotFoundException("TrashTag", "id", idOrTagCode));
        } catch (IllegalArgumentException e) {
            return trashTagRepository.findByTagCode(idOrTagCode)
                    .orElseThrow(() -> new ResourceNotFoundException("TrashTag", "tagCode", idOrTagCode));
        }
    }

    public static TrashTagResponse toResponse(TrashTag tag, String reporterName) {
        return TrashTagResponse.builder()
                .id(tag.getId().toString())
                .tagCode(tag.getTagCode())
                .reporterId(tag.getReporterId().toString())
                .reporterName(reporterName)
                .status(tag.getStatus())
                .wasteType(tag.getWasteType())
                .severity(tag.getSeverity())
                .title(tag.getTitle())
                .description(tag.getDescription())
                .latitude(tag.getLatitude())
                .longitude(tag.getLongitude())
                .address(tag.getAddress())
                .estimatedWeightKg(tag.getEstimatedWeightKg())
                .primaryImageUrl(tag.getPrimaryImageUrl())
                .reportedAt(tag.getReportedAt())
                .verifiedAt(tag.getVerifiedAt())
                .verifiedBy(tag.getVerifiedBy() != null ? tag.getVerifiedBy().toString() : null)
                .lastStatusChangedAt(tag.getLastStatusChangedAt())
                .createdAt(tag.getCreatedAt())
                .updatedAt(tag.getUpdatedAt())
                .build();
    }
}

