ALTER TABLE faculty_course_assignments
    ALTER COLUMN class_batch_id DROP NOT NULL;

ALTER TABLE faculty_course_assignments
    DROP COLUMN IF EXISTS class_batch_id;
