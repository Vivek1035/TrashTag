package com.trashtag.backend.dashboard.dto;

import com.trashtag.backend.mission.dto.MissionResponse;
import com.trashtag.backend.timeline.dto.TimelineEventResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserPersonalStats userStats;
    private LifecycleBreakdown lifecycleBreakdown;
    private ImpactOverview impactOverview;
    private List<MissionResponse> upcomingMissions;
    private MonitoringPipelineSummary monitoringPipeline;
    private List<TimelineEventResponse> recentTimeline;
}
