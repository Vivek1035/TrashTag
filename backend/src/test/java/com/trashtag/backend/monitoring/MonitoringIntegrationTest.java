package com.trashtag.backend.monitoring;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.monitoring.dto.CompleteMonitoringRequest;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
@DisplayName("Monitoring Lifecycle Integration Tests")
class MonitoringIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired MonitoringCheckpointRepository monitoringCheckpointRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired ScoreEventRepository scoreEventRepository;
    @Autowired UserRepository userRepository;

    private String userToken;
    private User normalUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        trashTagRepository.deleteAll();
        monitoringCheckpointRepository.deleteAll();
        timelineEventRepository.deleteAll();
        scoreEventRepository.deleteAll();

        // Register user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Monitoring Inspector",
                                "email", "inspector@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isCreated());

        normalUser = userRepository.findByEmail("inspector@trashtag.org").orElseThrow();

        // Login user
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "usernameOrEmail", "inspector@trashtag.org",
                                "password", "password123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        userToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    private TrashTag createTrashTagInMonitoring() {
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-9001")
                .title("Monitored Community Parklet")
                .description("Transformed urban site undergoing 90-day monitoring")
                .latitude(37.7749)
                .longitude(-122.4194)
                .address("Ocean Beach Footpath")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .estimatedWeightKg(200.0)
                .recoveredWeightKg(195.0)
                .status(RecoveryStatus.MONITORING)
                .reporterId(normalUser.getId())
                .primaryImageUrl("https://images.unsplash.com/before.jpg")
                .build();
        return trashTagRepository.save(tag);
    }

    @Test
    @DisplayName("GET /api/monitoring returns dashboard checkpoints and KPI metrics")
    void testGetMonitoringDashboard() throws Exception {
        TrashTag tag = createTrashTagInMonitoring();

        // Initialize checkpoints
        mockMvc.perform(post("/api/trash-tags/" + tag.getId() + "/monitoring")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));

        // GET /api/monitoring
        mockMvc.perform(get("/api/monitoring")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.metrics.dueCount").exists())
                .andExpect(jsonPath("$.data.checkpoints").isArray());
    }

    @Test
    @DisplayName("Inspection with wasteDetected = true transitions tag to REOPENED and logs SITE_REOPENED event")
    void testCompleteMonitoring_WasteDetected_ReopensSite() throws Exception {
        TrashTag tag = createTrashTagInMonitoring();

        MonitoringCheckpoint cp = MonitoringCheckpoint.builder()
                .trashTagId(tag.getId())
                .checkpointDays(30)
                .scheduledDate(Instant.now().plus(30, ChronoUnit.DAYS))
                .status("PENDING")
                .build();
        cp = monitoringCheckpointRepository.save(cp);

        CompleteMonitoringRequest request = CompleteMonitoringRequest.builder()
                .wasteDetected(true)
                .evidenceImageUrl("https://images.unsplash.com/new-waste.jpg")
                .notes("Re-inspection found single-use plastic bottles re-accumulating at trailhead.")
                .build();

        mockMvc.perform(post("/api/monitoring/" + cp.getId() + "/complete")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REOPENED"))
                .andExpect(jsonPath("$.data.wasteDetected").value(true));

        // Verify TrashTag status in DB is REOPENED
        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.REOPENED);

        // Verify TimelineEvent SITE_REOPENED
        List<TimelineEvent> events = timelineEventRepository.findByTrashTagId(tag.getId());
        assertThat(events).anyMatch(e -> "SITE_REOPENED".equals(e.getEventType()));
    }

    @Test
    @DisplayName("Inspection of 90-day checkpoint with wasteDetected = false transitions tag to SUSTAINED (+100 XP)")
    void testCompleteMonitoring_90DayClean_SustainsSite() throws Exception {
        TrashTag tag = createTrashTagInMonitoring();

        MonitoringCheckpoint cp30 = MonitoringCheckpoint.builder()
                .trashTagId(tag.getId())
                .checkpointDays(30)
                .scheduledDate(Instant.now().minus(60, ChronoUnit.DAYS))
                .status("COMPLETED")
                .wasteDetected(false)
                .build();
        monitoringCheckpointRepository.save(cp30);

        MonitoringCheckpoint cp60 = MonitoringCheckpoint.builder()
                .trashTagId(tag.getId())
                .checkpointDays(60)
                .scheduledDate(Instant.now().minus(30, ChronoUnit.DAYS))
                .status("COMPLETED")
                .wasteDetected(false)
                .build();
        monitoringCheckpointRepository.save(cp60);

        MonitoringCheckpoint cp90 = MonitoringCheckpoint.builder()
                .trashTagId(tag.getId())
                .checkpointDays(90)
                .scheduledDate(Instant.now())
                .status("PENDING")
                .build();
        cp90 = monitoringCheckpointRepository.save(cp90);

        CompleteMonitoringRequest request = CompleteMonitoringRequest.builder()
                .wasteDetected(false)
                .evidenceImageUrl("https://images.unsplash.com/sustained-garden.jpg")
                .notes("90-day final audit confirmed site remains pristine and active community garden.")
                .build();

        mockMvc.perform(post("/api/monitoring/" + cp90.getId() + "/complete")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.wasteDetected").value(false));

        // Verify TrashTag status in DB is SUSTAINED
        TrashTag updatedTag = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updatedTag.getStatus()).isEqualTo(RecoveryStatus.SUSTAINED);

        // Verify TimelineEvent SITE_SUSTAINED
        List<TimelineEvent> events = timelineEventRepository.findByTrashTagId(tag.getId());
        assertThat(events).anyMatch(e -> "SITE_SUSTAINED".equals(e.getEventType()));

        // Verify ScoreEvent (+100 XP)
        List<ScoreEvent> scoreEvents = scoreEventRepository.findByUserIdOrderByCreatedAtDesc(normalUser.getId());
        assertThat(scoreEvents).anyMatch(s -> s.getPoints() == 100 && "SITE_SUSTAINED".equals(s.getEventType()));
    }
}

