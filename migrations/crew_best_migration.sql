-- Crew Best (Group voting) tables
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS crew_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  creator_id uuid not null references users(user_id),
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS crew_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references crew_groups(id) on delete cascade,
  user_id uuid not null references users(user_id),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS crew_videos (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references crew_groups(id) on delete cascade,
  video_id text not null,
  added_by uuid not null references users(user_id),
  added_at timestamptz default now(),
  unique(group_id, video_id)
);

CREATE TABLE IF NOT EXISTS crew_votes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references crew_groups(id) on delete cascade,
  video_id text not null,
  user_id uuid not null references users(user_id),
  vote integer not null default 1,
  voted_at timestamptz default now(),
  unique(group_id, video_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_members_group ON crew_members (group_id);
CREATE INDEX IF NOT EXISTS idx_crew_videos_group ON crew_videos (group_id);
CREATE INDEX IF NOT EXISTS idx_crew_votes_group ON crew_votes (group_id);
CREATE INDEX IF NOT EXISTS idx_crew_groups_invite ON crew_groups (invite_code);
