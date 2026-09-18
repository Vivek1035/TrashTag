package com.trashtag.backend.ai.service;

import com.trashtag.backend.ai.dto.ImageClassificationResponse;
import com.trashtag.backend.ai.dto.PreventionResponse;
import com.trashtag.backend.trashtag.entity.TrashTag;

import java.util.List;
import java.util.UUID;

public interface AIService {
    ImageClassificationResponse classifyImage(String imageUrl, UUID trashTagId);
    PreventionResponse generatePreventionStrategies(TrashTag trashTag, List<TrashTag> previousReports);
    String getProviderName();
}

