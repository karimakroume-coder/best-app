from datetime import datetime, timezone


def compute_score(video: dict) -> dict:
    view_count = video.get("view_count", 0) or 0
    like_count = video.get("like_count", 0) or 0
    published_at = video.get("published_at")

    velocity_score = 0.0
    if published_at and view_count > 0:
        try:
            if isinstance(published_at, str):
                published_dt = datetime.fromisoformat(
                    published_at.replace("Z", "+00:00")
                )
            else:
                published_dt = published_at

            now = datetime.now(timezone.utc)
            hours_since = (now - published_dt).total_seconds() / 3600
            hours_since = max(hours_since, 1)

            views_per_hour = view_count / hours_since
            velocity_score = min(views_per_hour / 1_000_000, 1.0)
        except Exception:
            velocity_score = 0.0

    retention_score = 0.0
    if view_count > 0 and like_count > 0:
        ratio = like_count / view_count
        retention_score = min(ratio / 0.10, 1.0)

    geo_score    = 0.5
    elite_score  = 0.5
    spread_score = 0.5

    total_score = (
        velocity_score  * 0.40 +
        retention_score * 0.25 +
        geo_score       * 0.20 +
        elite_score     * 0.10 +
        spread_score    * 0.05
    )

    return {
        "total_score":     round(total_score, 4),
        "velocity_score":  round(velocity_score, 4),
        "retention_score": round(retention_score, 4),
        "geo_score":       round(geo_score, 4),
    }


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    from ranking.fetcher import fetch_trending

    print("Testing BEST scoring algorithm...")
    videos = fetch_trending("10", "US")

    for video in videos[:5]:
        score = compute_score(video)
        print(f"{video['title'][:45]}")
        print(f"  BEST Score:  {score['total_score']}")
        print(f"  Velocity:    {score['velocity_score']}")
        print(f"  Retention:   {score['retention_score']}")
        print(f"  Views:       {video['view_count']:,}")
        print()
