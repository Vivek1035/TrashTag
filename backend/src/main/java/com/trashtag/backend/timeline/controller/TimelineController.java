package com.trashtag.backend.timeline.controller;

import com.trashtag.backend.timeline.dto.TimelineEventResponse;
import com.trashtag.backend.timeline.service.TimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping("/timeline")
    public ResponseEntity<Page<TimelineEventResponse>> getGlobalTimeline(
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TimelineEventResponse> timeline = timelineService.getGlobalTimeline(eventType, pageable);
        return ResponseEntity.ok(timeline);
    }
}

