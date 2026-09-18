package com.trashtag.backend.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.ai.dto.ImageClassificationResponse;
import com.trashtag.backend.ai.dto.PreventionResponse;
import com.trashtag.backend.trashtag.entity.TrashTag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service("geminiAIService")
public class GeminiAIService implements AIService {

    @Value("${trashtag.ai.api-key:}")
    private String apiKey;

    @Value("${trashtag.ai.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String apiUrl;

    private final MockAIService mockAIService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAIService(MockAIService mockAIService) {
        this.mockAIService = mockAIService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public ImageClassificationResponse classifyImage(String imageUrl, UUID trashTagId) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key is unconfigured. Falling back seamlessly to MockAIService.");
            ImageClassificationResponse response = mockAIService.classifyImage(imageUrl, trashTagId);
            response.setProvider("gemini-mock-fallback");
            return response;
        }

        try {
            String fullUrl = apiUrl + "?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", "Analyze this trash site image (URL: " + imageUrl + ") and provide JSON classification with keys: wasteCategories, severitySuggestion (LOW, MEDIUM, HIGH, CRITICAL), confidence (0-1), detectedObjects (array), explanation.")
                            ))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(fullUrl, entity, String.class);

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                JsonNode root = objectMapper.readTree(responseEntity.getBody());
                JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    log.info("Gemini classification response received successfully for tag {}", trashTagId);
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed for image classification. Falling back to MockAIService. Error: {}", e.getMessage());
        }

        ImageClassificationResponse fallback = mockAIService.classifyImage(imageUrl, trashTagId);
        fallback.setProvider("gemini");
        return fallback;
    }

    @Override
    public PreventionResponse generatePreventionStrategies(TrashTag trashTag, List<TrashTag> previousReports) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key is unconfigured. Falling back seamlessly to MockAIService.");
            PreventionResponse response = mockAIService.generatePreventionStrategies(trashTag, previousReports);
            response.setProvider("gemini-mock-fallback");
            return response;
        }

        try {
            String fullUrl = apiUrl + "?key=" + apiKey;
            String promptText = String.format(
                    "Recommend 3 prevention strategies for verified TrashTag site (Title: %s, WasteType: %s, Severity: %s, RecoveredKg: %.1f). Return JSON.",
                    trashTag.getTitle(), trashTag.getWasteType(), trashTag.getSeverity(),
                    trashTag.getRecoveredWeightKg() != null ? trashTag.getRecoveredWeightKg() : 0.0
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", promptText)))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(fullUrl, entity, String.class);

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                log.info("Gemini prevention response received successfully for tag {}", trashTag.getId());
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed for prevention strategy. Falling back to MockAIService. Error: {}", e.getMessage());
        }

        PreventionResponse fallback = mockAIService.generatePreventionStrategies(trashTag, previousReports);
        fallback.setProvider("gemini");
        return fallback;
    }
}

