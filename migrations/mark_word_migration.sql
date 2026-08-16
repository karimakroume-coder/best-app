-- T001-F2: Persist the Mark word + snapshot.
-- Run this in the Supabase SQL editor.

ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS word text;
ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS snapshot_url text;
ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS country_code text;
