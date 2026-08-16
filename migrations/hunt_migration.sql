CREATE TABLE IF NOT EXISTS hunt_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id text not null,
  found_at timestamptz default now(),
  date text not null
);
CREATE INDEX IF NOT EXISTS hunt_date_idx ON hunt_completions(date);
