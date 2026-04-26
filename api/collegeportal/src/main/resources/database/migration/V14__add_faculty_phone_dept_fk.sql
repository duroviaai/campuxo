-- V14: Add all missing columns to faculty table

-- Add nullable columns first (safe for existing rows)
ALTER TABLE faculty
    ADD COLUMN IF NOT EXISTS phone         VARCHAR(20),
    ADD COLUMN IF NOT EXISTS designation   VARCHAR(100),
    ADD COLUMN IF NOT EXISTS department_id BIGINT
        REFERENCES departments(id) ON DELETE SET NULL;

-- Add role with a default so existing rows get a value
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'faculty';
UPDATE faculty SET role = 'faculty' WHERE role IS NULL;
ALTER TABLE faculty ALTER COLUMN role SET NOT NULL;
ALTER TABLE faculty ADD CONSTRAINT IF NOT EXISTS faculty_role_check CHECK (role IN ('faculty', 'hod'));

-- Add status with a default so existing rows get a value
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'active';
UPDATE faculty SET status = 'active' WHERE status IS NULL;
ALTER TABLE faculty ALTER COLUMN status SET NOT NULL;
ALTER TABLE faculty ADD CONSTRAINT IF NOT EXISTS faculty_status_check CHECK (status IN ('active', 'inactive'));

-- HOD partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS uk_faculty_hod_per_dept ON faculty (department) WHERE role = 'hod';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faculty_department_id ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_dept_role ON faculty(department, role);
