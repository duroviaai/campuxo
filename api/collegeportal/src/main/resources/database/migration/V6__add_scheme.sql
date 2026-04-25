-- Replace year column with start_year and end_year in class_batches
ALTER TABLE class_batches ADD COLUMN IF NOT EXISTS start_year INTEGER;
ALTER TABLE class_batches ADD COLUMN IF NOT EXISTS end_year INTEGER;

-- Migrate existing year data: treat old year as start_year, end_year = start_year + 3
UPDATE class_batches SET start_year = year, end_year = year + 3 WHERE start_year IS NULL;

ALTER TABLE class_batches ALTER COLUMN start_year SET NOT NULL;
ALTER TABLE class_batches ALTER COLUMN end_year SET NOT NULL;

-- Add scheme column if not already present
ALTER TABLE class_batches ADD COLUMN IF NOT EXISTS scheme VARCHAR(10);
UPDATE class_batches SET scheme = 'NEP' WHERE scheme IS NULL;
ALTER TABLE class_batches ALTER COLUMN scheme SET NOT NULL;

-- Drop old unique constraint on (name, year) and add new one on (name, start_year, end_year)
DO $$
DECLARE
    cname TEXT;
BEGIN
    SELECT conname INTO cname
    FROM pg_constraint
    WHERE conrelid = 'class_batches'::regclass AND contype = 'u';
    IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE class_batches DROP CONSTRAINT ' || quote_ident(cname);
    END IF;
END $$;

ALTER TABLE class_batches ADD CONSTRAINT uk_class_batches_name_start_end UNIQUE (name, start_year, end_year);

-- Drop old year column
ALTER TABLE class_batches DROP COLUMN IF EXISTS year;

-- Add scheme to students if not already present
ALTER TABLE students ADD COLUMN IF NOT EXISTS scheme VARCHAR(10);
