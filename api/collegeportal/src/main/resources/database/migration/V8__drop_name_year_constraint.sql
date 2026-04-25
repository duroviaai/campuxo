-- Drop old unique constraint on (name, year) which blocks year-based class creation
ALTER TABLE class_batches DROP CONSTRAINT IF EXISTS uk55x53g6fjamof7k7hivdhfaf1;

-- Also drop by common name pattern in case it was created differently
DO $$
DECLARE
    cname TEXT;
BEGIN
    SELECT conname INTO cname
    FROM pg_constraint
    WHERE conrelid = 'class_batches'::regclass
      AND contype = 'u'
      AND conname NOT IN ('uk_class_batches_name_start_end');
    IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE class_batches DROP CONSTRAINT IF EXISTS ' || quote_ident(cname);
    END IF;
END $$;
