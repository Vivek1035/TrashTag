package com.trashtag.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPersonalStats {
    private int environmentalScore;
    private long myReportsCount;
    private long myMissionsCount;
    private double myWasteRecoveredKg;
    private long mySitesRecoveredCount;
}

