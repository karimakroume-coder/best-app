-- Creator referral tracking
-- Run this in the Supabase SQL editor.

ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS ref text;

CREATE INDEX IF NOT EXISTS idx_creator_applications_ref ON creator_applications (ref);
