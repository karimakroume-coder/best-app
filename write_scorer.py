content = '''from datetime import datetime, timezone


def compute_score(video: dict, countries_present: list = None) -> dict:
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

    if countries_present and len(countries_present) > 0:
        geo_score = min(len(countries_present) / 10, 1.0)
    else:
        geo_score = 0.1

    elite_score = 0.5
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

    print("Testing BEST scoring with geo_score...")
    print()

    videos = fetch_trending("10", "US")
    video = videos[0]

    score_1 = compute_score(video, countries_present=["US"])
    score_8 = compute_score(video, countries_present=["US","GB","FR","DE","BR","JP","KR","NG"])

    print(f"Video: {video['title'][:45]}")
    print(f"  1 country   geo_score: {score_1['geo_score']}  total: {score_1['total_score']}")
    print(f"  8 countries geo_score: {score_8['geo_score']}  total: {score_8['total_score']}")
    print()
    print("Top 5 videos:")
    for v in videos[:5]:
        s = compute_score(v, countries_present=["US"])
        print(f"  {v['title'][:40]} Score: {s['total_score']}")
'''

with open("ranking/scorer.py", "w", encoding="utf-8") as f:
    f.write(content)
print("scorer.py written successfully")