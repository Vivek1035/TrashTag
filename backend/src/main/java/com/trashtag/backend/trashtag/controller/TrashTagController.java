package com.trashtag.backend.trashtag.controller;

import com.trashtag.backend.common.api.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * TrashTagController — stub for Phase 2.
 * Public GET endpoints are wired here to satisfy security config.
 */
@RestController
@RequestMapping("/api/trash-tags")
public class TrashTagController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Object>>> listTrashTags() {
        // Phase 2 will implement real pagination and filtering
        return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }
}

