package com.trashtag.backend.leaderboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBadgeDTO {
    private String id;
    private String name;
    private String description;
    private String icon;
    private String level; // e.g., BRONZE, SILVER, GOLD, PLATINUM
    private Instant earnedAt;
}

