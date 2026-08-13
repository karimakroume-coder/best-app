import os
import json
import time
import random
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BEST_API = os.getenv("BEST_API_URL", "http://localhost:8000")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"


def ask_gemini(prompt: str) -> dict:
    try:
        response = requests.post(
            GEMINI_URL,
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30
        )
        data = response.json()
        if "candidates" not in data:
            return None
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        return None


class BESTAgent:
    def __init__(self, profile: dict):
        self.profile = profile
        self.name = profile["name"]
        self.email = profile["email"]
        self.token = None
        self.user_id = None

    def login(self) -> bool:
        try:
            res = requests.post(f"{BEST_API}/auth/login", json={
                "email": self.email,
                "password": "BESTAgent2026!"
            }, timeout=10)
            if res.status_code == 200:
                self.token = res.json()["access_token"]
                return True
            return False
        except Exception as e:
            print(f"  {self.name} login error: {e}")
            return False

    def register(self) -> bool:
        try:
            res = requests.post(f"{BEST_API}/auth/register", json={
                "email": self.email,
                "password": "BESTAgent2026!"
            }, timeout=10)
            if res.status_code == 200:
                data = res.json()
                self.token = data["access_token"]
                self.user_id = data["user_id"]
                return True
            return False
        except Exception as e:
            print(f"  {self.name} register error: {e}")
            return False

    def get_user_id_from_token(self):
        try:
            res = requests.get(
                f"{BEST_API}/user/profile",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            if res.status_code == 200:
                self.user_id = res.json().get("user_id")
        except Exception:
            pass

    def get_rankings(self) -> list:
        try:
            category = random.choice(self.profile["content_preferences"])
            if category in ["music", "gaming", "sports", "entertainment"]:
                url = f"{BEST_API}/ranking/category/{category}"
            else:
                url = f"{BEST_API}/ranking/global"
            res = requests.get(url, timeout=15)
            if res.status_code == 200:
                return res.json()
            return []
        except Exception as e:
            print(f"  {self.name} fetch error: {e}")
            return []

    def _build_prompt(self, video: dict) -> str:
        return f"""You are {self.name}, a BEST platform user from {self.profile['region']}.
Your personality: {self.profile['personality']}
Your color preference order (most to least important): {self.profile['color_ranking']}
Your word style: {self.profile['word_style']}
Your fireflag threshold (0=flags everything, 1=almost never flags): {self.profile['fireflag_threshold']}

You are watching this video on BEST:
Title: {video.get('title', '')}
Channel: {video.get('channel_name', '')}
BEST Score: {video.get('total_score', 0)}
Current Rank: {video.get('rank', 0)}

Based on your personality decide your reaction.
Return ONLY valid JSON, no markdown:
{{"assign_color": true or false, "color": "red or blue or green or yellow or black or white", "word": "one single word in your language style", "fireflag": true or false, "reason": "brief reason"}}

Only assign color if the video genuinely moves you.
Only fireflag if score meets your threshold of {self.profile['fireflag_threshold']}.
Color must be one of: red, blue, green, yellow, black, white"""

    def decide_action(self, video: dict) -> dict:
        result = ask_gemini(self._build_prompt(video))

        if result:
            return result

        # Fallback: rule-based decision when Gemini unavailable
        score = video.get("total_score", 0)

        color_idx = 0
        if score > 0.4:
            color_idx = 0
        elif score > 0.25:
            color_idx = 1
        else:
            color_idx = 2

        color = self.profile["color_ranking"][color_idx]
        if color == "gold":
            color = self.profile["color_ranking"][1]

        assign = score > 0.2 and random.random() > 0.4

        fireflag = (
            score > 0.35 and
            random.random() > self.profile["fireflag_threshold"]
        )

        words_raw = self.profile["word_style"]
        if ":" in words_raw:
            words_part = words_raw.split(":")[-1]
        else:
            words_part = words_raw
        words = [w.strip() for w in words_part.split(",") if w.strip()]
        word = random.choice(words) if words else "real"
        word = word.split()[0][:20]

        return {
            "assign_color": assign,
            "color": color,
            "word": word,
            "fireflag": fireflag,
            "reason": "rule-based fallback"
        }

    def assign_color(self, video_id: str, color: str, word: str) -> bool:
        try:
            res = requests.post(
                f"{BEST_API}/color/assign",
                json={
                    "user_id": self.user_id,
                    "video_id": video_id,
                    "color": color,
                    "word": word
                },
                timeout=10
            )
            return res.status_code == 200
        except Exception as e:
            print(f"  {self.name} color error: {e}")
            return False

    def place_fireflag(self, video_id: str) -> bool:
        try:
            res = requests.post(
                f"{BEST_API}/fireflag/place",
                json={
                    "user_id": self.user_id,
                    "video_id": video_id,
                    "flag_type": "amber"
                },
                timeout=10
            )
            return res.status_code == 200
        except Exception as e:
            print(f"  {self.name} fireflag error: {e}")
            return False

    def run_session(self):
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] "
              f"{self.name} ({self.profile['region']}) starting session...")

        if not self.login():
            print(f"  {self.name} login failed — trying register...")
            if not self.register():
                print(f"  {self.name} could not authenticate. Skipping.")
                return

        if not self.user_id:
            self.get_user_id_from_token()

        if not self.user_id:
            print(f"  {self.name} could not get user_id. Skipping.")
            return

        rankings = self.get_rankings()
        if not rankings:
            print(f"  {self.name} got no rankings. Skipping.")
            return

        videos_to_watch = random.randint(3, 8)
        sample = random.sample(rankings, min(videos_to_watch, len(rankings)))

        colors_assigned = 0
        flags_placed = 0

        for video in sample:
            time.sleep(random.uniform(2, 5))

            decision = self.decide_action(video)
            if not decision:
                continue

            video_id = video.get("video_id", "")
            title = video.get("title", "")[:40]

            if decision.get("assign_color") and colors_assigned < 3:
                color = decision.get("color", "blue")
                word = decision.get("word", "real")[:20]
                if color == "gold":
                    color = "blue"
                if self.assign_color(video_id, color, word):
                    colors_assigned += 1
                    print(f"  ✓ {self.name} → {color.upper()} "
                          f"+ '{word}' on: {title}")

            if decision.get("fireflag") and flags_placed < 2:
                if self.place_fireflag(video_id):
                    flags_placed += 1
                    print(f"  🔥 {self.name} flagged: {title}")

        print(f"  {self.name} session complete — "
              f"{colors_assigned} marks, {flags_placed} flags")