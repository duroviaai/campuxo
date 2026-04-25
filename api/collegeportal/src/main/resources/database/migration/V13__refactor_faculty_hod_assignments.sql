-- ─────────────────────────────────────────────────────────────────────────────
-- V13: Refactor Faculty / HOD / Course-Assignment
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add role, designation, status to faculty table
ALTER TABLE faculty
    ADD COLUMN IF NOT EXISTS role        VARCHAR(10)  NOT NULL DEFAULT 'faculty'
                                         CHECK (role IN ('faculty', 'hod')),
    ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
    ADD COLUMN IF NOT EXISTS status      VARCHAR(10)  NOT NULL DEFAULT 'active'
                                         CHECK (status IN ('active', 'inactive'));

-- 2. Enforce exactly ONE HOD per department (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS uk_faculty_hod_per_dept
    ON faculty (department)
    WHERE role = 'hod';

-- 3. Migrate existing HOD role from user_roles → faculty.role
UPDATE faculty f
SET    role = 'hod'
WHERE  EXISTS (
    SELECT 1
    FROM   user_roles ur
    JOIN   roles r ON r.id = ur.role_id
    WHERE  ur.user_id = f.user_id
    AND    r.name     = 'ROLE_HOD'
);

-- 4. Add class_structure_id to faculty_course_assignments (replaces class_batch_id)
ALTER TABLE faculty_course_assignments
    ADD COLUMN IF NOT EXISTS class_structure_id BIGINT
        REFERENCES class_structure(id) ON DELETE SET NULL;

-- 5. Drop old nullable class_batch_id column (data already migrated via class_structure)
--    Keep it nullable first so existing rows are not broken; drop after app deploy
ALTER TABLE faculty_course_assignments
    ALTER COLUMN class_batch_id DROP NOT NULL;

-- 6. New unique constraint: one assignment per (faculty, course, class_structure)
ALTER TABLE faculty_course_assignments
    DROP CONSTRAINT IF EXISTS uk_fca_faculty_course_class;

ALTER TABLE faculty_course_assignments
    ADD CONSTRAINT uk_fca_faculty_course_class
        UNIQUE (faculty_id, course_id, class_structure_id);

-- 7. Remove course.faculty_id (single-faculty field — replaced by assignment table)
--    First nullify all references so FK is safe to drop
UPDATE courses SET faculty_id = NULL WHERE faculty_id IS NOT NULL;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_faculty_id_fkey;
ALTER TABLE courses DROP COLUMN IF EXISTS faculty_id;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_fca_faculty          ON faculty_course_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fca_course           ON faculty_course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_fca_class_structure  ON faculty_course_assignments(class_structure_id);
CREATE INDEX IF NOT EXISTS idx_faculty_dept_role    ON faculty(department, role);
