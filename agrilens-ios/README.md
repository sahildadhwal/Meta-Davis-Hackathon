# 🌿 AgriLens AI — iOS

> AI-powered produce quality inspection for iOS. Meta smart glasses + Gemini Vision + ElevenLabs + Deepgram + Twilio.

---

## Architecture

```
Meta Glasses / Camera
      │
      ▼
  iOS App (Expo)  ──── Socket.io ────▶  Live Transcripts & Status
      │
      │  POST /api/analyze-image
      ▼
  Express Backend (port 3002)
      │
      ├──▶ Gemini 1.5 Flash Vision ──▶ Produce Diagnosis
      │
      └──▶ POST /api/call-bob
                │
                ├── Demo Mode (client-side): scripted 38s conversation
                │
                └── Real Mode:
                      ├──▶ Twilio Outbound Call
                      ├──▶ Deepgram STT
                      ├──▶ Gemini Translation
                      └──▶ ElevenLabs TTS → Twilio Playback
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp ../.env.example .env   # fill in your keys
npm run dev               # starts on port 3002
```

### 2. Mobile App

```bash
cd mobile
npm install
npx expo start --ios      # opens iOS Simulator
```

> **Physical device**: Change `DEFAULT_BACKEND_URL` in `mobile/constants/config.ts` to your Mac's local IP:
> `http://192.168.x.x:3002` (run `ifconfig | grep "inet "` to find it)

---

## Demo Flow (no backend required)

1. Launch app → tap **Scan Produce**
2. Pick any produce photo from library
3. Tap **Analyze Produce** — 2s later: BAD QUALITY diagnosis appears
4. Tap **Call Bob** → 38-second scripted bilingual call begins
5. Watch live Spanish ↔ English conversation in the Call screen

Demo Mode is **on by default**. No API keys needed.

---

## Screens

| Screen | Description |
|--------|-------------|
| **Home** | Status card, Demo toggle, Scan CTA, recent diagnosis |
| **Scan** | Camera capture or library upload, Meta glasses simulation |
| **Diagnosis** | Full AI diagnosis: severity, issues, recommendations, Call Bob button |
| **Call** | Live Bob conversation, wave animation, bilingual transcript feed |
| **Settings** | Backend URL config, connection test, service status |

---

## Real Call Mode

1. Set `BOB_PHONE_NUMBER` + `PUBLIC_URL` (ngrok) in `backend/.env`
2. Run `ngrok http 3002` → paste URL into `PUBLIC_URL`
3. Toggle **Demo Mode OFF** in Settings
4. Tap **Call Bob** — Twilio calls Bob's real number

---

## API Endpoints (port 3002)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analyze-image` | Gemini Vision produce analysis |
| `POST` | `/api/call-bob` | Initiate call (demo or real) |
| `GET` | `/api/transcripts` | All session transcripts |
| `DELETE` | `/api/transcripts` | Clear transcripts |
| `WS` | `/socket` | Real-time events |

### Socket Events (Server → App)

| Event | Payload |
|-------|---------|
| `analysis:complete` | Full DiagnosisData JSON |
| `call:status` | `{ status, message }` |
| `call:language` | `{ language: 'es' }` |
| `transcript` | `{ speaker, text, lang, translation, timestamp }` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo 51 |
| Navigation | Expo Router v3 |
| State | React Context + useReducer |
| Realtime | Socket.io client |
| AI Vision | Google Gemini 1.5 Flash |
| Voice Synthesis | ElevenLabs multilingual v2 |
| Speech-to-Text | Deepgram Nova-2 |
| Voice Calls | Twilio Voice API |
| Image Upload | Expo Image Picker + FormData |

---

## Mock Conversation (Demo Mode)

```
AI  → "Hello Bob. This is AgriLens AI. What is your preferred language?"
Bob → "Español, por favor."                    → "Spanish, please."

AI  → "Hola Bob. Hemos inspeccionado          → "Hello Bob. We inspected Lot #6 and
        el Lote número seis y encontramos         found serious problems. Severe
        problemas graves..."                      deterioration, HIGH severity."

Bob → "Sí, el refrigerador falló anoche..."  → "Yes, the refrigerator failed last night..."

AI  → "Debemos rechazar el lote completo..."  → "We must reject the entire lot..."

Bob → "Sí, tomaré fotos ahora..."            → "Yes, I'll take photos now..."

AI  → "Perfecto. ¡Gracias Bob!"              → "Perfect. Thank you Bob!"
```
