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
public class LeaderboardResponse {
    private int globalTotalScore;
    private long globalTotalReports;
    private long globalTotalMissions;
    private double globalTotalWasteRecoveredKg;
    private long globalTotalRecoveries;

    private List<LeaderboardUserResponse> rankings;
}

