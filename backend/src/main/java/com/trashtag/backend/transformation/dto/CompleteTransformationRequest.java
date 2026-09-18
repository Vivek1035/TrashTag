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
public class CompleteTransformationRequest {
    @NotBlank(message = "Transformation type is required")
    private String transformationType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Transformation evidence image URL is required")
    private String afterImageUrl;
}

