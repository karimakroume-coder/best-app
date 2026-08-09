import time
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apscheduler.schedulers.background import BackgroundScheduler
from ranking.fetcher import fetch_trending
from ranking.scorer import compute_score
from database.client import save_video, save_ranking


def run_ranking_pipeline():
    try:
        print(f"Running ranking pipeline at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}...")

        videos = fetch_trending("10", "US")

        scored = []
        for video in videos:
            score = compute_score(video)
            scored.append({**video, **score})

        scored.sort(key=lambda x: x["total_score"], reverse=True)

        for rank, video in enumerate(scored, 1):
            save_video(video)
            save_ranking(
                video_id=video["video_id"],
                rank=rank,
                score=video["total_score"],
                velocity=video["velocity_score"],
                geo=video["geo_score"],
                retention=video["retention_score"],
                platform="youtube",
                country="US"
            )

        print(f"Ranking updated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} — {len(scored)} videos ranked.")

    except Exception as e:
        print(f"Pipeline error: {e}")


if __name__ == "__main__":
    print("Starting BEST ranking scheduler...")

    run_ranking_pipeline()

    scheduler = BackgroundScheduler()
    scheduler.add_job(run_ranking_pipeline, "interval", minutes=15)
    scheduler.start()

    print("Scheduler running. Rankings update every 15 minutes. Press Ctrl+C to stop.")

    try:
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        print("Scheduler stopped.")
