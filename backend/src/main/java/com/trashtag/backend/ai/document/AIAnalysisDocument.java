package com.trashtag.backend.ai.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Stores AI-generated analysis for a TrashTag.
 * References the PostgreSQL TrashTag by ID — does NOT duplicate TrashTag data.
 */
@Document(collection = "ai_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAnalysisDocument {

    @Id
    private String id;

    /** Foreign key reference to PostgreSQL trash_tags.id */
    @Indexed
    private UUID trashTagId;

    /** Which AI provider produced this (gemini, openai, mock) */
    private String provider;

    /** Prompt used */
    private String prompt;

    /** Raw response from the AI provider */
    private String rawResponse;

    /** Structured prevention recommendations */
    private List<String> preventionRecommendations;

    /** Structured transformation suggestions */
    private List<String> transformationSuggestions;

    /** Risk assessment score 0-100 */
    private Integer riskScore;

    /** Detected waste categories from image analysis */
    private List<String> detectedWasteCategories;

    /** Flexible key-value metadata for any additional AI output */
    private Map<String, Object> metadata;

    @CreatedDate
    private Instant createdAt;
}

