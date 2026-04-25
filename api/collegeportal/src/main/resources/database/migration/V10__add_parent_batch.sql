ALTER TABLE class_batches ADD COLUMN IF NOT EXISTS parent_batch_id BIGINT REFERENCES class_batches(id) ON DELETE SET NULL;
