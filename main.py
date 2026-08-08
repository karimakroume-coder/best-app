from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ranking.fetcher import fetch_trending

load_dotenv()

app = FastAPI(title="BEST API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "message": "BEST API is running"}

@app.get("/ranking/global")
def get_global_ranking():
    videos = fetch_trending("10", "US")
    ranked = []
    for index, video in enumerate(videos):
        ranked.append({
            "rank": index + 1,
            "video_id": video["video_id"],
            "title": video["title"],
            "channel_name": video["channel_name"],
            "view_count": video["view_count"],
            "like_count": video["like_count"],
            "thumbnail_url": video["thumbnail_url"],
        })
    return ranked
