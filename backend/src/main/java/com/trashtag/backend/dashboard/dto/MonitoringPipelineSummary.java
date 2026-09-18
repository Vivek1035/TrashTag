package com.trashtag.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringPipelineSummary {
    private long totalCheckpoints;
    private long dueCheckpoints;
    private long completedCheckpoints;
    private long overdueCheckpoints;
    private long sustainedSitesCount;
    private long reopenedSitesCount;
}

