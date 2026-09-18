package com.trashtag.backend.dashboard.controller;

import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.dashboard.dto.DashboardResponse;
import com.trashtag.backend.dashboard.service.DashboardService;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        User currentUser = null;
        try {
            currentUser = userService.getCurrentUser();
        } catch (Exception e) {
            log.debug("No authenticated user present for dashboard endpoint call");
        }

        DashboardResponse response = dashboardService.getDashboardData(currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}

