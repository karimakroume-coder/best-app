-- T026: Early access improvements + creator applications + stats.
-- Run this in the Supabase SQL editor.

-- Early access: add source, referrer, creator_interest columns
ALTER TABLE early_access ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE early_access ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE early_access ADD COLUMN IF NOT EXISTS creator_interest boolean DEFAULT false;

-- Creator applications table
CREATE TABLE IF NOT EXISTS creator_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  youtube_url text,
  subscriber_count integer,
  primary_category text,
  why_best text,
  status text default 'pending',
  applied_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_creator_applications_email ON creator_applications (email);
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications (status);
