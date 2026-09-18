package com.trashtag.backend.timeline;

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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
public class TimelineIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    @Autowired
    private TrashTagRepository trashTagRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private TrashTag testTag;

    @BeforeEach
    void setUp() {
        timelineEventRepository.deleteAll();
        trashTagRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .username("timeline_hero")
                .email("hero@trashtag.org")
                .password("password123")
                .displayName("Eco Hero")
                .role(UserRole.USER)
                .build());

        testTag = trashTagRepository.save(TrashTag.builder()
                .tagCode("TAG-TL-999")
                .title("River Bank Clean Site")
                .description("Plastic waste near river")
                .latitude(37.7749)
                .longitude(-122.4194)
                .status(RecoveryStatus.REPORTED)
                .severity(Severity.HIGH)
                .wasteType(WasteType.PLASTIC)
                .estimatedWeightKg(150.0)
                .reporterId(testUser.getId())
                .build());

        // Create initial timeline events
        timelineEventRepository.save(TimelineEvent.builder()
                .trashTagId(testTag.getId())
                .actorId(testUser.getId())
                .eventType("REPORT_CREATED")
                .title("TrashTag Reported")
                .description("Site reported by timeline_hero")
                .createdAt(Instant.now().minusSeconds(3600))
                .build());

        timelineEventRepository.save(TimelineEvent.builder()
                .trashTagId(testTag.getId())
                .actorId(testUser.getId())
                .eventType("REPORT_VERIFIED")
                .title("Report Verified")
                .description("Site report verified by verifier")
                .createdAt(Instant.now())
                .build());
    }

    @Test
    @DisplayName("GET /api/timeline returns global timeline stream ordered descending")
    void testGetGlobalTimeline() throws Exception {
        mockMvc.perform(get("/api/timeline")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].eventType", hasItems("REPORT_CREATED", "REPORT_VERIFIED")))
                .andExpect(jsonPath("$.content[0].tagCode", is("TAG-TL-999")))
                .andExpect(jsonPath("$.content[0].actorName", is("Eco Hero")));
    }

    @Test
    @DisplayName("GET /api/timeline?eventType=REPORT_CREATED filters by event type")
    void testGetGlobalTimelineWithFilter() throws Exception {
        mockMvc.perform(get("/api/timeline")
                        .param("eventType", "REPORT_CREATED")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].eventType", is("REPORT_CREATED")));
    }

    @Test
    @DisplayName("GET /api/trash-tags/{id}/timeline returns timeline for specific tag")
    void testGetTrashTagTimelineById() throws Exception {
        mockMvc.perform(get("/api/trash-tags/" + testTag.getId() + "/timeline")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].eventType", is("REPORT_CREATED")))
                .andExpect(jsonPath("$.data.content[1].eventType", is("REPORT_VERIFIED")));
    }

    @Test
    @DisplayName("GET /api/trash-tags/{tagCode}/timeline resolves tag code")
    void testGetTrashTagTimelineByTagCode() throws Exception {
        mockMvc.perform(get("/api/trash-tags/TAG-TL-999/timeline")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].tagCode", is("TAG-TL-999")));
    }
}
