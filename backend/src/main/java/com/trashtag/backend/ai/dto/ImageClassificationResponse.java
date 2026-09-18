package com.trashtag.backend.ai.dto;

import com.trashtag.backend.common.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageClassificationResponse {
    private UUID trashTagId;
    private Map<String, Double> wasteCategories; // e.g. {"PLASTIC": 72.0, "ORGANIC": 18.0, "OTHER": 10.0}
    private Severity severitySuggestion;
    private Double confidence; // e.g. 0.87
    private List<String> detectedObjects;
    private String explanation;
    private String provider;
    private String disclaimer;
    private Instant createdAt;
}

