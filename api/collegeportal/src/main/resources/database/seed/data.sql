-- Insert default roles if they don't exist
INSERT INTO roles (id, name, created_at, updated_at) 
SELECT 1, 'ROLE_ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO roles (id, name, created_at, updated_at) 
SELECT 2, 'ROLE_FACULTY', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_FACULTY');

INSERT INTO roles (id, name, created_at, updated_at) 
SELECT 3, 'ROLE_STUDENT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_STUDENT');

-- Create a default admin user (password: admin123)
-- Password hash for 'admin123' using BCrypt
INSERT INTO users (id, full_name, email, password, enabled, approved, created_at, updated_at)
SELECT 1, 'System Administrator', 'admin@college.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1 OR email = 'admin@college.edu');

-- Assign admin role to the default admin user
INSERT INTO user_roles (user_id, role_id)
SELECT 1, 1
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 1 AND role_id = 1);