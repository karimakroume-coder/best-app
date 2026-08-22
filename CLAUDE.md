# CLAUDE.md UPDATE — DESIGN SYSTEM PIVOT
## Add/replace this section in the live CLAUDE.md
## Date: August 22, 2026

---

## ⚠️ DESIGN DIRECTION CHANGE (August 22, 2026)

**This supersedes any earlier "vintage championship / embossed /
letterpress / film grain / cinematic" design language found
elsewhere in this document or in prior task history (T015, T019,
T022, the Design OS export, the Figma mandala work). Product
mechanics are UNCHANGED. Only the visual design system changed.**

**Rationale:** After extensive iteration (Figma hand-building,
Design OS exports, v0 generations, Google AI Studio generations),
the vintage/embossed direction proved slow to execute consistently
and risked reading as "trying too hard" rather than genuinely
premium. The team converged on a flatter, more confident, more
executable design language that still avoids looking like generic
SaaS/social apps — achieved through a distinctive rounded-rectangle
brand device and disciplined typography contrast, rather than
through texture/depth effects.

---

## LOCKED COLOR PALETTE (unchanged — same hex values as before)

```css
--color-gold: #F0C040;      /* Champagne Gold — primary accent,
                                 headlines, logo, active states,
                                 icon fills */
--color-bordeaux: #5C1A1A;  /* card fills, rectangle backgrounds,
                                 rich surfaces, secondary button fills */
--color-parchment: #F5E6C8; /* body text where not gold */
--color-bg: #0D0800;        /* page background — warm near-black,
                                 NOT pure #000000 */
```

No other colors are used in the UI. No blue, no purple, no
additional accent colors.

---

## TYPOGRAPHY SYSTEM (NEW — replaces Times New Roman / Bebas Neue /
## Pacifico system referenced elsewhere in this document)

**Font family: Poppins (Google Fonts), two weights only:**

```
DISPLAY / HEADLINES / LOGO / RANK NUMBERS / BUTTON LABELS:
  Poppins Black (900) or Poppins ExtraBold (800)
  - Wide letter-spacing (tracking)
  - Solid gold (#F0C040) fill
  - Always FLAT — no text-shadow, no gradient,
    no emboss/letterpress layering
  - Used for: logo wordmark, rank numbers,
    video titles, section headers, button labels
    (MARK / FLEX / MY 100 / RADAR)

SECONDARY / BODY / METADATA:
  Poppins ExtraLight (200)
  - Used for: creator names, timestamps,
    category labels (unselected state),
    AI-generated descriptions, fireflag/consensus
    counts, subtitles
  - Color: Parchment (#F5E6C8) or Gold at
    reduced opacity depending on context
```

**Pacifico script font is DEPRECATED.** Do not use it for AI
poetic descriptions or anywhere else. Replace all existing
Pacifico references with Poppins ExtraLight.

**Times New Roman is DEPRECATED.** Do not use for logo or headlines.

---

## VISUAL TREATMENT RULES (STRICT — apply globally)

```
REMOVE EVERYWHERE, if present from earlier work:
  ✗ text-shadow / letterpress emboss layering
    on rank numbers or any text
  ✗ film grain texture overlays
  ✗ radial vignette darkening at screen/card edges
  ✗ box-shadow gradients simulating "physical depth"
  ✗ any gradient fills except where explicitly
    specified below

KEEP / APPLY EVERYWHERE:
  ✓ Flat fills only — solid gold, solid bordeaux,
    solid parchment
  ✓ Rounded-rectangle as the universal shape
    language (see Brand Device below)
  ✓ Generous negative space
  ✓ Sharp, confident edges — moderate corner
    radius (8-16px range), not fully pill-shaped
    except where noted
```

---

## THE BRAND DEVICE — ROUNDED RECTANGLE (core visual identity)

Every interactive element and every badge/label in BEST uses the
same construction:

```
- Rounded rectangle (or circle for icon-only buttons)
- Thin gold (#F0C040) outline stroke, ~1.5-2px
- Bordeaux (#5C1A1A) solid fill inside
- Content (text or icon) in flat gold, centered
- Small gold sparkle/star accent (✦) optionally
  placed just outside the top-right corner —
  used on the primary logo mark and can be used
  sparingly on other high-emphasis elements
  (not on every button — reserve for emphasis)
```

Applies to: the logo, the app icon (B mark), category pills,
"RISING FAST" badge, "#1 CONSENSUS"-style rank badges, all
circular action buttons (MARK / FLEX / MY 100 / RADAR, and the
right-edge metric stack icons), the central play button overlay.

---

## THE LOGO (finalized)

```
Wordmark: rounded rectangle, gold outline, bordeaux fill,
"BEST" centered in Poppins Black, wide letter-spacing, flat
gold fill, small gold sparkle accent top-right corner of the
rectangle.

App icon / B mark: same treatment, square rounded-rect,
single letter "B" centered, same gold sparkle accent.

Files: [to be generated as SVG/PNG assets and placed in
frontend/src/assets/ — see integration task]
```

---

## REFERENCE SCREEN — SINGLE CARD VIEW (confirmed design, ready
## for implementation)

Layout, confirmed via Google AI Studio generation and reviewed:

```
HEADER (top of screen):
  Left: "B" mark (rounded-rect, tap → map navigation, per
        existing Five Map System / B navigation logic — UNCHANGED)
  Center: "BEST" wordmark (rounded-rect)
  Right: Vault — oval frame showing rotating FLEX profile photos
         (existing mechanic — UNCHANGED, restyle container only
         to rounded-rect/oval outline treatment)
  Below: category strip — GLOBAL / MUSIC / GAMING / SPORTS /
         ENTERTAINMENT / etc. Poppins ExtraLight, active category
         in gold with small dot indicator below it, unselected
         categories dimmed

MAIN CARD:
  Full-bleed video/thumbnail fills the frame
  Top-left overlay: "#1 CONSENSUS"-style rank badge
    (rounded-rect, rank number in Poppins Black gold,
    "CONSENSUS" or category label in Poppins ExtraLight
    beside it, separated by a thin vertical divider)
  Center: play button — bordeaux rounded-square, gold outline,
    gold play triangle icon, tap to play/pause
  Right edge, vertical stack: mute toggle, then 3 metric
    buttons (fireflag count, consensus/comment count, share
    count) — each a filled circle (gold for the "hero" metric
    like fireflag, bordeaux-outline for others), icon centered,
    NUMBER LABEL DIRECTLY BELOW each circle in Poppins ExtraLight,
    plus a "more" (•••) circle at the bottom of the stack with
    "MORE" label
  Lower-left overlay (never overlapping the rank badge or the
    right-edge stack):
    "↗ RISING FAST" pill (rounded-rect, only shown when
      applicable — wire to existing /ranking/rising endpoint)
    Video title — Poppins Black, gold, large
    One line of context (e.g. "Captured in Maui") —
      Poppins ExtraLight, parchment
    Creator credit — Poppins ExtraLight, parchment,
      dimmed slightly (e.g. "by [Creator] (@handle)")
    "🔥 Fireflag consensus by [N] peers" —
      Poppins ExtraLight, gold, small

BOTTOM ACTION BAR:
  4 items, evenly spaced, each: circle icon button (gold fill
    for MARK/FLEX/MY 100, or consistent styling per existing
    action semantics) + Poppins Black label below in gold:
    MARK   FLEX   MY 100   [Mandala/Radar icon]
  The 4th item is the existing Mandala control — keep its
    rotating-rings animation and bloom/retreat tap-and-hold
    behavior UNCHANGED, restyle only its resting-state visual
    treatment to match (thin gold rings on transparent/bordeaux,
    no change to interaction logic)
  Below the bar: a small position indicator
    (e.g. "#1/8") showing position within current zoom/browse
    context — new, lightweight addition, ties to existing
    zoom-level state
```

**This screen replaces the "SingleCardView" component from the
earlier Design OS integration (product-plan/sections/
spatial-map-world-best/components/SingleCardView.tsx) — that
component's DATA WIRING logic (props, types, Railway API mapping)
is still correct and should be reused; only its INTERNAL JSX/CSS
visual implementation is replaced by this new design.**

---

## WHAT IS EXPLICITLY UNCHANGED (do not modify)

```
- Mandala Control Center interaction logic (tap to bloom,
  hold to retreat) — visual restyle only, behavior identical
- Five Map System + B navigation logic
- The Mark (color + word + liquid spread + snapshot) mechanic
  — visual restyle of the color wheel/UI chrome only, core
  interaction unchanged
- FLEX camera panel, overlay system, FLEX Wall — visual
  restyle only
- Hunt Game, Discovery Score, milestone system — unchanged
- Fireflag scarcity system (10/week, 20 max active) — unchanged
- Spatial map coordinate grid, zoom levels, DROP animation
  — unchanged
- All backend endpoints, Railway/Supabase architecture,
  GitHub Actions agents — completely unaffected by this
  frontend visual change
- Video, User, Mark, Fireflag, Hunt, Coordinate data entities
  — unchanged
```

---

## IMPLEMENTATION NOTES FOR CLAUDE CODE / OPENCODE

```
1. Update design-system/tokens.css (or equivalent) with the
   new Poppins font-family declarations and remove/comment-out
   the old emboss shadow / film-grain / vignette CSS custom
   properties and utility classes.

2. Import Poppins from Google Fonts (weights 200 and 800/900)
   in the app's font loading (index.html <link> or CSS @import).

3. Build a reusable "RoundedRectBadge" or similar shared
   component implementing the Brand Device (gold outline,
   bordeaux fill, optional sparkle accent) so it's used
   consistently rather than re-implemented per-screen.

4. Replace SingleCardView's internal render with the new
   layout spec above, reusing its existing props/types/data
   fetching exactly as-is.

5. Do NOT touch: main.py, ranking/, agents/, database/,
   any Railway/Supabase configuration, or any .sql migration
   files. This is a frontend-only visual change.

6. Test on actual phone viewport before considering complete
   — confirm no text overlap (this was a real issue caught
   in design review and fixed before finalizing this spec).
```
