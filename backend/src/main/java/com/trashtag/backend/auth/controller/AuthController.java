package com.trashtag.backend.auth.controller;

import com.trashtag.backend.auth.dto.AuthResponse;
import com.trashtag.backend.auth.dto.LoginRequest;
import com.trashtag.backend.auth.dto.RegisterRequest;
import com.trashtag.backend.auth.service.AuthService;
import com.trashtag.backend.common.api.ApiResponse;
import com.trashtag.backend.user.dto.UserProfileDto;
import com.trashtag.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    /**
     * POST /api/auth/register
     * Register a new user account.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Account created successfully.", response));
    }

    /**
     * POST /api/auth/login
     * Authenticate with username/email + password; returns JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful.", response));
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user's profile.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileDto>> me() {
        UserProfileDto profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}

