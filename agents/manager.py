import time
import random
from datetime import datetime
from agents.profiles import AGENT_PROFILES
from agents.agent import BESTAgent


def run_all_agents():
    print(f"\n{'='*50}")
    print(f"BEST Agent Manager — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Running {len(AGENT_PROFILES)} agents...")
    print(f"{'='*50}")

    agents = [BESTAgent(profile) for profile in AGENT_PROFILES]

    total_sessions = 0
    for agent in agents:
        delay = random.uniform(1, 4)
        time.sleep(delay)
        try:
            agent.run_session()
            total_sessions += 1
        except Exception as e:
            print(f"  Agent {agent.name} crashed: {e}")
            continue

    print(f"\n{'='*50}")
    print(f"Manager complete — {total_sessions}/{len(agents)} agents ran successfully")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    print("BEST Agent Manager starting...")
    print("Press Ctrl+C to stop.\n")

    run_count = 0
    while True:
        run_count += 1
        print(f"\n--- RUN #{run_count} ---")
        run_all_agents()
        print(f"\nSleeping 30 minutes until next run...")
        print(f"Next run at: {datetime.now().strftime('%H:%M')}")
        time.sleep(1800)