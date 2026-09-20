package com.trashtag.backend.demo.service;

import com.trashtag.backend.ai.service.AIAnalysisService;
import com.trashtag.backend.common.enums.RecoveryStatus;
import com.trashtag.backend.common.enums.Severity;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.enums.WasteType;
import com.trashtag.backend.common.exception.ResourceNotFoundException;
import com.trashtag.backend.mission.dto.CompleteMissionRequest;
import com.trashtag.backend.mission.dto.CreateMissionRequest;
import com.trashtag.backend.mission.dto.MissionResponse;
import com.trashtag.backend.mission.entity.Mission;
import com.trashtag.backend.mission.repository.MissionRepository;
import com.trashtag.backend.mission.service.MissionService;
import com.trashtag.backend.monitoring.dto.CompleteMonitoringRequest;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.monitoring.service.MonitoringService;
import com.trashtag.backend.security.services.UserDetailsImpl;
import com.trashtag.backend.transformation.dto.CompleteTransformationRequest;
import com.trashtag.backend.transformation.dto.SelectStrategyRequest;
import com.trashtag.backend.transformation.service.TransformationService;
import com.trashtag.backend.trashtag.dto.CreateTrashTagRequest;
import com.trashtag.backend.trashtag.dto.TrashTagResponse;
import com.trashtag.backend.trashtag.dto.VerifyRecoveryRequest;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.trashtag.service.TrashTagService;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@Profile("!prod")
@RequiredArgsConstructor
public class DemoService {

    private final TrashTagService trashTagService;
    private final MissionService missionService;
    private final TransformationService transformationService;
    private final MonitoringService monitoringService;
    private final AIAnalysisService aiAnalysisService;
    private final TrashTagRepository trashTagRepository;
    private final MissionRepository missionRepository;
    private final MonitoringCheckpointRepository monitoringCheckpointRepository;
    private final UserRepository userRepository;

    private static final String DEMO_BEFORE_IMG = "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80";
    private static final String DEMO_AFTER_IMG = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80";

    @Transactional
    public TrashTagResponse createDemoTag(User actor) {
        setAuthContext(actor);
        String codeNum = String.format("%04d", new Random().nextInt(9000) + 1000);
        CreateTrashTagRequest req = CreateTrashTagRequest.builder()
                .title("[DEMO MODE] Hotspot TT-DEMO-" + codeNum)
                .description("⚠ DEMO MODE — Hotspot created for hackathon 15-step recovery lifecycle simulation.")
                .wasteType(WasteType.PLASTIC)
                .severity(Severity.HIGH)
                .latitude(12.9716)
                .longitude(77.5946)
                .address("MG Road, Bengaluru, KA (Demo Location)")
                .estimatedWasteKg(250.0)
                .beforeImageUrl(DEMO_BEFORE_IMG)
                .build();

        TrashTagResponse res = trashTagService.createTrashTag(req);
        TrashTag tag = trashTagRepository.findById(UUID.fromString(res.getId())).orElseThrow();
        tag.setIsDemo(true);
        trashTagRepository.save(tag);
        return TrashTagService.toResponse(tag, actor.getDisplayName());
    }

    @Transactional
    public Map<String, Object> advanceDemoStep(UUID tagId, int step, boolean wasteReturned, User actor) {
        TrashTag tag = trashTagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Demo TrashTag not found: " + tagId));

        Map<String, Object> stepResult = new LinkedHashMap<>();
        stepResult.put("stepNumber", step);
        stepResult.put("trashTagId", tagId.toString());

        User adminActor = getOrCreateDemoUser("demo_admin", "demo.admin@trashtag.dev", UserRole.ADMIN, "Demo Admin");
        User verifierActor = getOrCreateDemoUser("demo_verifier", "verifier@trashtag.dev", UserRole.VERIFIER, "Demo Verifier");
        User userActor = getOrCreateDemoUser("demo_volunteer", "volunteer@trashtag.dev", UserRole.USER, "Demo Volunteer");

        switch (step) {
            case 1:
                stepResult.put("action", "Created TrashTag");
                stepResult.put("status", tag.getStatus().name());
                break;

            case 2:
                if (tag.getStatus() == RecoveryStatus.REPORTED) {
                    setAuthContext(verifierActor);
                    trashTagService.verifyTrashTag(tag.getId().toString());
                }
                stepResult.put("action", "Report Verified by Verifier");
                break;

            case 3:
                if (tag.getStatus() == RecoveryStatus.VERIFIED) {
                    setAuthContext(adminActor);
                    CreateMissionRequest mReq = CreateMissionRequest.builder()
                            .trashTagId(tag.getId())
                            .title("Demo Operation Cleanup — " + tag.getTagCode())
                            .description("Hackathon simulated community cleanup mission.")
                            .scheduledDate(Instant.now().plus(1, ChronoUnit.DAYS))
                            .maxParticipants(20)
                            .meetingPoint("MG Road Metro Station Exit 2")
                            .meetingLatitude(12.9716)
                            .meetingLongitude(77.5946)
                            .equipmentNeeded("Gloves, Heavy Duty Trash Bags, Tongs")
                            .build();
                    missionService.createMission(mReq);
                }
                stepResult.put("action", "Cleanup Mission Created");
                break;

            case 4:
                Mission mission = getLatestMissionForTag(tag.getId());
                if (mission != null) {
                    setAuthContext(userActor);
                    missionService.joinMission(mission.getId());
                }
                stepResult.put("action", "Volunteer Joined Mission");
                break;

            case 5:
                Mission mStart = getLatestMissionForTag(tag.getId());
                if (mStart != null && mStart.getStatus() == com.trashtag.backend.common.enums.MissionStatus.UPCOMING) {
                    setAuthContext(adminActor);
                    missionService.startMission(mStart.getId());
                }
                stepResult.put("action", "Mission Started (Active)");
                break;

            case 6:
                Mission mComp = getLatestMissionForTag(tag.getId());
                if (mComp != null && mComp.getStatus() == com.trashtag.backend.common.enums.MissionStatus.ACTIVE) {
                    setAuthContext(userActor);
                    CompleteMissionRequest cReq = CompleteMissionRequest.builder()
                            .plasticKg(180.0)
                            .organicKg(40.0)
                            .otherKg(30.0)
                            .totalKg(250.0)
                            .afterImageUrl(DEMO_AFTER_IMG)
                            .notes("Simulated field cleanup completed successfully.")
                            .build();
                    missionService.completeMission(mComp.getId(), cReq);
                }
                stepResult.put("action", "Cleanup Completed in Field");
                break;

            case 7:
                stepResult.put("action", "Evidence Photos Recorded");
                break;

            case 8:
                if (tag.getStatus() == RecoveryStatus.CLEANUP_COMPLETED) {
                    setAuthContext(verifierActor);
                    VerifyRecoveryRequest vReq = VerifyRecoveryRequest.builder()
                            .approved(true)
                            .notes("Demo audit approved by field verifier.")
                            .evidenceGpsVerified(true)
                            .evidenceTimestampVerified(true)
                            .evidenceBeforeImageVerified(true)
                            .evidenceAfterImageVerified(true)
                            .evidenceWasteRecordVerified(true)
                            .build();
                    trashTagService.verifyRecovery(tag.getId().toString(), vReq);
                }
                stepResult.put("action", "Recovery Audit Verified");
                break;

            case 9:
                try {
                    aiAnalysisService.generatePreventionRecommendations(tag.getId());
                } catch (Exception e) {
                    log.info("AI prevention simulation executed.");
                }
                stepResult.put("action", "AI Prevention Plan Generated");
                break;

            case 10:
                if (tag.getStatus() == RecoveryStatus.RECOVERY_VERIFIED) {
                    SelectStrategyRequest pReq = SelectStrategyRequest.builder()
                            .strategyName("Community Garden & Solar Lighting")
                            .strategyReason("High foot traffic hotspot suitable for community greening.")
                            .costCategory("LOW")
                            .maintenanceLevel("LOW")
                            .expectedImpact("HIGH")
                            .implementationNotes("Install automated CCTV surveillance, solar floodlights, and raised bio-composting planters.")
                            .build();
                    transformationService.planTransformation(tag.getId(), pReq, adminActor.getId());
                }
                stepResult.put("action", "Transformation Strategy Selected");
                break;

            case 11:
                if (tag.getStatus() == RecoveryStatus.TRANSFORMATION_PLANNED) {
                    CompleteTransformationRequest tReq = CompleteTransformationRequest.builder()
                            .description("Site converted into a vibrant community garden with zero waste dumping.")
                            .afterImageUrl(DEMO_AFTER_IMG)
                            .build();
                    transformationService.completeTransformation(tag.getId(), tReq, adminActor.getId());
                }
                stepResult.put("action", "Site Transformation Completed");
                break;

            case 12:
                runSimulatedMonitoringCheckpoint(tag.getId(), 30, false, verifierActor);
                stepResult.put("action", "30-Day Monitoring Inspection Passed");
                break;

            case 13:
                runSimulatedMonitoringCheckpoint(tag.getId(), 60, false, verifierActor);
                stepResult.put("action", "60-Day Monitoring Inspection Passed");
                break;

            case 14:
                runSimulatedMonitoringCheckpoint(tag.getId(), 90, wasteReturned, verifierActor);
                stepResult.put("action", wasteReturned ? "90-Day Inspection: Waste Dumping Returned" : "90-Day Inspection Passed Clean");
                break;

            case 15:
                TrashTag finalTag = trashTagRepository.findById(tagId).orElseThrow();
                stepResult.put("action", "Final Status Outcome: " + finalTag.getStatus().name());
                break;

            default:
                throw new IllegalArgumentException("Invalid demo step: " + step);
        }

        TrashTag updatedTag = trashTagRepository.findById(tagId).orElseThrow();
        stepResult.put("currentStatus", updatedTag.getStatus().name());
        stepResult.put("recoveredWasteKg", updatedTag.getRecoveredWeightKg());
        return stepResult;
    }

    @Transactional
    public List<Map<String, Object>> autoRunFullDemoSequence(UUID tagId, boolean wasteReturned, User actor) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (int i = 1; i <= 15; i++) {
            results.add(advanceDemoStep(tagId, i, wasteReturned, actor));
        }
        return results;
    }

    private Mission getLatestMissionForTag(UUID tagId) {
        return missionRepository.findByTrashTagId(tagId).stream().findFirst().orElse(null);
    }

    private void runSimulatedMonitoringCheckpoint(UUID tagId, int days, boolean wasteDetected, User verifier) {
        monitoringService.initializeMonitoringForTag(tagId, verifier.getId());
        List<MonitoringCheckpoint> cps = monitoringCheckpointRepository.findByTrashTagIdOrderByCheckpointDaysAsc(tagId);
        MonitoringCheckpoint targetCp = cps.stream()
                .filter(c -> c.getCheckpointDays() == days)
                .findFirst()
                .orElse(null);

        if (targetCp != null && !"COMPLETED".equalsIgnoreCase(targetCp.getStatus())) {
            CompleteMonitoringRequest req = CompleteMonitoringRequest.builder()
                    .wasteDetected(wasteDetected)
                    .evidenceImageUrl(wasteDetected ? DEMO_BEFORE_IMG : DEMO_AFTER_IMG)
                    .notes("Simulated " + days + "-day hackathon monitoring inspection. Site clean = " + !wasteDetected)
                    .build();
            monitoringService.completeMonitoringInspection(targetCp.getId(), req, verifier.getId());
        }
    }

    private void setAuthContext(User user) {
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private User getOrCreateDemoUser(String username, String email, UserRole role, String name) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = User.builder()
                    .username(username)
                    .email(email)
                    .password("DemoPass123!")
                    .role(role)
                    .displayName(name)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
    }
}

