package com.trashtag.backend.transformation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.transformation.dto.CompleteTransformationRequest;
import com.trashtag.backend.transformation.dto.SelectStrategyRequest;
import com.trashtag.backend.transformation.entity.Transformation;
import com.trashtag.backend.transformation.repository.TransformationRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
@DisplayName("Transformation & Monitoring Stage Integration Tests")
class TransformationIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired TransformationRepository transformationRepository;
    @Autowired MonitoringCheckpointRepository monitoringCheckpointRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired UserRepository userRepository;

    private String userToken;
    private User normalUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        trashTagRepository.deleteAll();
        transformationRepository.deleteAll();
        monitoringCheckpointRepository.deleteAll();
        timelineEventRepository.deleteAll();

        // Register user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Transformation Partner",
                                "email", "transformation@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        normalUser = userRepository.findByEmail("transformation@trashtag.org").orElseThrow();

        // Login user
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "transformation@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        userToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    private TrashTag createTrashTag(RecoveryStatus status) {
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-8001")
                .title("Transformation River Bank Site")
                .description("Illegal plastics cleared from site")
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("Balmy Alley Path")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .estimatedWeightKg(200.0)
                .recoveredWeightKg(195.0)
                .status(status)
                .reporterId(normalUser.getId())
                .primaryImageUrl("https://images.unsplash.com/before-dump.jpg")
                .build();
        return trashTagRepository.save(tag);
    }

    @Test
    @DisplayName("Planning transformation on unverified site fails with 409 Conflict")
    void testPlanTransformation_UnverifiedSite_FailsConflict() throws Exception {
        TrashTag tag = createTrashTag(RecoveryStatus.REPORTED);

        SelectStrategyRequest request = SelectStrategyRequest.builder()
                .strategyName("Community Garden")
                .strategyReason("Convert dump to garden")
                .build();

        mockMvc.perform(post("/api/transformation/" + tag.getId() + "/plan")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Planning transformation on RECOVERY_VERIFIED site advances status to TRANSFORMATION_PLANNED")
    void testPlanTransformation_VerifiedSite_Success() throws Exception {
        TrashTag tag = createTrashTag(RecoveryStatus.RECOVERY_VERIFIED);

        SelectStrategyRequest request = SelectStrategyRequest.builder()
                .strategyName("Community Garden")
                .strategyReason("Convert dump into active urban raised-bed garden")
                .costCategory("MEDIUM")
                .maintenanceLevel("MEDIUM")
                .expectedImpact("HIGH")
                .build();

        mockMvc.perform(post("/api/transformation/" + tag.getId() + "/plan")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("TRANSFORMATION_PLANNED"))
                .andExpect(jsonPath("$.data.preventionStrategy").value("Community Garden"));

        // Verify TrashTag status in DB
        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.TRANSFORMATION_PLANNED);

        // Verify Transformation entity in DB
        Transformation transform = transformationRepository.findByTrashTagId(tag.getId()).orElseThrow();
        assertThat(transform.getPreventionStrategy()).isEqualTo("Community Garden");

        // Verify TimelineEvent
        List<TimelineEvent> events = timelineEventRepository.findByTrashTagId(tag.getId());
        assertThat(events).anyMatch(e -> "TRANSFORMATION_PLANNED".equals(e.getEventType()));
    }

    @Test
    @DisplayName("Completing transformation advances status to TRANSFORMED & MONITORING and creates 30, 60, 90-day checkpoints")
    void testCompleteTransformation_Success() throws Exception {
        TrashTag tag = createTrashTag(RecoveryStatus.RECOVERY_VERIFIED);

        // 1. Plan transformation
        SelectStrategyRequest planReq = SelectStrategyRequest.builder()
                .strategyName("Community Garden")
                .build();

        mockMvc.perform(post("/api/transformation/" + tag.getId() + "/plan")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isOk());

        // 2. Complete transformation
        CompleteTransformationRequest completeReq = CompleteTransformationRequest.builder()
                .transformationType("Community Garden & Native Plant Parklet")
                .description("Installed 4 raised vegetable beds, native flower borders, and compost bin.")
                .afterImageUrl("https://images.unsplash.com/transformed-garden.jpg")
                .build();

        mockMvc.perform(post("/api/transformation/" + tag.getId() + "/complete")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("MONITORING"))
                .andExpect(jsonPath("$.data.afterImageUrl").value("https://images.unsplash.com/transformed-garden.jpg"))
                .andExpect(jsonPath("$.data.checkpoints").isArray())
                .andExpect(jsonPath("$.data.checkpoints.length()").value(3))
                .andExpect(jsonPath("$.data.checkpoints[0].checkpointDays").value(30))
                .andExpect(jsonPath("$.data.checkpoints[1].checkpointDays").value(60))
                .andExpect(jsonPath("$.data.checkpoints[2].checkpointDays").value(90));

        // Verify DB status is MONITORING
        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.MONITORING);

        // Verify 3 MonitoringCheckpoints in DB
        List<MonitoringCheckpoint> checkpoints = monitoringCheckpointRepository.findByTrashTagIdOrderByCheckpointDaysAsc(tag.getId());
        assertThat(checkpoints).hasSize(3);
        assertThat(checkpoints.get(0).getCheckpointDays()).isEqualTo(30);
        assertThat(checkpoints.get(1).getCheckpointDays()).isEqualTo(60);
        assertThat(checkpoints.get(2).getCheckpointDays()).isEqualTo(90);

        // Verify GET endpoint returns transformation & checkpoints
        mockMvc.perform(get("/api/transformation/" + tag.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.checkpoints.length()").value(3));
    }
}

