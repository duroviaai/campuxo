-- First add column as nullable
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected BOOLEAN;

-- Set default value for existing rows
UPDATE users SET rejected = FALSE WHERE rejected IS NULL;

-- Now make it NOT NULL with default
ALTER TABLE users ALTER COLUMN rejected SET NOT NULL;
ALTER TABLE users ALTER COLUMN rejected SET DEFAULT FALSE;

-- Add rejection reason column
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
