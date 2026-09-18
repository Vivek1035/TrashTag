package com.trashtag.backend.mission.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteMissionRequest {

    @Min(value = 0, message = "Plastic weight cannot be negative")
    private Double plasticKg;

    @Min(value = 0, message = "Organic weight cannot be negative")
    private Double organicKg;

    @Min(value = 0, message = "Metal weight cannot be negative")
    private Double metalKg;

    @Min(value = 0, message = "Glass weight cannot be negative")
    private Double glassKg;

    @Min(value = 0, message = "Other weight cannot be negative")
    private Double otherKg;

    private Double totalKg;

    private String afterImageUrl;

    private String notes;
}

