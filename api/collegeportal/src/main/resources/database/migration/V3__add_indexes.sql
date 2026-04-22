-- Add indexes for frequently queried columns to speed up queries

CREATE INDEX IF NOT EXISTS idx_student_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_student_class_batch ON students(class_batch_id);
CREATE INDEX IF NOT EXISTS idx_student_user ON students(user_id);

CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved) WHERE approved = false;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_course_students_student ON course_students(student_id);
CREATE INDEX IF NOT EXISTS idx_course_students_course ON course_students(course_id);
