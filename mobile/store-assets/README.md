# Google Play Store — Submission Checklist

Package: `com.best.worldranking`
Version: 1.0.0 (versionCode: 1)

## Required Assets — STILL NEEDED

| Asset | Size | Status |
|-------|------|--------|
| App Icon (high-res) | 512 x 512 px PNG | MISSING |
| Feature Graphic | 1024 x 500 px PNG | MISSING |
| Phone Screenshots | Min 2, up to 8 (16:9 or 9:16) | MISSING |
| 7-inch Tablet Screenshots | Optional but recommended | MISSING |
| 10-inch Tablet Screenshots | Optional but recommended | MISSING |

### Screenshot suggestions
1. Spatial map (3x3 grid view with video cards)
2. Color wheel / Mark creation in action
3. Fireflag placed on a video
4. Hunt game compass pointing toward target
5. Personal Best 100 list

## Store Listing Copy

| Field | Max Length | File |
|-------|-----------|------|
| Short description | 80 chars | `listing-copy.md` |
| Full description | 4,000 chars | `listing-copy.md` |

## Content Rating

BEST will need a IARC content rating questionnaire. Expected rating:
**Everyone** — no violence, no mature content. Users mark videos with
colors and words. No user-generated social feed.

## Privacy Policy — BLOCKING

Play Store requires a **hosted privacy policy URL**. BEST does not have
one yet. Options:

1. Deploy a static privacy policy page on Vercel (e.g. `best-app-chi.vercel.app/privacy`)
2. Use a third-party generator (termly.io, privacypolicygenerator.info)
3. Write a custom policy with a lawyer

**This is a hard blocker — cannot submit without it.**

## Data Safety / Data Privacy

Play Store requires declaring what data the app collects:

| Data Type | Collected | Shared | Required for functionality |
|-----------|-----------|--------|---------------------------|
| Personal info (email) | Yes | No | Account creation |
| Photos/Media (camera) | Yes | No | FLEX feature |
| App activity | Yes | No | Discovery Score tracking |
| Device identifiers | No | No | — |

## Pre-Submission Testing

- [ ] `npx expo run:android` builds successfully
- [ ] App launches and connects to Railway backend
- [ ] Camera permission prompt appears when opening FLEX
- [ ] All screens render without crashes
- [ ] Tested on at least 2 physical devices or emulators

## EAS Build

To generate the APK / AAB for submission:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

This produces a `.aab` file ready for Play Console upload.
