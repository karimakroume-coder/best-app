#!/usr/bin/env python3
"""
Creator Application Digest — run manually.
Shows application stats, status breakdown, top referrers, and pending reviews.

Usage:
    python scripts/creator_digest.py
"""

import os, sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv()

from database.client import get_client

GOLD = "\033[33m"
DIM = "\033[2m"
BOLD = "\033[1m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
RESET = "\033[0m"

DIVIDER = f"{DIM}{'-' * 56}{RESET}"


def main():
    client = get_client()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())

    all_apps = (
        client.table("creator_applications")
        .select("id, name, email, status, ref, applied_at, youtube_url, primary_category, why_best")
        .order("applied_at", desc=True)
        .execute()
    )
    rows = all_apps.data or []

    today = [r for r in rows if r.get("applied_at") and datetime.fromisoformat(r["applied_at"].replace("Z", "+00:00")) >= today_start]
    this_week = [r for r in rows if r.get("applied_at") and datetime.fromisoformat(r["applied_at"].replace("Z", "+00:00")) >= week_start]

    status_counts = {}
    for r in rows:
        s = r.get("status", "unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    ref_counts = {}
    for r in rows:
        ref = r.get("ref")
        if ref:
            ref_counts[ref] = ref_counts.get(ref, 0) + 1
    top_refs = sorted(ref_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    pending = [r for r in rows if r.get("status") == "pending"]

    print()
    print(f"  {GOLD}{BOLD}BEST CREATOR DIGEST{RESET}")
    print(f"  {DIM}{now.strftime('%Y-%m-%d %H:%M UTC')}{RESET}")
    print(DIVIDER)

    print(f"\n  {BOLD}TOTALS{RESET}")
    print(f"  All time:       {BOLD}{len(rows)}{RESET}")
    print(f"  Today:          {BOLD}{len(today)}{RESET}")
    print(f"  This week:      {BOLD}{len(this_week)}{RESET}")

    print(f"\n  {BOLD}BY STATUS{RESET}")
    for status, count in sorted(status_counts.items()):
        color = GREEN if status == "approved" else RED if status == "rejected" else YELLOW
        print(f"  {color}{status.upper():<12}{RESET} {count}")

    if top_refs:
        print(f"\n  {BOLD}TOP REFERRERS{RESET}")
        for ref, count in top_refs:
            print(f"  {CYAN}{ref:<20}{RESET} {count} application{'s' if count != 1 else ''}")

    if pending:
        print(f"\n  {BOLD}PENDING REVIEW ({len(pending)}){RESET}")
        for r in pending:
            name = r.get("name", "?")
            email = r.get("email", "?")
            cat = r.get("primary_category") or ""
            applied = r.get("applied_at", "")[:10]
            cat_tag = f" {DIM}[{cat}]{RESET}" if cat else ""
            print(f"  {applied}  {GOLD}{name}{RESET}  {DIM}{email}{RESET}{cat_tag}")
    else:
        print(f"\n  {BOLD}PENDING REVIEW{RESET}")
        print(f"  {GREEN}None — all caught up!{RESET}")

    print(f"\n{DIVIDER}")
    print()


if __name__ == "__main__":
    main()
