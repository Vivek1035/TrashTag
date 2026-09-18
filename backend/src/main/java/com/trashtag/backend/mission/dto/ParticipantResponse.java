package com.trashtag.backend.mission.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ParticipantResponse {
    private String id;
    private String missionId;
    private String userId;
    private String userName;
    private String userAvatarUrl;
    private boolean checkedIn;
    private Instant checkedInAt;
    private Instant joinedAt;
}

