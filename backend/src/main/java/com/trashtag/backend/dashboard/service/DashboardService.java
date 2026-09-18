package com.trashtag.backend.dashboard.service;

import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.dashboard.dto.*;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.mission.dto.MissionResponse;
import com.trashtag.backend.mission.entity.Mission;
import com.trashtag.backend.mission.repository.MissionParticipantRepository;
import com.trashtag.backend.mission.repository.MissionRepository;
import com.trashtag.backend.mission.service.MissionService;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.recovery.repository.WasteRecordRepository;
import com.trashtag.backend.timeline.dto.TimelineEventResponse;
import com.trashtag.backend.timeline.service.TimelineService;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TrashTagRepository trashTagRepository;
    private final MissionRepository missionRepository;
    private final MissionParticipantRepository missionParticipantRepository;
    private final WasteRecordRepository wasteRecordRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final MonitoringCheckpointRepository monitoringCheckpointRepository;
    private final MissionService missionService;
    private final TimelineService timelineService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData(User currentUser) {
        UserPersonalStats userStats = computeUserPersonalStats(currentUser);
        LifecycleBreakdown lifecycleBreakdown = computeLifecycleBreakdown();
        ImpactOverview impactOverview = computeImpactOverview();
        List<MissionResponse> upcomingMissions = computeUpcomingMissions();
        MonitoringPipelineSummary monitoringPipeline = computeMonitoringPipeline();
        
        List<TimelineEventResponse> recentTimeline = Collections.emptyList();
        try {
            recentTimeline = timelineService.getGlobalTimeline(null, PageRequest.of(0, 10)).getContent();
        } catch (Exception e) {
            log.warn("Unable to fetch timeline events for dashboard", e);
        }

        return DashboardResponse.builder()
                .userStats(userStats)
                .lifecycleBreakdown(lifecycleBreakdown)
                .impactOverview(impactOverview)
                .upcomingMissions(upcomingMissions)
                .monitoringPipeline(monitoringPipeline)
                .recentTimeline(recentTimeline)
                .build();
    }

    private UserPersonalStats computeUserPersonalStats(User user) {
        if (user == null) {
            return UserPersonalStats.builder()
                    .environmentalScore(0)
                    .myReportsCount(0)
                    .myMissionsCount(0)
                    .myWasteRecoveredKg(0.0)
                    .mySitesRecoveredCount(0)
                    .build();
        }

        UUID userId = user.getId();
        Integer pts = scoreEventRepository.sumPointsByUserId(userId);
        int environmentalScore = pts != null ? pts : 0;

        long myReportsCount = trashTagRepository.countByReporterId(userId);
        long myMissionsCount = missionParticipantRepository.countByUserId(userId);

        Double wasteKgRecorded = wasteRecordRepository.sumWeightByRecordedBy(userId);
        double myWasteRecoveredKg = wasteKgRecorded != null ? wasteKgRecorded : 0.0;

        long mySitesRecoveredCount = trashTagRepository.findAll().stream()
                .filter(t -> (userId.equals(t.getReporterId()) || userId.equals(t.getVerifiedBy()))
                        && isAtLeastRecoveryVerified(t.getStatus()))
                .count();

        return UserPersonalStats.builder()
                .environmentalScore(environmentalScore)
                .myReportsCount(myReportsCount)
                .myMissionsCount(myMissionsCount)
                .myWasteRecoveredKg(myWasteRecoveredKg)
                .mySitesRecoveredCount(mySitesRecoveredCount)
                .build();
    }

    private LifecycleBreakdown computeLifecycleBreakdown() {
        List<TrashTag> allTags = trashTagRepository.findAll();

        long awaitingVerification = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.REPORTED).count();
        long verified = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.VERIFIED || t.getStatus() == RecoveryStatus.MISSION_CREATED).count();
        long activeMissions = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.MISSION_ACTIVE).count();
        long awaitingRecoveryVerification = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.CLEANUP_COMPLETED).count();
        long transformationPlanned = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.TRANSFORMATION_PLANNED).count();
        long transformed = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.TRANSFORMED).count();
        long inMonitoring = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.MONITORING).count();
        long reopened = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.REOPENED).count();
        long sustained = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.SUSTAINED).count();

        long totalActive = allTags.size() - sustained;

        return LifecycleBreakdown.builder()
                .totalActiveTrashTagsCount(totalActive)
                .awaitingVerificationCount(awaitingVerification)
                .verifiedCount(verified)
                .activeMissionsCount(activeMissions)
                .awaitingRecoveryVerificationCount(awaitingRecoveryVerification)
                .transformationPlannedCount(transformationPlanned)
                .transformedCount(transformed)
                .inMonitoringCount(inMonitoring)
                .reopenedCount(reopened)
                .sustainedCount(sustained)
                .build();
    }

    private ImpactOverview computeImpactOverview() {
        List<TrashTag> allTags = trashTagRepository.findAll();

        List<TrashTag> realTags = allTags.stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsDemo()))
                .toList();

        List<TrashTag> demoTags = allTags.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsDemo()))
                .toList();

        long userReportedCount = realTags.size();
        double estimatedWasteKg = realTags.stream().mapToDouble(t -> t.getEstimatedWeightKg() != null ? t.getEstimatedWeightKg() : 0.0).sum();
        double verifiedWasteKg = realTags.stream()
                .filter(t -> isAtLeastRecoveryVerified(t.getStatus()))
                .mapToDouble(t -> t.getRecoveredWeightKg() != null ? t.getRecoveredWeightKg() : 0.0)
                .sum();
        long sitesRecoveredCount = realTags.stream()
                .filter(t -> isAtLeastRecoveryVerified(t.getStatus()))
                .count();

        long demoReportsCount = demoTags.size();
        double demoEstimatedWasteKg = demoTags.stream().mapToDouble(t -> t.getEstimatedWeightKg() != null ? t.getEstimatedWeightKg() : 0.0).sum();
        double demoVerifiedWasteKg = demoTags.stream()
                .filter(t -> isAtLeastRecoveryVerified(t.getStatus()))
                .mapToDouble(t -> t.getRecoveredWeightKg() != null ? t.getRecoveredWeightKg() : 0.0)
                .sum();
        long demoSitesRecoveredCount = demoTags.stream()
                .filter(t -> isAtLeastRecoveryVerified(t.getStatus()))
                .count();

        DemoDataStats demoDataStats = DemoDataStats.builder()
                .demoReportsCount(demoReportsCount)
                .demoEstimatedWasteKg(demoEstimatedWasteKg)
                .demoVerifiedWasteKg(demoVerifiedWasteKg)
                .demoSitesRecoveredCount(demoSitesRecoveredCount)
                .build();

        return ImpactOverview.builder()
                .userReportedCount(userReportedCount)
                .estimatedWasteKg(estimatedWasteKg)
                .verifiedWasteKg(verifiedWasteKg)
                .sitesRecoveredCount(sitesRecoveredCount)
                .demoData(demoDataStats)
                .build();
    }

    private List<MissionResponse> computeUpcomingMissions() {
        try {
            return missionService.getMissions(null, null, PageRequest.of(0, 5, Sort.by("createdAt").descending())).getContent();
        } catch (Exception e) {
            log.warn("Unable to fetch upcoming missions for dashboard", e);
            return List.of();
        }
    }

    private MonitoringPipelineSummary computeMonitoringPipeline() {
        List<MonitoringCheckpoint> checkpoints = monitoringCheckpointRepository.findAll();
        Instant now = Instant.now();

        long total = checkpoints.size();
        long due = checkpoints.stream().filter(c -> "SCHEDULED".equalsIgnoreCase(c.getStatus()) || "DUE".equalsIgnoreCase(c.getStatus())).count();
        long completed = checkpoints.stream().filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus())).count();
        long overdue = checkpoints.stream().filter(c -> "OVERDUE".equalsIgnoreCase(c.getStatus())).count();

        List<TrashTag> allTags = trashTagRepository.findAll();
        long sustainedCount = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.SUSTAINED).count();
        long reopenedCount = allTags.stream().filter(t -> t.getStatus() == RecoveryStatus.REOPENED).count();

        return MonitoringPipelineSummary.builder()
                .totalCheckpoints(total)
                .dueCheckpoints(due)
                .completedCheckpoints(completed)
                .overdueCheckpoints(overdue)
                .sustainedSitesCount(sustainedCount)
                .reopenedSitesCount(reopenedCount)
                .build();
    }

    private boolean isAtLeastRecoveryVerified(RecoveryStatus status) {
        return status == RecoveryStatus.RECOVERY_VERIFIED
                || status == RecoveryStatus.TRANSFORMATION_PLANNED
                || status == RecoveryStatus.TRANSFORMED
                || status == RecoveryStatus.MONITORING
                || status == RecoveryStatus.SUSTAINED;
    }
}
