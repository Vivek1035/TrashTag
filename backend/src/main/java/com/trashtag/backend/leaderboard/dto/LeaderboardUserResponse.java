package com.trashtag.backend.leaderboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardUserResponse {
    private int rank;
    private String userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String role;

    private int points;
    private long reports;
    private long missions;
    private double wasteRecoveredKg;
    private long recoveries;

    private List<UserBadgeDTO> badges;
}

