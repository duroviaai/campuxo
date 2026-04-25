package com.collegeportal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner dropLegacyConstraints() {
        return args -> {
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE class_batches DROP CONSTRAINT IF EXISTS uk55x53g6fjamof7k7hivdhfaf1"
                );
                log.info("Legacy constraint uk55x53g6fjamof7k7hivdhfaf1 dropped (or did not exist).");
            } catch (Exception e) {
                log.warn("Could not drop legacy constraint: {}", e.getMessage());
            }
        };
    }
}
