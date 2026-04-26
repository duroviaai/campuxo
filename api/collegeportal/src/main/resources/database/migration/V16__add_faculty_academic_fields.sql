-- V16: Add academic profile fields to faculty table
ALTER TABLE faculty
    ADD COLUMN IF NOT EXISTS qualification  VARCHAR(50),
    ADD COLUMN IF NOT EXISTS experience     INTEGER,
    ADD COLUMN IF NOT EXISTS subjects       VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS joining_date   DATE;
