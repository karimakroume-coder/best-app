# BEST — World Ranking Platform
## Context for Claude Code

---

## WHAT BEST IS

BEST is a global independent video ranking platform 
that answers one question no platform answers: 
what is genuinely the best content in the world right now?

Independence from platforms is the entire value proposition.
YouTube cannot objectively rank YouTube videos.
BEST can.

---

## THE CORE EXPERIENCE

**The Spatial Map** — not a feed. A world.
Every video has a permanent coordinate.
Rank 1 is always at the center.
Users navigate by swiping in 4 directions.
Pinch zooms between views.

**Zoom Levels:**
- 1x1: Single card full screen. Video plays. Dot UI visible.
- 3x3: Nine cards. Sound zoom — center card loudest.
- 5x5: Twenty-five cards. All muted. Landscape view.
- WORLD BEST: All cards form the letters WORLD BEST in gold.

**The DROP Animation:**
Every session opens with a cinematic fall from 
the WORLD BEST formation landing on a random rank.
Slow at start. Accelerating. Snaps to video.

---

## THE DOT UI

Single white dot appears on every video card.
Fades after 3 seconds.
Tap → three action dots appear:
  Left dot (gold 🎨): color wheel / fireflag
  Right dot (red ▶): watch on YouTube at peak moment
Long press left dot → color wheel opens.
Wave right edge → dots appear without pausing video.

---

## THE MARK — MOST ORIGINAL FEATURE

When user selects a color:

1. **Liquid spread**: Color bleeds from touch point 
   across entire screen like ink in water. 
   70% opacity. Video plays underneath.
   
2. **Strip keyboard appears**: 
   Single horizontal scrollable line.
   All letters A-Z, numbers 0-9.
   Letters grow larger as they approach 
   selection zone from right to left.
   User scrolls to find letter. Taps to select.
   One word builds above the strip.
   Zero cognitive friction. Preserves emotional state.
   
3. **Snapshot taken**: Screen freezes.
   Video frame + color + word + BEST watermark.
   Saved to device and database.
   Shareable to Instagram, WhatsApp, X.
   
4. **Permanent mark**: Small colored dot + word
   remains in corner of card forever.

The Mark = color + liquid spread + one word + snapshot.
This is BEST's fundamental unit of cultural expression.

---

## THE 7 COLORS

- Red #E74C3C — passion, intensity (free)
- Blue #2980B9 — trust, depth (free)  
- Green #27AE60 — growth, discovery (free)
- Yellow #F1C40F — joy, energy (free)
- Black #1A1A1A — power, mystery (free)
- White #FFFFFF — pure, clarity (free)
- Gold #C9A84C — EARNED ONLY. 500 Discovery Score 
  or top 1% Annual Badge. Lock icon shown.

---

## THE RANKING ALGORITHM

BEST Score = Velocity×0.40 + Retention×0.25 + 
             Geo×0.20 + Elite×0.10 + Spread×0.05

Velocity: views per hour since published.
Retention: likes/views ratio.
Geo: number of countries trending / 10.
Elite: bonus when high Discovery Score users watch.
Spread: cross-platform presence.

---

## THE HUNT GAME

Daily. One target image shown (no title, no rank).
Compass arrow points toward target from current position.
User navigates spatial map toward target.
Compass glows gold when within 5 ranks.
Gold pulse on discovery. +50 Discovery Score.
Leaderboard shows who found it fastest.
Resets daily at midnight UTC.

---

## THE FIREFLAG SYSTEM

10 fireflags per week. Maximum 20 active.
Absolute scarcity — cannot buy more.
Dark mode shows only flame-lit cards.
Amber = personal. Red = community. Orange = Flame Keeper.
Fireflag history accumulates permanently.

---

## MAP 2 — PERMANENT COORDINATES

Finite coordinate system. Creators own permanent spots.
Three acquisition paths:
- Founding creators: free choice, Founding District
- Merit grants: algorithm awards automatically
- Auctions: 10-15% of spots, labeled permanently

Dark cards: empty coordinates breathe and whisper
in local language. "feed it" "this place is waiting"
Whisper changes across 5 visits then goes silent.
Gold dot appears. Creator can claim for 7 days.

---

## DISCOVERY SCORE

0-1000 points.
+10: watch video below rank 500
+5: assign color to video
+20: place fireflag
+50: add to Personal Best 100
+50: complete Hunt game
+100: discover video before top 100
+30: fireflag video that rises (prediction accuracy)

Annual badges: Gold top 1%, Silver top 5%, Bronze top 15%.
Elite users (750+) get 3x weight in ranking algorithm.

---

## TECHNICAL STACK

Backend: FastAPI + APScheduler + Supabase + Gemini AI
Frontend: React (web) → React Native (Phase 2)
Database: Supabase (videos, rankings, users, color_assignments, fireflags)
AI: Gemini 2.0 Flash for video analysis
Auth: JWT tokens via Supabase Auth
Scheduler: Runs ranking pipeline every 15 minutes

API base: http://192.168.11.152:8000
Frontend: http://192.168.11.152:3000

File root: C:\Users\karim\Documents\BEST APP\

---

## CURRENT BUILD STATUS (August 2026)

COMPLETE:
- YouTube API fetching real trending data
- BEST scoring algorithm (velocity+retention+geo)
- Automated scheduler every 15 minutes
- Supabase tables: videos, rankings, users, color_assignments, fireflags
- FastAPI with 15 endpoints
- User authentication (JWT)
- React spatial map replacing list entirely
- DROP animation (two-phase spring)
- Zoom levels 1x, 3x3, 5x5, WORLD BEST formation
- Dot UI system (single dot → three dots → color wheel)
- Color wheel (7 colors, Gold locked)
- Color assignments saving to Supabase
- Discovery Score incrementing
- Gemini AI analyzer built (quota pending)
- PWA setup complete
- The Mark (liquid spread → Strip keyboard → html2canvas snapshot → permanent corner mark)
- Fireflag system with scarcity rules (10/week, 20 max active, 429 on limit)
- Dark mode (flame-lit cards only, fireflag glow, header toggle)
- Hunt game (HuntGame.js — compass navigation, gold pulse on discovery, +50 Discovery Score)
- Capacitor Android project scaffolded
- CORS fixed (phone origin allowed)
- /ranking/global optimized (no longer writes to Supabase on every request — fixed intermittent 500s)
- YouTube IFrame API — real video playback in single-card view (YouTubePlayer.js embedded in SpatialMap.js, 20% volume, pauses on color wheel)
- Online AI agents on GitHub Actions (.github/workflows/agents.yml — runs python -m agents.manager every 30 minutes)

IN PROGRESS THIS SESSION:
- Android PWA installation on phone
- AI agents system (20 agents, 20 countries)
- Personal Best 100 implementation (backend endpoints + add button live; no dedicated browse/view screen yet)

COMING NEXT:
- Daily shared Hunt target (backend endpoint needed)
- Hunt leaderboard
- React Native conversion (Phase 2)
- Countdown page for launch

---

## THE VISION

Launch: March 2027
Users: 500,000 by end of Year 1
Revenue target: €9,000/month by May 2027
Founder moves to Cartagena, Colombia: December 2026
Founder leaves JESA SA: June 2027

10-year projection: $9.5B cumulative net profit
Exit valuation Year 10: $120B-$200B

The platform becomes an institution.
The AI trained on color+word data becomes
the Bloomberg Terminal of culture.

---

## DESIGN PRINCIPLES

1. Restraint: interface appears only when summoned
2. Geography means something: center = best
3. Navigation is discovery: not search, not feed
4. The feeling before the function: DROP, liquid spread
5. Permanent: every Mark, fireflag, coordinate lasts forever
6. Independent: never financially tied to any platform
7. The word must be true: Strip keyboard preserves 
   the first impression before friction destroys it

---

## FOUNDER

Abdelkrim Akroume
Lead Piping Engineer, JESA SA, Morocco
Building BEST in evenings and weekends.
GitHub: karimakroume-coder