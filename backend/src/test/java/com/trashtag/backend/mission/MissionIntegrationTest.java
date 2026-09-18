package com.trashtag.backend.mission;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.mission.dto.CreateMissionRequest;
import com.trashtag.backend.mission.entity.Mission;
import com.trashtag.backend.mission.repository.MissionParticipantRepository;
import com.trashtag.backend.mission.repository.MissionRepository;
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
@DisplayName("Cleanup Mission Integration Tests")
class MissionIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired MissionRepository missionRepository;
    @Autowired MissionParticipantRepository participantRepository;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired UserRepository userRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired ScoreEventRepository scoreEventRepository;
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
        timelineEventRepository.deleteAll();
        scoreEventRepository.deleteAll();

        // Register normal user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Volunteer User",
                                "email", "volunteer@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        normalUser = userRepository.findByEmail("volunteer@trashtag.org").orElseThrow();

        // Register org user and assign ROLE_ORGANIZATION
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Clean Earth Org",
                                "email", "org@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        orgUser = userRepository.findByEmail("org@trashtag.org").orElseThrow();
        orgUser.setRole(UserRole.ORGANIZATION);
        userRepository.save(orgUser);

        // Login normal user
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "volunteer@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        userToken = objectMapper.readTree(userLoginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();

        // Login org user
        MvcResult orgLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "org@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        orgToken = objectMapper.readTree(orgLoginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    private TrashTag createTrashTag(RecoveryStatus status) {
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-2001")
                .title("River Bank Cleanup Target")
                .description("Plastic accumulation near water line")
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("Riverbank Way")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .estimatedWeightKg(150.0)
                .status(status)
                .reporterId(normalUser.getId())
                .build();
        return trashTagRepository.save(tag);
    }

    @Test
    @DisplayName("Create mission by ORGANIZATION on VERIFIED TrashTag updates TrashTag to MISSION_CREATED")
    void testCreateMission_Success() throws Exception {
        TrashTag verifiedTag = createTrashTag(RecoveryStatus.VERIFIED);

        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(verifiedTag.getId())
                .title("Operation River Cleanup")
                .description("Removing plastic bags and bottles")
                .scheduledDate(Instant.now().plus(3, ChronoUnit.DAYS))
                .maxParticipants(15)
                .meetingPoint("South River Entrance Gate")
                .meetingLatitude(37.7750)
                .meetingLongitude(-122.4190)
                .equipmentNeeded("Gloves, Heavy-duty Bags")
                .build();

        MvcResult result = mockMvc.perform(post("/api/missions")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Operation River Cleanup"))
                .andExpect(jsonPath("$.status").value("UPCOMING"))
                .andExpect(jsonPath("$.trashTagCode").value("TT-2001"))
                .andReturn();

        // Verify TrashTag status was updated to MISSION_CREATED
        TrashTag updatedTag = trashTagRepository.findById(verifiedTag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.MISSION_CREATED);

        // Verify TimelineEvent created
        List<TimelineEvent> timelineEvents = timelineEventRepository.findByTrashTagId(verifiedTag.getId());
        assertThat(timelineEvents).anyMatch(e -> "MISSION_CREATED".equals(e.getEventType()));
    }

    @Test
    @DisplayName("Create mission on REPORTED (unverified) TrashTag fails")
    void testCreateMission_UnverifiedTag_Fails() throws Exception {
        TrashTag reportedTag = createTrashTag(RecoveryStatus.REPORTED);

        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(reportedTag.getId())
                .title("Premature Mission")
                .scheduledDate(Instant.now().plus(2, ChronoUnit.DAYS))
                .build();

        mockMvc.perform(post("/api/missions")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Normal USER role cannot create a mission (403 Forbidden)")
    void testCreateMission_NormalUser_Forbidden() throws Exception {
        TrashTag verifiedTag = createTrashTag(RecoveryStatus.VERIFIED);

        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(verifiedTag.getId())
                .title("Unauthorized Mission")
                .scheduledDate(Instant.now().plus(2, ChronoUnit.DAYS))
                .build();

        mockMvc.perform(post("/api/missions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authenticated user joins mission, receives 10 points and duplicate join fails")
    void testJoinMission_SuccessAndDuplicateCheck() throws Exception {
        TrashTag verifiedTag = createTrashTag(RecoveryStatus.VERIFIED);

        // Create mission
        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(verifiedTag.getId())
                .title("Community Beach Clean")
                .scheduledDate(Instant.now().plus(5, ChronoUnit.DAYS))
                .maxParticipants(10)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/missions")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String missionId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Normal user joins
        mockMvc.perform(post("/api/missions/" + missionId + "/join")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentParticipantsCount").value(1))
                .andExpect(jsonPath("$.joinedByCurrentUser").value(true));

        // Check participant in repository
        assertThat(participantRepository.existsByMissionIdAndUserId(UUID.fromString(missionId), normalUser.getId())).isTrue();

        // Check 10 score points awarded
        List<ScoreEvent> scoreEvents = scoreEventRepository.findByUserIdOrderByCreatedAtDesc(normalUser.getId());
        assertThat(scoreEvents).hasSize(1);
        assertThat(scoreEvents.get(0).getPoints()).isEqualTo(10);
        assertThat(scoreEvents.get(0).getEventType()).isEqualTo("VOLUNTEER_JOINED");

        // Duplicate join attempt must fail
        mockMvc.perform(post("/api/missions/" + missionId + "/join")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isConflict());

        // Score points should still be only 1 event
        List<ScoreEvent> updatedScoreEvents = scoreEventRepository.findByUserIdOrderByCreatedAtDesc(normalUser.getId());
        assertThat(updatedScoreEvents).hasSize(1);
    }

    @Test
    @DisplayName("User leaves mission successfully")
    void testLeaveMission_Success() throws Exception {
        TrashTag verifiedTag = createTrashTag(RecoveryStatus.VERIFIED);

        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(verifiedTag.getId())
                .title("Park Restoration")
                .scheduledDate(Instant.now().plus(4, ChronoUnit.DAYS))
                .maxParticipants(5)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/missions")
                        .header("Authorization", "Bearer " + orgToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String missionId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Join
        mockMvc.perform(post("/api/missions/" + missionId + "/join")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        // Leave
        mockMvc.perform(post("/api/missions/" + missionId + "/leave")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentParticipantsCount").value(0))
                .andExpect(jsonPath("$.joinedByCurrentUser").value(false));

        assertThat(participantRepository.existsByMissionIdAndUserId(UUID.fromString(missionId), normalUser.getId())).isFalse();
    }

    @Test
    @DisplayName("Start mission updates Mission to ACTIVE and TrashTag to MISSION_ACTIVE")
    void testStartMission_Success() throws Exception {
        TrashTag verifiedTag = createTrashTag(RecoveryStatus.VERIFIED);

        CreateMissionRequest request = CreateMissionRequest.builder()
                .trashTagId(verifiedTag.getId())
                .title("Operation Plastic Sweep")
                .scheduledDate(Instant.now().plus(1, ChronoUnit.DAYS))
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
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Verify Mission in DB
        Mission mission = missionRepository.findById(UUID.fromString(missionId)).orElseThrow();
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.ACTIVE);
        assertThat(mission.getStartedAt()).isNotNull();

        // Verify TrashTag status in DB
        TrashTag tag = trashTagRepository.findById(verifiedTag.getId()).orElseThrow();
        assertThat(tag.getStatus()).isEqualTo(RecoveryStatus.MISSION_ACTIVE);
    }
}
