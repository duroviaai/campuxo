CREATE TABLE internal_assessments (
    id               BIGSERIAL PRIMARY KEY,
    student_id       BIGINT       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id        BIGINT       NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    class_structure_id BIGINT     NOT NULL REFERENCES class_structure(id) ON DELETE CASCADE,
    ia_number        SMALLINT     NOT NULL CHECK (ia_number BETWEEN 1 AND 3),
    marks_obtained   NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
    max_marks        NUMERIC(5,2) NOT NULL DEFAULT 50 CHECK (max_marks > 0),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_ia UNIQUE (student_id, course_id, class_structure_id, ia_number)
);

CREATE INDEX idx_ia_class_course ON internal_assessments (class_structure_id, course_id);
CREATE INDEX idx_ia_student       ON internal_assessments (student_id);
