package com.trashtag.backend.config;

import com.trashtag.backend.ai.repository.AIAnalysisRepository;
import com.trashtag.backend.evidence.repository.EvidenceMetadataRepository;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DevMongoConfig {

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

