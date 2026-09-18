package com.trashtag.backend.config;

import com.trashtag.backend.ai.repository.AIAnalysisRepository;
import com.trashtag.backend.evidence.repository.EvidenceMetadataRepository;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@TestConfiguration
@Profile("test")
public class TestMongoConfig {

    @Bean
    @Primary
    public AIAnalysisRepository aiAnalysisRepository() {
        return Mockito.mock(AIAnalysisRepository.class);
    }

    @Bean
    @Primary
    public EvidenceMetadataRepository evidenceMetadataRepository() {
        return Mockito.mock(EvidenceMetadataRepository.class);
    }
}

