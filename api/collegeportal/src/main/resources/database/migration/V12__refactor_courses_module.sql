-- ─────────────────────────────────────────────────────────────────────────────
-- V12: Refactor Courses Module — normalized batches + class_structure
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Batches (replaces the "parent batch" concept in class_batches)
CREATE TABLE IF NOT EXISTS batches (
    id         BIGSERIAL PRIMARY KEY,
    start_year INTEGER      NOT NULL,
    end_year   INTEGER      NOT NULL,
    scheme     VARCHAR(10)  NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_batch_years_scheme UNIQUE (start_year, end_year, scheme)
);

-- 2. Specializations: add FK to departments table (keep backward-compat columns)
ALTER TABLE specializations
    ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL;

-- 3. Normalized class structure (replaces overloaded class_batches rows)
CREATE TABLE IF NOT EXISTS class_structure (
    id                 BIGSERIAL PRIMARY KEY,
    batch_id           BIGINT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    department_id      BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    specialization_id  BIGINT REFERENCES specializations(id) ON DELETE SET NULL,
    year_of_study      INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 3),
    semester           INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 6),
    created_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_class_structure UNIQUE (batch_id, department_id, specialization_id, year_of_study, semester)
);

-- 4. Fix course code uniqueness: scoped to department (not globally unique)
--    First drop the old global unique constraint if it exists
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_code_key;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS uk_course_code_dept;
ALTER TABLE courses ADD CONSTRAINT uk_course_code_dept UNIQUE (code, department_id);

-- 5. New course-to-class mapping table (replaces the ManyToMany via class_batch_courses)
CREATE TABLE IF NOT EXISTS class_structure_courses (
    id                 BIGSERIAL PRIMARY KEY,
    class_structure_id BIGINT NOT NULL REFERENCES class_structure(id) ON DELETE CASCADE,
    course_id          BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at         TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_class_structure_course UNIQUE (class_structure_id, course_id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_class_structure_batch      ON class_structure(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_structure_dept       ON class_structure(department_id);
CREATE INDEX IF NOT EXISTS idx_class_structure_spec       ON class_structure(specialization_id);
CREATE INDEX IF NOT EXISTS idx_class_structure_courses_cs ON class_structure_courses(class_structure_id);
CREATE INDEX IF NOT EXISTS idx_class_structure_courses_c  ON class_structure_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_dept               ON courses(department_id);
