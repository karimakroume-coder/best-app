from datetime import datetime, timezone, timedelta
from database.client import get_client


AFRICA_CODES = {"NG","KE","ZA","GH","ET","TZ","UG","EG","MA","TN","DZ","CM","SN","ML","BF","CI","RW","ZM","ZW","MZ","AO","MG","MW","NE","TD","BF","LR","SL","GM","GN","GW","BZ","CV","SC","MU","KM","DJ","SO"}
ASIA_CODES = {"IN","CN","JP","KR","ID","TH","VN","PH","MY","SG","BD","PK","LK","NP","MM","KH","LA","TW","HK","MO","MN","KZ","UZ","TM","KG","TJ","AF","IR","IQ","SY","LB","JO","PS","IL","AE","SA","QA","KW","BH","OM","YE"}
AMERICAS_CODES = {"US","CA","MX","BR","AR","CO","CL","PE","VE","EC","BO","PY","UY","PA","CR","HN","GT","SV","NI","DO","CU","JM","TT","HT","BS","BB","GY","SR","BZ"}


def _get_assignment_stats(video_id):
    """Weighted discovery-score stats and countries of everyone who's marked this video.

    Returns raw discovery_scores, country_codes, and weighted_count where each
    assigner's contribution is weighted by their discovery_score:
      weight = max(user.discovery_score, 1) / 100
    """
    client = get_client()
    assignments = client.table("color_assignments").select("user_id, country_code").eq("video_id", video_id).execute()
    rows = assignments.data or []
    user_ids = list({r["user_id"] for r in rows if r.get("user_id")})
    country_codes = [r["country_code"] for r in rows if r.get("country_code")]

    discovery_scores = []
    weighted_count = 0.0
    if user_ids:
        users = client.table("users").select("user_id, discovery_score").in_("user_id", user_ids).execute()
        for u in (users.data or []):
            ds = u.get("discovery_score", 0) or 0
            discovery_scores.append(ds)
            weighted_count += max(ds, 1) / 100.0

    return discovery_scores, country_codes, weighted_count


def _get_fireflag_velocity(video_id: str) -> float:
    """Fraction of fireflags placed on this video in the last 24 hours, scaled to [0, 1]."""
    try:
        client = get_client()
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        result = client.table("fireflags").select("id", count="exact") \
            .eq("video_id", video_id).gte("placed_at", cutoff).execute()
        recent = result.count or 0
        return min(recent / 10.0, 1.0)
    except Exception:
        return 0.0


def _diversity_bonus(countries: list) -> float:
    """0.1 bonus when assignments span Africa, Asia, and Americas."""
    if not countries:
        return 0.0
    codes = set(c.upper() for c in countries)
    has_africa = bool(codes & AFRICA_CODES)
    has_asia = bool(codes & ASIA_CODES)
    has_americas = bool(codes & AMERICAS_CODES)
    if has_africa and has_asia and has_americas:
        return 0.1
    return 0.0


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

    discovery_scores, countries, weighted_count = _get_assignment_stats(video.get("video_id"))

    if discovery_scores:
        elite_score = min(sum(discovery_scores) / len(discovery_scores) / 1000.0, 1.0)
    else:
        elite_score = 0.0

    # PART 1: Weighted discovery score — high-DS users carry more weight
    max_possible_weighted = max(len(discovery_scores) * 10.0, 1.0) if discovery_scores else 1.0
    weighted_elite = min(weighted_count / max_possible_weighted, 1.0)

    if countries:
        countries_present = countries
        geo_score = min(len(countries) / 10, 1.0)
    else:
        geo_score = 0.1

    spread_score = 0.5

    # PART 2: Fireflag velocity — recent fireflag activity boosts rank
    fireflag_velocity = _get_fireflag_velocity(video.get("video_id", ""))
    fireflag_boost = fireflag_velocity * 0.15

    # PART 3: Geographic diversity bonus
    diversity = _diversity_bonus(countries_present or countries or [])

    total_score = (
        velocity_score    * 0.40 +
        retention_score   * 0.25 +
        geo_score         * 0.20 +
        (elite_score * 0.05 + weighted_elite * 0.05) +
        spread_score      * 0.05 +
        fireflag_boost +
        diversity
    )

    return {
        "total_score":       round(total_score, 4),
        "velocity_score":    round(velocity_score, 4),
        "retention_score":   round(retention_score, 4),
        "geo_score":         round(geo_score, 4),
        "elite_score":       round(elite_score, 4),
        "weighted_elite":    round(weighted_elite, 4),
        "fireflag_velocity": round(fireflag_velocity, 4),
        "diversity_bonus":   round(diversity, 4),
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


def is_creator_content(video: dict) -> bool:
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
