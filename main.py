from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import base64, binascii, hashlib, os, re, sys, uuid
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
    name: str | None = None

class FlexPlaceRequest(BaseModel):
    user_id: str
    video_id: str
    photo_base64: str
    overlay_type: str = "none"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/register")
def register(req: AuthRequest):
    try:
        client = get_client()
        result = client.auth.sign_up({"email": req.email, "password": req.password})
        user_id = result.user.id
        username = req.name if req.name else req.email.split("@")[0]
        client.table("users").insert({
            "user_id": user_id,
            "email": req.email,
            "username": username,
            "discovery_score": 0,
            "badge_tier": "none",
            "fireflag_count": 0,
            "fireflags_remaining": 10
        }).execute()
        token = create_access_token({"sub": user_id, "email": req.email})
        return {"user_id": user_id, "access_token": token, "message": "User registered successfully"}
    except Exception as e:
        error_str = str(e).lower()
        if "already" in error_str or "exists" in error_str or "duplicate" in error_str:
            return login(AuthRequest(email=req.email, password=req.password))
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
def login(req: AuthRequest):
    try:
        client = get_client()
        result = client.auth.sign_in_with_password({"email": req.email, "password": req.password})
        user_id = result.user.id
        token = create_access_token({"sub": user_id, "email": req.email})
        return {"access_token": token, "user_id": user_id, "message": "Login successful"}
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
    word = payload.get("word")
    snapshot_url = payload.get("snapshot_url")
    if color not in valid_colors:
        raise HTTPException(status_code=400, detail=f"Invalid color")
    if word and len(word) > 50:
        raise HTTPException(status_code=400, detail="word must be 50 characters or fewer")
    client = get_client()
    row = {"user_id": user_id, "video_id": video_id, "color": color, "word": word, "snapshot_url": snapshot_url}
    profile = client.table("users").select("country_code").eq("user_id", user_id).execute()
    if profile.data:
        row["country_code"] = profile.data[0].get("country_code")
    client.table("color_assignments").insert(row).execute()
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

    active = client.table("fireflags").select("id", count="exact") \
        .eq("user_id", user_id).eq("is_active", True).gte("placed_at", week_ago).execute()
    if (active.count or 0) >= 20:
        raise HTTPException(status_code=429, detail="You have reached your maximum of 20 active fireflags")

    client.table("fireflags").insert({"user_id": user_id, "video_id": video_id, "is_active": True}).execute()
    user_data = client.table("users").select("discovery_score").eq("user_id", user_id).execute()
    current_score = user_data.data[0]["discovery_score"] if user_data.data else 0
    client.table("users").update({"discovery_score": current_score + 20}).eq("user_id", user_id).execute()
    return {"message": "Fireflag placed", "points_earned": 20}

@app.get("/color/distribution/{video_id}")
def get_color_distribution(video_id: str):
    client = get_client()
    result = client.table("color_assignments").select("color, word, snapshot_url").eq("video_id", video_id).execute()
    total = len(result.data)
    if total == 0:
        return {"video_id": video_id, "total": 0, "distribution": {}, "marks": []}
    counts = {}
    marks = []
    for row in result.data:
        c = row["color"]
        counts[c] = counts.get(c, 0) + 1
        marks.append({"color": c, "word": row.get("word"), "snapshot_url": row.get("snapshot_url")})
    distribution = {c: round((n/total)*100, 1) for c, n in counts.items()}
    return {"video_id": video_id, "total": total, "distribution": distribution, "marks": marks}

async def generate_poetic_description(title: str, channel: str) -> str:
    try:
        import google.generativeai as genai
        import os
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""Write ONE LINE only.
Not a description. A poetic distillation.
Under 12 words. No clichés. No adjectives
like beautiful or amazing. Show do not tell.
Write what the video DOES not what it IS.
Title: {title}
Channel: {channel}"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        return text[:100] if text else "A moment worth keeping."
    except Exception:
        return "A moment worth keeping."


@app.post("/personal-best/add")
async def add_personal_best(payload: dict):
    user_id = payload.get("user_id")
    video_id = payload.get("video_id")
    title = payload.get("title", "")
    channel = payload.get("channel", "")
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

    description = await generate_poetic_description(title, channel)
    client.table("personal_best").update({"ai_description": description}).eq("user_id", user_id).eq("video_id", video_id).execute()

    return {"message": "Added to Personal Best 100", "points_earned": 50, "total": total + 1, "ai_description": description}

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

@app.post("/flex/place")
def place_flex(req: FlexPlaceRequest):
    client = get_client()

    photo_bytes = req.photo_base64
    if "," in photo_bytes and photo_bytes.strip().startswith("data:"):
        photo_bytes = photo_bytes.split(",", 1)[1]
    photo_bytes = re.sub(r"\s+", "", photo_bytes)
    try:
        photo_data = base64.b64decode(photo_bytes, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="photo_base64 is not valid base64")
    if not photo_data:
        raise HTTPException(status_code=400, detail="photo_base64 is empty")

    file_name = f"flex/{req.user_id}/{uuid.uuid4()}.jpg"
    client.storage.from_("flex-photos").upload(file_name, photo_data)
    photo_url = client.storage.from_("flex-photos").get_public_url(file_name)

    insert_result = client.table("flex_comments").insert({
        "user_id": req.user_id,
        "video_id": req.video_id,
        "photo_url": photo_url,
        "overlay_type": req.overlay_type,
    }).execute()
    if not insert_result.data:
        raise HTTPException(status_code=500, detail="flex_comments insert returned no rows")
    flex_id = insert_result.data[0]["id"]

    user_data = client.table("users").select("discovery_score").eq("user_id", req.user_id).execute()
    current_score = user_data.data[0]["discovery_score"] if user_data.data else 0
    client.table("users").update({"discovery_score": current_score + 10}).eq("user_id", req.user_id).execute()

    return {
        "flex_id": flex_id,
        "photo_url": photo_url,
        "position": {"x": 50, "y": 50},
        "points_earned": 10,
    }

@app.get("/flex/list/{video_id}")
def list_flexes(video_id: str):
    client = get_client()
    result = client.table("flex_comments").select("*").eq("video_id", video_id).order("placed_at", desc=True).limit(50).execute()
    return {"video_id": video_id, "count": len(result.data), "flexes": result.data}

# ── HUNT GAME ───────────────────────────────────────────────────────────────

@app.get("/hunt/daily")
def get_hunt_daily():
    today = datetime.now(timezone.utc).date().isoformat()
    client = get_client()
    rankings = client.table("rankings").select("video_id, rank, thumbnail_url").order("rank", desc=False).execute()
    if not rankings.data:
        raise HTTPException(status_code=404, detail="No rankings available")
    seed = int(hashlib.md5(today.encode()).hexdigest(), 16)
    target_index = seed % len(rankings.data)
    target = rankings.data[target_index]
    return {"video_id": target["video_id"], "rank": target["rank"], "thumbnail_url": target["thumbnail_url"], "date": today}


@app.post("/hunt/found")
def hunt_found(payload: dict):
    user_id = payload.get("user_id")
    video_id = payload.get("video_id")
    date = payload.get("date")
    if not user_id or not video_id or not date:
        raise HTTPException(status_code=400, detail="user_id, video_id, and date are required")
    client = get_client()
    # Validate target
    rankings = client.table("rankings").select("video_id, rank").order("rank", desc=False).execute()
    seed = int(hashlib.md5(date.encode()).hexdigest(), 16)
    target_index = seed % len(rankings.data)
    target = rankings.data[target_index]
    if target["video_id"] != video_id:
        raise HTTPException(status_code=400, detail="That is not today's hunt target")
    # Check if already found
    existing = client.table("hunt_completions").select("id").eq("user_id", user_id).eq("date", date).execute()
    if existing.data:
        return {"success": True, "points": 0, "message": "Already found today"}
    # Record and award
    client.table("hunt_completions").insert({"user_id": user_id, "video_id": video_id, "date": date}).execute()
    user_data = client.table("users").select("discovery_score").eq("user_id", user_id).execute()
    current_score = user_data.data[0]["discovery_score"] if user_data.data else 0
    client.table("users").update({"discovery_score": current_score + 50}).eq("user_id", user_id).execute()
    return {"success": True, "points": 50}


@app.get("/hunt/leaderboard")
def get_hunt_leaderboard():
    today = datetime.now(timezone.utc).date().isoformat()
    client = get_client()
    results = client.table("hunt_completions").select("user_id, found_at").eq("date", today).order("found_at", desc=False).limit(10).execute()
    leaderboard = []
    for i, row in enumerate(results.data):
        leaderboard.append({"user_id": row["user_id"], "found_at": row["found_at"], "rank_in_list": i + 1})
    return leaderboard


# ── DISCOVERY SCORE ─────────────────────────────────────────────────────────

MILESTONES = [
    (100, "EXPLORER"),
    (200, "SCOUT"),
    (500, "GOLD UNLOCK"),
    (750, "LEGEND"),
    (1000, "ORACLE"),
]


@app.get("/user/discovery-score/{user_id}")
def get_discovery_score(user_id: str):
    client = get_client()
    result = client.table("users").select("discovery_score").eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    score = result.data[0]["discovery_score"] or 0
    next_milestone = None
    for threshold, label in MILESTONES:
        if score < threshold:
            next_milestone = (threshold, label)
            break
    if next_milestone:
        progress = round((score / next_milestone[0]) * 100)
        return {"score": score, "next_milestone": next_milestone[0], "milestone_label": next_milestone[1], "progress_pct": progress}
    return {"score": score, "next_milestone": 1000, "milestone_label": "ORACLE", "progress_pct": 100}


# ── FIREFLAG EXPIRY ────────────────────────────────────────────────────────

def expire_fireflags():
    client = get_client()
    rankings = client.table("rankings").select("video_id").order("rank", desc=False).execute()
    top_200_ids = [r["video_id"] for r in (rankings.data or [])[:200]]
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    if top_200_ids:
        client.table("fireflags").update({"is_active": False}).not_.in_("video_id", top_200_ids).execute()
    client.table("fireflags").update({"is_active": False}).lt("placed_at", cutoff).execute()


scheduler.add_job(expire_fireflags, "interval", hours=1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
