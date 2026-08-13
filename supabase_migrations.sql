-- Personal Best 100
-- Run this in the Supabase SQL editor.

CREATE TABLE personal_best (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id text not null,
  added_at timestamptz default now(),
  rank_at_add int4,
  score_at_add float8,
  unique(user_id, video_id)
);
