package com.trashtag.backend.trashtag;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.evidence.document.EvidenceMetadataDocument;
import com.trashtag.backend.evidence.repository.EvidenceMetadataRepository;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.recovery.entity.WasteRecord;
import com.trashtag.backend.recovery.repository.WasteRecordRepository;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.dto.VerifyRecoveryRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
@DisplayName("Recovery Verification Integration Tests")
class RecoveryVerificationIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired WasteRecordRepository wasteRecordRepository;
    @Autowired EvidenceMetadataRepository evidenceMetadataRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired ScoreEventRepository scoreEventRepository;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private String userToken;
    private String verifierToken;
    private User normalUser;
    private User verifierUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        trashTagRepository.deleteAll();
        wasteRecordRepository.deleteAll();
        evidenceMetadataRepository.deleteAll();
        timelineEventRepository.deleteAll();
        scoreEventRepository.deleteAll();

        // Register normal user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Normal Volunteer",
                                "email", "volunteer@verify.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        normalUser = userRepository.findByEmail("volunteer@verify.org").orElseThrow();

        // Register verifier user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Verifier Alice",
                                "email", "verifier@verify.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        verifierUser = userRepository.findByEmail("verifier@verify.org").orElseThrow();
        verifierUser.setRole(UserRole.VERIFIER);
        userRepository.save(verifierUser);

        // Login normal user
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "volunteer@verify.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        userToken = objectMapper.readTree(userLoginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();

        // Login verifier user
        MvcResult verifierLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "verifier@verify.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        verifierToken = objectMapper.readTree(verifierLoginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    private TrashTag createTrashTagWithStatus(RecoveryStatus status) {
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-4001")
                .title("Recovery Verification Dump Site")
                .description("Illegal plastics dump site")
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("Ocean Beach North Footpath")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .estimatedWeightKg(120.0)
                .recoveredWeightKg(115.0)
                .status(status)
                .reporterId(normalUser.getId())
                .primaryImageUrl("https://images.unsplash.com/before-dump.jpg")
                .build();
        return trashTagRepository.save(tag);
    }

    @Test
    @DisplayName("Unauthorized verifier (USER role) cannot verify recovery (403 Forbidden)")
    void testVerifyRecovery_UnauthorizedUser_Forbidden() throws Exception {
        TrashTag tag = createTrashTagWithStatus(RecoveryStatus.CLEANUP_COMPLETED);

        VerifyRecoveryRequest request = VerifyRecoveryRequest.builder().approved(true).build();

        mockMvc.perform(post("/api/trash-tags/" + tag.getId() + "/recovery/verify")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Invalid state: verifying recovery on REPORTED hotspot fails with 409 Conflict")
    void testVerifyRecovery_InvalidState_Fails() throws Exception {
        TrashTag uncleanedTag = createTrashTagWithStatus(RecoveryStatus.REPORTED);

        VerifyRecoveryRequest request = VerifyRecoveryRequest.builder().approved(true).build();

        mockMvc.perform(post("/api/trash-tags/" + uncleanedTag.getId() + "/recovery/verify")
                        .header("Authorization", "Bearer " + verifierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Valid verifier successfully approves recovery and updates status to RECOVERY_VERIFIED")
    void testVerifyRecovery_Success() throws Exception {
        TrashTag completedTag = createTrashTagWithStatus(RecoveryStatus.CLEANUP_COMPLETED);

        // Add waste record sum
        WasteRecord wr = WasteRecord.builder()
                .missionId(UUID.randomUUID())
                .trashTagId(completedTag.getId())
                .recordedBy(normalUser.getId())
                .wasteType(WasteType.PLASTIC)
                .weightKg(115.0)
                .build();
        wasteRecordRepository.save(wr);

        VerifyRecoveryRequest request = VerifyRecoveryRequest.builder()
                .approved(true)
                .notes("On-site audit confirmed ocean beach site fully cleared. All plastics removed.")
                .evidenceGpsVerified(true)
                .evidenceTimestampVerified(true)
                .evidenceBeforeImageVerified(true)
                .evidenceAfterImageVerified(true)
                .evidenceWasteRecordVerified(true)
                .build();

        mockMvc.perform(post("/api/trash-tags/" + completedTag.getId() + "/recovery/verify")
                        .header("Authorization", "Bearer " + verifierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RECOVERY_VERIFIED"));

        // Verify TrashTag status in DB
        TrashTag updatedTag = trashTagRepository.findById(completedTag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.RECOVERY_VERIFIED);
        assertThat(updatedTag.getVerifiedAt()).isNotNull();
        assertThat(updatedTag.getVerifiedBy()).isEqualTo(verifierUser.getId());
        assertThat(updatedTag.getRecoveredWeightKg()).isEqualTo(115.0);

        // Verify TimelineEvent
        List<TimelineEvent> timelineEvents = timelineEventRepository.findByTrashTagId(completedTag.getId());
        assertThat(timelineEvents).anyMatch(e -> "RECOVERY_VERIFIED".equals(e.getEventType()));

        // Verify ScoreEvent (50 pts for verifier)
        List<ScoreEvent> scoreEvents = scoreEventRepository.findByUserIdOrderByCreatedAtDesc(verifierUser.getId());
        assertThat(scoreEvents).hasSize(1);
        assertThat(scoreEvents.get(0).getPoints()).isEqualTo(50);
        assertThat(scoreEvents.get(0).getEventType()).isEqualTo("RECOVERY_VERIFIED");

        org.mockito.Mockito.when(evidenceMetadataRepository.findByTrashTagIdAndEvidencePhase(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(EvidenceMetadataDocument.builder().evidencePhase("RECOVERY_VERIFIED").build()));

        // Verify MongoDB EvidenceMetadataDocument
        List<EvidenceMetadataDocument> docs = evidenceMetadataRepository.findByTrashTagIdAndEvidencePhase(completedTag.getId(), "RECOVERY_VERIFIED");
        assertThat(docs).isNotEmpty();
    }

    @Test
    @DisplayName("Duplicate verification attempt fails with 409 Conflict")
    void testVerifyRecovery_DuplicateVerification_Fails() throws Exception {
        TrashTag completedTag = createTrashTagWithStatus(RecoveryStatus.CLEANUP_COMPLETED);

        VerifyRecoveryRequest request = VerifyRecoveryRequest.builder().approved(true).build();

        // First verification succeeds
        mockMvc.perform(post("/api/trash-tags/" + completedTag.getId() + "/recovery/verify")
                        .header("Authorization", "Bearer " + verifierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Duplicate verification call must fail with 409 Conflict
        mockMvc.perform(post("/api/trash-tags/" + completedTag.getId() + "/recovery/verify")
                        .header("Authorization", "Bearer " + verifierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}
