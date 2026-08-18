# Milestone 2: Spatial Map (World Best)

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

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
