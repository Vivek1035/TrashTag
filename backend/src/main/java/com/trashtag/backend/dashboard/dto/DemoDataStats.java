package com.trashtag.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoDataStats {
    private long demoReportsCount;
    private double demoEstimatedWasteKg;
    private double demoVerifiedWasteKg;
    private long demoSitesRecoveredCount;
}

