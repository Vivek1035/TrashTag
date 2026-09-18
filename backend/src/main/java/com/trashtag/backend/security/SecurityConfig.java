package com.trashtag.backend.security;

import com.trashtag.backend.security.jwt.JwtAccessDeniedHandler;
import com.trashtag.backend.security.jwt.JwtAuthenticationEntryPoint;
import com.trashtag.backend.security.jwt.JwtAuthenticationFilter;
import com.trashtag.backend.security.services.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint authEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {}) // uses CorsConfig bean
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth

                // ── Fully public ──────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                // Public read — TrashTags
                .requestMatchers(HttpMethod.GET, "/api/trash-tags").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/trash-tags/{id}").permitAll()

                // Public read — Missions
                .requestMatchers(HttpMethod.GET, "/api/missions").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/missions/{id}").permitAll()

                // Public read — Leaderboard
                .requestMatchers(HttpMethod.GET, "/api/leaderboard").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/leaderboard/**").permitAll()

                // ── Authenticated (any role) ───────────────────────────
                .requestMatchers(HttpMethod.GET,  "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/trash-tags").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/missions/{id}/join").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/missions/{id}/leave").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/missions/{id}/complete").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/missions/{id}/field/**").authenticated()
                .requestMatchers("/api/evidence/**").authenticated()
                .requestMatchers("/api/timeline/**").authenticated()
                .requestMatchers("/api/monitoring/**").authenticated()

                // ── VERIFIER or ADMIN ─────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/trash-tags/{id}/verify").hasAnyRole("VERIFIER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/trash-tags/{id}/recovery/verify").hasAnyRole("VERIFIER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/recovery/**").hasAnyRole("VERIFIER", "ADMIN")

                // ── ADMIN only ────────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                // ── ORGANIZATION or ADMIN — mission creation ──────────
                .requestMatchers(HttpMethod.POST, "/api/missions").hasAnyRole("ORGANIZATION", "ADMIN")

                // ── Default: require authentication ───────────────────
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
