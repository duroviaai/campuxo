-- V15: Fix roles_name_check constraint blocking ROLE_HOD
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_check;
INSERT INTO roles (name) VALUES ('ROLE_HOD') ON CONFLICT (name) DO NOTHING;
