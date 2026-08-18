# BEST — Complete Implementation Instructions

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Testing

Each section includes a `tests.md` file with UI behavior test specs. These are **framework-agnostic** — adapt them to your testing setup.

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

---

# BEST — Product Overview

BEST is a global independent video ranking platform that answers one question no platform answers: what is genuinely the best content on earth right now — independently, without algorithmic bias or platform conflict of interest.

**Planned Sections:**
1. **Spatial Map (World Best)** — Core ranked video experience
2. **The Mark System** — Color + word cultural expression
3. **Mandala Control Center & Five Map System** — Hidden UI and map navigation
4. **Hunt Game & Discovery Score** — Daily discovery challenge
5. **Creator Studio & Fireflag System** — Creator controls and endorsements

**Entities:** Video, User, Mark, Fireflag, Hunt, Coordinate

---

# Milestone 1: Shell

## Goal

Set up the design tokens and application shell — the mandala-first, bloom-on-demand navigation system.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

### 2. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with bloom/retreat state machine

**Shell Behavior:**
- Default state: Video fills 100%, only Mandala visible (bottom-right, 60px)
- Tap Mandala: UI blooms outward (category strip, B navigation, action bar, vault)
- Hold Mandala 3s: UI retreats, video returns to fullscreen

**Navigation Maps:**
- World Best (W) — Global ranking
- Best Map (M) — Map 2 permanent coordinates
- My Best (Y) — Personal Best 100
- Crew Best (C) — Group voting
- Crown (K) — Competition map

**Action Bar Buttons:**
- MARK, FLEX, MY 100, RADAR

**Color System:**
- Champagne Gold #F0C040 (mandala, accents)
- Bordeaux #5C1A1A (surfaces)
- Parchment #F5E6C8 (text)
- Warm near-black #0D0800 (background)

**Typography:**
- Bebas Neue for UI labels
- Times New Roman Bold for display
- Pacifico for script accents

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured
- [ ] Shell renders with mandala
- [ ] Tap mandala blooms UI
- [ ] Hold mandala retreats UI
- [ ] Category strip, B nav, action bar, vault all appear on bloom
- [ ] Responsive on mobile

---

# Milestone 2: Spatial Map (World Best)

## Goal

Implement the single-card video view — the most-seen screen in BEST.

## Overview

The single-card view fills the entire screen with video content, overlaid with a championship trophy aesthetic. Rank numbers are physically embossed into the image using a 3-layer gold shadow system. No persistent UI on the video itself — all actions are accessed through the Mandala.

**Key Functionality:**
- Display a single ranked video filling the entire screen
- Show embossed gold rank number (#1, #2, etc.) with 3-layer shadow depth
- Display video title, creator name, and fireflag count
- Show AI poetic description in Pacifico italic
- Display "RISING FAST" gold pill badge when video is climbing
- Show right-edge metric stack (fireflag, FLEX, share counts) as gold medallions
- Tap Mandala to bloom action bar
- Swipe to navigate between ranked videos
- Pinch to zoom between zoom levels

## Components Provided

Copy the section components from `product-plan/sections/spatial-map-world-best/components/`:

- `SingleCardView.tsx` — Main single-card view with video background, vignette, grain
- `RankNumber.tsx` — 3-layer embossed gold rank number
- `MetricStack.tsx` — Right-edge vertical metric medallions
- `RisingFastBadge.tsx` — Gold pill badge for rising videos

## Props Reference

The components expect these data shapes (see `types.ts` for full definitions):

**Data props:**
- `currentVideo: Video` — The currently displayed video with rank, title, creator, scores, metrics
- `nearbyVideos: Video[]` — Adjacent ranked videos for swipe navigation
- `zoomLevel: ZoomLevel` — Current zoom level ('1x1', '3x3', '5x5', 'WORLD_BEST')

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onNavigateToVideo` | User swipes to navigate to another video |
| `onTogglePlayPause` | User taps video to play/pause |
| `onZoomChange` | User pinches to change zoom level |
| `onMandalaTap` | User taps the Mandala to open action bar |
| `onMandalaHold` | User holds Mandala to dismiss UI |

## Expected User Flows

### Flow 1: View Ranked Video

1. User opens app / navigates to a rank
2. Video fills entire screen with cinematic vignette and film grain
3. Embossed rank number visible top-left
4. Title, creator, fireflag count, AI description visible lower-third
5. Metric stack visible right edge
6. Mandala spinning bottom-right

### Flow 2: Navigate Between Videos

1. User swipes up/down on the video
2. Current video transitions out, next ranked video transitions in
3. All overlay elements update (rank, title, metrics)

### Flow 3: Open Action Bar

1. User taps the Mandala (bottom-right)
2. UI blooms: category strip (top), B navigation (left), action bar (bottom), vault (top-right)
3. User can tap MARK, FLEX, MY 100, or RADAR

### Flow 4: Dismiss UI

1. User holds Mandala for 3 seconds
2. All UI elements retreat back into mandala
3. Video returns to 100% fullscreen

## Empty States

- **No video data:** Show a loading state or empty card with BEST branding
- **No metrics:** Show zero counts gracefully

## Testing

See `product-plan/sections/spatial-map-world-best/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/spatial-map-world-best/README.md` — Feature overview
- `product-plan/sections/spatial-map-world-best/tests.md` — UI behavior test specs
- `product-plan/sections/spatial-map-world-best/components/` — React components
- `product-plan/sections/spatial-map-world-best/types.ts` — TypeScript interfaces
- `product-plan/sections/spatial-map-world-best/sample-data.json` — Test data

## Done When

- [ ] Components render with real data
- [ ] Embossed rank number displays with 3-layer gold depth
- [ ] Video frame has rounded corners and gold border
- [ ] Film grain and vignette overlays render
- [ ] Metric stack shows as gold medallions
- [ ] Rising Fast badge appears conditionally
- [ ] Mandala spins and triggers bloom on tap
- [ ] All callback props are wired to working functionality
- [ ] Matches the visual design
- [ ] Responsive on mobile
