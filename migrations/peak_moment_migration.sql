-- T020: Peak moment integration.
-- Run this in the Supabase SQL editor.

ALTER TABLE videos   ADD COLUMN IF NOT EXISTS peak_moment_seconds integer default 0;
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS peak_moment_seconds integer default 0;
