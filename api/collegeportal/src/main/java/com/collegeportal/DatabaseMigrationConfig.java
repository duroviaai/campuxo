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
            runSilently("ALTER TABLE class_batches DROP CONSTRAINT IF EXISTS uk55x53g6fjamof7k7hivdhfaf1");
            runSilently("ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_check");
            runSilently("INSERT INTO roles (name) VALUES ('ROLE_HOD') ON CONFLICT (name) DO NOTHING");
            runSilently(
                "UPDATE faculty f SET department_id = d.id " +
                "FROM departments d " +
                "WHERE f.department = d.name AND f.department_id IS NULL"
            );
            runSilently("ALTER TABLE faculty_course_assignments ALTER COLUMN class_batch_id DROP NOT NULL");
            runSilently("ALTER TABLE faculty_course_assignments DROP COLUMN IF EXISTS class_batch_id");
            runSilently("ALTER TABLE registration_windows ALTER COLUMN batch_id DROP NOT NULL");
            runSilently("ALTER TABLE registration_windows ALTER COLUMN allowed_year_of_study DROP NOT NULL");
            log.info("Startup migrations applied.");
        };
    }

    private void runSilently(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            log.warn("Startup migration warning: {}", e.getMessage());
        }
    }
}
