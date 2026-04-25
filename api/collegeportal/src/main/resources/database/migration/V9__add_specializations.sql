CREATE TABLE IF NOT EXISTS specializations (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    scheme     VARCHAR(10)  NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_specialization_name_dept_scheme UNIQUE (name, department, scheme)
);

ALTER TABLE class_batches ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);
