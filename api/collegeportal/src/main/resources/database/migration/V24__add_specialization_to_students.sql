ALTER TABLE students ADD COLUMN IF NOT EXISTS specialization_id BIGINT;
ALTER TABLE students ADD CONSTRAINT fk_student_specialization
  FOREIGN KEY (specialization_id) REFERENCES specializations(id);
