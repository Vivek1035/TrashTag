package com.trashtag.backend.ai.service;

import com.trashtag.backend.ai.dto.ImageClassificationResponse;
import com.trashtag.backend.ai.dto.PreventionResponse;
import com.trashtag.backend.ai.dto.PreventionStrategy;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.trashtag.entity.TrashTag;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service("mockAIService")
public class MockAIService implements AIService {

    public static final String DISCLAIMER_CLASSIFICATION = "AI-generated estimate. Not ground truth.";
    public static final String DISCLAIMER_PREVENTION = "AI-generated recommendation";

    @Override
    public String getProviderName() {
        return "mock";
    }

    @Override
    public ImageClassificationResponse classifyImage(String imageUrl, UUID trashTagId) {
        Map<String, Double> categories = new LinkedHashMap<>();
        categories.put("PLASTIC", 72.0);
        categories.put("ORGANIC", 18.0);
        categories.put("OTHER", 10.0);

        List<String> objects = List.of("plastic_bottles", "single_use_packaging", "organic_debris");

        return ImageClassificationResponse.builder()
                .trashTagId(trashTagId)
                .wasteCategories(categories)
                .severitySuggestion(Severity.HIGH)
                .confidence(0.87)
                .detectedObjects(objects)
                .explanation("AI visual recognition identified heavy concentrations of synthetic polymer materials, food packaging, and organic matter with 87% confidence.")
                .provider(getProviderName())
                .disclaimer(DISCLAIMER_CLASSIFICATION)
                .createdAt(Instant.now())
                .build();
    }

    @Override
    public PreventionResponse generatePreventionStrategies(TrashTag trashTag, List<TrashTag> previousReports) {
        List<PreventionStrategy> strategies = new ArrayList<>();

        strategies.add(PreventionStrategy.builder()
                .name("Community Garden")
                .reason("Converting cleared dump sites into active community gardens fosters ongoing neighborhood stewardship and deters illegal dumping.")
                .costCategory("MEDIUM")
                .maintenanceLevel("MEDIUM")
                .expectedImpact("HIGH")
                .implementationNotes("Engage local residents for a planting weekend. Coordinate with municipal compost delivery and establish local garden leads.")
                .build());

        strategies.add(PreventionStrategy.builder()
                .name("Waste Segregation Point")
                .reason("Providing dedicated, labeled waste collection infrastructure addresses the root cause of dumping at high-density public access points.")
                .costCategory("LOW")
                .maintenanceLevel("LOW")
                .expectedImpact("HIGH")
                .implementationNotes("Install color-coded bins for Plastic, Organic, and Mixed waste with educational anti-littering signage.")
                .build());

        strategies.add(PreventionStrategy.builder()
                .name("Mural + Barrier")
                .reason("Combining vibrant community mural artwork with decorative planter barriers visually revitalizes the site and prevents vehicle dumping.")
                .costCategory("LOW")
                .maintenanceLevel("LOW")
                .expectedImpact("MEDIUM")
                .implementationNotes("Partner with local artists for a youth wall painting day. Place heavy planter boxes to block vehicle access.")
                .build());

        return PreventionResponse.builder()
                .trashTagId(trashTag.getId())
                .strategies(strategies)
                .provider(getProviderName())
                .disclaimer(DISCLAIMER_PREVENTION)
                .createdAt(Instant.now())
                .build();
    }
}

