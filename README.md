# Smart Produce Inspection Assistant

> React Native + Expo phone app — Meta Smart Glasses Hackathon Demo

---

## What This Is

A phone app that simulates a Meta smart glasses produce inspection assistant. The phone camera acts as the glasses camera for v1. Point it at produce, get an AI-powered quality diagnosis spoken aloud, and trigger a multilingual workflow to notify the warehouse supervisor (Bob).

**This is not a web app.** It is a native mobile app built with React Native and Expo, designed to run on iPhone via Expo Go during the hackathon demo.

---

## Current Status

**Phase 1 — Foundation complete. App runs on Expo Go.**

React Native + Expo + TypeScript foundation is live. All 4 placeholder screens are navigable. Camera, AI, and session logic arrive in later phases.

---

## How the Demo Works

1. Open the app on iPhone using Expo Go.
2. Tap **Capture Produce Photo** — the phone camera captures an image (simulating Meta glasses capture).
3. Tap **Analyze Produce** — the AI inspects quality.
4. App displays result: **Needs Attention** (default unless produce is clearly perfect).
5. App **speaks** a short diagnosis aloud using the phone speaker.
6. User taps **Notify Bob**.
7. Bob's communication panel opens — Bob selects **Spanish**.
8. App displays an explanation in Spanish.
9. Bob types a response in Spanish.
10. App translates Bob's response to English.
11. Dashboard updates with full session summary.

---

## MVP Features

- Phone camera capture (v1 simulation of Meta glasses capture)
- AI produce quality inspection (mock first, real AI in Phase 10)
- Spoken diagnosis via expo-speech
- User confirmation flow to notify Bob
- Bob communication simulator with language selection
- Spanish ↔ English translation
- Session dashboard summary
- Local session persistence with AsyncStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Camera | expo-camera |
| Speech | expo-speech |
| Local Storage | AsyncStorage |
| AI (mock) | Local mock services |
| AI (real) | Backend API (Phase 10) |

---

## Folder Structure

```
meta-agi-phone/
├── app/                  # Expo Router screens
├── components/
│   ├── layout/           # Layout wrappers
│   ├── ui/               # Reusable UI components
│   ├── capture/          # Camera capture logic (isolated)
│   ├── inspection/       # Inspection result display
│   ├── bob/              # Bob communication simulator
│   └── dashboard/        # Dashboard summary
├── hooks/                # Custom React hooks
├── services/
│   ├── ai/               # All AI logic (mock + real)
│   └── session/          # Session persistence (AsyncStorage)
├── types/                # Shared TypeScript interfaces
├── constants/            # Colors, strings, config
├── assets/               # Images, icons
├── tests/                # Tests
└── docs/                 # Extended documentation
```

---

## How to Run

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) installed on your iPhone
- iPhone and Mac on the **same Wi-Fi network**

### Steps

```bash
npm install
npx expo start
```

Expo will start Metro Bundler and display a QR code in the terminal.

1. Open the **Camera** app on your iPhone.
2. Point it at the QR code in the terminal.
3. Tap the banner that appears — it opens the app in **Expo Go**.

> If the QR code doesn't scan, open Expo Go manually and tap **Scan QR code**.

### Clear cache if needed

```bash
npx expo start --clear
```

### TypeScript check

```bash
npm run typecheck
```

---

## Future: Real Meta Glasses Integration

In v1, the phone camera simulates Meta smart glasses capture. In a future version:

- The app would receive the image stream directly from Meta smart glasses hardware.
- The capture component is deliberately isolated so this swap requires only changes inside `components/capture/`.
- No other part of the app needs to change when the camera source changes.

---

## Demo Rules

- Default produce status is **Needs Attention** or **Not Sufficient** unless the image clearly shows perfect produce quality. This keeps the demo engaging and the workflow active.
- All demo flows must complete end-to-end without backend connectivity failures blocking the demo. Mock services are the safety net.
