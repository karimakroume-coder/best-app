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

    def register(self) -> bool:
        try:
            res = requests.post(f"{BEST_API}/auth/register", json={
                "email": self.email,
                "password": "BESTAgent2026!",
                "name": self.name
            }, timeout=15)
            if res.status_code == 200:
                data = res.json()
                self.token = data.get("access_token")
                self.user_id = data.get("user_id")
                return bool(self.token)
            return False
        except Exception as e:
            print(f"  {self.name} register error: {e}")
            return False

    def login(self) -> bool:
        try:
            res = requests.post(f"{BEST_API}/auth/login", json={
                "email": self.email,
                "password": "BESTAgent2026!"
            }, timeout=15)
            if res.status_code == 200:
                data = res.json()
                self.token = data.get("access_token")
                self.user_id = data.get("user_id")
                return bool(self.token)
            return False
        except Exception as e:
            print(f"  {self.name} login error: {e}")
            return False

    def get_rankings(self) -> list:
        try:
            preferred = self.profile["content_preferences"]
            # Fetch from the agent's top preferred category for better targeting
            category = preferred[0] if preferred else "global"
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

    def _is_preferred_category(self, video: dict) -> bool:
        """Check if video matches any of the agent's preferred content categories."""
        pref = [c.lower() for c in self.profile.get("content_preferences", [])]
        cat_id = str(video.get("category_id", ""))
        cat_map = {"10": "music", "20": "gaming", "17": "sports",
                    "24": "entertainment", "22": "people"}
        cat_name = cat_map.get(cat_id, "")
        return cat_name in pref

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
        is_preferred = self._is_preferred_category(video)

        # Pick color from agent's preferred ranking (top of list = most likely)
        color_ranking = self.profile["color_ranking"]
        preferred_colors = [c for c in color_ranking if c != "gold"]
        color = preferred_colors[0] if preferred_colors else "blue"

        # Higher-score videos get the top color; lower-score get secondary
        if score < 0.25 and len(preferred_colors) > 1:
            color = preferred_colors[1]
        if score < 0.15 and len(preferred_colors) > 2:
            color = preferred_colors[2]

        # More likely to assign color to preferred-category content
        assign_chance = 0.6 if is_preferred else 0.3
        assign = score > 0.15 and random.random() < assign_chance

        # Fireflag based on threshold (selective agents flag rarely)
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
            "reason": f"rule-based fallback ({'preferred' if is_preferred else 'browse'})"
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
                headers={"Authorization": f"Bearer {self.token}"} if self.token else {},
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
                headers={"Authorization": f"Bearer {self.token}"} if self.token else {},
                timeout=10
            )
            return res.status_code == 200
        except Exception as e:
            print(f"  {self.name} fireflag error: {e}")
            return False

    def hunt_participate(self):
        try:
            res = requests.get(f"{BEST_API}/hunt/daily", timeout=10)
            if res.status_code != 200:
                return
            target = res.json()
            if random.random() > 0.30:
                return
            found = requests.post(f"{BEST_API}/hunt/found", json={
                "user_id": self.user_id,
                "video_id": target["video_id"],
                "date": target["date"]
            }, timeout=10)
            if found.status_code == 200:
                data = found.json()
                pts = data.get("points", 0)
                if pts > 0:
                    print(f"  🎯 {self.name} found hunt target! +{pts}")
                else:
                    print(f"  🎯 {self.name} already found hunt today")
        except Exception as e:
            print(f"  {self.name} hunt error: {e}")

    def run_session(self):
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] "
              f"{self.name} ({self.profile['region']}) starting session...")

        if not self.register():
            print(f"  {self.name} register failed — trying login...")
            if not self.login():
                print(f"  {self.name} could not authenticate. Skipping.")
                return

        if not self.user_id:
            print(f"  {self.name} has no user_id after auth. Skipping.")
            return

        # Hunt participation
        self.hunt_participate()

        rankings = self.get_rankings()
        if not rankings:
            print(f"  {self.name} got no rankings. Skipping.")
            return

        videos_to_watch = random.randint(3, 8)
        # Sort so preferred-category videos come first (real humans engage more with what they like)
        ranked = sorted(rankings, key=lambda v: (not self._is_preferred_category(v), -v.get("total_score", 0)))
        sample = random.sample(ranked[:min(15, len(ranked))], min(videos_to_watch, min(15, len(ranked))))

        colors_assigned = 0
        max_colors = 5 if self.profile.get("activity_level") == "high" else 3
        flags_placed = 0

        for video in sample:
            time.sleep(random.uniform(2, 5))

            decision = self.decide_action(video)
            if not decision:
                continue

            video_id = video.get("video_id", "")
            title = video.get("title", "")[:40]

            if decision.get("assign_color") and colors_assigned < max_colors:
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