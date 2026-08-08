import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


def get_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise ValueError("Missing Supabase credentials in .env file")
    return create_client(url, key)


def save_video(video_dict: dict):
    client = get_client()
    data = {
        "video_id":      video_dict.get("video_id"),
        "title":         video_dict.get("title"),
        "channel_name":  video_dict.get("channel_name"),
        "view_count":    video_dict.get("view_count", 0),
        "like_count":    video_dict.get("like_count"),
        "comment_count": video_dict.get("comment_count"),
        "thumbnail_url": video_dict.get("thumbnail_url"),
        "published_at":  video_dict.get("published_at"),
        "category_id":   video_dict.get("category_id"),
        "country_code":  video_dict.get("country_code"),
        "platform":      video_dict.get("platform", "youtube"),
    }
    response = client.table("videos").upsert(data).execute()
    return response


def save_ranking(video_id: str, rank: int, score: float,
                 velocity: float, geo: float, retention: float,
                 platform: str, country: str):
    client = get_client()
    data = {
        "video_id":        video_id,
        "rank":            rank,
        "score":           score,
        "velocity_score":  velocity,
        "geo_score":       geo,
        "retention_score": retention,
        "platform":        platform,
        "country_code":    country,
    }
    response = client.table("rankings").insert(data).execute()
    return response


def fetch_rankings(limit: int = 100):
    client = get_client()
    response = (
        client.table("rankings")
        .select("*")
        .order("rank", desc=False)
        .limit(limit)
        .execute()
    )
    return response.data
