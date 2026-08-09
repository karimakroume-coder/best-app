import os
import json
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_video(video_dict: dict) -> dict:
    default = {
        "category": "unknown",
        "mood": "unknown",
        "quality_score": 0.5,
        "topics": [],
        "peak_moment_estimate": 0
    }
    try:
        title = video_dict.get("title", "")
        channel = video_dict.get("channel_name", "")
        category_id = video_dict.get("category_id", "")
        prompt = (
            "Analyze this YouTube video and return ONLY a JSON object with no markdown.\n"
            f"Title: {title}\nChannel: {channel}\nCategory ID: {category_id}\n"
            "Return this exact JSON:\n"
            '{"category":"music/gaming/sports/entertainment/education/comedy/news/other",'
            '"mood":"energetic/calm/emotional/funny/inspiring/dramatic/informative",'
            '"quality_score":0.0,'
            '"topics":["topic1","topic2","topic3"],'
            '"peak_moment_estimate":30}'
        )
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text.strip())
        time.sleep(1)
        return result
    except Exception as e:
        print(f"  Gemini error: {e}")
        return default


def get_peak_moment(video_dict: dict) -> int:
    try:
        title = video_dict.get("title", "")
        prompt = f'For YouTube video: "{title}" — return ONLY an integer: the second where the most engaging moment occurs.'
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return int(response.text.strip())
    except Exception:
        return 30


if __name__ == "__main__":
    test_video = {
        "video_id": "BZ4UzthYTss",
        "title": "Stray Kids This and That MV",
        "channel_name": "JYP Entertainment",
        "category_id": "10"
    }
    print("Testing Gemini AI analysis...")
    result = analyze_video(test_video)
    print(f"  Category:      {result['category']}")
    print(f"  Mood:          {result['mood']}")
    print(f"  Quality score: {result['quality_score']}")
    print(f"  Topics:        {result['topics']}")
    print(f"  Peak moment:   {result['peak_moment_estimate']} seconds")
    peak = get_peak_moment(test_video)
    print(f"  Peak URL: https://youtube.com/watch?v=BZ4UzthYTss&t={peak}")