package com.trashtag.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreventionStrategy {
    private String name;
    private String reason;
    private String costCategory;      // e.g. LOW, MEDIUM, HIGH
    private String maintenanceLevel;  // e.g. LOW, MEDIUM, HIGH
    private String expectedImpact;    // e.g. HIGH, MEDIUM
    private String implementationNotes;
}

