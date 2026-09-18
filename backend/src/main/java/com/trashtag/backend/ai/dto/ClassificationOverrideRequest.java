package com.trashtag.backend.ai.dto;

import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationOverrideRequest {
    @NotNull(message = "Waste type is required for classification override")
    private WasteType wasteType;

    @NotNull(message = "Severity is required for classification override")
    private Severity severity;

    private String notes;
}

