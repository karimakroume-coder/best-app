-- FLEX system migration
-- Run against your Supabase project (SQL editor) to create the flex_comments table.

create table if not exists flex_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id text not null,
  photo_url text not null,
  overlay_type text default 'none',
  position_x float default 50,
  position_y float default 50,
  placed_at timestamptz default now(),
  video_rank_at_time int4
);

-- Index for fast listing of flexes per video (newest first, capped at 50)
create index if not exists idx_flex_comments_video_placed
  on flex_comments (video_id, placed_at desc);
