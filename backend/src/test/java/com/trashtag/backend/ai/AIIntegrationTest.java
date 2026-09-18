package com.trashtag.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.ai.document.AIAnalysisDocument;
import com.trashtag.backend.ai.dto.ClassificationOverrideRequest;
import com.trashtag.backend.ai.repository.AIAnalysisRepository;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
@DisplayName("AI Features Integration Tests")
class AIIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired AIAnalysisRepository aiAnalysisRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired UserRepository userRepository;

    private String userToken;
    private User normalUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        trashTagRepository.deleteAll();
        timelineEventRepository.deleteAll();

        // Register user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "AI Tester",
                                "email", "aitester@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        normalUser = userRepository.findByEmail("aitester@trashtag.org").orElseThrow();

        // Login user
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "aitester@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        userToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    private TrashTag createTrashTag(RecoveryStatus status) {
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-7001")
                .title("AI Analysis Dumping Site")
                .description("Illegal plastics and e-waste near bay footpath")
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("Ocean Beach Trailhead")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .estimatedWeightKg(150.0)
                .recoveredWeightKg(status == RecoveryStatus.RECOVERY_VERIFIED ? 145.0 : 0.0)
                .status(status)
                .reporterId(normalUser.getId())
                .primaryImageUrl("https://images.unsplash.com/ai-test-dump.jpg")
                .build();
        return trashTagRepository.save(tag);
    }

    @Test
    @DisplayName("POST /api/ai/trash-tags/{id}/classify returns visual breakdown and AI estimate disclaimer")
    void testClassifyTrashTag_Success() throws Exception {
        TrashTag tag = createTrashTag(RecoveryStatus.REPORTED);

        mockMvc.perform(post("/api/ai/trash-tags/" + tag.getId() + "/classify")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.trashTagId").value(tag.getId().toString()))
                .andExpect(jsonPath("$.data.wasteCategories.PLASTIC").value(72.0))
                .andExpect(jsonPath("$.data.wasteCategories.ORGANIC").value(18.0))
                .andExpect(jsonPath("$.data.severitySuggestion").value("HIGH"))
                .andExpect(jsonPath("$.data.confidence").value(0.87))
                .andExpect(jsonPath("$.data.disclaimer").value("AI-generated estimate. Not ground truth."));
    }

    @Test
    @DisplayName("POST /api/ai/trash-tags/{id}/prevention on unverified site fails with 409 Conflict")
    void testPrevention_UnverifiedSite_FailsConflict() throws Exception {
        TrashTag unverifiedTag = createTrashTag(RecoveryStatus.REPORTED);

        mockMvc.perform(post("/api/ai/trash-tags/" + unverifiedTag.getId() + "/prevention")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Prevention recommendations are only available for TrashTags with status RECOVERY_VERIFIED or later. Current status: REPORTED"));
    }

    @Test
    @DisplayName("POST /api/ai/trash-tags/{id}/prevention on RECOVERY_VERIFIED site returns 3 prevention strategies")
    void testPrevention_VerifiedSite_Success() throws Exception {
        TrashTag verifiedTag = createTrashTag(RecoveryStatus.RECOVERY_VERIFIED);

        mockMvc.perform(post("/api/ai/trash-tags/" + verifiedTag.getId() + "/prevention")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.trashTagId").value(verifiedTag.getId().toString()))
                .andExpect(jsonPath("$.data.strategies").isArray())
                .andExpect(jsonPath("$.data.strategies.length()").value(3))
                .andExpect(jsonPath("$.data.strategies[0].name").value("Community Garden"))
                .andExpect(jsonPath("$.data.strategies[1].name").value("Waste Segregation Point"))
                .andExpect(jsonPath("$.data.strategies[2].name").value("Mural + Barrier"))
                .andExpect(jsonPath("$.data.disclaimer").value("AI-generated recommendation"));
    }

    @Test
    @DisplayName("POST /api/ai/trash-tags/{id}/override successfully overrides classification and creates TimelineEvent")
    void testOverrideClassification_Success() throws Exception {
        TrashTag tag = createTrashTag(RecoveryStatus.REPORTED);

        ClassificationOverrideRequest overrideRequest = ClassificationOverrideRequest.builder()
                .wasteType(WasteType.ELECTRONIC)
                .severity(Severity.CRITICAL)
                .notes("On-site inspector confirmed heavy metal battery e-waste risk.")
                .build();

        mockMvc.perform(post("/api/ai/trash-tags/" + tag.getId() + "/override")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overrideRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.wasteType").value("ELECTRONIC"))
                .andExpect(jsonPath("$.data.severity").value("CRITICAL"));

        // Verify PostgreSQL update
        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getWasteType()).isEqualTo(WasteType.ELECTRONIC);
        assertThat(updatedTag.getSeverity()).isEqualTo(Severity.CRITICAL);

        // Verify TimelineEvent
        List<TimelineEvent> timelineEvents = timelineEventRepository.findByTrashTagId(tag.getId());
        assertThat(timelineEvents).anyMatch(e -> "CLASSIFICATION_OVERRIDDEN".equals(e.getEventType()));
    }
}

