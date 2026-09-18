package com.trashtag.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@Profile("!test")
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = {
        "com.trashtag.backend.ai.repository",
        "com.trashtag.backend.evidence.repository"
})
public class MongoConfig {
}
