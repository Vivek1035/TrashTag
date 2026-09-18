package com.trashtag.backend.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringDashboardMetrics {
    private long dueCount;
    private long completedCount;
    private long overdueCount;
    private long sustainedCount;
    private long reopenedCount;
}

