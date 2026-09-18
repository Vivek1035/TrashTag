package com.trashtag.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = {
        "com.trashtag.backend.user.repository",
        "com.trashtag.backend.trashtag.repository",
        "com.trashtag.backend.mission.repository",
        "com.trashtag.backend.recovery.repository",
        "com.trashtag.backend.transformation.repository",
        "com.trashtag.backend.monitoring.repository",
        "com.trashtag.backend.timeline.repository",
        "com.trashtag.backend.leaderboard.repository"
})
public class JpaConfig {
}

