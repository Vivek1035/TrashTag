package com.trashtag.backend.auth.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Returned by /api/auth/login and /api/auth/register
 */
@Data
@Builder
public class AuthResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UserSummary user;

    @Data
    @Builder
    public static class UserSummary {
        private String id;
        private String username;
        private String email;
        private String displayName;
        private String role;
    }
}

