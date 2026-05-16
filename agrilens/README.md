# 🌿 AgriLens AI

> Multilingual AI-powered produce quality inspection using Meta smart glasses, Gemini Vision, ElevenLabs, Deepgram, and Twilio.

---

## Architecture

```
Meta Glasses / Image Upload
        │
        ▼
  Next.js Frontend  ──── Socket.io ────▶  Real-time Dashboard
        │                                   (transcripts, status)
        │ POST /api/analyze-image
        ▼
  Express Backend
        │
        ├──▶ Gemini Vision API ──▶ Produce Diagnosis (JSON)
        │
        └──▶ POST /api/call-bob
                  │
                  ├── Demo Mode: Simulated bilingual conversation
                  │
                  └── Real Mode:
                        │
                        ├──▶ Twilio Outbound Call ──▶ Bob's Phone
                        │         │
                        │   Twilio Webhooks
                        │         │
                        ├──▶ Deepgram STT ──▶ Transcript
                        │
                        ├──▶ Gemini Translation ──▶ English
                        │
                        └──▶ ElevenLabs TTS ──▶ Spanish Audio ──▶ Twilio Playback
```

---

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp .env.example backend/.env
# Edit backend/.env with your API keys
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:3000**

---

## Demo Flow

1. **Upload** a produce image (any photo works for demo)
2. **Gemini** analyzes and returns a BAD QUALITY diagnosis for Lot #6
3. Click **"Call Bob"** — Demo Mode is on by default
4. Watch the **live bilingual conversation** unfold over ~38 seconds:
   - AI asks Bob's preferred language
   - Bob says Spanish
   - AI explains the produce issue in Spanish
   - Bob explains the refrigerator failure
   - AI recommends rejecting the shipment
5. Both the **original Spanish** and **English translation** appear in real-time

---

## Real Phone Call Mode

To make an actual phone call to Bob:

1. Set `BOB_PHONE_NUMBER` in `backend/.env`
2. Install ngrok: `brew install ngrok`
3. Run: `ngrok http 3001`
4. Copy the `https://xxx.ngrok.io` URL into `PUBLIC_URL` in `backend/.env`
5. Toggle **Demo Mode OFF** in the dashboard
6. Click **Call Bob**

Twilio will call Bob's number. When answered, the full speech pipeline activates.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-image` | Upload image → Gemini Vision analysis |
| `POST` | `/api/call-bob` | Initiate call (real or demo) |
| `GET`  | `/api/transcripts` | Fetch all transcripts |
| `DELETE` | `/api/transcripts` | Clear transcript history |
| `GET`  | `/api/twiml/greeting` | Twilio webhook — call greeting |
| `POST` | `/api/twiml/language` | Twilio webhook — language detection |
| `POST` | `/api/twiml/status` | Twilio webhook — call status |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `analysis:complete` | Server → Client | Full diagnosis JSON |
| `call:status` | Server → Client | `{ status, message }` |
| `call:language` | Server → Client | `{ language: 'es' }` |
| `transcript` | Server → Client | `{ speaker, text, lang, translation, timestamp }` |
| `transcripts:cleared` | Server → Client | — |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Realtime | Socket.io |
| AI Vision | Google Gemini 1.5 Flash |
| Voice Synthesis | ElevenLabs (eleven_multilingual_v2) |
| Speech-to-Text | Deepgram Nova-2 |
| Voice Calls | Twilio Voice API |
| Image Upload | Multer |

---

## Mock Conversation (Demo Mode)

```
AI  → "Hello Bob. This is AgriLens AI. What is your preferred language?"
Bob → "Español, por favor."                        [Translation: "Spanish, please."]

AI  → "Hola Bob. Hemos inspeccionado el Lote #6   [Hello Bob. We inspected Lot #6 and
        y encontramos problemas serios de calidad…"  found serious quality issues…]

Bob → "Sí, el refrigerador tuvo fallas ayer…"     [Yes, the refrigerator failed yesterday…]

AI  → "Entendido. Recomendamos rechazar el         [Understood. We recommend rejecting
        envío completo…"                             the entire shipment…]

Bob → "Sí, tomaré las fotos ahora…"               [Yes, I'll take photos now…]

AI  → "Perfecto, Bob. ¡Que tenga un buen día!"    [Perfect, Bob. Have a great day!]
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio outbound number |
| `ELEVENLABS_API_KEY` | ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | Voice ID (default: Rachel) |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `BOB_PHONE_NUMBER` | Bob's real phone number |
| `PUBLIC_URL` | ngrok URL for Twilio webhooks |
| `PORT` | Backend port (default: 3001) |
