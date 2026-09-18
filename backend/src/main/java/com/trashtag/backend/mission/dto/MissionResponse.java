package com.trashtag.backend.mission.dto;

import com.trashtag.backend.common.enums.MissionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MissionResponse {
    private String id;
    private String trashTagId;
    private String trashTagCode;
    private String trashTagTitle;
    private String title;
    private String description;
    private MissionStatus status;
    private Instant scheduledDate;
    private Instant startedAt;
    private Instant completedAt;
    private Integer maxParticipants;
    private long currentParticipantsCount;
    private boolean joinedByCurrentUser;
    private Double targetWasteKg;
    private String meetingPoint;
    private Double meetingLatitude;
    private Double meetingLongitude;
    private String equipmentNeeded;
    private String createdBy;
    private String creatorName;
    private Instant createdAt;
    private Instant updatedAt;
}

