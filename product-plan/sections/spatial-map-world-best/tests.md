# Test Specs: Spatial Map (World Best)

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Spatial Map single-card view is the primary screen in BEST. It displays a single ranked video filling the entire screen with embossed rank numbers, metadata overlays, and a spinning mandala. Tests should verify the visual presentation, conditional badges, and mandala interaction.

---

## User Flow Tests

### Flow 1: View Ranked Video

**Scenario:** User opens the app and sees the #1 ranked video

**Setup:**
- `currentVideo` is set to rank 1 with all fields populated
- `isRisingFast` is `true`

**Steps:**
1. User opens the app
2. Video fills entire screen background
3. User sees rank number "#1" in top-left

**Expected Results:**
- [ ] Video background fills the entire screen (no padding, no overflow)
- [ ] Rank number "#1" is visible in top-left corner
- [ ] Rank number has embossed gold appearance (3 visible layers)
- [ ] Title "THE LAST DANCE — EPISODE 10" is visible in lower-third
- [ ] Creator "ESPN" is visible below title in gold
- [ ] "FIREFLAG BY 2,847 CURATORS" text is visible
- [ ] AI poetic description in Pacifico italic is visible
- [ ] "RISING FAST" gold pill badge is visible near rank number
- [ ] Right-edge metric stack shows 3 gold medallions (fireflag, FLEX, share)
- [ ] Mandala (3 spinning gold rings) is visible bottom-right

### Flow 2: Navigate Between Videos

**Scenario:** User swipes to see the next ranked video

**Setup:**
- `currentVideo` is rank 1
- `nearbyVideos` contains ranks 2-8

**Steps:**
1. User swipes up on the video
2. Current video transitions out
3. Next video (#2) transitions in

**Expected Results:**
- [ ] Rank number updates to "#2"
- [ ] Title updates to "BOHEMIAN RHAPSODY — REMASTERED 4K"
- [ ] Creator updates to "QUEEN OFFICIAL"
- [ ] Fireflag count updates to "2,103"
- [ ] AI description updates
- [ ] "RISING FAST" badge disappears (isRisingFast is false for rank 2)
- [ ] Metric stack values update

### Flow 3: Open Action Bar via Mandala

**Scenario:** User taps the Mandala to access actions

**Setup:**
- App is in default state (UI hidden)
- Mandala is visible bottom-right

**Steps:**
1. User taps the Mandala (bottom-right)
2. UI blooms outward

**Expected Results:**
- [ ] Category strip slides down from top (GLOBAL, MUSIC, GAMING, etc.)
- [ ] BEST wordmark appears top-left in gold
- [ ] B navigation letters appear on left edge (W, M, Y, C, K)
- [ ] Action bar appears bottom-center with 4 gold medallion buttons
- [ ] Vault appears top-right
- [ ] All animations feel organic (spring easing, not linear)

### Flow 4: Dismiss UI via Mandala Hold

**Scenario:** User holds Mandala to return to fullscreen

**Setup:**
- App is in bloom state (UI visible)

**Steps:**
1. User holds Mandala for 3 seconds
2. All UI elements retreat

**Expected Results:**
- [ ] Category strip slides up and fades
- [ ] B navigation slides left and fades
- [ ] Action bar slides down and fades
- [ ] Vault slides up and fades
- [ ] Video returns to 100% fullscreen
- [ ] Mandala remains visible

---

## Empty State Tests

### No Video Data

**Scenario:** No video data is available

**Setup:**
- `currentVideo` is `null` or has empty fields

**Expected Results:**
- [ ] Component does not crash
- [ ] Shows a loading state or empty card with BEST branding
- [ ] Mandala still renders and is tappable

---

## Component Interaction Tests

### RankNumber

**Renders correctly:**
- [ ] Displays "#1" for rank 1
- [ ] Displays "#42" for rank 42
- [ ] Three layered spans are present (deep, mid, bright)

**Visual:**
- [ ] Deep shadow layer is offset 4px down and right
- [ ] Mid shadow layer is offset 2px down and right
- [ ] Bright face has gradient background clip

### MetricStack

**Renders correctly:**
- [ ] Shows fireflag count as "2.8k" for 2847
- [ ] Shows FLEX count as "1.2k" for 1203
- [ ] Shows share count as "456" for 456 (under 1000, no abbreviation)
- [ ] Three gold medallion circles are visible

### RisingFastBadge

**Conditional rendering:**
- [ ] When `visible` is `true`, badge renders with "RISING FAST" text
- [ ] When `visible` is `false`, badge returns `null` (not in DOM)

---

## Edge Cases

- [ ] Handles very long video titles with text truncation or wrapping
- [ ] Works correctly with rank #1 and rank #999
- [ ] Handles zero metrics (fireflagCount: 0, flexCount: 0, shareCount: 0)
- [ ] Handles very large metrics (fireflagCount: 999999 → "1000.0k")
- [ ] Mandala tap does not trigger video play/pause simultaneously
- [ ] Film grain overlay does not block pointer events on underlying elements

---

## Accessibility Checks

- [ ] Mandala has appropriate aria-label ("Open navigation")
- [ ] Rank number has appropriate aria-label ("Ranked number 1")
- [ ] Action bar buttons have aria-labels
- [ ] Focus is managed appropriately after mandala bloom/retreat
- [ ] Color contrast meets WCAG AA for text over video backgrounds

---

## Sample Test Data

```typescript
// Populated state
const mockVideo = {
  id: "vid_001",
  rank: 1,
  title: "The Last Dance — Episode 10",
  creator: "ESPN",
  thumbnailUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&h=1080&fit=crop",
  videoUrl: "https://www.youtube.com/watch?v=example1",
  bestScore: 9847,
  isRisingFast: true,
  fireflagCount: 2847,
  flexCount: 1203,
  shareCount: 456,
  aiDescription: "A championship moment that transcends sport — raw, eternal, golden.",
  category: "sports",
  publishedAt: "2026-08-17T14:30:00Z",
  velocity: 342,
  retention: 0.94,
  geoSpread: 47,
  eliteBonus: true,
};

const mockEmptyVideo = {
  ...mockVideo,
  title: "",
  creator: "",
  aiDescription: "",
  isRisingFast: false,
  fireflagCount: 0,
  flexCount: 0,
  shareCount: 0,
};
```
