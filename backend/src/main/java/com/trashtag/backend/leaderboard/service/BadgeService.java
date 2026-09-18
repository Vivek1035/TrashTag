package com.trashtag.backend.leaderboard.service;

import com.trashtag.backend.leaderboard.dto.UserBadgeDTO;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class BadgeService {

    public List<UserBadgeDTO> deriveBadges(
            long reportsCount,
            long missionsCount,
            double wasteRecoveredKg,
            long recoveriesCount,
            long transformationsCount,
            long monitoringCheckpointsCount
    ) {
        List<UserBadgeDTO> badges = new ArrayList<>();
        Instant now = Instant.now();

        // 1. Hotspot Scout
        if (reportsCount >= 3) {
            badges.add(UserBadgeDTO.builder()
                    .id("badge-scout")
                    .name("Hotspot Scout")
                    .description("Reported or verified 3+ illegal dump hotspots.")
                    .icon("🏷️")
                    .level("BRONZE")
                    .earnedAt(now)
                    .build());
        }

        // 2. Cleanup Volunteer
        if (missionsCount >= 2) {
            badges.add(UserBadgeDTO.builder()
                    .id("badge-volunteer")
                    .name("Cleanup Volunteer")
                    .description("Participated in 2+ community cleanup missions.")
                    .icon("🧹")
                    .level("SILVER")
                    .earnedAt(now)
                    .build());
        }

        // 3. Recovery Champion
        if (recoveriesCount >= 1 || wasteRecoveredKg >= 50.0) {
            badges.add(UserBadgeDTO.builder()
                    .id("badge-champion")
                    .name("Recovery Champion")
                    .description("Verified site recovery or recovered 50+ kg of waste.")
                    .icon("🏆")
                    .level("GOLD")
                    .earnedAt(now)
                    .build());
        }

        // 4. Prevention Builder
        if (transformationsCount >= 1) {
            badges.add(UserBadgeDTO.builder()
                    .id("badge-builder")
                    .name("Prevention Builder")
                    .description("Planned or completed 1+ site eco-transformations.")
                    .icon("🌱")
                    .level("PLATINUM")
                    .earnedAt(now)
                    .build());
        }

        // 5. Monitoring Guardian
        if (monitoringCheckpointsCount >= 1) {
            badges.add(UserBadgeDTO.builder()
                    .id("badge-guardian")
                    .name("Monitoring Guardian")
                    .description("Completed 1+ 90-day site surveillance audits.")
                    .icon("🛡️")
                    .level("GOLD")
                    .earnedAt(now)
                    .build());
        }

        return badges;
    }
}

