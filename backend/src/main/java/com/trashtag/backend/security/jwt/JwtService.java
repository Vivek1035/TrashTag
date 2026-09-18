package com.trashtag.backend.security.jwt;

import com.trashtag.backend.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

/**
 * JwtService — generates and validates JWT tokens.
 *
 * Payload claims:
 *   sub   → username
 *   userId → UUID string
 *   email  → user email
 *   role   → e.g. ROLE_USER
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${trashtag.app.jwt-secret}")
    private String jwtSecret;

    @Value("${trashtag.app.jwt-expiration-ms}")
    private long jwtExpirationMs;

    // ── Token generation ──────────────────────────────────────

    public String generateToken(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return buildToken(principal);
    }

    public String generateToken(UserDetailsImpl principal) {
        return buildToken(principal);
    }

    private String buildToken(UserDetailsImpl principal) {
        String role = principal.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("ROLE_USER");

        return Jwts.builder()
                .setSubject(principal.getUsername())
                .claim("userId", principal.getId().toString())
                .claim("email",  principal.getEmail())
                .claim("role",   role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Claims extraction ─────────────────────────────────────

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public UUID extractUserId(String token) {
        String id = parseClaims(token).get("userId", String.class);
        return UUID.fromString(id);
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    // ── Validation ────────────────────────────────────────────

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT malformed: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT empty/null claims: {}", e.getMessage());
        } catch (io.jsonwebtoken.security.SecurityException e) {
            log.warn("JWT signature invalid: {}", e.getMessage());
        }
        return false;
    }

    // ── Internals ─────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}

