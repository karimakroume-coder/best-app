# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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
