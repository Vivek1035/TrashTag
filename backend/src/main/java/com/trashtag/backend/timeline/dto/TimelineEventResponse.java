package com.trashtag.backend.timeline.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimelineEventResponse {
    private String id;
    private String trashTagId;
    private String actorId;
    private String actorName;
    private String eventType;
    private String title;
    private String description;
    private String relatedEntityId;
    private String relatedEntityType;
    private String imageUrl;
    private Instant createdAt;
}

