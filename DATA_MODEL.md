# DATA_MODEL.md — TypeScript Data Interfaces

> All shared types are defined here and implemented in `types/`. No inline type definitions in screens, services, or hooks.

---

## ProduceStatus

```typescript
// types/inspection.ts

export type ProduceStatus = 
  | 'Good Quality'
  | 'Needs Attention'
  | 'Not Sufficient';
```

**Rules:**
- Default to `'Needs Attention'` or `'Not Sufficient'` unless produce is clearly excellent.
- `'Good Quality'` is only returned when the AI or mock is highly confident.

---

## InspectionResult

```typescript
// types/inspection.ts

export type InspectionConfidence = 'high' | 'medium' | 'low';

export interface InspectionResult {
  status: ProduceStatus;
  diagnosis: string;        // 1-2 sentence description of what was observed
  confidence: InspectionConfidence;
  spokenDiagnosis?: string; // text-to-speech optimized version of diagnosis
  inspectedAt: string;      // ISO 8601 timestamp
}
```

---

## TimelineEvent

```typescript
// types/session.ts

export type TimelineEventType =
  | 'image_captured'
  | 'inspection_started'
  | 'inspection_complete'
  | 'diagnosis_spoken'
  | 'bob_notified'
  | 'bob_language_selected'
  | 'bob_message_sent'
  | 'bob_responded'
  | 'translation_complete'
  | 'session_complete';

export interface TimelineEvent {
  type: TimelineEventType;
  timestamp: string;        // ISO 8601 timestamp
  detail?: string;          // Human-readable description for dashboard display
}
```

---

## BobCommunicationState

```typescript
// types/bob.ts

export type SupportedLanguage = 'English' | 'Spanish';

export interface BobCommunicationState {
  notified: boolean;
  preferredLanguage: SupportedLanguage | null;
  messageToBoб: string | null;           // Message sent to Bob in his language
  bobResponseRaw: string | null;         // Bob's response in his language
  bobResponseTranslated: string | null;  // Bob's response translated to English
  notifiedAt: string | null;             // ISO 8601 timestamp
  respondedAt: string | null;            // ISO 8601 timestamp
}
```

---

## InspectionSession

```typescript
// types/session.ts

export type NextAction =
  | 'capture'          // Waiting for image capture
  | 'analyze'          // Image captured, waiting to analyze
  | 'review'           // Inspection complete, reviewing result
  | 'notify_bob'       // Awaiting user confirmation to notify Bob
  | 'bob_responding'   // Bob has been notified, awaiting response
  | 'complete';        // Session complete

export interface InspectionSession {
  sessionId: string;                        // UUID
  imageUri: string | null;                  // Local file URI from camera capture
  imageCaptured: boolean;
  inspectionResult: InspectionResult | null;
  userConfirmedNotifyBob: boolean;
  bobCommunication: BobCommunicationState;
  nextAction: NextAction;
  timeline: TimelineEvent[];
  createdAt: string;                        // ISO 8601 timestamp
  updatedAt: string;                        // ISO 8601 timestamp
}
```

---

## Default / Empty Session

```typescript
// services/session/sessionService.ts

export function createEmptySession(sessionId: string): InspectionSession {
  const now = new Date().toISOString();
  return {
    sessionId,
    imageUri: null,
    imageCaptured: false,
    inspectionResult: null,
    userConfirmedNotifyBob: false,
    bobCommunication: {
      notified: false,
      preferredLanguage: null,
      messageToBoб: null,
      bobResponseRaw: null,
      bobResponseTranslated: null,
      notifiedAt: null,
      respondedAt: null,
    },
    nextAction: 'capture',
    timeline: [],
    createdAt: now,
    updatedAt: now,
  };
}
```

---

## AsyncStorage Key

```typescript
// constants/storage.ts (or services/session/sessionService.ts)

export const SESSION_STORAGE_KEY = '@meta_agi_phone:current_session';
```

---

## Type Relationships

```
InspectionSession
    ├── imageUri: string | null
    ├── inspectionResult: InspectionResult | null
    │       ├── status: ProduceStatus
    │       └── confidence: InspectionConfidence
    ├── bobCommunication: BobCommunicationState
    │       └── preferredLanguage: SupportedLanguage | null
    ├── nextAction: NextAction
    └── timeline: TimelineEvent[]
                └── type: TimelineEventType
```

---

## Notes

- All timestamps are ISO 8601 strings (not Date objects) for reliable AsyncStorage serialization.
- `sessionId` is generated with a UUID utility; `crypto.randomUUID()` or a lightweight library.
- The `timeline` array is append-only within a session. Events are never removed or modified.
- `nextAction` drives screen navigation logic — screens read this to know what state the session is in.
- All timestamps are ISO 8601 strings for reliable AsyncStorage serialization.
