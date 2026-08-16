-- T001-F5: Real scoring data — store the assigner's country on color assignments.
-- Run this in the Supabase SQL editor.

ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS country_code text;
