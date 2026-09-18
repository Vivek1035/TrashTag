package com.trashtag.backend.transformation.dto;

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
public class MonitoringCheckpointDTO {
    private UUID id;
    private UUID trashTagId;
    private Integer checkpointDays;
    private Instant scheduledDate;
    private String status;
    private String notes;
    private UUID verifiedBy;
    private Instant verifiedAt;
    private Instant createdAt;
}

