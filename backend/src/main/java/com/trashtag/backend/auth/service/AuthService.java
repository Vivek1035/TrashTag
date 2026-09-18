package com.trashtag.backend.auth.service;

import com.trashtag.backend.auth.dto.AuthResponse;
import com.trashtag.backend.auth.dto.LoginRequest;
import com.trashtag.backend.auth.dto.RegisterRequest;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.common.exception.DuplicateOperationException;
import com.trashtag.backend.security.jwt.JwtService;
import com.trashtag.backend.security.services.UserDetailsImpl;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService — encapsulates register and login business logic.
 * The controller is kept thin; all rules live here.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // Generate a unique username from the email prefix
        String baseUsername = req.getEmail().split("@")[0].toLowerCase()
                .replaceAll("[^a-z0-9_]", "_");
        String username = ensureUniqueUsername(baseUsername);

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateOperationException(
                    "An account with this email already exists.");
        }

        User user = User.builder()
                .username(username)
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .displayName(req.getName())
                .role(UserRole.USER)
                .build();

        userRepository.save(user);

        // Auto-login after registration
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtService.generateToken(auth);
        return buildAuthResponse(token, principal, user.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getUsernameOrEmail(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtService.generateToken(auth);

        String role = principal.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("USER");

        return buildAuthResponse(token, principal, role);
    }

    // ── Helpers ───────────────────────────────────────────────

    private String ensureUniqueUsername(String base) {
        if (!userRepository.existsByUsername(base)) return base;
        int i = 1;
        while (userRepository.existsByUsername(base + i)) i++;
        return base + i;
    }

    private AuthResponse buildAuthResponse(String token, UserDetailsImpl p, String role) {
        return AuthResponse.builder()
                .accessToken(token)
                .user(AuthResponse.UserSummary.builder()
                        .id(p.getId().toString())
                        .username(p.getUsername())
                        .email(p.getEmail())
                        .displayName(p.getDisplayName())
                        .role(role)
                        .build())
                .build();
    }
}

