package com.trashtag.backend.monitoring.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteMonitoringRequest {
    @NotNull(message = "wasteDetected flag is required")
    private Boolean wasteDetected; // true if dumping has returned, false if site remains clean

    private String evidenceImageUrl;
    private String notes;
}

