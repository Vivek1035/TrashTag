package com.trashtag.backend.dashboard;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
public class DashboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ScoreEventRepository scoreEventRepository;

    @Autowired
    private TrashTagRepository trashTagRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private TrashTag realTag;
    private TrashTag demoTag;

    @BeforeEach
    void setUp() {
        scoreEventRepository.deleteAll();
        trashTagRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .username("dashboarduser")
                .email("dashboard@trashtag.org")
                .password("password123")
                .role(UserRole.USER)
                .displayName("Dashboard Tester")
                .build());

        // Real TrashTag
        realTag = trashTagRepository.save(TrashTag.builder()
                .tagCode("TT-9001")
                .reporterId(testUser.getId())
                .title("Real Community Site")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .status(RecoveryStatus.REPORTED)
                .latitude(37.77)
                .longitude(-122.41)
                .estimatedWeightKg(150.0)
                .isDemo(false)
                .build());

        // Score event
        scoreEventRepository.save(ScoreEvent.builder()
                .userId(testUser.getId())
                .trashTagId(realTag.getId())
                .eventType("REPORT_VERIFIED")
                .points(20)
                .description("Verified report")
                .build());

        // Demo TrashTag
        demoTag = trashTagRepository.save(TrashTag.builder()
                .tagCode("TT-DEMO-1")
                .reporterId(UUID.randomUUID())
                .title("Seeded Demo Dump Site")
                .wasteType(WasteType.MIXED)
                .severity(Severity.LOW)
                .status(RecoveryStatus.RECOVERY_VERIFIED)
                .latitude(37.78)
                .longitude(-122.42)
                .estimatedWeightKg(500.0)
                .recoveredWeightKg(480.0)
                .isDemo(true)
                .build());
    }

    @Test
    @DisplayName("GET /api/dashboard - Returns dynamic calculations and separates demo data from real impact")
    void testGetDashboardData() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.lifecycleBreakdown.totalActiveTrashTagsCount").value(2))
                .andExpect(jsonPath("$.data.lifecycleBreakdown.awaitingVerificationCount").value(1))
                .andExpect(jsonPath("$.data.impactOverview.userReportedCount").value(1))
                .andExpect(jsonPath("$.data.impactOverview.estimatedWasteKg").value(150.0))
                .andExpect(jsonPath("$.data.impactOverview.demoData.demoReportsCount").value(1))
                .andExpect(jsonPath("$.data.impactOverview.demoData.demoEstimatedWasteKg").value(500.0))
                .andExpect(jsonPath("$.data.impactOverview.demoData.demoVerifiedWasteKg").value(480.0));
    }
}
