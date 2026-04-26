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
                jdbcTemplate.execute(
                    "ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_check"
                );
                jdbcTemplate.execute(
                    "INSERT INTO roles (name) VALUES ('ROLE_HOD') ON CONFLICT (name) DO NOTHING"
                );
                // Back-fill department_id for legacy faculty rows that have department name but no FK
                jdbcTemplate.execute(
                    "UPDATE faculty f SET department_id = d.id " +
                    "FROM departments d " +
                    "WHERE f.department = d.name AND f.department_id IS NULL"
                );
                // Drop class_batch_id NOT NULL constraint and column (replaced by class_structure_id)
                jdbcTemplate.execute(
                    "ALTER TABLE faculty_course_assignments ALTER COLUMN class_batch_id DROP NOT NULL"
                );
                jdbcTemplate.execute(
                    "ALTER TABLE faculty_course_assignments DROP COLUMN IF EXISTS class_batch_id"
                );
                log.info("Legacy constraints dropped, ROLE_HOD ensured, faculty department_id back-filled.");
            } catch (Exception e) {
                log.warn("Startup migration warning: {}", e.getMessage());
            }
        };
    }
}
