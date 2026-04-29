CREATE TABLE IF NOT EXISTS timetable_entries (
    id BIGSERIAL PRIMARY KEY,
    class_structure_id BIGINT NOT NULL REFERENCES class_structure(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id BIGINT REFERENCES faculty(id) ON DELETE SET NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    type VARCHAR(20) NOT NULL DEFAULT 'LECTURE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timetable_class_structure
    ON timetable_entries(class_structure_id);

CREATE INDEX IF NOT EXISTS idx_timetable_faculty
    ON timetable_entries(faculty_id);
