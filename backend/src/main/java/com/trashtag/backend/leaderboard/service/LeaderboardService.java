package com.trashtag.backend.leaderboard.service;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.leaderboard.dto.LeaderboardResponse;
import com.trashtag.backend.leaderboard.dto.LeaderboardUserResponse;
import com.trashtag.backend.leaderboard.dto.UserBadgeDTO;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.mission.repository.MissionParticipantRepository;
import com.trashtag.backend.mission.repository.MissionRepository;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.recovery.repository.WasteRecordRepository;
import com.trashtag.backend.transformation.repository.TransformationRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final TrashTagRepository trashTagRepository;
    private final MissionRepository missionRepository;
    private final MissionParticipantRepository missionParticipantRepository;
    private final WasteRecordRepository wasteRecordRepository;
    private final TransformationRepository transformationRepository;
    private final MonitoringCheckpointRepository monitoringCheckpointRepository;
    private final BadgeService badgeService;

    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard() {
        List<User> users = userRepository.findAll();
        List<LeaderboardUserResponse> rankings = new ArrayList<>();

        for (User user : users) {
            UUID userId = user.getId();

            // Points sum from ScoreEvent records
            Integer pts = scoreEventRepository.sumPointsByUserId(userId);
            int points = pts != null ? pts : 0;

            // Measurable user impact metrics
            long reports = trashTagRepository.countByReporterId(userId);
            long missionsJoined = missionParticipantRepository.countByUserId(userId);

            Double wasteKgRecorded = wasteRecordRepository.sumWeightByRecordedBy(userId);
            double wasteRecoveredKg = wasteKgRecorded != null ? wasteKgRecorded : 0.0;

            long verifierRecoveries = trashTagRepository.countByVerifiedBy(userId);

            // Compute site recoveries contributed
            long userRecoveredSites = trashTagRepository.findAll().stream()
                    .filter(t -> (userId.equals(t.getVerifiedBy()) || userId.equals(t.getReporterId()))
                            && isAtLeastRecoveryVerified(t.getStatus()))
                    .count();
            long recoveries = Math.max(verifierRecoveries, userRecoveredSites);

            // Additional metrics for badge derivation
            long transformationsCount = transformationRepository.findAll().stream()
                    .filter(t -> userId.equals(t.getSubmittedBy()))
                    .count();

            long monitoringCheckpointsCount = monitoringCheckpointRepository.findAll().stream()
                    .filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus()) || "SUSTAINED".equalsIgnoreCase(c.getStatus()))
                    .count();

            // Derive badges based on measurable actions
            List<UserBadgeDTO> badges = badgeService.deriveBadges(
                    reports,
                    missionsJoined,
                    wasteRecoveredKg,
                    recoveries,
                    transformationsCount,
                    monitoringCheckpointsCount
            );

            String displayName = user.getDisplayName() != null && !user.getDisplayName().isBlank()
                    ? user.getDisplayName()
                    : user.getUsername();

            String avatar = user.getAvatarUrl() != null ? user.getAvatarUrl()
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

            rankings.add(LeaderboardUserResponse.builder()
                    .userId(userId.toString())
                    .username(user.getUsername())
                    .displayName(displayName)
                    .avatarUrl(avatar)
                    .role(user.getRole().name())
                    .points(points)
                    .reports(reports)
                    .missions(missionsJoined)
                    .wasteRecoveredKg(wasteRecoveredKg)
                    .recoveries(recoveries)
                    .badges(badges)
                    .build());
        }

        // Sort rankings: points DESC, wasteRecoveredKg DESC, reports DESC
        rankings.sort(Comparator.comparingInt(LeaderboardUserResponse::getPoints).reversed()
                .thenComparing(Comparator.comparingDouble(LeaderboardUserResponse::getWasteRecoveredKg).reversed())
                .thenComparing(Comparator.comparingLong(LeaderboardUserResponse::getReports).reversed()));

        // Assign ranks (1-indexed)
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setRank(i + 1);
        }

        // Global aggregate impact metrics
        int globalTotalScore = rankings.stream().mapToInt(LeaderboardUserResponse::getPoints).sum();
        long globalTotalReports = trashTagRepository.count();
        long globalTotalMissions = missionRepository.count();

        double globalTotalWasteRecoveredKg = trashTagRepository.findAll().stream()
                .mapToDouble(t -> t.getRecoveredWeightKg() != null ? t.getRecoveredWeightKg() : 0.0)
                .sum();

        long globalTotalRecoveries = trashTagRepository.findAll().stream()
                .filter(t -> isAtLeastRecoveryVerified(t.getStatus()))
                .count();

        return LeaderboardResponse.builder()
                .globalTotalScore(globalTotalScore)
                .globalTotalReports(globalTotalReports)
                .globalTotalMissions(globalTotalMissions)
                .globalTotalWasteRecoveredKg(globalTotalWasteRecoveredKg)
                .globalTotalRecoveries(globalTotalRecoveries)
                .rankings(rankings)
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
