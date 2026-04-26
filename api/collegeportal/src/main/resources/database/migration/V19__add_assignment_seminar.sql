CREATE TABLE assignments (
    id                 BIGSERIAL    PRIMARY KEY,
    student_id         BIGINT       NOT NULL REFERENCES students(id)         ON DELETE CASCADE,
    course_id          BIGINT       NOT NULL REFERENCES courses(id)           ON DELETE CASCADE,
    class_structure_id BIGINT       NOT NULL REFERENCES class_structure(id)   ON DELETE CASCADE,
    submitted          BOOLEAN      NOT NULL DEFAULT FALSE,
    marks_obtained     NUMERIC(5,2)          CHECK (marks_obtained >= 0),
    max_marks          NUMERIC(5,2) NOT NULL DEFAULT 10 CHECK (max_marks > 0),
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_assignment UNIQUE (student_id, course_id, class_structure_id)
);

CREATE TABLE seminars (
    id                 BIGSERIAL    PRIMARY KEY,
    student_id         BIGINT       NOT NULL REFERENCES students(id)         ON DELETE CASCADE,
    course_id          BIGINT       NOT NULL REFERENCES courses(id)           ON DELETE CASCADE,
    class_structure_id BIGINT       NOT NULL REFERENCES class_structure(id)   ON DELETE CASCADE,
    done               BOOLEAN      NOT NULL DEFAULT FALSE,
    script_submitted   BOOLEAN      NOT NULL DEFAULT FALSE,
    marks_obtained     NUMERIC(5,2)          CHECK (marks_obtained >= 0),
    max_marks          NUMERIC(5,2) NOT NULL DEFAULT 10 CHECK (max_marks > 0),
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_seminar UNIQUE (student_id, course_id, class_structure_id)
);

CREATE INDEX idx_assignment_class_course ON assignments (class_structure_id, course_id);
CREATE INDEX idx_seminar_class_course    ON seminars    (class_structure_id, course_id);
