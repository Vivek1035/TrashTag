package com.trashtag.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trashtag.backend.auth.dto.LoginRequest;
import com.trashtag.backend.auth.dto.RegisterRequest;
import com.trashtag.backend.common.enums.UserRole;
import com.trashtag.backend.user.entity.User;
import com.trashtag.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.trashtag.backend.config.TestMongoConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
@Transactional
@DisplayName("Auth Integration Tests")
class AuthIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private static final String REGISTER_URL = "/api/auth/register";
    private static final String LOGIN_URL     = "/api/auth/login";
    private static final String ME_URL        = "/api/auth/me";

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    // ── Register ──────────────────────────────────────────────

    @Test
    @DisplayName("Register: success → 201 with token")
    void register_success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice Smith");
        req.setEmail("alice@example.com");
        req.setPassword("password123");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("alice@example.com"))
                .andExpect(jsonPath("$.data.user.displayName").value("Alice Smith"))
                .andExpect(jsonPath("$.data.user.role").value("USER"));

        assertThat(userRepository.existsByEmail("alice@example.com")).isTrue();
    }

    @Test
    @DisplayName("Register: duplicate email → 409")
    void register_duplicateEmail_conflict() throws Exception {
        createTestUser("bob@example.com", "bob", "password123");

        RegisterRequest req = new RegisterRequest();
        req.setName("Bob Clone");
        req.setEmail("bob@example.com");
        req.setPassword("password123");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Duplicate Operation"));
    }

    @Test
    @DisplayName("Register: missing name → 400 validation error")
    void register_missingName_badRequest() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("name")));
    }

    @Test
    @DisplayName("Register: invalid email → 400 validation error")
    void register_invalidEmail_badRequest() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Charlie");
        req.setEmail("not-an-email");
        req.setPassword("password123");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("email")));
    }

    @Test
    @DisplayName("Register: password too short → 400 validation error")
    void register_shortPassword_badRequest() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Dave");
        req.setEmail("dave@example.com");
        req.setPassword("short");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("password")));
    }

    // ── Login ─────────────────────────────────────────────────

    @Test
    @DisplayName("Login: success by username → 200 with token")
    void login_byUsername_success() throws Exception {
        createTestUser("eve@example.com", "eve_user", "securePass1");

        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("eve_user");
        req.setPassword("securePass1");

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.username").value("eve_user"));
    }

    @Test
    @DisplayName("Login: success by email → 200 with token")
    void login_byEmail_success() throws Exception {
        createTestUser("frank@example.com", "frank_user", "securePass1");

        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("frank@example.com");
        req.setPassword("securePass1");

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value("frank@example.com"));
    }

    @Test
    @DisplayName("Login: wrong password → 401")
    void login_wrongPassword_unauthorized() throws Exception {
        createTestUser("grace@example.com", "grace_user", "correctPass1");

        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("grace_user");
        req.setPassword("wrongPass!");

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Login: non-existent user → 401")
    void login_unknownUser_unauthorized() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("nobody@example.com");
        req.setPassword("password123");

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── /me ───────────────────────────────────────────────────

    @Test
    @DisplayName("GET /me: with valid token → 200 with profile")
    void getMe_authenticated_success() throws Exception {
        String token = registerAndGetToken("helen@example.com", "Helen Green", "myPass123!");

        mockMvc.perform(get(ME_URL)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("helen@example.com"))
                .andExpect(jsonPath("$.data.displayName").value("Helen Green"))
                .andExpect(jsonPath("$.data.role").value("USER"));
    }

    @Test
    @DisplayName("GET /me: no token → 401")
    void getMe_noToken_unauthorized() throws Exception {
        mockMvc.perform(get(ME_URL))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("GET /me: malformed token → 401")
    void getMe_badToken_unauthorized() throws Exception {
        mockMvc.perform(get(ME_URL)
                        .header("Authorization", "Bearer this.is.not.a.valid.jwt"))
                .andExpect(status().isUnauthorized());
    }

    // ── Security — public endpoints don't require auth ────────

    @Test
    @DisplayName("GET /api/trash-tags is public → 200 (empty list)")
    void publicEndpoint_noAuth_allowed() throws Exception {
        mockMvc.perform(get("/api/trash-tags"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/trash-tags without auth → 401")
    void createTrashTag_noAuth_unauthorized() throws Exception {
        mockMvc.perform(post("/api/trash-tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ── Helpers ───────────────────────────────────────────────

    private User createTestUser(String email, String username, String rawPassword) {
        User user = User.builder()
                .email(email)
                .username(username)
                .displayName(username)
                .password(passwordEncoder.encode(rawPassword))
                .role(UserRole.USER)
                .build();
        return userRepository.save(user);
    }

    private String registerAndGetToken(String email, String name, String password) throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail(email);
        req.setName(name);
        req.setPassword(password);

        MvcResult result = mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        return objectMapper.readTree(body)
                .path("data")
                .path("accessToken")
                .asText();
    }
}

