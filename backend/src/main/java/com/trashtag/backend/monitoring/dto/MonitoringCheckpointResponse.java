package com.trashtag.backend.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringCheckpointResponse {
    private UUID id;
    private UUID trashTagId;
    private String tagCode;
    private String trashTagTitle;
    private String address;
    private String trashTagStatus;
    private Integer checkpointDays;
    private Instant scheduledDate;
    private Instant completedDate;
    private String image;
    private Boolean wasteDetected;
    private String notes;
    private String status; // PENDING, COMPLETED, SUSTAINED, REOPENED
    private UUID verifiedBy;
    private Instant verifiedAt;
    private Instant createdAt;
}

