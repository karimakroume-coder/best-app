content = """from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ranking.fetcher import fetch_trending
from ranking.scorer import compute_score
from database.client import save_video, save_ranking, get_client
from auth.auth import create_access_token, get_token_from_header
from apscheduler.schedulers.background import BackgroundScheduler
from ranking.scheduler import run_ranking_pipeline
load_dotenv()

app = FastAPI(title="BEST API", version="1.0.0")
scheduler = BackgroundScheduler()
scheduler.add_job(run_ranking_pipeline, "interval", minutes=15)
scheduler.start()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000","http://localhost:3001"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

CATEGORY_IDS = {"music":"10","gaming":"20","sports":"17","entertainment":"24","people":"22"}

class AuthRequest(BaseModel):
    email: str
    password: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/register")
def register(req: AuthRequest):
    try:
        client = get_client()
        result = client.auth.sign_up({"email": req.email, "password": req.password})
        user_id = result.user.id
        client.table("users").insert({
            "user_id": user_id,
            "email": req.email,
            "username": req.email.split("@")[0],
            "discovery_score": 0,
            "badge_tier": "none",
            "fireflag_count": 0,
            "fireflags_remaining": 10
        }).execute()
        token = create_access_token({"sub": user_id, "email": req.email})
        return {"user_id": user_id, "access_token": token, "message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
def login(req: AuthRequest):
    try:
        client = get_client()
        result = client.auth.sign_in_with_password({"email": req.email, "password": req.password})
        user_id = result.user.id
        token = create_access_token({"sub": user_id, "email": req.email})
        return {"access_token": token, "message": "Login successful"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/user/profile")
def get_profile(authorization: str = Header(None)):
    payload = get_token_from_header(authorization)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        client = get_client()
        user_id = payload.get("sub")
        result = client.table("users").select("*").eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ranking/global")
def get_global_ranking():
    videos = fetch_trending("10", "US")
    scored = []
    for video in videos:
        score = compute_score(video, countries_present=["US"])
        scored.append({**video, **score})
    scored.sort(key=lambda x: x["total_score"], reverse=True)
    results = []
    for rank, video in enumerate(scored, 1):
        save_video(video)
        save_ranking(video["video_id"], rank, video["total_score"], video["velocity_score"], video["geo_score"], video["retention_score"], "youtube", "US")
        results.append({"rank": rank, "video_id": video["video_id"], "title": video["title"], "channel_name": video["channel_name"], "view_count": video["view_count"], "total_score": video["total_score"], "velocity_score": video["velocity_score"], "retention_score": video["retention_score"], "thumbnail_url": video["thumbnail_url"]})
    return results

@app.get("/ranking/category/{category_name}")
def get_category_ranking(category_name: str):
    cat_id = CATEGORY_IDS.get(category_name.lower(), "10")
    videos = fetch_trending(cat_id, "US")
    scored = []
    for video in videos:
        score = compute_score(video, countries_present=["US"])
        scored.append({**video, **score})
    scored.sort(key=lambda x: x["total_score"], reverse=True)
    return [{"rank": r+1, "video_id": v["video_id"], "title": v["title"], "channel_name": v["channel_name"], "view_count": v["view_count"], "total_score": v["total_score"], "thumbnail_url": v["thumbnail_url"]} for r, v in enumerate(scored)]

@app.get("/ranking/country/{country_code}")
def get_country_ranking(country_code: str):
    videos = fetch_trending("10", country_code.upper())
    scored = []
    for video in videos:
        score = compute_score(video, countries_present=[country_code.upper()])
        scored.append({**video, **score})
    scored.sort(key=lambda x: x["total_score"], reverse=True)
    return [{"rank": r+1, "video_id": v["video_id"], "title": v["title"], "channel_name": v["channel_name"], "view_count": v["view_count"], "total_score": v["total_score"], "thumbnail_url": v["thumbnail_url"]} for r, v in enumerate(scored)]

@app.get("/ranking/history/{video_id}")
def get_video_history(video_id: str):
    client = get_client()
    response = client.table("rankings").select("rank, score, recorded_at, country_code").eq("video_id", video_id).order("recorded_at", desc=False).execute()
    return response.data
"""

with open("main.py", "w", encoding="utf-8") as f:
    f.write(content)
print("main.py written successfully")