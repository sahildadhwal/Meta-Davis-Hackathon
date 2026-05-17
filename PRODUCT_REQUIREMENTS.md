# PRODUCT_REQUIREMENTS.md — Smart Produce Inspection Assistant

---

## Product Goal

Enable a warehouse produce inspector to instantly capture produce images using their phone (simulating Meta smart glasses), receive an AI-powered spoken quality diagnosis, and trigger a seamless multilingual notification to the warehouse supervisor — all in under 60 seconds.

The app demonstrates the value of AI-assisted inspection + voice + multilingual communication in a supply chain context, using the phone camera as a v1 stand-in for Meta smart glasses hardware.

---

## Personas

### 1. Phone App User / Produce Inspector

**Name:** Alex  
**Role:** Warehouse produce inspector on the floor  
**Device:** iPhone running Expo Go (hackathon demo) or native app (future)  
**Goal:** Quickly assess produce quality and report issues without stopping to type long reports.  
**Pain points:**
- Inspections are slow and paper-based.
- Communicating issues to supervisors requires back-and-forth.
- Language barriers slow down floor communication.

**What they need from this app:**
- Point phone at produce, get instant diagnosis.
- Hear the diagnosis spoken aloud — no need to read while hands are busy.
- One tap to notify the supervisor.

---

### 2. Bob / Warehouse Supervisor

**Name:** Bob  
**Role:** Warehouse supervisor responsible for produce quality decisions  
**Language preference:** Spanish  
**Goal:** Receive clear, actionable issue reports in his preferred language and respond quickly.  
**Pain points:**
- Reports come in English; he prefers Spanish.
- He needs to respond quickly without translation delays.

**What he needs from this app:**
- Receive issue reports in Spanish automatically.
- Respond in Spanish; the app translates for Alex.

---

### 3. Dashboard Viewer / Operations Manager

**Name:** Jordan  
**Role:** Operations manager reviewing quality issues across the warehouse  
**Goal:** See a clear summary of each inspection session — what was flagged, what action was taken, what Bob said.  
**Pain points:**
- No central log of quality issues.
- Hard to audit what happened after the fact.

**What they need from this app:**
- Dashboard that shows the full inspection session timeline.
- Clear status: was Bob notified? What did he say? What was the resolution?

---

## Full User Journey

### Step 1 — Capture
Alex opens the app. Taps **Capture Produce Photo**. The phone camera opens (simulating Meta glasses capture). Alex points at the produce and takes a photo.

### Step 2 — Analyze
Alex taps **Analyze Produce**. The app sends the image to the inspection service (mock in v1, real AI in v2). The inspection service returns a quality verdict and a short diagnosis.

### Step 3 — Spoken Diagnosis
The app displays the inspection result on screen (e.g., **Needs Attention**) and speaks the diagnosis aloud using expo-speech: *"This produce shows signs of bruising and discoloration. Immediate review recommended."*

### Step 4 — Confirm Notification
The app asks: *"Notify Bob?"* Alex taps **Yes, Notify Bob**.

### Step 5 — Bob's Language Preference
The Bob communication panel opens. It asks Bob (simulated in the app): *"What language would you like to receive the update in?"* Bob selects **Spanish**.

### Step 6 — Spanish Message to Bob
The app generates and displays the produce issue summary in Spanish: *"La fruta muestra signos de magulladuras y decoloración. Se recomienda revisión inmediata."*

### Step 7 — Bob Responds in Spanish
Bob reads the message and types a response in Spanish: *"Entendido. Retira ese lote y marca como rechazado."*

### Step 8 — Translation
The app translates Bob's response to English and displays it to Alex: *"Understood. Remove that batch and mark as rejected."*

### Step 9 — Dashboard Update
The dashboard screen updates with the complete session timeline: capture time, inspection result, diagnosis, Bob notification, Bob's response, and the translated resolution.

---

## Functional Requirements

### Camera Capture
- FR-01: App must allow user to take a photo using the phone camera.
- FR-02: App must request camera permission and handle denial gracefully.
- FR-03: Captured image URI must be passed to the inspection service.

### Produce Inspection
- FR-04: App must call the inspection service with the image URI.
- FR-05: Inspection service must return a ProduceStatus and short diagnosis string.
- FR-06: Default verdict must be Needs Attention or Not Sufficient unless produce is clearly high quality.
- FR-07: Inspection result must be displayed on screen.

### Spoken Diagnosis
- FR-08: App must speak the diagnosis aloud using expo-speech immediately after inspection.
- FR-09: User must be able to replay the spoken diagnosis.

### Bob Notification Flow
- FR-10: App must ask user to confirm notification to Bob before sending.
- FR-11: Bob communication panel must allow language selection (Spanish in v1 demo).
- FR-12: App must generate a localized message in Bob's selected language.
- FR-13: Bob must be able to enter a response in his selected language.
- FR-14: App must translate Bob's response to English for the inspector.

### Dashboard
- FR-15: Dashboard must display a timeline of the current inspection session.
- FR-16: Timeline must include: capture, inspection result, diagnosis, Bob notification status, Bob's response, translated response.
- FR-17: Dashboard must show ProduceStatus with a clear visual indicator.

### Session Persistence
- FR-18: Session state must persist locally using AsyncStorage.
- FR-19: App must restore the most recent session on relaunch.

---

## Non-Functional Requirements

- NFR-01: App must run on iPhone via Expo Go for the hackathon demo.
- NFR-02: Inspection-to-spoken-diagnosis must complete in under 5 seconds (mock AI).
- NFR-03: All screens must be readable in warehouse lighting (high contrast).
- NFR-04: App must not crash if camera permission is denied — show a clear fallback.
- NFR-05: All AI service calls must be mockable without any code changes in screens or hooks.
- NFR-06: TypeScript strict mode; no use of `any` type.

---

## MVP Scope

| Feature | In MVP |
|---|---|
| Phone camera capture | Yes |
| Mock AI produce inspection | Yes |
| Spoken diagnosis | Yes |
| Bob notification flow | Yes |
| Spanish translation (mock) | Yes |
| Session dashboard | Yes |
| Local session persistence | Yes |
| Real AI/backend integration | No (Phase 10) |
| Real Meta glasses hardware | No (future) |
| Multi-session history | No |
| Push notifications to Bob | No |
| User accounts / auth | No |

---

## Out of Scope for v1

- Real Meta smart glasses hardware integration
- Real-time video stream analysis (photo only in v1)
- Backend server or database
- User authentication
- Multi-user accounts
- Push notifications
- Multi-session history browser
- Support for languages other than English and Spanish
- Offline AI inference
