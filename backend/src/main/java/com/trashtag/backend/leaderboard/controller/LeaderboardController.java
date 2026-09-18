package com.trashtag.backend.leaderboard.controller;

import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.leaderboard.dto.LeaderboardResponse;
import com.trashtag.backend.leaderboard.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getLeaderboard() {
        LeaderboardResponse response = leaderboardService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}

