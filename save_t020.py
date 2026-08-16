import os

BASE = r"C:\Users\karim\Documents\BEST APP"

# ── MIGRATION FILE ──────────────────────────────────────────────────────────
migrations_dir = os.path.join(BASE, "migrations")
os.makedirs(migrations_dir, exist_ok=True)

peak_migration = """-- T020: Peak moment integration.
-- Run this in the Supabase SQL editor.

ALTER TABLE videos   ADD COLUMN IF NOT EXISTS peak_moment_seconds integer default 0;
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS peak_moment_seconds integer default 0;
"""
with open(os.path.join(migrations_dir, "peak_moment_migration.sql"), 'w') as f:
    f.write(peak_migration)
print("Saved: migrations/peak_moment_migration.sql")

# ── SCORER.PY — add is_creator_content ─────────────────────────────────────
scorer_path = os.path.join(BASE, "ranking", "scorer.py")
with open(scorer_path, 'r', encoding='utf-8') as f:
    scorer = f.read()

creator_fn = '''

def is_creator_content(video: dict) -> bool:
    """Return True if the video is independent creator content."""
    channel = (video.get("channel_name") or "").lower()
    if not channel:
        return False
    official_markers = [
        "vevo", "topic", "records", "official", "network", "news", "tv",
        "studio", "media", "entertainment", "bbc", "cnn", "netflix", "disney",
        "warner", "sony", "universal", "nbc", "fox", "cbs", "abc", "mtv",
        "espn", "paramount", "nickelodeon", "cartoon",
    ]
    for marker in official_markers:
        if marker in channel:
            return False
    return True
'''

if 'is_creator_content' not in scorer:
    scorer += creator_fn
    with open(scorer_path, 'w', encoding='utf-8') as f:
        f.write(scorer)
    print("Updated: ranking/scorer.py (added is_creator_content)")
else:
    print("Skipped: ranking/scorer.py (is_creator_content already exists)")

# ── DATABASE/CLIENT.PY — add fetch_peak_moments ─────────────────────────────
client_path = os.path.join(BASE, "database", "client.py")
with open(client_path, 'r', encoding='utf-8') as f:
    client = f.read()

fetch_peak_fn = '''

def fetch_peak_moments(video_ids: list) -> dict:
    if not video_ids:
        return {}
    client = get_client()
    result = (
        client.table("videos")
        .select("video_id, peak_moment_seconds")
        .in_("video_id", video_ids)
        .execute()
    )
    return {
        row["video_id"]: row.get("peak_moment_seconds", 0) or 0
        for row in (result.data or [])
    }
'''

if 'fetch_peak_moments' not in client:
    client += fetch_peak_fn
    with open(client_path, 'w', encoding='utf-8') as f:
        f.write(client)
    print("Updated: database/client.py (added fetch_peak_moments)")
else:
    print("Skipped: database/client.py (fetch_peak_moments already exists)")

# ── AGENTS/AGENT.PY — add get_discovery_score logging ──────────────────────
agent_path = os.path.join(BASE, "agents", "agent.py")
with open(agent_path, 'r', encoding='utf-8') as f:
    agent = f.read()

discovery_fn = '''
    def get_discovery_score(self) -> int:
        try:
            import requests as req
            res = req.get(
                f"{self.api_url}/user/discovery-score/{self.user_id}",
                timeout=10
            )
            if res.status_code == 200:
                return res.json().get("score", 0)
            return 0
        except Exception as e:
            print(f"  {self.name} discovery-score fetch error: {e}")
            return 0
'''

if 'get_discovery_score' not in agent:
    # Add method before last class closing
    agent += discovery_fn
    with open(agent_path, 'w', encoding='utf-8') as f:
        f.write(agent)
    print("Updated: agents/agent.py (added get_discovery_score)")
else:
    print("Skipped: agents/agent.py (get_discovery_score already exists)")

print("\n" + "="*50)
print("T020 FILES SAVED")
print("="*50)
print("\nNEXT STEPS:")
print("1. Run in Supabase SQL Editor:")
print("   migrations/peak_moment_migration.sql")
print("\n2. main.py needs manual additions:")
print("   - Rate limiting (enforce_rate_limit function)")  
print("   - GET /ranking/creators endpoint")
print("   - GET /health improved")
print("   - import is_creator_content from ranking.scorer")
print("   - import fetch_peak_moments from database.client")
print("\n3. ranking/scheduler.py needs peak_moment_seconds")
print("   integration in run_ranking_pipeline()")
print("\n4. git add . && git commit -m 'T020 — Backend improvements'")
print("   && git push origin main")
