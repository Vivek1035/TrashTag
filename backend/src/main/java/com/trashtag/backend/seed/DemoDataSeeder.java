package com.trashtag.backend.seed;

import com.trashtag.backend.ai.document.AIAnalysisDocument;
import com.trashtag.backend.ai.repository.AIAnalysisRepository;
import com.trashtag.backend.common.enums.*;
import com.trashtag.backend.leaderboard.entity.ScoreEvent;
import com.trashtag.backend.leaderboard.repository.ScoreEventRepository;
import com.trashtag.backend.mission.entity.Mission;
import com.trashtag.backend.mission.entity.MissionParticipant;
import com.trashtag.backend.mission.repository.MissionParticipantRepository;
import com.trashtag.backend.mission.repository.MissionRepository;
import com.trashtag.backend.monitoring.entity.MonitoringCheckpoint;
import com.trashtag.backend.monitoring.repository.MonitoringCheckpointRepository;
import com.trashtag.backend.recovery.entity.WasteRecord;
import com.trashtag.backend.recovery.repository.WasteRecordRepository;
import com.trashtag.backend.timeline.entity.TimelineEvent;
import com.trashtag.backend.timeline.repository.TimelineEventRepository;
import com.trashtag.backend.trashtag.entity.TrashTag;
import com.trashtag.backend.trashtag.repository.TrashTagRepository;
import com.trashtag.backend.transformation.entity.Transformation;
import com.trashtag.backend.transformation.repository.TransformationRepository;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                         ⚠  DEMO DATA SEEDER  ⚠                              ║
 * ║                                                                              ║
 * ║  This component runs ONLY under the "dev" Spring profile.                   ║
 * ║  All records created here are FICTIONAL demo data for hackathon/demo        ║
 * ║  purposes. Locations are based in Bengaluru, India, but are clearly         ║
 * ║  fictional. No real environmental cleanup is claimed or implied.             ║
 * ║                                                                              ║
 * ║  DO NOT run this against a production database.                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final TrashTagRepository trashTagRepo;
    private final MissionRepository missionRepo;
    private final MissionParticipantRepository participantRepo;
    private final WasteRecordRepository wasteRecordRepo;
    private final TimelineEventRepository timelineRepo;
    private final ScoreEventRepository scoreEventRepo;
    private final MonitoringCheckpointRepository checkpointRepo;
    private final TransformationRepository transformationRepo;
    private final AIAnalysisRepository aiAnalysisRepo;
    private final PasswordEncoder passwordEncoder;

    // Demo Image URLs — freely licensed Unsplash images
    private static final String IMG_PLASTIC    = "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_EWASTE     = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_DRAIN      = "https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_DUMPING    = "https://images.unsplash.com/photo-1601315379734-425a4b994be7?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_MIXED      = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_GARDEN     = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_PARK       = "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_AFTER      = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_CLEANUP    = "https://images.unsplash.com/photo-1591193686104-fddba4f8c9e3?auto=format&fit=crop&w=800&q=80";
    private static final String IMG_ORGANIC    = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80";

    private static final String DEMO_PASSWORD = "Demo@12345";

    @Override
    public void run(String... args) {
        // Idempotent guard: skip if demo users already exist
        if (userRepo.existsByEmail("demo.admin@trashtag.dev")) {
            log.info("⚡ DemoDataSeeder: Demo data already present — skipping seed.");
            return;
        }

        log.info("╔══════════════════════════════════════════════════════╗");
        log.info("║          TrashTag Demo Data Seeder Starting          ║");
        log.info("║  All data is FICTIONAL. Bengaluru demo locations.   ║");
        log.info("╚══════════════════════════════════════════════════════╝");

        // ──────────────────────────────────────────────
        // 1. CREATE 20 DEMO USERS
        // ──────────────────────────────────────────────
        String encoded = passwordEncoder.encode(DEMO_PASSWORD);

        User admin = saveUser("demo_admin", "demo.admin@trashtag.dev", encoded, UserRole.ADMIN, "[DEMO] Arjun Verma",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                "Platform administrator for TrashTag demo.");
        User verifier1 = saveUser("demo_verifier_priya", "priya.verifier@trashtag.dev", encoded, UserRole.VERIFIER, "[DEMO] Priya Krishnan",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                "Environmental verifier, BBMP partner.");
        User verifier2 = saveUser("demo_verifier_rajan", "rajan.verifier@trashtag.dev", encoded, UserRole.VERIFIER, "[DEMO] Rajan Pillai",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
                "Waste management inspector.");
        User org1 = saveUser("demo_org_greenblr", "greenblr@trashtag.dev", encoded, UserRole.ORGANIZATION, "[DEMO] Green Bengaluru Foundation",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80",
                "NGO focused on urban solid waste management.");
        User org2 = saveUser("demo_org_cleantech", "cleantech@trashtag.dev", encoded, UserRole.ORGANIZATION, "[DEMO] CleanTech Bluru",
                "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=200&q=80",
                "Technology-driven urban cleanup collective.");
        User u1  = saveUser("demo_anika_rao",      "anika.rao@trashtag.dev",      encoded, UserRole.USER, "[DEMO] Anika Rao",      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", "College student, eco activist.");
        User u2  = saveUser("demo_kiran_kumar",    "kiran.kumar@trashtag.dev",    encoded, UserRole.USER, "[DEMO] Kiran Kumar",    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", "Software engineer, weekend volunteer.");
        User u3  = saveUser("demo_sneha_mistry",  "sneha.mistry@trashtag.dev",   encoded, UserRole.USER, "[DEMO] Sneha Mistry",   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", "Freelance photographer and cleanup volunteer.");
        User u4  = saveUser("demo_rahul_nair",    "rahul.nair@trashtag.dev",     encoded, UserRole.USER, "[DEMO] Rahul Nair",     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", "Environmental science student.");
        User u5  = saveUser("demo_fatima_khan",   "fatima.khan@trashtag.dev",    encoded, UserRole.USER, "[DEMO] Fatima Khan",    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80", "Community leader, Yelahanka.");
        User u6  = saveUser("demo_deepak_reddy",  "deepak.reddy@trashtag.dev",   encoded, UserRole.USER, "[DEMO] Deepak Reddy",   "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=200&q=80", "Retired teacher, active volunteer.");
        User u7  = saveUser("demo_nandini_v",     "nandini.v@trashtag.dev",      encoded, UserRole.USER, "[DEMO] Nandini V",      "https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?auto=format&fit=crop&w=200&q=80", "Urban planner.");
        User u8  = saveUser("demo_suresh_iyer",   "suresh.iyer@trashtag.dev",    encoded, UserRole.USER, "[DEMO] Suresh Iyer",    "https://images.unsplash.com/photo-1542909168-82c3e7fdcd5c?auto=format&fit=crop&w=200&q=80", "Entrepreneur, sustainability advocate.");
        User u9  = saveUser("demo_meera_thomas",  "meera.thomas@trashtag.dev",   encoded, UserRole.USER, "[DEMO] Meera Thomas",   "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80", "Medical professional, community health.");
        User u10 = saveUser("demo_abhi_sharma",   "abhi.sharma@trashtag.dev",    encoded, UserRole.USER, "[DEMO] Abhishek Sharma","https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80", "Architect, green building enthusiast.");
        User u11 = saveUser("demo_tanya_patel",   "tanya.patel@trashtag.dev",    encoded, UserRole.USER, "[DEMO] Tanya Patel",    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80", "High school teacher, youth eco leader.");
        User u12 = saveUser("demo_vikram_anand",  "vikram.anand@trashtag.dev",   encoded, UserRole.USER, "[DEMO] Vikram Anand",   "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80", "Startup founder, climate tech.");
        User u13 = saveUser("demo_lakshmi_g",     "lakshmi.g@trashtag.dev",      encoded, UserRole.USER, "[DEMO] Lakshmi G",      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80", "Social worker, Koramangala.");
        User u14 = saveUser("demo_rohit_menon",   "rohit.menon@trashtag.dev",    encoded, UserRole.USER, "[DEMO] Rohit Menon",    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=200&q=80", "Civil engineer, urban infrastructure.");
        User u15 = saveUser("demo_zara_hussain",  "zara.hussain@trashtag.dev",   encoded, UserRole.USER, "[DEMO] Zara Hussain",   "https://images.unsplash.com/photo-1525879000488-bff3b1c4df3e?auto=format&fit=crop&w=200&q=80", "Environmental lawyer.");

        log.info("✅ Created 20 demo users.");

        Instant now = Instant.now();

        // ──────────────────────────────────────────────
        // 2. CREATE 15 TRASHTAGS — all demo, Bengaluru coordinates
        //    isDemo = true on every record
        // ──────────────────────────────────────────────

        // ── TT-D01 · REPORTED ──────────────────────────────────────────────
        TrashTag tt01 = saveTag("TT-D01", u1.getId(), RecoveryStatus.REPORTED, WasteType.PLASTIC, Severity.HIGH,
                "[DEMO] Bellandur Lake Plastic Heap",
                "⚠ DEMO DATA — Large accumulation of single-use plastic bags, bottles and packaging material observed near the eastern bank of Bellandur lake. Reported for awareness only. No real cleanup claimed.",
                12.9250, 77.6780, "Bellandur Lake East Bank, Bengaluru, KA",
                180.0, null, IMG_PLASTIC, now.minus(5, ChronoUnit.DAYS), null, null);

        // ── TT-D02 · VERIFIED ──────────────────────────────────────────────
        TrashTag tt02 = saveTag("TT-D02", u2.getId(), RecoveryStatus.VERIFIED, WasteType.ELECTRONIC, Severity.CRITICAL,
                "[DEMO] HSR Layout E-Waste Dump",
                "⚠ DEMO DATA — Discarded monitors, keyboards and circuit boards scattered behind a fictional warehouse on Sector 3, HSR Layout. Verified by demo verifier for lifecycle demonstration.",
                12.9116, 77.6389, "Sector 3, HSR Layout, Bengaluru, KA",
                420.0, null, IMG_EWASTE, now.minus(12, ChronoUnit.DAYS), now.minus(10, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D03 · MISSION_CREATED ───────────────────────────────────────
        TrashTag tt03 = saveTag("TT-D03", u3.getId(), RecoveryStatus.MISSION_CREATED, WasteType.ORGANIC, Severity.MEDIUM,
                "[DEMO] Koramangala Nala Organic Dump",
                "⚠ DEMO DATA — Organic waste and food debris blocking a stormwater drain near 5th Block, Koramangala. Mission created for demonstration of the mission workflow.",
                12.9352, 77.6270, "5th Block, Koramangala, Bengaluru, KA",
                95.0, null, IMG_ORGANIC, now.minus(18, ChronoUnit.DAYS), now.minus(16, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D04 · MISSION_ACTIVE ────────────────────────────────────────
        TrashTag tt04 = saveTag("TT-D04", u4.getId(), RecoveryStatus.MISSION_ACTIVE, WasteType.MIXED, Severity.HIGH,
                "[DEMO] Ulsoor Lake Perimeter Mixed Waste",
                "⚠ DEMO DATA — Mixed waste including construction debris, plastic and glass observed around Ulsoor Lake's western perimeter. Active demo mission in progress.",
                12.9785, 77.6199, "Ulsoor Lake West Perimeter, Bengaluru, KA",
                260.0, null, IMG_MIXED, now.minus(25, ChronoUnit.DAYS), now.minus(23, ChronoUnit.DAYS), verifier2.getId());

        // ── TT-D05 · CLEANUP_COMPLETED ─────────────────────────────────────
        TrashTag tt05 = saveTag("TT-D05", u5.getId(), RecoveryStatus.CLEANUP_COMPLETED, WasteType.PLASTIC, Severity.MEDIUM,
                "[DEMO] Indiranagar 12th Main Drain Blockage",
                "⚠ DEMO DATA — Plastic debris accumulated at drain inlet causing localised flooding during monsoons. Demo cleanup mission completed. Awaiting recovery verification.",
                12.9716, 77.6412, "12th Main, Indiranagar, Bengaluru, KA",
                75.0, 68.0, IMG_DRAIN, now.minus(35, ChronoUnit.DAYS), now.minus(33, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D06 · RECOVERY_VERIFIED ─────────────────────────────────────
        TrashTag tt06 = saveTag("TT-D06", u6.getId(), RecoveryStatus.RECOVERY_VERIFIED, WasteType.CONSTRUCTION, Severity.HIGH,
                "[DEMO] JP Nagar Construction Debris",
                "⚠ DEMO DATA — Illegally dumped construction debris (bricks, concrete rubble, sand bags) on a public road margin in JP Nagar Phase 5. Recovery verified for demo.",
                12.9081, 77.5885, "Phase 5, JP Nagar, Bengaluru, KA",
                350.0, 320.0, IMG_DUMPING, now.minus(50, ChronoUnit.DAYS), now.minus(48, ChronoUnit.DAYS), verifier2.getId());

        // ── TT-D07 · TRANSFORMATION_PLANNED ───────────────────────────────
        TrashTag tt07 = saveTag("TT-D07", u7.getId(), RecoveryStatus.TRANSFORMATION_PLANNED, WasteType.MIXED, Severity.CRITICAL,
                "[DEMO] Rajajinagar Illegal Landfill",
                "⚠ DEMO DATA — Longstanding illegal mixed landfill near Rajajinagar Industrial Area. Transformation plan selected: Community Biodiverse Park. AI prevention plan generated.",
                12.9895, 77.5530, "Industrial Area, Rajajinagar, Bengaluru, KA",
                600.0, 550.0, IMG_DUMPING, now.minus(70, ChronoUnit.DAYS), now.minus(68, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D08 · TRANSFORMED ──────────────────────────────────────────
        TrashTag tt08 = saveTag("TT-D08", u8.getId(), RecoveryStatus.TRANSFORMED, WasteType.ORGANIC, Severity.LOW,
                "[DEMO] Jayanagar Community Garden Demo Site",
                "⚠ DEMO DATA — Former organic waste accumulation point near 4th Block, Jayanagar. Transformed into a demo community composting and garden space. Monitoring ongoing.",
                12.9250, 77.5938, "4th Block, Jayanagar, Bengaluru, KA",
                120.0, 118.0, IMG_GARDEN, now.minus(90, ChronoUnit.DAYS), now.minus(88, ChronoUnit.DAYS), verifier2.getId());

        // ── TT-D09 · MONITORING (30-day) ──────────────────────────────────
        TrashTag tt09 = saveTag("TT-D09", u9.getId(), RecoveryStatus.MONITORING, WasteType.PLASTIC, Severity.MEDIUM,
                "[DEMO] Sadashivanagar Plastic Accumulation",
                "⚠ DEMO DATA — Repeated plastic waste accumulation spot near Sadashivanagar residential park. Transformed into a demo zero-waste segregation station. 30-day checkpoint due.",
                13.0085, 77.5797, "Sadashivanagar Residential Park, Bengaluru, KA",
                85.0, 80.0, IMG_PARK, now.minus(100, ChronoUnit.DAYS), now.minus(98, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D10 · MONITORING (60-day) ──────────────────────────────────
        TrashTag tt10 = saveTag("TT-D10", u10.getId(), RecoveryStatus.MONITORING, WasteType.ELECTRONIC, Severity.HIGH,
                "[DEMO] Electronic City E-Waste Accumulation",
                "⚠ DEMO DATA — E-waste accumulation near an IT park perimeter in Electronic City Phase 2. Site cleared and fenced. 60-day monitoring checkpoint completed.",
                12.8458, 77.6697, "Phase 2, Electronic City, Bengaluru, KA",
                300.0, 285.0, IMG_EWASTE, now.minus(130, ChronoUnit.DAYS), now.minus(128, ChronoUnit.DAYS), verifier2.getId());

        // ── TT-D11 · SUSTAINED ────────────────────────────────────────────
        TrashTag tt11 = saveTag("TT-D11", u11.getId(), RecoveryStatus.SUSTAINED, WasteType.MIXED, Severity.LOW,
                "[DEMO] Malleswaram Market Waste — SUSTAINED",
                "⚠ DEMO DATA — Former mixed waste hotspot near Malleswaram Sankey Tank. Site fully sustained after 90-day monitoring. Community ownership transferred. No waste recurrence detected.",
                13.0020, 77.5680, "Sankey Tank Road, Malleswaram, Bengaluru, KA",
                200.0, 195.0, IMG_PARK, now.minus(180, ChronoUnit.DAYS), now.minus(178, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D12 · REOPENED ─────────────────────────────────────────────
        TrashTag tt12 = saveTag("TT-D12", u12.getId(), RecoveryStatus.REOPENED, WasteType.MIXED, Severity.HIGH,
                "[DEMO] Marathahalli Bridge Underpass — REOPENED",
                "⚠ DEMO DATA — Previously cleared waste dump under Marathahalli Bridge. 90-day monitoring detected waste return — site reopened for a second demo cleanup mission.",
                12.9560, 77.7010, "Under Marathahalli Bridge, Outer Ring Road, Bengaluru, KA",
                150.0, 130.0, IMG_DUMPING, now.minus(140, ChronoUnit.DAYS), now.minus(138, ChronoUnit.DAYS), verifier2.getId());

        // ── TT-D13 · REPORTED (Critical) ──────────────────────────────────
        TrashTag tt13 = saveTag("TT-D13", u13.getId(), RecoveryStatus.REPORTED, WasteType.CONSTRUCTION, Severity.CRITICAL,
                "[DEMO] Whitefield Construction Rubble",
                "⚠ DEMO DATA — Large pile of construction waste and debris occupying a footpath near Whitefield Main Road. Flagged as critical for pedestrian safety. Awaiting verification.",
                12.9791, 77.7480, "Whitefield Main Road, Bengaluru, KA",
                500.0, null, IMG_DUMPING, now.minus(2, ChronoUnit.DAYS), null, null);

        // ── TT-D14 · VERIFIED ─────────────────────────────────────────────
        TrashTag tt14 = saveTag("TT-D14", u14.getId(), RecoveryStatus.VERIFIED, WasteType.ORGANIC, Severity.MEDIUM,
                "[DEMO] Hebbal Lake Organic Waste",
                "⚠ DEMO DATA — Organic waste including vegetable peels, waste food, and flower offerings accumulated near Hebbal Lake's heritage zone. Verified by demo verifier.",
                13.0358, 77.5967, "Heritage Zone, Hebbal Lake, Bengaluru, KA",
                110.0, null, IMG_ORGANIC, now.minus(8, ChronoUnit.DAYS), now.minus(6, ChronoUnit.DAYS), verifier1.getId());

        // ── TT-D15 · CLEANUP_COMPLETED ────────────────────────────────────
        TrashTag tt15 = saveTag("TT-D15", u15.getId(), RecoveryStatus.CLEANUP_COMPLETED, WasteType.PLASTIC, Severity.HIGH,
                "[DEMO] Yeshwanthpur Market Plastic",
                "⚠ DEMO DATA — Heavy accumulation of single-use plastic near Yeshwanthpur APMC wholesale market. Demo cleanup completed. Recovery verification pending.",
                13.0215, 77.5490, "APMC Wholesale Market, Yeshwanthpur, Bengaluru, KA",
                220.0, 198.0, IMG_PLASTIC, now.minus(22, ChronoUnit.DAYS), now.minus(20, ChronoUnit.DAYS), verifier2.getId());

        log.info("✅ Created 15 demo TrashTags across all lifecycle statuses.");

        // ──────────────────────────────────────────────
        // 3. TIMELINE EVENTS — Report Created
        // ──────────────────────────────────────────────
        List<TrashTag> allTags = List.of(tt01,tt02,tt03,tt04,tt05,tt06,tt07,tt08,tt09,tt10,tt11,tt12,tt13,tt14,tt15);
        List<User> reporters = List.of(u1,u2,u3,u4,u5,u6,u7,u8,u9,u10,u11,u12,u13,u14,u15);

        for (int i = 0; i < allTags.size(); i++) {
            TrashTag t = allTags.get(i);
            User reporter = reporters.get(i);
            saveTimeline(t, reporter, "REPORT_CREATED",
                    "[DEMO] TrashTag Reported: " + t.getTitle(),
                    "[DEMO] Community member reported a waste hotspot at " + t.getAddress() + ".",
                    null, null, t.getPrimaryImageUrl());
        }

        // Verified tags — add REPORT_VERIFIED events
        for (TrashTag t : List.of(tt02, tt03, tt04, tt05, tt06, tt07, tt08, tt09, tt10, tt11, tt12, tt14, tt15)) {
            saveTimeline(t, verifier1, "REPORT_VERIFIED",
                    "[DEMO] Report Verified by Inspector",
                    "[DEMO] Environmental verifier confirmed the waste hotspot and approved for mission creation.",
                    null, null, t.getPrimaryImageUrl());
        }

        log.info("✅ Created initial timeline events for all 15 TrashTags.");

        // ──────────────────────────────────────────────
        // 4. CREATE 6 DEMO MISSIONS
        // ──────────────────────────────────────────────

        // MISSION 1 — for TT-D03 (MISSION_CREATED)
        Mission m1 = saveMission(tt03, org1, "[DEMO] Koramangala Nala Organic Clearance",
                "[DEMO] Volunteer team to safely remove organic waste and debris from the stormwater drain. Gloves and masks provided. DEMO MISSION.",
                MissionStatus.UPCOMING, now.plus(5, ChronoUnit.DAYS), null, null, 25,
                "5th Block Koramangala Park Gate", 12.9352, 77.6270,
                "Gloves, Organic waste bags, Shovels, Safety masks");

        saveTimeline(tt03, org1, "MISSION_CREATED",
                "[DEMO] Cleanup Mission Scheduled",
                "[DEMO] Green Bengaluru Foundation scheduled a volunteer cleanup mission for " + tt03.getAddress(),
                m1.getId(), "Mission", tt03.getPrimaryImageUrl());

        // MISSION 2 — for TT-D04 (MISSION_ACTIVE)
        Mission m2 = saveMission(tt04, org2, "[DEMO] Ulsoor Lake Perimeter Waste Drive",
                "[DEMO] Mixed waste recovery operation around Ulsoor Lake. Teams will sort waste into plastic, glass and debris categories. DEMO MISSION.",
                MissionStatus.ACTIVE, now.minus(2, ChronoUnit.DAYS), now.minus(1, ChronoUnit.DAYS), null, 30,
                "Ulsoor Lake West Gate Entry", 12.9785, 77.6199,
                "Safety vests, Sorting bins, Heavy-duty bags, Gloves");

        saveTimeline(tt04, org2, "MISSION_CREATED",
                "[DEMO] Active Mission Deployed",
                "[DEMO] CleanTech Bluru launched an emergency waste recovery drive at Ulsoor Lake.",
                m2.getId(), "Mission", tt04.getPrimaryImageUrl());
        saveTimeline(tt04, org2, "CLEANUP_STARTED",
                "[DEMO] Volunteers On Site",
                "[DEMO] 18 volunteers checked in at Ulsoor Lake. Cleanup operations underway.",
                m2.getId(), "Mission", IMG_CLEANUP);

        // MISSION 3 — for TT-D05 (CLEANUP_COMPLETED)
        Mission m3 = saveMission(tt05, org1, "[DEMO] Indiranagar Drain Plastic Recovery",
                "[DEMO] Plastic waste blocking a drain inlet removed by demo volunteer team. DEMO MISSION.",
                MissionStatus.COMPLETED, now.minus(20, ChronoUnit.DAYS), now.minus(18, ChronoUnit.DAYS), now.minus(15, ChronoUnit.DAYS), 15,
                "12th Main Bus Stop, Indiranagar", 12.9716, 77.6412,
                "Waterproof gloves, Small rakes, Trash grabbers, Bags");

        saveTimeline(tt05, org1, "MISSION_CREATED", "[DEMO] Mission Created", "[DEMO] Cleanup mission for Indiranagar drain.", m3.getId(), "Mission", tt05.getPrimaryImageUrl());
        saveTimeline(tt05, u5, "CLEANUP_COMPLETED", "[DEMO] 68 kg Recovered — Demo",
                "[DEMO] Demo mission completed. 68 kg of plastic waste removed from drain. Recovery verification pending. THIS IS DEMO DATA.",
                m3.getId(), "Mission", IMG_CLEANUP);

        // MISSION 4 — for TT-D06 (RECOVERY_VERIFIED)
        Mission m4 = saveMission(tt06, org2, "[DEMO] JP Nagar Construction Debris Removal",
                "[DEMO] Coordinated debris removal with demo municipality support. Construction rubble cleared. DEMO MISSION.",
                MissionStatus.COMPLETED, now.minus(48, ChronoUnit.DAYS), now.minus(46, ChronoUnit.DAYS), now.minus(43, ChronoUnit.DAYS), 20,
                "JP Nagar Phase 5 Community Hall", 12.9081, 77.5885,
                "Heavy machinery (demo), Gloves, Safety boots, Hard hats");

        saveTimeline(tt06, org2, "MISSION_CREATED", "[DEMO] Mission Launched", "[DEMO] Construction debris cleanup mission at JP Nagar.", m4.getId(), "Mission", tt06.getPrimaryImageUrl());
        saveTimeline(tt06, org2, "CLEANUP_COMPLETED", "[DEMO] 320 kg Recovered — Demo",
                "[DEMO] 320 kg of construction debris removed. Awaiting demo recovery verification.",
                m4.getId(), "Mission", IMG_CLEANUP);
        saveTimeline(tt06, verifier2, "RECOVERY_VERIFIED",
                "[DEMO] Recovery Verified — JP Nagar Site",
                "[DEMO] Verifier confirmed 320 kg debris recovery. Site cleared. Transformation plan recommended.",
                null, null, IMG_AFTER);

        // MISSION 5 — for TT-D08 (TRANSFORMED)
        Mission m5 = saveMission(tt08, org1, "[DEMO] Jayanagar Organic Hotspot Cleanup",
                "[DEMO] Organic waste clearance as part of community garden transformation. DEMO MISSION.",
                MissionStatus.COMPLETED, now.minus(88, ChronoUnit.DAYS), now.minus(86, ChronoUnit.DAYS), now.minus(83, ChronoUnit.DAYS), 20,
                "4th Block Jayanagar Park Main Gate", 12.9250, 77.5938,
                "Compost bags, Shovels, Biodegradable liners, Gloves");

        saveTimeline(tt08, org1, "MISSION_CREATED", "[DEMO] Mission Scheduled", "[DEMO] Jayanagar organic waste clearance mission.", m5.getId(), "Mission", tt08.getPrimaryImageUrl());
        saveTimeline(tt08, org1, "CLEANUP_COMPLETED", "[DEMO] 118 kg Removed — Demo", "[DEMO] Organic waste removed. Site ready for transformation.", m5.getId(), "Mission", IMG_CLEANUP);
        saveTimeline(tt08, verifier1, "RECOVERY_VERIFIED", "[DEMO] Recovery Verified — Jayanagar", "[DEMO] Recovery verified. AI prevention plan recommended.", null, null, IMG_AFTER);
        saveTimeline(tt08, admin, "TRANSFORMATION_SELECTED", "[DEMO] Transformation Strategy Selected",
                "[DEMO] Community Composting + Biodiverse Garden chosen as transformation strategy.",
                null, null, IMG_GARDEN);
        saveTimeline(tt08, admin, "TRANSFORMATION_COMPLETED",
                "[DEMO] Jayanagar Community Garden Demo — Transformed",
                "[DEMO] Site successfully transformed into a demo community garden. THIS IS DEMO DATA — no real transformation occurred.",
                null, null, IMG_GARDEN);

        // MISSION 6 — for TT-D12 (REOPENED second mission)
        Mission m6 = saveMission(tt12, org2, "[DEMO] Marathahalli Bridge — Second Recovery",
                "[DEMO] Second cleanup attempt after waste returned at 90-day monitoring. DEMO MISSION — REOPENED lifecycle stage.",
                MissionStatus.UPCOMING, now.plus(7, ChronoUnit.DAYS), null, null, 20,
                "Marathahalli Bridge South End", 12.9560, 77.7010,
                "Heavy bags, Gloves, Reflective vests (night crew)");

        saveTimeline(tt12, org2, "SITE_REOPENED",
                "[DEMO] Site Reopened — Waste Returned",
                "[DEMO] 90-day monitoring confirmed waste return at Marathahalli Bridge. Site reopened for second recovery mission.",
                m6.getId(), "Mission", tt12.getPrimaryImageUrl());

        log.info("✅ Created 6 demo missions.");

        // ──────────────────────────────────────────────
        // 5. MISSION PARTICIPANTS
        // ──────────────────────────────────────────────
        // m2 — Ulsoor (ACTIVE)
        saveParticipant(m2, u1); saveParticipant(m2, u3); saveParticipant(m2, u4);
        saveParticipant(m2, u5); saveParticipant(m2, u6); saveParticipant(m2, u9);
        saveParticipant(m2, u11); saveParticipant(m2, u13); saveParticipant(m2, u15);

        for (User vol : List.of(u1, u3, u4, u5, u6, u9, u11, u13, u15)) {
            saveTimeline(tt04, vol, "MISSION_JOINED",
                    "[DEMO] Volunteer Joined Mission",
                    "[DEMO] " + vol.getDisplayName() + " joined the Ulsoor Lake cleanup team.",
                    m2.getId(), "Mission", null);
            saveScore(vol, tt04, "MISSION_JOINED", 10, "[DEMO] +10 pts for joining Ulsoor Lake mission");
        }

        // m3 — Indiranagar (COMPLETED)
        saveParticipant(m3, u5); saveParticipant(m3, u7); saveParticipant(m3, u10);
        for (User vol : List.of(u5, u7, u10)) {
            saveScore(vol, tt05, "MISSION_JOINED", 10, "[DEMO] +10 pts for joining Indiranagar mission");
            saveScore(vol, tt05, "CLEANUP_COMPLETED", 30, "[DEMO] +30 pts for completing Indiranagar cleanup");
        }

        // m4 — JP Nagar (COMPLETED + RECOVERY_VERIFIED)
        saveParticipant(m4, u6); saveParticipant(m4, u8); saveParticipant(m4, u12);
        saveParticipant(m4, u14); saveParticipant(m4, u2);
        for (User vol : List.of(u6, u8, u12, u14, u2)) {
            saveScore(vol, tt06, "MISSION_JOINED", 10, "[DEMO] +10 pts for joining JP Nagar mission");
            saveScore(vol, tt06, "CLEANUP_COMPLETED", 30, "[DEMO] +30 pts for JP Nagar cleanup");
        }
        saveScore(verifier2, tt06, "RECOVERY_VERIFIED", 50, "[DEMO] +50 pts for verifying JP Nagar recovery");

        // m5 — Jayanagar (TRANSFORMED)
        saveParticipant(m5, u8); saveParticipant(m5, u10); saveParticipant(m5, u13);
        for (User vol : List.of(u8, u10, u13)) {
            saveScore(vol, tt08, "MISSION_JOINED", 10, "[DEMO] +10 pts for Jayanagar mission");
            saveScore(vol, tt08, "CLEANUP_COMPLETED", 30, "[DEMO] +30 pts for Jayanagar cleanup");
        }
        saveScore(verifier1, tt08, "RECOVERY_VERIFIED", 50, "[DEMO] +50 pts for Jayanagar recovery verification");
        saveScore(admin, tt08, "TRANSFORMATION_COMPLETED", 50, "[DEMO] +50 pts for Jayanagar transformation");

        // Report scores
        for (User reporter : List.of(u1,u2,u3,u4,u5,u6,u7,u8,u9,u10,u11,u12,u13,u14,u15)) {
            TrashTag tag = allTags.get(reporters.indexOf(reporter));
            saveScore(reporter, tag, "REPORT_VERIFIED", 20, "[DEMO] +20 pts for verified report at " + tag.getTitle());
        }

        log.info("✅ Created mission participants and score events.");

        // ──────────────────────────────────────────────
        // 6. WASTE RECORDS — for completed missions
        // ──────────────────────────────────────────────

        // m3 — Indiranagar (68 kg plastic)
        saveWasteRecord(m3, tt05, u5, WasteType.PLASTIC, 45.0, IMG_CLEANUP);
        saveWasteRecord(m3, tt05, u7, WasteType.ORGANIC, 15.0, null);
        saveWasteRecord(m3, tt05, u10, WasteType.OTHER,   8.0, null);

        // m4 — JP Nagar (320 kg construction)
        saveWasteRecord(m4, tt06, u6, WasteType.CONSTRUCTION, 180.0, IMG_DUMPING);
        saveWasteRecord(m4, tt06, u8, WasteType.CONSTRUCTION, 100.0, null);
        saveWasteRecord(m4, tt06, u12, WasteType.MIXED,        40.0, null);

        // m5 — Jayanagar (118 kg organic)
        saveWasteRecord(m5, tt08, u8,  WasteType.ORGANIC, 80.0, IMG_ORGANIC);
        saveWasteRecord(m5, tt08, u10, WasteType.ORGANIC, 28.0, null);
        saveWasteRecord(m5, tt08, u13, WasteType.OTHER,   10.0, null);

        // TT-D09/10/11/12/15 — historical waste records (without mission objects for simplicity)
        saveWasteRecord(m2, tt04, u1, WasteType.PLASTIC,  80.0, IMG_PLASTIC);
        saveWasteRecord(m2, tt04, u3, WasteType.MIXED,    60.0, null);

        log.info("✅ Created waste records.");

        // ──────────────────────────────────────────────
        // 7. TRANSFORMATIONS — for TRANSFORMATION_PLANNED, TRANSFORMED, MONITORING, SUSTAINED sites
        // ──────────────────────────────────────────────

        // TT-D07 — Rajajinagar (TRANSFORMATION_PLANNED)
        Transformation tf07 = saveTransformation(tt07, admin,
                "Community Biodiverse Park",
                "[DEMO] Planned transformation of former Rajajinagar landfill into a biodiverse community park with native plant species, permeable walkways and waste-segregation stations.",
                "AI-Recommended: Community Green Corridor with native flora, rainwater harvesting, and scheduled maintenance by BBMP partnership.",
                IMG_DUMPING, null, null);

        saveTimeline(tt07, admin, "TRANSFORMATION_RECOMMENDED",
                "[DEMO] AI Prevention Plan Generated",
                "[DEMO] AI recommended Community Biodiverse Park strategy based on waste type, location and urban density analysis.",
                tf07.getId(), "Transformation", IMG_DUMPING);
        saveTimeline(tt07, admin, "TRANSFORMATION_SELECTED",
                "[DEMO] Transformation Strategy Selected",
                "[DEMO] Community Biodiverse Park strategy approved for Rajajinagar site.",
                tf07.getId(), "Transformation", IMG_DUMPING);

        // TT-D08 — Jayanagar (TRANSFORMED)
        Transformation tf08 = saveTransformation(tt08, admin,
                "Community Composting & Garden",
                "[DEMO] Former organic waste dump converted to a demo community composting station and biodiverse garden. Managed by residents.",
                "AI-Recommended: Neighbourhood Composting Hub with segregated organic bins, vermicomposting pits, and sensory garden.",
                IMG_ORGANIC, IMG_GARDEN, now.minus(75, ChronoUnit.DAYS));

        saveTimeline(tt08, admin, "TRANSFORMATION_RECOMMENDED", "[DEMO] AI Plan Generated", "[DEMO] Neighbourhood Composting Hub recommended by AI.", tf08.getId(), "Transformation", IMG_ORGANIC);

        // TT-D09 — Sadashivanagar (MONITORING)
        Transformation tf09 = saveTransformation(tt09, admin,
                "Zero-Waste Segregation Station",
                "[DEMO] Converted to a demo waste segregation and recycling kiosk with colour-coded bins for dry, wet and hazardous waste.",
                "AI-Recommended: On-site dry-waste kiosk with user education signage and weekly municipal collection integration.",
                IMG_PARK, IMG_AFTER, now.minus(85, ChronoUnit.DAYS));

        // TT-D10 — Electronic City (MONITORING)
        Transformation tf10 = saveTransformation(tt10, admin,
                "E-Waste Collection Hub",
                "[DEMO] E-waste cleared, site converted to a designated, fenced e-waste drop-off point with CPCB-certified recycler partnership.",
                "AI-Recommended: E-Waste Aggregation Centre with security camera, CPCB partner integration.",
                IMG_EWASTE, IMG_AFTER, now.minus(100, ChronoUnit.DAYS));

        // TT-D11 — Malleswaram (SUSTAINED)
        Transformation tf11 = saveTransformation(tt11, admin,
                "Community Ownership Transfer",
                "[DEMO] Site fully sustained. Malleswaram residents' association took permanent ownership of waste management. No recurrence in 90 days.",
                "AI-Recommended: Community Guardian Model with monthly audits and resident accountability.",
                IMG_MIXED, IMG_PARK, now.minus(150, ChronoUnit.DAYS));

        log.info("✅ Created transformations for TRANSFORMATION_PLANNED, TRANSFORMED, MONITORING, SUSTAINED sites.");

        // ──────────────────────────────────────────────
        // 8. MONITORING CHECKPOINTS
        //    TT-D08 (TRANSFORMED), TT-D09/10 (MONITORING), TT-D11 (SUSTAINED), TT-D12 (REOPENED)
        // ──────────────────────────────────────────────

        // TT-D08 — Jayanagar TRANSFORMED — all 3 checkpoints completed clean
        saveCheckpoint(tt08, 30, now.minus(45, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 30-day check: No waste detected. Community garden maintained.", IMG_GARDEN, verifier1, now.minus(45, ChronoUnit.DAYS));
        saveCheckpoint(tt08, 60, now.minus(15, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 60-day check: Site clean. Composting bins active.", IMG_GARDEN, verifier2, now.minus(15, ChronoUnit.DAYS));
        saveCheckpoint(tt08, 90, now.plus(15, ChronoUnit.DAYS),   "PENDING",   null,  "[DEMO] 90-day checkpoint scheduled.", null, null, null);

        // TT-D09 — Sadashivanagar MONITORING — 30-day due
        saveCheckpoint(tt09, 30, now.minus(5, ChronoUnit.DAYS),   "COMPLETED", false, "[DEMO] 30-day check: Clean. Segregation kiosk operational.", IMG_PARK, verifier1, now.minus(5, ChronoUnit.DAYS));
        saveTimeline(tt09, verifier1, "MONITORING_COMPLETED", "[DEMO] 30-Day Monitoring Checkpoint Passed",
                "[DEMO] Sadashivanagar site clean at 30-day inspection. Zero waste detected.", null, null, IMG_PARK);
        saveScore(verifier1, tt09, "MONITORING_COMPLETED", 20, "[DEMO] +20 pts for 30-day monitoring");

        saveCheckpoint(tt09, 60, now.plus(25, ChronoUnit.DAYS),   "PENDING",   null,  "[DEMO] 60-day checkpoint upcoming.", null, null, null);
        saveCheckpoint(tt09, 90, now.plus(55, ChronoUnit.DAYS),   "PENDING",   null,  "[DEMO] 90-day checkpoint upcoming.", null, null, null);

        // TT-D10 — Electronic City MONITORING — 30 and 60 day completed
        saveCheckpoint(tt10, 30, now.minus(70, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 30-day: E-waste hub operational, no dumping.", IMG_AFTER, verifier2, now.minus(70, ChronoUnit.DAYS));
        saveCheckpoint(tt10, 60, now.minus(40, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 60-day: Site still clean. Drop-off kiosk receiving weekly collections.", IMG_AFTER, verifier2, now.minus(40, ChronoUnit.DAYS));
        saveCheckpoint(tt10, 90, now.minus(10, ChronoUnit.DAYS),  "PENDING",   null,  "[DEMO] 90-day checkpoint overdue — inspection not yet submitted (PENDING past schedule date = overdue).", null, null, null);

        for (User v : List.of(verifier2, verifier2)) {
            saveScore(v, tt10, "MONITORING_COMPLETED", 20, "[DEMO] +20 pts for monitoring checkpoint");
        }
        saveTimeline(tt10, verifier2, "MONITORING_COMPLETED", "[DEMO] 60-Day Monitoring Checkpoint Passed",
                "[DEMO] Electronic City site clean at 60-day inspection.", null, null, IMG_AFTER);

        // TT-D11 — Malleswaram SUSTAINED — all 3 done, site_sustained
        saveCheckpoint(tt11, 30, now.minus(120, ChronoUnit.DAYS), "COMPLETED", false, "[DEMO] 30-day: Clean.", IMG_PARK, verifier1, now.minus(120, ChronoUnit.DAYS));
        saveCheckpoint(tt11, 60, now.minus(90, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 60-day: Clean. Community actively maintaining.", IMG_PARK, verifier1, now.minus(90, ChronoUnit.DAYS));
        saveCheckpoint(tt11, 90, now.minus(60, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 90-day: Clean. Site officially sustained. Community ownership active.", IMG_PARK, verifier1, now.minus(60, ChronoUnit.DAYS));
        saveTimeline(tt11, verifier1, "SITE_SUSTAINED", "[DEMO] Site Sustained — Malleswaram",
                "[DEMO] Malleswaram Sankey Tank site officially declared sustained after 90-day clean record. Community ownership transferred.",
                null, null, IMG_PARK);
        saveTimeline(tt11, verifier1, "MONITORING_COMPLETED", "[DEMO] 90-Day Final Checkpoint", "[DEMO] All 3 monitoring checkpoints passed with zero waste detected.", null, null, IMG_PARK);
        saveScore(verifier1, tt11, "MONITORING_COMPLETED", 20, "[DEMO] +20 pts for 90-day sustained monitoring");

        // TT-D12 — Marathahalli REOPENED — 30/60 clean, 90 waste detected → REOPENED
        saveCheckpoint(tt12, 30, now.minus(110, ChronoUnit.DAYS), "COMPLETED", false, "[DEMO] 30-day: Clean after first cleanup.", IMG_AFTER, verifier2, now.minus(110, ChronoUnit.DAYS));
        saveCheckpoint(tt12, 60, now.minus(80, ChronoUnit.DAYS),  "COMPLETED", false, "[DEMO] 60-day: Site still clear.", IMG_AFTER, verifier2, now.minus(80, ChronoUnit.DAYS));
        saveCheckpoint(tt12, 90, now.minus(50, ChronoUnit.DAYS),  "REOPENED",  true,  "[DEMO] 90-day check: Significant waste return detected under bridge. Site REOPENED.", IMG_DUMPING, verifier2, now.minus(50, ChronoUnit.DAYS));
        saveTimeline(tt12, verifier2, "SITE_REOPENED",
                "[DEMO] Site Reopened — Waste Returned at 90 Days",
                "[DEMO] Marathahalli Bridge: waste returned at 90-day inspection. Site reopened for second recovery mission cycle.",
                null, null, IMG_DUMPING);

        log.info("✅ Created monitoring checkpoints for TRANSFORMED, MONITORING, SUSTAINED, REOPENED sites.");

        // ──────────────────────────────────────────────
        // 9. AI ANALYSIS DOCUMENTS (MongoDB)
        // ──────────────────────────────────────────────

        saveAIAnalysis(tt06.getId(), "mock",
                List.of("Construction rubble: 75%", "Mixed debris: 15%", "Plastic packaging: 10%"),
                List.of(
                        "Install concrete barriers to prevent future illegal dumping",
                        "Partner with BBMP for regular debris removal patrol",
                        "Deploy CCTV surveillance at site perimeter"
                ),
                List.of("Community park", "Paved road margin with green buffer"),
                78,
                Map.of("severity_suggestion", "HIGH", "confidence", "82%",
                        "disclaimer", "⚠ DEMO DATA — AI estimates generated by MockAIService for hackathon demo. Do not treat as verified environmental data."));

        saveAIAnalysis(tt07.getId(), "mock",
                List.of("Organic waste: 40%", "Plastic: 30%", "Construction debris: 20%", "Other: 10%"),
                List.of(
                        "Immediate fencing to prevent continued access",
                        "Bioremediation treatment for organic layer",
                        "Community ownership model with monthly BBMP audits",
                        "Solar-powered surveillance cameras"
                ),
                List.of("Biodiverse community park", "Urban forest patch", "Waste segregation station"),
                92,
                Map.of("severity_suggestion", "CRITICAL", "confidence", "89%",
                        "disclaimer", "⚠ DEMO DATA — AI estimates generated by MockAIService for hackathon demo."));

        saveAIAnalysis(tt08.getId(), "mock",
                List.of("Organic food waste: 85%", "Paper/cardboard: 10%", "Plastic: 5%"),
                List.of(
                        "Install ventilated compost bins to manage organic accumulation",
                        "Engage RWA for weekly collection schedule",
                        "Create community kitchen garden with composted soil"
                ),
                List.of("Community composting hub", "Kitchen garden", "Sensory garden space"),
                65,
                Map.of("severity_suggestion", "LOW", "confidence", "91%",
                        "disclaimer", "⚠ DEMO DATA — AI estimates generated by MockAIService for hackathon demo."));

        saveAIAnalysis(tt02.getId(), "mock",
                List.of("E-waste (circuit boards, monitors): 60%", "Lithium batteries: 20%", "Plastic casings: 20%"),
                List.of(
                        "Emergency CPCB-certified e-waste collector engagement",
                        "Battery containment to prevent soil leaching",
                        "Public awareness campaign on proper e-waste disposal"
                ),
                List.of("E-waste aggregation centre", "Community recycling depot"),
                95,
                Map.of("severity_suggestion", "CRITICAL", "confidence", "94%",
                        "disclaimer", "⚠ DEMO DATA — AI estimates generated by MockAIService for hackathon demo."));

        log.info("✅ Created AI analysis documents (MongoDB) for 4 demo TrashTags.");

        log.info("╔══════════════════════════════════════════════════════╗");
        log.info("║        TrashTag Demo Data Seeder Complete! ✅         ║");
        log.info("║  20 users | 15 TrashTags | 6 missions               ║");
        log.info("║  All lifecycle stages demonstrated.                  ║");
        log.info("║  All records marked isDemo=true or labelled [DEMO].  ║");
        log.info("╚══════════════════════════════════════════════════════╝");
    }

    // ────────────────────────────────────────────────────────────────────────────
    //  Helper methods
    // ────────────────────────────────────────────────────────────────────────────

    private User saveUser(String username, String email, String encodedPw, UserRole role,
                          String displayName, String avatarUrl, String bio) {
        return userRepo.save(User.builder()
                .username(username).email(email).password(encodedPw)
                .role(role).displayName(displayName).avatarUrl(avatarUrl).bio(bio)
                .build());
    }

    private TrashTag saveTag(String tagCode, UUID reporterId, RecoveryStatus status,
                             WasteType wasteType, Severity severity, String title, String description,
                             double lat, double lon, String address,
                             Double estimatedKg, Double recoveredKg, String imageUrl,
                             Instant reportedAt, Instant verifiedAt, UUID verifiedBy) {
        TrashTag tag = TrashTag.builder()
                .tagCode(tagCode).reporterId(reporterId)
                .status(status).wasteType(wasteType).severity(severity)
                .title(title).description(description)
                .latitude(lat).longitude(lon).address(address)
                .estimatedWeightKg(estimatedKg).recoveredWeightKg(recoveredKg)
                .primaryImageUrl(imageUrl).isDemo(true)
                .verifiedAt(verifiedAt).verifiedBy(verifiedBy)
                .lastStatusChangedAt(reportedAt)
                .build();
        tag = trashTagRepo.save(tag);
        return tag;
    }

    private Mission saveMission(TrashTag tag, User creator, String title, String description,
                                MissionStatus status, Instant scheduledDate, Instant startedAt,
                                Instant completedAt, int maxParticipants,
                                String meetingPoint, double meetLat, double meetLon,
                                String equipment) {
        return missionRepo.save(Mission.builder()
                .trashTagId(tag.getId()).createdBy(creator.getId())
                .title(title).description(description).status(status)
                .scheduledDate(scheduledDate).startedAt(startedAt).completedAt(completedAt)
                .maxParticipants(maxParticipants)
                .meetingPoint(meetingPoint).meetingLatitude(meetLat).meetingLongitude(meetLon)
                .equipmentNeeded(equipment)
                .build());
    }

    private void saveParticipant(Mission mission, User user) {
        if (!participantRepo.existsByMissionIdAndUserId(mission.getId(), user.getId())) {
            participantRepo.save(MissionParticipant.builder()
                    .missionId(mission.getId()).userId(user.getId()).checkedIn(true)
                    .build());
        }
    }

    private void saveWasteRecord(Mission mission, TrashTag tag, User recorder,
                                 WasteType type, double kg, String imageUrl) {
        wasteRecordRepo.save(WasteRecord.builder()
                .missionId(mission.getId()).trashTagId(tag.getId())
                .recordedBy(recorder.getId()).wasteType(type).weightKg(kg)
                .notes("[DEMO] Waste record — fictional demo data only.")
                .imageUrl(imageUrl)
                .build());
    }

    private void saveTimeline(TrashTag tag, User actor, String eventType,
                              String title, String description,
                              UUID relatedId, String relatedType, String imageUrl) {
        timelineRepo.save(TimelineEvent.builder()
                .trashTagId(tag.getId()).actorId(actor.getId())
                .eventType(eventType).title(title).description(description)
                .relatedEntityId(relatedId).relatedEntityType(relatedType)
                .imageUrl(imageUrl)
                .build());
    }

    private void saveScore(User user, TrashTag tag, String eventType, int points, String desc) {
        if (!scoreEventRepo.existsByUserIdAndTrashTagIdAndEventType(user.getId(), tag.getId(), eventType)) {
            scoreEventRepo.save(ScoreEvent.builder()
                    .userId(user.getId()).trashTagId(tag.getId())
                    .eventType(eventType).points(points).description(desc)
                    .build());
        }
    }

    private void saveCheckpoint(TrashTag tag, int days, Instant scheduledDate, String status,
                                Boolean wasteDetected, String notes, String evidenceImageUrl,
                                User verifiedBy, Instant completedAt) {
        checkpointRepo.save(MonitoringCheckpoint.builder()
                .trashTagId(tag.getId()).checkpointDays(days)
                .scheduledDate(scheduledDate).status(status)
                .wasteDetected(wasteDetected).notes(notes)
                .evidenceImageUrl(evidenceImageUrl)
                .verifiedBy(verifiedBy != null ? verifiedBy.getId() : null)
                .completedAt(completedAt)
                .build());
    }

    private Transformation saveTransformation(TrashTag tag, User submitter,
                                              String type, String description,
                                              String preventionStrategy,
                                              String beforeImg, String afterImg,
                                              Instant transformedAt) {
        return transformationRepo.save(Transformation.builder()
                .trashTagId(tag.getId()).submittedBy(submitter.getId())
                .transformationType(type).description(description)
                .preventionStrategy(preventionStrategy)
                .beforeImageUrl(beforeImg).afterImageUrl(afterImg)
                .transformedAt(transformedAt)
                .build());
    }

    private void saveAIAnalysis(UUID trashTagId, String provider,
                                List<String> detectedWaste,
                                List<String> prevention,
                                List<String> transformation,
                                int riskScore,
                                Map<String, Object> metadata) {
        aiAnalysisRepo.save(AIAnalysisDocument.builder()
                .trashTagId(trashTagId).provider(provider)
                .prompt("[DEMO] Analyse the waste in this image and provide prevention recommendations.")
                .rawResponse("[DEMO] MockAIService response — fictional demo data for hackathon.")
                .detectedWasteCategories(detectedWaste)
                .preventionRecommendations(prevention)
                .transformationSuggestions(transformation)
                .riskScore(riskScore)
                .metadata(metadata)
                .build());
    }
}
