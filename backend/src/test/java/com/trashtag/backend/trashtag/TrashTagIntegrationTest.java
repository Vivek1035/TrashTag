package com.trashtag.backend.trashtag;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.auth.dto.RegisterRequest;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.dto.CreateTrashTagRequest;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
@DisplayName("TrashTag Reporting Integration Tests")
class TrashTagIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TrashTagRepository trashTagRepository;
    @Autowired TimelineEventRepository timelineEventRepository;
    @Autowired ScoreEventRepository scoreEventRepository;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        scoreEventRepository.deleteAll();
        timelineEventRepository.deleteAll();
        trashTagRepository.deleteAll();
        userRepository.deleteAll();

        // Register and obtain token
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Reporter Jane");
        reg.setEmail("jane@example.com");
        reg.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andReturn();

        authToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    // ── Create TrashTag ───────────────────────────────────────

    @Test
    @DisplayName("Create TrashTag: valid request + auth → 201 Created + Timeline + Score")
    void createTrashTag_success() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Illegal Dumping Site #1");
        req.setDescription("Large pile of plastic bottles and electronics along riverbank.");
        req.setLatitude(37.7749);
        req.setLongitude(-122.4194);
        req.setAddress("123 River Rd, San Francisco, CA");
        req.setWasteType(WasteType.PLASTIC);
        req.setSeverity(Severity.HIGH);
        req.setEstimatedWasteKg(45.5);
        req.setBeforeImageUrl("https://cloudinary.com/sample.jpg");

        MvcResult res = mockMvc.perform(post("/api/trash-tags")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tagCode").value(startsWith("TT-")))
                .andExpect(jsonPath("$.data.status").value("REPORTED"))
                .andExpect(jsonPath("$.data.title").value("Illegal Dumping Site #1"))
                .andExpect(jsonPath("$.data.wasteType").value("PLASTIC"))
                .andExpect(jsonPath("$.data.severity").value("HIGH"))
                .andExpect(jsonPath("$.data.estimatedWeightKg").value(45.5))
                .andExpect(jsonPath("$.data.reporterName").value("Reporter Jane"))
                .andReturn();

        String tagId = objectMapper.readTree(res.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // Verify TimelineEvent created
        List<TimelineEvent> timelineEvents = timelineEventRepository.findAll();
        assertThat(timelineEvents).hasSize(1);
        assertThat(timelineEvents.get(0).getEventType()).isEqualTo("REPORT_CREATED");

        // Verify ScoreEvent created (50 pts)
        List<ScoreEvent> scoreEvents = scoreEventRepository.findAll();
        assertThat(scoreEvents).hasSize(1);
        assertThat(scoreEvents.get(0).getPoints()).isEqualTo(50);
        assertThat(scoreEvents.get(0).getEventType()).isEqualTo("HOTSPOT_REPORTED");
    }

    @Test
    @DisplayName("Create TrashTag: unauthenticated → 401 Unauthorized")
    void createTrashTag_unauthenticated() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Unauth Spot");
        req.setLatitude(10.0);
        req.setLongitude(10.0);
        req.setWasteType(WasteType.MIXED);
        req.setSeverity(Severity.LOW);

        mockMvc.perform(post("/api/trash-tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Create TrashTag: invalid latitude (>90) → 400 Bad Request")
    void createTrashTag_invalidLat() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Bad Lat Spot");
        req.setLatitude(95.0);
        req.setLongitude(0.0);
        req.setWasteType(WasteType.OTHER);
        req.setSeverity(Severity.MEDIUM);

        mockMvc.perform(post("/api/trash-tags")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("latitude")));
    }

    @Test
    @DisplayName("Create TrashTag: invalid longitude (<-180) → 400 Bad Request")
    void createTrashTag_invalidLng() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Bad Lng Spot");
        req.setLatitude(0.0);
        req.setLongitude(-190.0);
        req.setWasteType(WasteType.ORGANIC);
        req.setSeverity(Severity.MEDIUM);

        mockMvc.perform(post("/api/trash-tags")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("longitude")));
    }

    @Test
    @DisplayName("Create TrashTag: negative waste → 400 Bad Request")
    void createTrashTag_negativeWaste() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Negative Waste Spot");
        req.setLatitude(0.0);
        req.setLongitude(0.0);
        req.setWasteType(WasteType.CONSTRUCTION);
        req.setSeverity(Severity.CRITICAL);
        req.setEstimatedWasteKg(-5.0);

        mockMvc.perform(post("/api/trash-tags")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("estimatedWasteKg")));
    }

    // ── Get TrashTags (Filtering & Pagination) ───────────────

    @Test
    @DisplayName("GET /api/trash-tags: public access + filter by status & wasteType → 200 OK")
    void getTrashTags_filtered() throws Exception {
        // Create a hotspot via API
        createTrashTag_success();

        mockMvc.perform(get("/api/trash-tags")
                        .param("status", "REPORTED")
                        .param("wasteType", "PLASTIC")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].wasteType").value("PLASTIC"));
    }

    @Test
    @DisplayName("GET /api/trash-tags/{id}: retrieve by UUID or TagCode → 200 OK")
    void getTrashTagById_success() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Target Spot");
        req.setLatitude(12.34);
        req.setLongitude(56.78);
        req.setWasteType(WasteType.ELECTRONIC);
        req.setSeverity(Severity.HIGH);

        MvcResult createRes = mockMvc.perform(post("/api/trash-tags")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String tagId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();
        String tagCode = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("tagCode").asText();

        // Retrieve by UUID
        mockMvc.perform(get("/api/trash-tags/" + tagId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Target Spot"));

        // Retrieve by TagCode (e.g. TT-1000)
        mockMvc.perform(get("/api/trash-tags/" + tagCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(tagId));
    }

    // ── Get Timeline ──────────────────────────────────────────

    @Test
    @DisplayName("GET /api/trash-tags/{id}/timeline: retrieve events → 200 OK")
    void getTrashTagTimeline_success() throws Exception {
        CreateTrashTagRequest req = new CreateTrashTagRequest();
        req.setTitle("Timeline Test Spot");
        req.setLatitude(10.0);
        req.setLongitude(20.0);
        req.setWasteType(WasteType.MIXED);
        req.setSeverity(Severity.MEDIUM);

        MvcResult createRes = mockMvc.perform(post("/api/trash-tags")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String tagCode = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("tagCode").asText();

        mockMvc.perform(get("/api/trash-tags/" + tagCode + "/timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].eventType").value("REPORT_CREATED"));
    }

    // ── Verify TrashTag (VERIFIER or ADMIN role) ─────────────

    @Test
    @DisplayName("Verify TrashTag: VERIFIER role → 200 OK + status set to VERIFIED")
    void verifyTrashTag_verifierRole_success() throws Exception {
        // Create verifier user and token
        String verifierToken = createAndLoginUser("verifier1@example.com", "verifier_one", "VERIFIER");

        // Report a hotspot as standard user
        TrashTag tag = createTestTag(RecoveryStatus.REPORTED);

        mockMvc.perform(post("/api/trash-tags/" + tag.getTagCode() + "/verify")
                        .header("Authorization", "Bearer " + verifierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"))
                .andExpect(jsonPath("$.data.verifiedBy").isNotEmpty());

        TrashTag updated = trashTagRepository.findById(tag.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(RecoveryStatus.VERIFIED);
        assertThat(updated.getVerifiedAt()).isNotNull();
    }

    @Test
    @DisplayName("Verify TrashTag: USER role → 403 Forbidden")
    void verifyTrashTag_userRole_forbidden() throws Exception {
        TrashTag tag = createTestTag(RecoveryStatus.REPORTED);

        mockMvc.perform(post("/api/trash-tags/" + tag.getTagCode() + "/verify")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Verify TrashTag: invalid transition (already VERIFIED) → 409 Conflict")
    void verifyTrashTag_alreadyVerified_conflict() throws Exception {
        String verifierToken = createAndLoginUser("verifier2@example.com", "verifier_two", "VERIFIER");
        TrashTag tag = createTestTag(RecoveryStatus.VERIFIED);

        mockMvc.perform(post("/api/trash-tags/" + tag.getTagCode() + "/verify")
                        .header("Authorization", "Bearer " + verifierToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Invalid Status Transition"));
    }

    // ── Helper methods ────────────────────────────────────────

    private TrashTag createTestTag(RecoveryStatus status) {
        User reporter = userRepository.findAll().get(0);
        TrashTag tag = TrashTag.builder()
                .tagCode("TT-" + System.currentTimeMillis() % 100000)
                .reporterId(reporter.getId())
                .status(status)
                .title("Test Spot")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .latitude(10.0)
                .longitude(20.0)
                .build();
        return trashTagRepository.save(tag);
    }

    private String createAndLoginUser(String email, String username, String roleName) throws Exception {
        User user = User.builder()
                .email(email)
                .username(username)
                .displayName(username)
                .password(passwordEncoder.encode("password123"))
                .role(com.trashtag.backend.common.enums.UserRole.valueOf(roleName))
                .build();
        userRepository.save(user);

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("usernameOrEmail", username, "password", "password123"))))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(loginRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }
}


