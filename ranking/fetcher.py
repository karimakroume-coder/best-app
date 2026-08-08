import os
import requests


def fetch_trending(category_id, country_code):
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        raise EnvironmentError("YOUTUBE_API_KEY is not set in environment variables")

    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet,statistics",
        "chart": "mostPopular",
        "regionCode": country_code,
        "videoCategoryId": category_id,
        "key": api_key,
        "maxResults": 50,
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    trending = []
    for item in data.get("items", []):
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        trending.append({
            "video_id": item.get("id"),
            "title": snippet.get("title"),
            "channel_name": snippet.get("channelTitle"),
            "view_count": int(stats.get("viewCount", 0)) if stats.get("viewCount") is not None else 0,
            "like_count": int(stats.get("likeCount")) if stats.get("likeCount") is not None else None,
            "comment_count": int(stats.get("commentCount")) if stats.get("commentCount") is not None else None,
            "thumbnail_url": next(
                (thumb.get("url") for thumb in snippet.get("thumbnails", {}).values() if thumb.get("url")),
                None,
            ),
            "published_at": snippet.get("publishedAt"),
            "category_id": category_id,
            "country_code": country_code,
        })

    return trending
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    results = fetch_trending("10", "US")
    for video in results[:5]:
        print(video["title"], "-", video["view_count"], "views")