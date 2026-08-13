from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ranking.fetcher import fetch_trending
from ranking.scorer import compute_score
from database.client import get_client
from auth.auth import create_access_token, get_token_from_header
from apscheduler.schedulers.background import BackgroundScheduler
from ranking.scheduler import run_ranking_pipeline
load_dotenv()

app = FastAPI(title="BEST API", version="1.0.0")
scheduler = BackgroundScheduler()
scheduler.add_job(
    run_ranking_pipeline,
    "interval",
    minutes=15,
    next_run_time=datetime.now(timezone.utc) + timedelta(minutes=15),
)
scheduler.start()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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

@app.post("/early-access")
def join_early_access(payload: dict):
    email = payload.get("email", "").strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email is required")
    client = get_client()
    try:
        client.table("early_access").insert({"email": email}).execute()
    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=409, detail="Email already on the list")
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "You are on the list"}

@app.post("/color/assign")
def assign_color(payload: dict):
    valid_colors = ["red","blue","green","yellow","black","white","gold"]
    user_id = payload.get("user_id")
    video_id = payload.get("video_id")
    color = payload.get("color","").lower()
    if color not in valid_colors:
        raise HTTPException(status_code=400, detail=f"Invalid color")
    client = get_client()
    client.table("color_assignments").insert({"user_id": user_id, "video_id": video_id, "color": color}).execute()
    user_data = client.table("users").select("discovery_score").eq("user_id", user_id).execute()
    current_score = user_data.data[0]["discovery_score"] if user_data.data else 0
    client.table("users").update({"discovery_score": current_score + 5}).eq("user_id", user_id).execute()
    return {"message": f"Color {color} assigned", "points_earned": 5}

@app.post("/fireflag/place")
def place_fireflag(payload: dict):
    user_id = payload.get("user_id")
    video_id = payload.get("video_id")
    if not user_id or not video_id:
        raise HTTPException(status_code=400, detail="user_id and video_id are required")
    client = get_client()

    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    weekly = client.table("fireflags").select("id", count="exact") \
        .eq("user_id", user_id).gte("placed_at", week_ago).execute()
    if (weekly.count or 0) >= 10:
        raise HTTPException(status_code=429, detail="You have used all your fireflags this week")

    # No deactivation mechanism exists yet, so "active" is every fireflag
    # this user has ever placed.
    active = client.table("fireflags").select("id", count="exact").eq("user_id", user_id).execute()
    if (active.count or 0) >= 20:
        raise HTTPException(status_code=429, detail="You have reached your maximum of 20 active fireflags")

    client.table("fireflags").insert({"user_id": user_id, "video_id": video_id}).execute()
    user_data = client.table("users").select("discovery_score").eq("user_id", user_id).execute()
    current_score = user_data.data[0]["discovery_score"] if user_data.data else 0
    client.table("users").update({"discovery_score": current_score + 20}).eq("user_id", user_id).execute()
    return {"message": "Fireflag placed", "points_earned": 20}

@app.get("/color/distribution/{video_id}")
def get_color_distribution(video_id: str):
    client = get_client()
    result = client.table("color_assignments").select("color").eq("video_id", video_id).execute()
    total = len(result.data)
    if total == 0:
        return {"video_id": video_id, "total": 0, "distribution": {}}
    counts = {}
    for row in result.data:
        c = row["color"]
        counts[c] = counts.get(c, 0) + 1
    distribution = {c: round((n/total)*100, 1) for c, n in counts.items()}
    return {"video_id": video_id, "total": total, "distribution": distribution}

@app.post("/personal-best/add")
def add_personal_best(payload: dict):
    user_id = payload.get("user_id")
    video_id = payload.get("video_id")
    if not user_id or not video_id:
        raise HTTPException(status_code=400, detail="user_id and video_id are required")
    client = get_client()

    existing = client.table("personal_best").select("video_id").eq("user_id", user_id).execute().data
    total = len(existing)

    if any(row["video_id"] == video_id for row in existing):
        raise HTTPException(status_code=400, detail="Already in your Personal Best 100")

    if total >= 100:
        raise HTTPException(status_code=400, detail="Personal Best 100 is full")

    client.table("personal_best").insert({
        "user_id": user_id,
        "video_id": video_id,
        "rank_at_add": payload.get("rank"),
        "score_at_add": payload.get("score"),
    }).execute()

    user_data = client.table("users").select("discovery_score").eq("user_id", user_id).execute()
    current_score = user_data.data[0]["discovery_score"] if user_data.data else 0
    client.table("users").update({"discovery_score": current_score + 50}).eq("user_id", user_id).execute()

    return {"message": "Added to Personal Best 100", "points_earned": 50, "total": total + 1}

@app.get("/personal-best/{user_id}")
def get_personal_best(user_id: str):
    client = get_client()
    result = client.table("personal_best").select("*").eq("user_id", user_id).order("added_at", desc=False).execute()
    return result.data

@app.delete("/personal-best/remove")
def remove_personal_best(payload: dict):
    user_id = payload.get("user_id")
    video_id = payload.get("video_id")
    if not user_id or not video_id:
        raise HTTPException(status_code=400, detail="user_id and video_id are required")
    client = get_client()
    client.table("personal_best").delete().eq("user_id", user_id).eq("video_id", video_id).execute()
    return {"message": "Removed from Personal Best 100"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
