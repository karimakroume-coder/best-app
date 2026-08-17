# BEST Mobile (Expo / React Native)

Proof-of-concept scaffold demonstrating that the React Native shell
can connect to the existing Railway backend.

## Quick start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS) or the Expo dev client (Android).

## What this shows

On launch, the app fetches `GET /stats` from the Railway API
and renders platform statistics (videos ranked, users, marks, fireflags,
creator applications, early access signups) in a vintage-styled
dark screen. This confirms the mobile codebase can talk to the
same FastAPI backend that powers the web frontend.

## Relationship to frontend/

| | `frontend/` | `mobile/` |
|---|---|---|
| Framework | React (web) | React Native (Expo) |
| Runs in | Browser | Phone / Simulator |
| Shares | Backend API | Backend API |
| Router | react-router-dom | React Navigation (future) |
| State | localStorage | AsyncStorage (future) |

Both consume the same endpoints at
`https://web-production-a267.up.railway.app`.

## Next steps

- Install `@react-navigation/native` + stack/tab navigators
- Port SpatialMap → React Native `Animated` + `PanGestureHandler`
- Port ColorWheel → native gesture-driven picker
- Add `expo-secure-store` for JWT token persistence
- Add `expo-camera` for FLEX feature
- Configure EAS Build for APK / IPA generation
