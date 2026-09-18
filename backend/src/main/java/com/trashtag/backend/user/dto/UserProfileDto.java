package com.trashtag.backend.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * Public-facing user profile DTO — never exposes passwords or internal fields.
 */
@Data
@Builder
public class UserProfileDto {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private String role;
    private Instant createdAt;
}

