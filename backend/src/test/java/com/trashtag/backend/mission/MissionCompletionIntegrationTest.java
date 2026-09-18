package com.trashtag.backend.mission;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.mission.dto.CompleteMissionRequest;
import com.trashtag.backend.mission.dto.CreateMissionRequest;
import com.trashtag.backend.mission.entity.Mission;
import com.trashtag.backend.mission.repository.MissionParticipantRepository;
import com.trashtag.backend.mission.repository.MissionRepository;
import com.trashtag.backend.recovery.entity.WasteRecord;
import com.trashtag.backend.recovery.repository.WasteRecordRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
@DisplayName("Field Mode & Mission Completion Integration Tests")
class MissionCompletionIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired MissionRepository missionRepository;
    @Autowired MissionParticipantRepository participantRepository;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired WasteRecordRepository wasteRecordRepository;
    @Autowired UserRepository userRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private String userToken;
    private String orgToken;
    private User orgUser;
    private User normalUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        trashTagRepository.deleteAll();
        missionRepository.deleteAll();
        participantRepository.deleteAll();
        wasteRecordRepository.deleteAll();
        timelineEventRepository.deleteAll();

        // Register normal user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Volunteer User",
                                "email", "volunteer@field.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        normalUser = userRepository.findByEmail("volunteer@field.org").orElseThrow();

        // Register org user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Clean Field Org",
                                "email", "org@field.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        orgUser = userRepository.findByEmail("org@field.org").orElseThrow();
        orgUser.setRole(UserRole.ORGANIZATION);
        userRepository.save(orgUser);

        // Login normal user
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "volunteer@field.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        userToken = objectMapper.readTree(userLoginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();

        // Login org user
        MvcResult orgLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "org@field.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        orgToken = objectMapper.readTree(orgLoginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    private TrashTag createVerifiedTrashTag() {
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-3001")
                .title("Field Mode Dump Site")
                .description("Plastic bottles and metal cans along trail")
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("Trailhead Way")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .estimatedWeightKg(100.0)
                .status(RecoveryStatus.VERIFIED)
                .reporterId(normalUser.getId())
                .build();
        return trashTagRepository.save(tag);
    }

    private String createAndStartMission(TrashTag tag) throws Exception {
        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(tag.getId())
                .title("Field Mode Sweep")
                .scheduledDate(Instant.now().plus(1, ChronoUnit.DAYS))
                .maxParticipants(10)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/missions")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String missionId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Start mission
        mockMvc.perform(post("/api/missions/" + missionId + "/start")
                        .header("Authorization", "Bearer " + orgToken))
                .andExpect(status().isOk());

        return missionId;
    }

    @Test
    @DisplayName("Complete mission success: updates Mission to COMPLETED and TrashTag to CLEANUP_COMPLETED")
    void testCompleteMission_Success() throws Exception {
        TrashTag tag = createVerifiedTrashTag();
        String missionId = createAndStartMission(tag);

        // Join mission as volunteer
        mockMvc.perform(post("/api/missions/" + missionId + "/join")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        CompleteMissionRequest completeReq = CompleteMissionRequest.builder()
                .plasticKg(25.0)
                .organicKg(10.0)
                .metalKg(5.0)
                .glassKg(0.0)
                .otherKg(2.5)
                .afterImageUrl("https://images.unsplash.com/after-cleanup.jpg")
                .notes("All plastic containers and metal cans bagged safely.")
                .build();

        mockMvc.perform(post("/api/missions/" + missionId + "/complete")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Verify Mission in DB
        Mission mission = missionRepository.findById(UUID.fromString(missionId)).orElseThrow();
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.COMPLETED);
        assertThat(mission.getCompletedAt()).isNotNull();

        // Verify TrashTag status is CLEANUP_COMPLETED (and NOT RECOVERY_VERIFIED)
        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.CLEANUP_COMPLETED);
        assertThat(updatedTag.getRecoveredWeightKg()).isEqualTo(42.5);

        // Verify WasteRecords created
        List<WasteRecord> wasteRecords = wasteRecordRepository.findByMissionId(UUID.fromString(missionId));
        assertThat(wasteRecords).hasSize(4); // PLASTIC, ORGANIC, METAL, OTHER
        assertThat(wasteRecords).extracting("wasteType").contains(WasteType.PLASTIC, WasteType.ORGANIC, WasteType.METAL, WasteType.OTHER);

        // Verify TimelineEvent created
        List<TimelineEvent> timelineEvents = timelineEventRepository.findByTrashTagId(tag.getId());
        assertThat(timelineEvents).anyMatch(e -> "CLEANUP_COMPLETED".equals(e.getEventType()));
    }

    @Test
    @DisplayName("Duplicate mission completion submission fails with 409 Conflict")
    void testCompleteMission_DuplicateSubmission_Fails() throws Exception {
        TrashTag tag = createVerifiedTrashTag();
        String missionId = createAndStartMission(tag);

        CompleteMissionRequest completeReq = CompleteMissionRequest.builder()
                .plasticKg(20.0)
                .build();

        // First completion call (as org user / creator)
        mockMvc.perform(post("/api/missions/" + missionId + "/complete")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk());

        // Duplicate completion attempt must fail with 409 Conflict
        mockMvc.perform(post("/api/missions/" + missionId + "/complete")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Backend recalculates and validates total waste weight accurately")
    void testCompleteMission_BackendRecalculatesTotal() throws Exception {
        TrashTag tag = createVerifiedTrashTag();
        String missionId = createAndStartMission(tag);

        // Client passes totalKg = 999.0 (mismatched/incorrect UX value), backend recalculates 10+20+30 = 60.0
        CompleteMissionRequest completeReq = CompleteMissionRequest.builder()
                .plasticKg(10.0)
                .organicKg(20.0)
                .metalKg(30.0)
                .totalKg(999.0)
                .build();

        mockMvc.perform(post("/api/missions/" + missionId + "/complete")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk());

        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getRecoveredWeightKg()).isEqualTo(60.0);
    }
}

