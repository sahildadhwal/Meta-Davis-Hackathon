# ARCHITECTURE.md — Smart Produce Inspection Assistant

---

## Target Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React Native | Cross-platform mobile |
| Build / Dev | Expo SDK | Managed workflow; Expo Go for demo |
| Language | TypeScript | Strict mode enabled |
| Navigation | Expo Router | File-based routing (app/ directory) |
| Camera | expo-camera | Phone camera = v1 Meta glasses simulation |
| Speech | expo-speech | Text-to-speech for spoken diagnosis |
| Local Storage | AsyncStorage (@react-native-async-storage/async-storage) | Session persistence |
| State Management | React Context + useReducer | No external state lib needed for MVP |
| AI Services (mock) | Local mock functions in services/ai/ | Match real interface exactly |
| AI Services (real) | Backend REST API (Phase 10) | Swappable without changing callers |
| Styling | StyleSheet API (React Native) | Constants-driven colors and spacing |

---

## Guiding Architectural Principles

1. **Isolation of concerns.** Camera logic, AI logic, and session persistence each live in exactly one place. Screens and components do not contain any of these.
2. **Mock-first services.** All AI services are mocked first. The mock and real implementations share the same TypeScript interface, so swapping them requires changing one import.
3. **Hooks as the bridge.** Screens talk to services only through custom hooks. This keeps screens clean and makes services testable.
4. **Phase-gated complexity.** No abstraction is introduced before it is needed. Infrastructure is added phase by phase.
5. **Expo Go compatibility.** Every phase must be runnable on Expo Go (managed workflow) unless a specific phase documents why it cannot be.

---

## Folder Structure

```
meta-agi-phone/
│
├── app/                          # Expo Router — file-based screens
│   ├── index.tsx                 # Entry / redirect to capture
│   ├── capture.tsx               # Capture screen
│   ├── inspection.tsx            # Inspection result screen
│   ├── bob.tsx                   # Bob communication screen
│   ├── dashboard.tsx             # Dashboard / timeline screen
│   └── _layout.tsx               # Root layout (navigation shell)
│
├── components/
│   ├── layout/                   # Screen layout wrappers
│   │   └── ScreenContainer.tsx
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Card.tsx
│   │   └── Typography.tsx
│   ├── capture/                  # Camera logic — ISOLATED
│   │   └── CameraCapture.tsx     # expo-camera wrapper; returns imageUri only
│   ├── inspection/               # Inspection result display
│   │   ├── InspectionResult.tsx
│   │   └── DiagnosisCard.tsx
│   ├── bob/                      # Bob communication simulator
│   │   ├── LanguageSelector.tsx
│   │   ├── BobMessagePanel.tsx
│   │   └── BobResponseInput.tsx
│   └── dashboard/                # Dashboard / timeline display
│       ├── SessionTimeline.tsx
│       └── TimelineEvent.tsx
│
├── hooks/                        # Custom hooks — bridge between screens and services
│   ├── useInspection.ts          # Calls services/ai/inspectionService
│   ├── useSpeech.ts              # Wraps expo-speech
│   ├── useBobCommunication.ts    # Calls services/ai/bobService
│   ├── useTranslation.ts         # Calls services/ai/translationService
│   └── useSession.ts             # Calls services/session/sessionService
│
├── services/
│   ├── ai/                       # ALL AI logic lives here
│   │   ├── inspectionService.ts  # Produce quality inspection
│   │   ├── diagnosisService.ts   # Spoken diagnosis text generation
│   │   ├── bobService.ts         # Bob message generation (localized)
│   │   ├── translationService.ts # Bob response → English translation
│   │   └── summaryService.ts     # Dashboard summary generation
│   └── session/                  # ALL session persistence lives here
│       └── sessionService.ts     # AsyncStorage read/write for InspectionSession
│
├── types/                        # Shared TypeScript interfaces
│   ├── inspection.ts             # ProduceStatus, InspectionResult
│   ├── session.ts                # InspectionSession, TimelineEvent
│   └── bob.ts                    # BobCommunicationState
│
├── constants/                    # App-wide constants
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── strings.ts
│
├── assets/                       # Static assets
│   └── (icons, splash, etc.)
│
├── tests/                        # Tests
│   ├── services/
│   ├── hooks/
│   └── components/
│
└── docs/                         # Extended design and decision docs
```

---

## Screen Structure

### Capture Screen (`app/capture.tsx`)
- Renders `CameraCapture` component.
- On image captured: stores `imageUri` in session state.
- Shows **Analyze Produce** button after capture.
- On analyze: navigates to Inspection screen.
- No AI logic. No camera logic. Coordinates only.

### Inspection Screen (`app/inspection.tsx`)
- Reads `imageUri` from session state.
- Calls `useInspection` hook → calls `inspectionService`.
- Displays `InspectionResult` and `DiagnosisCard`.
- Calls `useSpeech` to speak diagnosis on mount.
- Shows **Notify Bob** button.
- Navigates to Bob screen on confirm.

### Bob Screen (`app/bob.tsx`)
- Shows `LanguageSelector` — Bob picks Spanish.
- Shows `BobMessagePanel` with localized produce issue message.
- Shows `BobResponseInput` — Bob types in Spanish.
- On submit: calls `useTranslation` → translates to English.
- Shows translated response.
- Navigates to Dashboard on complete.

### Dashboard Screen (`app/dashboard.tsx`)
- Reads full session from `useSession`.
- Renders `SessionTimeline` with all `TimelineEvent` entries.
- Shows final `ProduceStatus` badge.
- Shows Bob's response (English).
- Option to start a new inspection.

### Optional: Debug / Settings Screen (`app/debug.tsx`)
- Toggle between mock and real AI services.
- Show raw session JSON.
- Replay speech.
- Reset session.
- Only shown in development builds.

---

## Data Flow

```
Phone Camera (components/capture/)
        |
        v imageUri
Inspection Screen
        |
        v calls
useInspection hook
        |
        v calls
services/ai/inspectionService (mock → real)
        |
        v InspectionResult
Inspection Screen → renders result, triggers speech
        |
        v user taps Notify Bob
Bob Screen
        |
        v calls
services/ai/bobService (generates Spanish message)
        |
        v user types Spanish response
useTranslation hook
        |
        v calls
services/ai/translationService
        |
        v English translation
Dashboard Screen
        |
        v reads
services/session/sessionService (AsyncStorage)
        |
        v full InspectionSession
SessionTimeline rendered
```

---

## AI Service Interface Pattern

All AI services follow this pattern so mock and real are fully swappable:

```typescript
// services/ai/inspectionService.ts

export interface InspectionServiceInterface {
  inspectProduce(imageUri: string): Promise<InspectionResult>;
}

// Mock implementation
export const mockInspectionService: InspectionServiceInterface = { ... };

// Real implementation (Phase 10)
export const realInspectionService: InspectionServiceInterface = { ... };

// Active service — swap this one line to go from mock to real
export const inspectionService = mockInspectionService;
```

---

## Navigation Flow

```
app/index.tsx
    └─> app/capture.tsx          (Capture Produce Photo)
            └─> app/inspection.tsx    (Analyze + Diagnosis)
                    └─> app/bob.tsx        (Bob Communication)
                            └─> app/dashboard.tsx  (Summary)
                                    └─> app/capture.tsx  (New Inspection)
```

---

## Phase Compatibility

| Phase | Expo Go Compatible |
|---|---|
| 0 — Docs | N/A |
| 1 — Foundation | Yes |
| 2 — Types + Session | Yes |
| 3 — Camera | Yes (real device required) |
| 4 — Mock Inspection | Yes |
| 5 — Speech | Yes |
| 6 — Bob Confirm | Yes |
| 7 — Bob Simulator | Yes |
| 8 — Dashboard | Yes |
| 9 — AI Abstraction | Yes |
| 10 — Real AI | Yes (requires network) |
| 11 — Polish + QA | Yes |
| Future — Meta Glasses | No (custom native module required) |
