# TASKS.md — Smart Produce Inspection Assistant Build Phases

> One phase at a time. A phase is complete only when all acceptance criteria pass.

---

## Phase 0 — Documentation and Planning

**Status:** In Progress

### Tasks
- [x] Create AGENTS.md
- [x] Create README.md
- [x] Create PRODUCT_REQUIREMENTS.md
- [x] Create ARCHITECTURE.md
- [x] Create TASKS.md
- [x] Create PROMPTS.md
- [x] Create DATA_MODEL.md
- [x] Create DEMO_SCRIPT.md
- [x] Create TECH_DECISIONS.md
- [x] Create .gitignore
- [x] Create all required folders with .gitkeep files

### Acceptance Criteria
- All 10 root documentation files exist.
- All required folders exist with .gitkeep files.
- No code, no package.json, no node_modules.
- Human approval received before Phase 1 begins.

### Expected Files
```
AGENTS.md, README.md, PRODUCT_REQUIREMENTS.md, ARCHITECTURE.md,
TASKS.md, PROMPTS.md, DATA_MODEL.md, DEMO_SCRIPT.md,
TECH_DECISIONS.md, .gitignore
docs/.gitkeep, app/.gitkeep, components/**/.gitkeep,
hooks/.gitkeep, services/**/.gitkeep, types/.gitkeep,
constants/.gitkeep, assets/.gitkeep, tests/.gitkeep
```

---

## Phase 1 — Expo React Native Foundation

**Status:** Not Started

### Tasks
- [ ] Initialize Expo project with TypeScript template inside current folder.
- [ ] Configure Expo Router (file-based navigation).
- [ ] Create root `_layout.tsx` with navigation shell.
- [ ] Create placeholder screens: capture, inspection, bob, dashboard.
- [ ] Each placeholder screen shows its own name as text only.
- [ ] Verify app launches on Expo Go (real iPhone).
- [ ] Confirm TypeScript strict mode is on in tsconfig.json.

### Acceptance Criteria
- `npx expo start` runs without errors.
- App launches on iPhone via Expo Go.
- Navigating between all 4 screens works.
- TypeScript strict mode enabled; zero type errors.
- No camera, no AI, no session logic yet.

### Expected Files
```
package.json, tsconfig.json, app.json (or app.config.ts),
app/_layout.tsx, app/index.tsx, app/capture.tsx,
app/inspection.tsx, app/bob.tsx, app/dashboard.tsx
```

---

## Phase 2 — Shared Types and AsyncStorage Session State

**Status:** Not Started

### Tasks
- [ ] Define all TypeScript interfaces in `types/` (see DATA_MODEL.md).
- [ ] Implement `sessionService` in `services/session/sessionService.ts`.
- [ ] sessionService must: create session, update session fields, read session, clear session.
- [ ] Implement `useSession` hook in `hooks/useSession.ts`.
- [ ] Wire `useSession` into Dashboard screen as a proof of concept.
- [ ] Write unit tests for sessionService.

### Acceptance Criteria
- All types compile with zero errors in strict mode.
- sessionService can write and read an InspectionSession from AsyncStorage.
- useSession hook exposes session state to a screen.
- Dashboard screen displays session data (even if empty/placeholder).
- Tests pass.

### Expected Files
```
types/inspection.ts, types/session.ts, types/bob.ts,
services/session/sessionService.ts,
hooks/useSession.ts,
tests/services/sessionService.test.ts
```

---

## Phase 3 — Phone Camera Capture

**Status:** Not Started

### Tasks
- [ ] Install expo-camera.
- [ ] Build `CameraCapture` component in `components/capture/CameraCapture.tsx`.
- [ ] CameraCapture must: request permission, show camera preview, capture photo, return imageUri via callback.
- [ ] Handle camera permission denied — show fallback message, not a crash.
- [ ] Wire CameraCapture into Capture screen.
- [ ] On capture: store imageUri in session via useSession.
- [ ] Show captured image thumbnail on Capture screen after photo taken.
- [ ] Test on real iPhone via Expo Go.
- [ ] Label all camera code with comment: "v1 simulation of Meta glasses capture"

### Acceptance Criteria
- Camera opens on Capture screen.
- Photo is taken and imageUri is stored in session.
- Thumbnail displays after capture.
- Permission denial shows a readable fallback.
- Tested on real device — not just simulator.
- Zero camera logic outside `components/capture/`.

### Expected Files
```
components/capture/CameraCapture.tsx
(updated) app/capture.tsx
(updated) hooks/useSession.ts
```

---

## Phase 4 — Mock Produce Inspection

**Status:** Not Started

### Tasks
- [ ] Define `InspectionServiceInterface` in `services/ai/inspectionService.ts`.
- [ ] Build `mockInspectionService` — returns hardcoded InspectionResult with status "Needs Attention" and a diagnosis string.
- [ ] Build `useInspection` hook.
- [ ] Wire Analyze button on Capture screen → calls useInspection → navigates to Inspection screen.
- [ ] Build `InspectionResult` component and `DiagnosisCard` component.
- [ ] Inspection screen displays result and diagnosis.
- [ ] Persist inspection result to session.
- [ ] Write tests for mockInspectionService.

### Acceptance Criteria
- Tapping Analyze triggers inspection service call.
- Mock returns "Needs Attention" status and diagnosis text.
- Inspection screen displays result clearly.
- Result persisted to AsyncStorage session.
- Zero AI logic outside `services/ai/`.
- Tests pass.

### Expected Files
```
services/ai/inspectionService.ts,
hooks/useInspection.ts,
components/inspection/InspectionResult.tsx,
components/inspection/DiagnosisCard.tsx,
(updated) app/capture.tsx,
(updated) app/inspection.tsx,
tests/services/inspectionService.test.ts
```

---

## Phase 5 — Spoken Diagnosis Using expo-speech

**Status:** Not Started

### Tasks
- [ ] Install expo-speech.
- [ ] Build `useSpeech` hook in `hooks/useSpeech.ts`.
- [ ] useSpeech must: speak a string, stop speech, expose isSpeaking state.
- [ ] Inspection screen speaks diagnosis on mount (after result loads).
- [ ] Add replay button to Inspection screen.
- [ ] Test speech on real device.

### Acceptance Criteria
- Diagnosis is spoken aloud immediately after inspection result loads.
- Replay button works.
- Speech stops if user navigates away.
- Tested on real device.

### Expected Files
```
hooks/useSpeech.ts,
(updated) app/inspection.tsx
```

---

## Phase 6 — User Confirmation to Notify Bob

**Status:** Not Started

### Tasks
- [ ] Add "Notify Bob" button to Inspection screen.
- [ ] Build confirmation prompt (modal or inline) asking user to confirm.
- [ ] On confirm: update session `userConfirmedNotifyBob = true`.
- [ ] On confirm: navigate to Bob screen.
- [ ] On decline: stay on Inspection screen, session remains open.

### Acceptance Criteria
- Confirmation prompt appears before navigating to Bob screen.
- Session correctly records userConfirmedNotifyBob.
- Decline keeps user on Inspection screen.

### Expected Files
```
(updated) app/inspection.tsx,
(updated) hooks/useSession.ts
```

---

## Phase 7 — Bob Communication Simulator

**Status:** Not Started

### Tasks
- [ ] Define `BobServiceInterface` in `services/ai/bobService.ts`.
- [ ] Build `mockBobService` — generates a Spanish produce issue message from InspectionResult.
- [ ] Build `LanguageSelector` component — shows language options, Bob selects Spanish.
- [ ] Build `BobMessagePanel` component — displays the Spanish message.
- [ ] Build `BobResponseInput` component — text input for Bob's Spanish response.
- [ ] Define `TranslationServiceInterface` in `services/ai/translationService.ts`.
- [ ] Build `mockTranslationService` — returns hardcoded English translation of Bob's response.
- [ ] Build `useTranslation` hook and `useBobCommunication` hook.
- [ ] Wire all into Bob screen.
- [ ] Persist BobCommunicationState to session.
- [ ] Write tests.

### Acceptance Criteria
- Bob screen shows language selector; Bob selects Spanish.
- Spanish message appears.
- Bob enters Spanish response; English translation appears.
- Full BobCommunicationState persisted to session.
- Zero translation/AI logic outside `services/ai/`.
- Tests pass.

### Expected Files
```
services/ai/bobService.ts,
services/ai/translationService.ts,
hooks/useBobCommunication.ts,
hooks/useTranslation.ts,
components/bob/LanguageSelector.tsx,
components/bob/BobMessagePanel.tsx,
components/bob/BobResponseInput.tsx,
(updated) app/bob.tsx,
tests/services/bobService.test.ts,
tests/services/translationService.test.ts
```

---

## Phase 8 — Dashboard Summary Screen

**Status:** Not Started

### Tasks
- [ ] Build `SessionTimeline` component in `components/dashboard/SessionTimeline.tsx`.
- [ ] Build `TimelineEvent` component in `components/dashboard/TimelineEvent.tsx`.
- [ ] Dashboard screen reads full session from useSession.
- [ ] Render full timeline: capture, inspection, diagnosis, Bob notification, Bob response, translation.
- [ ] Show ProduceStatus badge prominently.
- [ ] Show Bob's English-translated response.
- [ ] Add "New Inspection" button — clears session and navigates to Capture screen.

### Acceptance Criteria
- Dashboard renders complete session timeline.
- All timeline events display correctly.
- New Inspection clears session and returns to start.
- Tested end-to-end from capture → dashboard.

### Expected Files
```
components/dashboard/SessionTimeline.tsx,
components/dashboard/TimelineEvent.tsx,
(updated) app/dashboard.tsx
```

---

## Phase 9 — AI Service Abstraction Layer

**Status:** Not Started

### Tasks
- [ ] Audit all AI services; confirm each has a clean interface + mock + real (stub) implementation.
- [ ] Add a service configuration file in `services/ai/serviceConfig.ts` to toggle mock vs. real.
- [ ] Confirm all hooks consume services through this config.
- [ ] Add optional debug screen (`app/debug.tsx`) to toggle service mode at runtime.
- [ ] Write integration tests confirming mock and real interfaces are identical.

### Acceptance Criteria
- Switching from mock to real requires changing one value in serviceConfig.ts.
- No screen or hook changes needed to switch service mode.
- Debug screen can toggle mode at runtime in dev builds.
- Integration tests confirm interface compatibility.

### Expected Files
```
services/ai/serviceConfig.ts,
app/debug.tsx (optional, dev only),
tests/services/serviceIntegration.test.ts
```

---

## Phase 10 — Real AI / Backend Integration

**Status:** Not Started

### Tasks
- [ ] Stand up backend API endpoint for produce inspection (or use direct API key in dev).
- [ ] Implement `realInspectionService` using real AI model.
- [ ] Implement `realBobService` using real AI model for Spanish message generation.
- [ ] Implement `realTranslationService` using real translation API.
- [ ] Implement `realDiagnosisService` for spoken diagnosis text generation.
- [ ] Toggle serviceConfig.ts to real services.
- [ ] Test end-to-end on real device with network connectivity.
- [ ] Confirm fallback to mock if API is unreachable (demo safety).

### Acceptance Criteria
- Real AI inspection runs end-to-end on real device.
- Spanish message and translation are real AI outputs.
- Spoken diagnosis reflects real AI analysis.
- Mock fallback works if network is unavailable.
- Demo safety confirmed.

### Expected Files
```
services/ai/realInspectionService.ts,
services/ai/realBobService.ts,
services/ai/realTranslationService.ts,
services/ai/realDiagnosisService.ts,
(updated) services/ai/serviceConfig.ts
```

---

## Phase 11 — Demo Polish and QA

**Status:** Not Started

### Tasks
- [ ] Visual polish: consistent colors, typography, spacing using constants.
- [ ] Loading states on all async operations.
- [ ] Error states on all async operations.
- [ ] Full end-to-end demo run on real iPhone.
- [ ] Rehearse full DEMO_SCRIPT.md flow.
- [ ] Fix any blockers found in rehearsal.
- [ ] QA sign-off on all acceptance criteria.

### Acceptance Criteria
- Full demo script runs without errors on real device.
- No loading flash or blank screens.
- All error states handled gracefully.
- QA agent signs off.

---

## Future Phase — Real Meta Glasses Integration

**Status:** Not Started (Post-Hackathon)

### Tasks
- [ ] Research Meta smart glasses SDK / API.
- [ ] Replace `components/capture/CameraCapture.tsx` with a Meta glasses capture adapter.
- [ ] All other app logic remains unchanged.
- [ ] Test end-to-end with real Meta glasses hardware.

### Notes
- This phase requires custom native modules and will not run in Expo Go.
- All prior phases have been designed so this swap touches only `components/capture/`.
- No other screen, hook, or service needs to change.
