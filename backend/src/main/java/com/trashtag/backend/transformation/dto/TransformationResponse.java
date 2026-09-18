package com.trashtag.backend.transformation.dto;

import com.trashtag.backend.common.enums.RecoveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransformationResponse {
    private UUID id;
    private UUID trashTagId;
    private String tagCode;
    private String title;
    private RecoveryStatus status;
    private String transformationType;
    private String description;
    private String preventionStrategy;
    private String beforeImageUrl;
    private String afterImageUrl;
    private Double estimatedWeightKg;
    private Double recoveredWeightKg;
    private UUID submittedBy;
    private Instant transformedAt;
    private List<MonitoringCheckpointDTO> checkpoints;
    private Instant createdAt;
    private Instant updatedAt;
}

