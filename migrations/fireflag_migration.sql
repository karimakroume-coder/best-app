-- T001-F3: Fireflag lifetime bug — track only active fireflags.
-- Run this in the Supabase SQL editor.

ALTER TABLE fireflags ADD COLUMN IF NOT EXISTS is_active boolean default true;
