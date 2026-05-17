# DEMO_SCRIPT.md — Full Hackathon Demo Script

> This is the exact flow to run during the hackathon demo. Rehearse it until it takes under 90 seconds end-to-end. Every step corresponds to a real app interaction.

---

## Setup Before Demo

- iPhone charged and unlocked.
- Expo Go installed and app already loaded (avoid QR scan during demo).
- App on **Capture screen** — ready to go.
- Piece of produce ready to photograph (ideally slightly imperfect for the demo).
- No other apps running that could interrupt.

---

## Demo Flow

---

### Step 1 — Open App

**Narrator:**
*"This is the Smart Produce Inspection Assistant — running on an iPhone, using the phone camera to simulate what a Meta smart glasses wearer would see on the warehouse floor."*

**Action:**
Show the Capture screen. Point to the camera viewfinder area.

---

### Step 2 — Tap Capture Produce Photo

**Narrator:**
*"Alex, our produce inspector, points his phone at a batch that just arrived. He taps Capture."*

**Action:**
Tap the **Capture Produce Photo** button. Phone camera opens with live preview.

---

### Step 3 — Take Photo with Phone Camera

**Narrator:**
*"He snaps a photo — just like the glasses would capture the scene automatically."*

**Action:**
Point phone at the produce. Tap the shutter button. A thumbnail of the captured image appears on the Capture screen.

---

### Step 4 — Tap Analyze Produce

**Narrator:**
*"Now he taps Analyze. The AI inspects the image."*

**Action:**
Tap **Analyze Produce**. Brief loading state. App navigates to Inspection screen.

---

### Step 5 — App Shows "Needs Attention"

**Narrator:**
*"The result: Needs Attention. The AI detected bruising and early discoloration."*

**Action:**
Inspection screen is now visible. Large status badge reads **NEEDS ATTENTION** in amber/red. Diagnosis text is displayed below.

---

### Step 6 — App Speaks Diagnosis Aloud

**Narrator:**
*"And here's where it gets powerful — the app speaks the diagnosis out loud."*

**Action:**
Wait for expo-speech to play automatically:

> *"This produce needs attention. Bruising and discoloration detected. Recommend immediate review."*

**Narrator (while speech plays):**
*"Imagine wearing the glasses — you hear the diagnosis in your ear without breaking your workflow."*

---

### Step 7 — User Taps Notify Bob

**Narrator:**
*"Alex needs to escalate. He taps Notify Bob."*

**Action:**
Tap **Notify Bob**. Confirmation prompt appears: *"Notify Bob about this produce issue?"* Tap **Yes, Notify Bob**.

---

### Step 8 — Bob Selects Spanish

**Narrator:**
*"Bob receives the notification. He prefers to communicate in Spanish."*

**Action:**
Bob communication screen opens. Language selector is shown. Tap **Spanish**.

---

### Step 9 — App Shows Spanish Message to Bob

**Narrator:**
*"The app automatically generates the produce report in Spanish — no manual translation needed."*

**Action:**
Spanish message appears in the BobMessagePanel:

> *"Estimado supervisor, se ha detectado un problema de calidad en el lote inspeccionado. La fruta muestra signos de magulladuras y decoloración. Por favor confirme cómo proceder."*

---

### Step 10 — Bob Enters Spanish Response

**Narrator:**
*"Bob reads it and types back in Spanish."*

**Action:**
Type into the BobResponseInput field:

```
Entendido. Retira ese lote y márcalo como rechazado. Notificaré al equipo de calidad.
```

Tap **Submit Response**.

---

### Step 11 — App Translates Bob's Response

**Narrator:**
*"Instantly translated back to English for Alex."*

**Action:**
English translation appears on screen:

> *"Understood. Remove that batch and mark it as rejected. I will notify the quality team."*

---

### Step 12 — Dashboard Shows Final Summary

**Narrator:**
*"Everything is logged automatically. The full session timeline — capture, inspection, Bob's decision — all in one place for the operations manager."*

**Action:**
Navigate to Dashboard screen. Show the full SessionTimeline:

| Event | Detail |
|---|---|
| Image captured | [timestamp] |
| Inspection complete | Needs Attention |
| Diagnosis spoken | Bruising and discoloration detected |
| Bob notified | Spanish selected |
| Bob responded | Remove and reject batch |
| Translation complete | English translation shown |
| Session complete | — |

---

## Closing Line

**Narrator:**
*"Real-time produce inspection. Multilingual communication. Full audit trail. This is what Meta smart glasses on the warehouse floor could look like — and today we built the v1 with just a phone camera."*

---

## Fallback Plan (If Anything Breaks)

| Problem | Fallback |
|---|---|
| Camera does not open | Show screenshot of capture screen; continue from inspection |
| AI returns error | Mock service is always on as fallback; demo should not fail |
| Speech does not play | Read diagnosis aloud yourself; continue |
| Translation returns error | Show the hardcoded mock translation; continue |
| App crashes | Relaunch Expo Go; session persists via AsyncStorage — resume from last step |

---

## Timing Target

| Section | Target Time |
|---|---|
| Steps 1-3: Capture | 15 seconds |
| Steps 4-6: Inspect + Speak | 20 seconds |
| Steps 7-9: Bob Notified | 15 seconds |
| Steps 10-11: Bob Response + Translation | 15 seconds |
| Step 12: Dashboard | 10 seconds |
| **Total** | **~75 seconds** |
