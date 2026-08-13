import requests
import time
from agents.profiles import AGENT_PROFILES

API = "http://127.0.0.1:8000"

print("Registering 20 BEST agents...")
print()

failed = []

for profile in AGENT_PROFILES:
    name = profile["name"]
    email = profile["email"]
    
    try:
        res = requests.post(f"{API}/auth/register", json={
            "email": email,
            "password": "BESTAgent2026!"
        }, timeout=30)
        
        if res.status_code == 200:
            print(f"Registered: {name}")
        else:
            res2 = requests.post(f"{API}/auth/login", json={
                "email": email,
                "password": "BESTAgent2026!"
            }, timeout=30)
            if res2.status_code == 200:
                print(f"Already exists: {name}")
            else:
                print(f"Failed: {name}")
                failed.append(profile)
    except Exception as e:
        print(f"Timeout: {name} — retrying...")
        failed.append(profile)
    
    time.sleep(1)

if failed:
    print(f"\nRetrying {len(failed)} failed agents...")
    time.sleep(3)
    for profile in failed:
        name = profile["name"]
        email = profile["email"]
        try:
            res = requests.post(f"{API}/auth/register", json={
                "email": email,
                "password": "BESTAgent2026!"
            }, timeout=30)
            if res.status_code == 200:
                print(f"Registered: {name}")
            else:
                res2 = requests.post(f"{API}/auth/login", json={
                    "email": email,
                    "password": "BESTAgent2026!"
                }, timeout=30)
                if res2.status_code == 200:
                    print(f"Already exists: {name}")
                else:
                    print(f"Still failed: {name}")
        except Exception as e:
            print(f"Still timing out: {name}")
        time.sleep(2)

print()
print("Done.")