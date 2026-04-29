ALTER TABLE students ADD COLUMN IF NOT EXISTS class_structure_id BIGINT;
ALTER TABLE students ADD CONSTRAINT fk_student_class_structure
  FOREIGN KEY (class_structure_id) REFERENCES class_structure(id);
