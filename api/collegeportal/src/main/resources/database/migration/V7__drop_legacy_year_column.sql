-- V6 may have failed to drop the old year column on some environments.
-- This migration ensures it is removed so inserts using start_year/end_year succeed.
ALTER TABLE class_batches DROP COLUMN IF EXISTS year;
