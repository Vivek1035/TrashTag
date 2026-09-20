package com.trashtag.backend.demo.controller;

import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.demo.service.DemoService;
import com.trashtag.backend.trashtag.dto.TrashTagResponse;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for Hackathon Demo Mode.
 * Safe & disabled in production via @Profile("!prod").
 */
@RestController
@RequestMapping("/api/demo")
@Profile("!prod")
@RequiredArgsConstructor
public class DemoController {

    private final DemoService demoService;
    private final UserService userService;

    /**
     * POST /api/demo/create
     * Instantiates a new demo TrashTag for 15-step lifecycle simulation
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<TrashTagResponse>> createDemoTag() {
        User currentUser = userService.getCurrentUser();
        TrashTagResponse res = demoService.createDemoTag(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Demo TrashTag created for lifecycle simulation", res));
    }

    /**
     * POST /api/demo/{tagId}/step/{stepNumber}
     * Advances demo tag to step (1 to 15) using real services
     */
    @PostMapping("/{tagId}/step/{stepNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> advanceStep(
            @PathVariable UUID tagId,
            @PathVariable int stepNumber,
            @RequestParam(required = false, defaultValue = "false") boolean wasteReturned) {
        User currentUser = userService.getCurrentUser();
        Map<String, Object> result = demoService.advanceDemoStep(tagId, stepNumber, wasteReturned, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Advanced to demo step " + stepNumber, result));
    }

    /**
     * POST /api/demo/{tagId}/auto-run
     * Auto-runs all 15 steps sequentially for instant hackathon demonstration
     */
    @PostMapping("/{tagId}/auto-run")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> autoRun(
            @PathVariable UUID tagId,
            @RequestParam(required = false, defaultValue = "false") boolean wasteReturned) {
        User currentUser = userService.getCurrentUser();
        List<Map<String, Object>> results = demoService.autoRunFullDemoSequence(tagId, wasteReturned, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Executed full 15-step lifecycle demo sequence", results));
    }
}
