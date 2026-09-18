package com.trashtag.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.trashtag.backend.config.TestMongoConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestMongoConfig.class)
class TrashtagBackendApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context starts successfully with test profile
    }
}
