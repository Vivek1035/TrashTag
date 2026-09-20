package com.trashtag.backend.demo;

import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.config.TestMongoConfig;
import com.trashtag.backend.demo.service.DemoService;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.dto.TrashTagResponse;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import com.trashtag.backend.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
public class DemoLifecycleIntegrationTest {

    @Autowired
    private DemoService demoService;

    @Autowired
    private TrashTagRepository trashTagRepository;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    @Autowired
    private UserRepository userRepository;

    private User testAdmin;

    @BeforeEach
    void setUp() {
        testAdmin = userRepository.findByEmail("test.admin@trashtag.dev").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("test_admin")
                        .email("test.admin@trashtag.dev")
                        .password("Password123!")
                        .role(UserRole.ADMIN)
                        .displayName("Test Admin")
                        .active(true)
                        .build())
        );

        UserDetailsImpl userDetails = UserDetailsImpl.build(testAdmin);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testFull15StepDemoSequenceSustainedOutcome() {
        // Step 1: Create Demo TrashTag
        TrashTagResponse res = demoService.createDemoTag(testAdmin);
        UUID tagId = UUID.fromString(res.getId());
        assertThat(res.getStatus()).isEqualTo(RecoveryStatus.REPORTED);

        // Step 1 - 15 Auto Run with clean outcome
        List<Map<String, Object>> results = demoService.autoRunFullDemoSequence(tagId, false, testAdmin);
        assertThat(results).hasSize(15);

        // Verify final TrashTag status is SUSTAINED
        TrashTag finalTag = trashTagRepository.findById(tagId).orElseThrow();
        assertThat(finalTag.getStatus()).isEqualTo(RecoveryStatus.SUSTAINED);
        assertThat(finalTag.getIsDemo()).isTrue();

        // Verify TimelineEvents generated
        long timelineCount = timelineEventRepository.findByTrashTagIdOrderByCreatedAtAsc(tagId, null).getTotalElements();
        assertThat(timelineCount).isGreaterThanOrEqualTo(5);
    }

    @Test
    void testFull15StepDemoSequenceReopenedOutcome() {
        // Step 1: Create Demo TrashTag
        TrashTagResponse res = demoService.createDemoTag(testAdmin);
        UUID tagId = UUID.fromString(res.getId());

        // Step 1 - 15 Auto Run with waste detected outcome
        List<Map<String, Object>> results = demoService.autoRunFullDemoSequence(tagId, true, testAdmin);
        assertThat(results).hasSize(15);

        // Verify final TrashTag status is REOPENED
        TrashTag finalTag = trashTagRepository.findById(tagId).orElseThrow();
        assertThat(finalTag.getStatus()).isEqualTo(RecoveryStatus.REOPENED);
    }
}
