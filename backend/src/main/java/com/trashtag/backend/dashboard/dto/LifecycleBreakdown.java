package com.trashtag.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifecycleBreakdown {
    private long totalActiveTrashTagsCount;
    private long awaitingVerificationCount;      // REPORTED
    private long verifiedCount;                  // VERIFIED or MISSION_CREATED
    private long activeMissionsCount;            // MISSION_ACTIVE
    private long awaitingRecoveryVerificationCount; // CLEANUP_COMPLETED
    private long transformationPlannedCount;     // TRANSFORMATION_PLANNED
    private long transformedCount;               // TRANSFORMED
    private long inMonitoringCount;              // MONITORING
    private long reopenedCount;                  // REOPENED
    private long sustainedCount;                 // SUSTAINED
}

