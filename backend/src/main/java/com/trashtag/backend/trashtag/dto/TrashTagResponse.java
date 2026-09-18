package com.trashtag.backend.trashtag.dto;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TrashTagResponse {
    private String id;
    private String tagCode;
    private String reporterId;
    private String reporterName;
    private RecoveryStatus status;
    private WasteType wasteType;
    private Severity severity;
    private String title;
    private String description;
    private Double latitude;
    private Double longitude;
    private String address;
    private Double estimatedWeightKg;
    private String primaryImageUrl;
    private Instant reportedAt;
    private Instant verifiedAt;
    private String verifiedBy;
    private Instant lastStatusChangedAt;
    private Instant createdAt;
    private Instant updatedAt;
}

