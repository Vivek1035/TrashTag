package com.trashtag.backend.transformation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectStrategyRequest {
    @NotBlank(message = "Strategy name is required")
    private String strategyName;

    private String strategyReason;
    private String costCategory;
    private String maintenanceLevel;
    private String expectedImpact;
    private String implementationNotes;
}

