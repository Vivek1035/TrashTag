package com.trashtag.backend.ai.config;

import com.trashtag.backend.ai.service.AIService;
import com.trashtag.backend.ai.service.GeminiAIService;
import com.trashtag.backend.ai.service.MockAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
public class AIConfig {

    @Value("${trashtag.ai.provider:mock}")
    private String aiProvider;

    @Value("${trashtag.ai.api-key:}")
    private String apiKey;

    @Bean
    @Primary
    public AIService primaryAIService(MockAIService mockAIService, GeminiAIService geminiAIService) {
        if ("gemini".equalsIgnoreCase(aiProvider)) {
            if (apiKey == null || apiKey.isBlank()) {
                log.info("AI provider configured as 'gemini' but no API key present. Defaulting to MockAIService.");
                return mockAIService;
            }
            log.info("Initializing primary AIService with GeminiAIService.");
            return geminiAIService;
        }
        log.info("Initializing primary AIService with MockAIService.");
        return mockAIService;
    }
}

