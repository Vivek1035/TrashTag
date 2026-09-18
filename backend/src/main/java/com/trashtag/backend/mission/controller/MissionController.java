package com.trashtag.backend.mission.controller;

import com.trashtag.backend.common.enums.MissionStatus;
import com.trashtag.backend.mission.dto.CompleteMissionRequest;
import com.trashtag.backend.mission.dto.CreateMissionRequest;
import com.trashtag.backend.mission.dto.MissionResponse;
import com.trashtag.backend.mission.dto.ParticipantResponse;
import com.trashtag.backend.mission.service.MissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<MissionResponse> createMission(@Valid @RequestBody CreateMissionRequest request) {
        MissionResponse response = missionService.createMission(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<MissionResponse>> getMissions(
            @RequestParam(required = false) MissionStatus status,
            @RequestParam(required = false) UUID trashTagId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<MissionResponse> missions = missionService.getMissions(status, trashTagId, pageable);
        return ResponseEntity.ok(missions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissionResponse> getMissionById(@PathVariable UUID id) {
        MissionResponse mission = missionService.getMissionById(id);
        return ResponseEntity.ok(mission);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<MissionResponse> joinMission(@PathVariable UUID id) {
        MissionResponse response = missionService.joinMission(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<MissionResponse> leaveMission(@PathVariable UUID id) {
        MissionResponse response = missionService.leaveMission(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<MissionResponse> startMission(@PathVariable UUID id) {
        MissionResponse response = missionService.startMission(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<MissionResponse> completeMission(@PathVariable UUID id, @Valid @RequestBody CompleteMissionRequest request) {
        MissionResponse response = missionService.completeMission(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<ParticipantResponse>> getParticipants(@PathVariable UUID id) {
        List<ParticipantResponse> participants = missionService.getParticipants(id);
        return ResponseEntity.ok(participants);
    }
}
