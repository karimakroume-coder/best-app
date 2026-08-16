-- T024: Daily ranking snapshot table.
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  video_id text not null,
  rank integer not null,
  total_score float not null,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_date ON ranking_snapshots (snapshot_date);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_video ON ranking_snapshots (video_id, snapshot_date);
