package com.trashtag.backend.leaderboard;

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
public class LeaderboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ScoreEventRepository scoreEventRepository;

    @Autowired
    private TrashTagRepository trashTagRepository;

    @Autowired
    private UserRepository userRepository;

    private User champ;
    private User scout;
    private TrashTag tag1;

    @BeforeEach
    void setUp() {
        scoreEventRepository.deleteAll();
        trashTagRepository.deleteAll();
        userRepository.deleteAll();

        champ = userRepository.save(User.builder()
                .username("eco_champion")
                .email("champ@trashtag.org")
                .password("password123")
                .displayName("Eco Champion")
                .role(UserRole.USER)
                .build());

        scout = userRepository.save(User.builder()
                .username("scout_volunteer")
                .email("scout@trashtag.org")
                .password("password123")
                .displayName("Scout Volunteer")
                .role(UserRole.USER)
                .build());

        tag1 = trashTagRepository.save(TrashTag.builder()
                .tagCode("TT-LEAD-100")
                .title("Ocean Beach Dumping")
                .latitude(37.7749)
                .longitude(-122.4194)
                .status(RecoveryStatus.RECOVERY_VERIFIED)
                .severity(Severity.HIGH)
                .wasteType(WasteType.PLASTIC)
                .estimatedWeightKg(100.0)
                .recoveredWeightKg(120.0)
                .reporterId(scout.getId())
                .verifiedBy(champ.getId())
                .build());

        // Save score events for champ (+50 recovery verified, +30 cleanup completed)
        scoreEventRepository.save(ScoreEvent.builder()
                .userId(champ.getId())
                .trashTagId(tag1.getId())
                .eventType("RECOVERY_VERIFIED")
                .points(50)
                .description("Earned 50 pts for conducting verified recovery audit")
                .build());

        scoreEventRepository.save(ScoreEvent.builder()
                .userId(champ.getId())
                .trashTagId(tag1.getId())
                .eventType("CLEANUP_COMPLETED")
                .points(30)
                .description("Earned 30 pts for completing field cleanup")
                .build());

        // Save score events for scout (+20 report verified, +10 mission joined)
        scoreEventRepository.save(ScoreEvent.builder()
                .userId(scout.getId())
                .trashTagId(tag1.getId())
                .eventType("REPORT_VERIFIED")
                .points(20)
                .description("Earned 20 pts for verified report")
                .build());

        scoreEventRepository.save(ScoreEvent.builder()
                .userId(scout.getId())
                .trashTagId(tag1.getId())
                .eventType("MISSION_JOINED")
                .points(10)
                .description("Earned 10 pts for joining mission")
                .build());
    }

    @Test
    @DisplayName("GET /api/leaderboard returns ranked list with points and impact metrics")
    void testGetLeaderboard() throws Exception {
        mockMvc.perform(get("/api/leaderboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.globalTotalScore", is(110)))
                .andExpect(jsonPath("$.data.globalTotalReports", is(1)))
                .andExpect(jsonPath("$.data.globalTotalWasteRecoveredKg", is(120.0)))
                .andExpect(jsonPath("$.data.rankings", hasSize(2)))

                // Rank 1: Eco Champion (80 pts)
                .andExpect(jsonPath("$.data.rankings[0].rank", is(1)))
                .andExpect(jsonPath("$.data.rankings[0].username", is("eco_champion")))
                .andExpect(jsonPath("$.data.rankings[0].points", is(80)))

                // Rank 2: Scout Volunteer (30 pts)
                .andExpect(jsonPath("$.data.rankings[1].rank", is(2)))
                .andExpect(jsonPath("$.data.rankings[1].username", is("scout_volunteer")))
                .andExpect(jsonPath("$.data.rankings[1].points", is(30)));
    }
}

