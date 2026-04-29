CREATE TABLE IF NOT EXISTS registration_windows (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    role VARCHAR(20) NOT NULL,
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    allowed_year_of_study INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (batch_id, role, allowed_year_of_study)
);
