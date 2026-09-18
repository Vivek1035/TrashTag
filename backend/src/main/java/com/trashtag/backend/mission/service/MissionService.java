package com.trashtag.backend.mission.service;

import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.exception.DuplicateOperationException;
import com.trashtag.backend.common.exception.InvalidStatusTransitionException;
import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.mission.dto.CreateMissionRequest;
import com.trashtag.backend.mission.dto.MissionResponse;
import com.trashtag.backend.mission.dto.ParticipantResponse;
import com.trashtag.backend.mission.entity.Mission;
import com.trashtag.backend.mission.entity.MissionParticipant;
import com.trashtag.backend.mission.repository.MissionParticipantRepository;
import com.trashtag.backend.mission.repository.MissionRepository;
import com.trashtag.backend.security.services.UserDetailsImpl;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.trashtag.service.TrashTagService;
import com.trashtag.backend.trashtag.service.TrashTagStateMachine;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.mission.dto.CompleteMissionRequest;
import com.trashtag.backend.recovery.entity.WasteRecord;
import com.trashtag.backend.recovery.repository.WasteRecordRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import com.trashtag.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final MissionParticipantRepository participantRepository;
    private final TrashTagRepository trashTagRepository;
    private final TrashTagService trashTagService;
    private final TrashTagStateMachine stateMachine;
    private final TimelineEventRepository timelineEventRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final WasteRecordRepository wasteRecordRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Create a new cleanup mission for a TrashTag.
     * Enforces that TrashTag must be in VERIFIED or REOPENED state.
     * Updates TrashTag state to MISSION_CREATED.
     */
    @Transactional
    public MissionResponse createMission(CreateMissionRequest request) {
        User creator = userService.getCurrentUser();
        TrashTag tag = trashTagRepository.findById(request.getTrashTagId())
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag", "id", request.getTrashTagId()));

        // Enforce state transition: VERIFIED -> MISSION_CREATED (or REOPENED -> MISSION_CREATED)
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.MISSION_CREATED);

        tag.setStatus(RecoveryStatus.MISSION_CREATED);
        tag.setLastStatusChangedAt(Instant.now());
        trashTagRepository.save(tag);

        Mission mission = Mission.builder()
                .trashTagId(tag.getId())
                .createdBy(creator.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(MissionStatus.UPCOMING)
                .scheduledDate(request.getScheduledDate())
                .maxParticipants(request.getMaxParticipants() != null ? request.getMaxParticipants() : 20)
                .meetingPoint(request.getMeetingPoint())
                .meetingLatitude(request.getMeetingLatitude())
                .meetingLongitude(request.getMeetingLongitude())
                .equipmentNeeded(request.getEquipmentNeeded())
                .build();

        mission = missionRepository.save(mission);

        // Timeline Event
        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trashTagId(tag.getId())
                .actorId(creator.getId())
                .eventType("MISSION_CREATED")
                .title("Cleanup Mission Scheduled: " + mission.getTitle())
                .description("Mission scheduled for " + mission.getScheduledDate() + " with max " + mission.getMaxParticipants() + " volunteers.")
                .relatedEntityId(mission.getId())
                .relatedEntityType("Mission")
                .imageUrl(tag.getPrimaryImageUrl())
                .build();
        timelineEventRepository.save(timelineEvent);

        return toResponse(mission, tag, creator.getDisplayName(), 0, false);
    }

    /**
     * Start a scheduled cleanup mission.
     * Updates Mission to ACTIVE and TrashTag to MISSION_ACTIVE.
     */
    @Transactional
    public MissionResponse startMission(UUID missionId) {
        User currentUser = userService.getCurrentUser();
        Mission mission = findById(missionId);

        if (mission.getStatus() != MissionStatus.UPCOMING) {
            throw new InvalidStatusTransitionException(mission.getStatus().name(), MissionStatus.ACTIVE.name());
        }

        TrashTag tag = trashTagRepository.findById(mission.getTrashTagId())
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag", "id", mission.getTrashTagId()));

        // Enforce TrashTag transition: MISSION_CREATED -> MISSION_ACTIVE
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.MISSION_ACTIVE);

        tag.setStatus(RecoveryStatus.MISSION_ACTIVE);
        tag.setLastStatusChangedAt(Instant.now());
        trashTagRepository.save(tag);

        mission.setStatus(MissionStatus.ACTIVE);
        mission.setStartedAt(Instant.now());
        Mission savedMission = missionRepository.save(mission);

        // Timeline Event
        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trashTagId(tag.getId())
                .actorId(currentUser.getId())
                .eventType("MISSION_STARTED")
                .title("Cleanup Mission Deployed")
                .description("Volunteers active on site for mission: " + mission.getTitle())
                .relatedEntityId(mission.getId())
                .relatedEntityType("Mission")
                .imageUrl(tag.getPrimaryImageUrl())
                .build();
        timelineEventRepository.save(timelineEvent);

        long participantCount = participantRepository.countByMissionId(mission.getId());
        boolean isJoined = participantRepository.existsByMissionIdAndUserId(mission.getId(), currentUser.getId());

        return toResponse(savedMission, tag, currentUser.getDisplayName(), participantCount, isJoined);
    }

    /**
     * Authenticated user joins a mission.
     * Prevents duplicate participation and awards 10 points (without duplicates).
     */
    @Transactional
    public MissionResponse joinMission(UUID missionId) {
        User user = userService.getCurrentUser();
        Mission mission = findById(missionId);

        if (participantRepository.existsByMissionIdAndUserId(mission.getId(), user.getId())) {
            throw new DuplicateOperationException("You have already joined this cleanup mission.");
        }

        long count = participantRepository.countByMissionId(mission.getId());
        if (count >= mission.getMaxParticipants()) {
            throw new InvalidStatusTransitionException("MISSION_FULL", "JOIN");
        }

        MissionParticipant participant = MissionParticipant.builder()
                .missionId(mission.getId())
                .userId(user.getId())
                .checkedIn(false)
                .build();
        participantRepository.save(participant);

        TrashTag tag = trashTagRepository.findById(mission.getTrashTagId()).orElse(null);

        // Timeline Event
        if (tag != null) {
            TimelineEvent timelineEvent = TimelineEvent.builder()
                    .trashTagId(tag.getId())
                    .actorId(user.getId())
                    .eventType("VOLUNTEER_JOINED")
                    .title(user.getDisplayName() + " Joined Cleanup Team")
                    .description("Volunteered for mission: " + mission.getTitle())
                    .relatedEntityId(mission.getId())
                    .relatedEntityType("Mission")
                    .build();
            timelineEventRepository.save(timelineEvent);
        }

        // Score Event — award 10 points once (MISSION_JOINED)
        if (!scoreEventRepository.existsByUserIdAndTrashTagIdAndEventType(user.getId(), mission.getTrashTagId(), "MISSION_JOINED")) {
            ScoreEvent scoreEvent = ScoreEvent.builder()
                    .userId(user.getId())
                    .trashTagId(mission.getTrashTagId())
                    .eventType("MISSION_JOINED")
                    .points(10)
                    .description("Earned 10 pts for joining mission " + mission.getTitle())
                    .build();
            scoreEventRepository.save(scoreEvent);
        }

        long updatedCount = count + 1;
        String creatorName = userRepository.findById(mission.getCreatedBy())
                .map(u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .orElse("Organization");

        return toResponse(mission, tag, creatorName, updatedCount, true);
    }

    /**
     * Authenticated user leaves a mission.
     */
    @Transactional
    public MissionResponse leaveMission(UUID missionId) {
        User user = userService.getCurrentUser();
        Mission mission = findById(missionId);

        MissionParticipant participant = participantRepository.findByMissionIdAndUserId(mission.getId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("MissionParticipant", "userId", user.getId()));

        participantRepository.delete(participant);

        long updatedCount = participantRepository.countByMissionId(mission.getId());
        TrashTag tag = trashTagRepository.findById(mission.getTrashTagId()).orElse(null);
        String creatorName = userRepository.findById(mission.getCreatedBy())
                .map(u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .orElse("Organization");

        return toResponse(mission, tag, creatorName, updatedCount, false);
    }

    /**
     * Complete a cleanup mission and record recovered waste metrics.
     * Enforces duplicate submission protection and validates participant/creator authorization.
     * Updates Mission to COMPLETED and TrashTag to CLEANUP_COMPLETED.
     */
    @Transactional
    public MissionResponse completeMission(UUID missionId, CompleteMissionRequest request) {
        User currentUser = userService.getCurrentUser();
        Mission mission = findById(missionId);

        // Duplicate-submission protection: reject if already completed or cancelled
        if (mission.getStatus() == MissionStatus.COMPLETED) {
            throw new DuplicateOperationException("This cleanup mission has already been completed.");
        }
        if (mission.getStatus() == MissionStatus.CANCELLED) {
            throw new InvalidStatusTransitionException("CANCELLED", "COMPLETED");
        }

        // Validate participant or creator/admin eligibility
        boolean isParticipant = participantRepository.existsByMissionIdAndUserId(mission.getId(), currentUser.getId());
        boolean isCreatorOrAdmin = mission.getCreatedBy().equals(currentUser.getId()) || currentUser.getRole() == com.trashtag.backend.common.enums.UserRole.ADMIN;
        if (!isParticipant && !isCreatorOrAdmin) {
            throw new InvalidStatusTransitionException("UNAUTHORIZED_COMPLETION", "COMPLETED");
        }

        TrashTag tag = trashTagRepository.findById(mission.getTrashTagId())
                .orElseThrow(() -> new ResourceNotFoundException("TrashTag", "id", mission.getTrashTagId()));

        // Enforce TrashTag transition: MISSION_ACTIVE -> CLEANUP_COMPLETED
        stateMachine.validateTransition(tag.getStatus(), RecoveryStatus.CLEANUP_COMPLETED);

        // Backend recalculation and validation of total waste
        double plastic = request.getPlasticKg() != null ? Math.max(0.0, request.getPlasticKg()) : 0.0;
        double organic = request.getOrganicKg() != null ? Math.max(0.0, request.getOrganicKg()) : 0.0;
        double metal   = request.getMetalKg() != null ? Math.max(0.0, request.getMetalKg()) : 0.0;
        double glass   = request.getGlassKg() != null ? Math.max(0.0, request.getGlassKg()) : 0.0;
        double other   = request.getOtherKg() != null ? Math.max(0.0, request.getOtherKg()) : 0.0;

        double calculatedTotalKg = plastic + organic + metal + glass + other;
        if (calculatedTotalKg == 0.0 && request.getTotalKg() != null && request.getTotalKg() > 0.0) {
            calculatedTotalKg = request.getTotalKg();
        }

        // Save individual WasteRecord entries for non-zero categories
        saveWasteRecordIfNonZero(mission, tag, currentUser, WasteType.PLASTIC, plastic, request);
        saveWasteRecordIfNonZero(mission, tag, currentUser, WasteType.ORGANIC, organic, request);
        saveWasteRecordIfNonZero(mission, tag, currentUser, WasteType.METAL, metal, request);
        saveWasteRecordIfNonZero(mission, tag, currentUser, WasteType.GLASS, glass, request);
        saveWasteRecordIfNonZero(mission, tag, currentUser, WasteType.OTHER, other, request);

        if (calculatedTotalKg > 0.0 && plastic == 0 && organic == 0 && metal == 0 && glass == 0 && other == 0) {
            saveWasteRecordIfNonZero(mission, tag, currentUser, WasteType.MIXED, calculatedTotalKg, request);
        }

        // Update Mission status to COMPLETED
        mission.setStatus(MissionStatus.COMPLETED);
        mission.setCompletedAt(Instant.now());
        Mission savedMission = missionRepository.save(mission);

        // Update TrashTag status to CLEANUP_COMPLETED & accumulate recovered weight
        tag.setStatus(RecoveryStatus.CLEANUP_COMPLETED);
        double currentRecovered = tag.getRecoveredWeightKg() != null ? tag.getRecoveredWeightKg() : 0.0;
        tag.setRecoveredWeightKg(currentRecovered + calculatedTotalKg);
        tag.setLastStatusChangedAt(Instant.now());
        trashTagRepository.save(tag);

        // Timeline Event for CLEANUP_COMPLETED
        String eventImg = (request.getAfterImageUrl() != null && !request.getAfterImageUrl().isBlank())
                ? request.getAfterImageUrl() : tag.getPrimaryImageUrl();

        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trashTagId(tag.getId())
                .actorId(currentUser.getId())
                .eventType("CLEANUP_COMPLETED")
                .title("Cleanup Operation Completed: " + Math.round(calculatedTotalKg) + " kg Recovered")
                .description("Mission '" + mission.getTitle() + "' successfully finished. Total recovered waste: "
                        + String.format("%.1f", calculatedTotalKg) + " kg.")
                .relatedEntityId(mission.getId())
                .relatedEntityType("Mission")
                .imageUrl(eventImg)
                .build();
        timelineEventRepository.save(timelineEvent);

        // Score Event — award 30 points for completing cleanup (with duplicate protection)
        if (!scoreEventRepository.existsByUserIdAndTrashTagIdAndEventType(currentUser.getId(), tag.getId(), "CLEANUP_COMPLETED")) {
            ScoreEvent scoreEvent = ScoreEvent.builder()
                    .userId(currentUser.getId())
                    .trashTagId(tag.getId())
                    .eventType("CLEANUP_COMPLETED")
                    .points(30)
                    .description("Earned 30 pts for completing field cleanup on mission " + mission.getTitle())
                    .build();
            scoreEventRepository.save(scoreEvent);
        }

        long count = participantRepository.countByMissionId(mission.getId());
        String creatorName = userRepository.findById(mission.getCreatedBy())
                .map(u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .orElse("Organization");

        return toResponse(savedMission, tag, creatorName, count, isParticipant);
    }

    private void saveWasteRecordIfNonZero(Mission m, TrashTag tag, User recorder, WasteType type, double weight, CompleteMissionRequest req) {
        if (weight <= 0.0) return;
        WasteRecord wr = WasteRecord.builder()
                .missionId(m.getId())
                .trashTagId(tag.getId())
                .recordedBy(recorder.getId())
                .wasteType(type)
                .weightKg(weight)
                .notes(req.getNotes())
                .imageUrl(req.getAfterImageUrl())
                .build();
        wasteRecordRepository.save(wr);
    }

    /**
     * Get paginated missions with optional filters (status, trashTagId).
     */
    @Transactional(readOnly = true)
    public Page<MissionResponse> getMissions(MissionStatus status, UUID trashTagId, Pageable pageable) {
        Page<Mission> page = missionRepository.findByFilters(status, trashTagId, pageable);
        UUID currentUserId = tryGetCurrentUserId();

        Map<UUID, TrashTag> tagMap = trashTagRepository.findAllById(
                page.getContent().stream().map(Mission::getTrashTagId).distinct().toList()
        ).stream().collect(Collectors.toMap(TrashTag::getId, t -> t));

        Map<UUID, String> creatorMap = userRepository.findAllById(
                page.getContent().stream().map(Mission::getCreatedBy).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername()));

        return page.map(mission -> {
            TrashTag tag = tagMap.get(mission.getTrashTagId());
            long count = participantRepository.countByMissionId(mission.getId());
            boolean joined = currentUserId != null && participantRepository.existsByMissionIdAndUserId(mission.getId(), currentUserId);
            return toResponse(mission, tag, creatorMap.getOrDefault(mission.getCreatedBy(), "Organization"), count, joined);
        });
    }

    /**
     * Get single mission details.
     */
    @Transactional(readOnly = true)
    public MissionResponse getMissionById(UUID id) {
        Mission mission = findById(id);
        TrashTag tag = trashTagRepository.findById(mission.getTrashTagId()).orElse(null);
        String creatorName = userRepository.findById(mission.getCreatedBy())
                .map(u -> u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .orElse("Organization");

        UUID currentUserId = tryGetCurrentUserId();
        long count = participantRepository.countByMissionId(mission.getId());
        boolean joined = currentUserId != null && participantRepository.existsByMissionIdAndUserId(mission.getId(), currentUserId);

        return toResponse(mission, tag, creatorName, count, joined);
    }

    /**
     * Get participants list for a mission.
     */
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(UUID missionId) {
        List<MissionParticipant> list = participantRepository.findByMissionId(missionId);
        Map<UUID, User> userMap = userRepository.findAllById(
                list.stream().map(MissionParticipant::getUserId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, u -> u));

        return list.stream().map(p -> {
            User user = userMap.get(p.getUserId());
            return ParticipantResponse.builder()
                    .id(p.getId().toString())
                    .missionId(p.getMissionId().toString())
                    .userId(p.getUserId().toString())
                    .userName(user != null ? (user.getDisplayName() != null ? user.getDisplayName() : user.getUsername()) : "Unknown User")
                    .userAvatarUrl(user != null ? user.getAvatarUrl() : null)
                    .checkedIn(p.isCheckedIn())
                    .checkedInAt(p.getCheckedInAt())
                    .joinedAt(p.getJoinedAt())
                    .build();
        }).toList();
    }

    public Mission findById(UUID id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mission", "id", id));
    }

    private UUID tryGetCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl principal) {
                return principal.getId();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private MissionResponse toResponse(Mission m, TrashTag tag, String creatorName, long participantCount, boolean isJoined) {
        return MissionResponse.builder()
                .id(m.getId().toString())
                .trashTagId(m.getTrashTagId().toString())
                .trashTagCode(tag != null ? tag.getTagCode() : null)
                .trashTagTitle(tag != null ? tag.getTitle() : null)
                .title(m.getTitle())
                .description(m.getDescription())
                .status(m.getStatus())
                .scheduledDate(m.getScheduledDate())
                .startedAt(m.getStartedAt())
                .completedAt(m.getCompletedAt())
                .maxParticipants(m.getMaxParticipants())
                .currentParticipantsCount(participantCount)
                .joinedByCurrentUser(isJoined)
                .meetingPoint(m.getMeetingPoint())
                .meetingLatitude(m.getMeetingLatitude())
                .meetingLongitude(m.getMeetingLongitude())
                .equipmentNeeded(m.getEquipmentNeeded())
                .createdBy(m.getCreatedBy().toString())
                .creatorName(creatorName)
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
