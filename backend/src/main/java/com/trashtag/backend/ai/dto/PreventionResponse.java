package com.trashtag.backend.ai.dto;

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
public class PreventionResponse {
    private UUID trashTagId;
    private List<PreventionStrategy> strategies;
    private String provider;
    private String disclaimer;
    private Instant createdAt;
}

