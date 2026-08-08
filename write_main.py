content = """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ranking.fetcher import fetch_trending
from ranking.scorer import compute_score
from database.client import save_video, save_ranking
load_dotenv()
app = FastAPI(title="BEST API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ranking/global")
def get_global_ranking():
    videos = fetch_trending("10", "US")
    scored = []
    for video in videos:
        score = compute_score(video)
        scored.append({**video, **score})
    scored.sort(key=lambda x: x["total_score"], reverse=True)
    results = []
    for rank, video in enumerate(scored, 1):
        save_video(video)
        save_ranking(video["video_id"], rank, video["total_score"], video["velocity_score"], video["geo_score"], video["retention_score"], "youtube", "US")
        results.append({"rank": rank, "video_id": video["video_id"], "title": video["title"], "channel_name": video["channel_name"], "view_count": video["view_count"], "total_score": video["total_score"], "velocity_score": video["velocity_score"], "retention_score": video["retention_score"], "thumbnail_url": video["thumbnail_url"]})
    return results
"""

with open("main.py", "w") as f:
    f.write(content)
print("main.py written successfully")