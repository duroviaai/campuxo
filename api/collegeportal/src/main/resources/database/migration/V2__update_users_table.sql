-- Migration to update users table for new registration system
-- Run this script to update your existing database

-- Add new columns to users table
ALTER TABLE users ADD COLUMN full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN registration_number VARCHAR(50);
ALTER TABLE users ADD COLUMN faculty_id VARCHAR(50);
ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;

-- Update existing users to have full_name (copy from username if exists)
UPDATE users SET full_name = username WHERE full_name IS NULL;

-- Make full_name not null after copying data
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Remove unique constraint from username (if you want to keep the column)
-- Or drop the username column entirely if not needed
-- ALTER TABLE users DROP COLUMN username;

-- Update enabled default to false for new registrations
ALTER TABLE users ALTER COLUMN enabled SET DEFAULT FALSE;