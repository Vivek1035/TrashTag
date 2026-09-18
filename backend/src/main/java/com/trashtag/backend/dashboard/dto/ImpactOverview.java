package com.trashtag.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactOverview {
    // Real community metrics
    private long userReportedCount;
    private double estimatedWasteKg;
    private double verifiedWasteKg;
    private long sitesRecoveredCount;

    // Distinct Seeded Demo Data metrics
    private DemoDataStats demoData;
}

