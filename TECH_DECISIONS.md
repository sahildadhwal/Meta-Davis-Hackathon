# TECH_DECISIONS.md — Technology Decision Log

> Each decision records what was chosen, what was rejected, and why. This prevents revisiting settled decisions and helps new agents understand constraints.

---

## Decision 1: Expo Instead of Native Swift/Kotlin

**Chosen:** React Native + Expo (managed workflow)  
**Rejected:** Native Swift (iOS), Native Kotlin (Android), Flutter

**Why Expo:**
- Expo Go enables instant testing on any iPhone without App Store submission, Xcode builds, or provisioning profiles — critical for a hackathon demo where iteration speed is everything.
- TypeScript throughout the stack. One language for all engineers.
- expo-camera, expo-speech, and AsyncStorage are first-class Expo packages with stable managed workflow support — no custom native modules needed for MVP features.
- Expo Router provides file-based navigation (same mental model as Next.js) — familiar to web developers and fast to set up.
- The future Meta glasses integration is the only point where we'll need to eject to bare workflow or use a custom native module. Everything else stays in managed workflow.

**Trade-offs accepted:**
- Some React Native performance limitations vs. fully native.
- Expo managed workflow has some restrictions on native modules — acceptable until Meta glasses phase.
- Bundle size is larger than native. Acceptable for a demo.

---

## Decision 2: Phone Camera for v1 Instead of Real Meta Glasses

**Chosen:** Phone camera via expo-camera (v1 simulation)  
**Rejected:** Real Meta smart glasses hardware integration (deferred to future phase)

**Why phone camera first:**
- Meta smart glasses SDK/hardware is not available in the hackathon environment.
- The phone camera provides the same demo narrative: "point at produce, get instant analysis."
- The camera capture component is fully isolated in `components/capture/`. Swapping to real glasses hardware requires only replacing this one component — nothing else in the app changes.
- Labeling this as "v1 simulation" is honest and sets correct expectations. We do not claim glasses integration works unless it is implemented and tested.

**Future swap path:**
When Meta glasses SDK is available, replace `components/capture/CameraCapture.tsx` with a glasses capture adapter. All other screens, hooks, services, and types remain unchanged.

---

## Decision 3: Mock AI Services First

**Chosen:** Mock AI services in `services/ai/` for Phases 1-9  
**Rejected:** Wiring real AI from the start

**Why mock first:**
- Mock services eliminate API key management, rate limits, latency, and network dependency during early development and demo rehearsal.
- Mocks return deterministic responses — easier to build and test UI flows.
- The mock and real service implementations share the same TypeScript interface. Swapping them requires changing one line in `serviceConfig.ts`.
- Demo safety: if real AI is unreachable during the hackathon demo, the mock service is the fallback. The demo never fails due to an API outage.
- Separation of concerns: UI and service layers can be developed in parallel because the interface contract is defined upfront.

**Phase 10 transition:**
Real AI services are implemented as a second implementation of the same interface. The mock is never deleted — it remains as a fallback and test fixture.

---

## Decision 4: AsyncStorage for Local Session Persistence

**Chosen:** `@react-native-async-storage/async-storage`  
**Rejected:** SQLite, Realm, MMKV, backend database, in-memory only

**Why AsyncStorage first:**
- For a single-session inspection workflow with a small data payload (one InspectionSession object), AsyncStorage is entirely sufficient.
- No backend server required. No database setup. Works offline.
- Sessions survive app restarts — important for demo resilience (if app crashes, session is restored).
- Expo Go compatible; no native module installation needed.
- The `services/session/` abstraction layer means migrating to a different storage solution later (e.g., MMKV for performance) requires changing only `sessionService.ts`.

**Trade-offs accepted:**
- AsyncStorage is not suitable for large datasets or complex queries.
- No multi-session history in v1 — only the current session is stored.
- Acceptable for MVP scope.

---

## Decision 5: Real AI / Backend Comes in Phase 10

**Chosen:** Defer real AI/backend integration to Phase 10  
**Rejected:** Building real AI integration from the start

**Why defer:**
- The demo must work reliably. Real AI adds latency and failure modes.
- UI development should not be blocked by backend readiness.
- The interface contract is defined before real implementation — this is the correct engineering order.
- By Phase 10, all UI is complete and tested against mocks. Real AI can be dropped in with confidence.

**What changes in Phase 10:**
- Implement real service classes that satisfy the same interfaces.
- Update `serviceConfig.ts` to use real services.
- Add network error handling and mock fallback.
- Nothing else changes.

---

## Decision 6: Expo Router for Navigation

**Chosen:** Expo Router (file-based routing)  
**Rejected:** React Navigation (stack/tab navigator with manual config)

**Why Expo Router:**
- File-based routing means screen structure is visible in the folder structure — matches ARCHITECTURE.md.
- Familiar to anyone who has used Next.js.
- Built on React Navigation under the hood — no loss of capability.
- Supported in Expo managed workflow.

---

## Decision 7: React Context + useReducer for State (No Redux)

**Chosen:** React Context + useReducer  
**Rejected:** Redux, Zustand, Jotai, MobX

**Why no external state library:**
- The session data model is a single InspectionSession object. This does not require a complex state management library.
- Context + useReducer is built into React — no additional dependencies.
- Keeping state in `services/session/` (AsyncStorage) and surfacing it via `useSession` hook is sufficient for the MVP data flow.
- If state complexity grows significantly post-MVP, migrating to Zustand is straightforward.

---

## Decision 8: TypeScript Strict Mode

**Chosen:** TypeScript strict mode enabled  
**Rejected:** TypeScript with lenient settings, JavaScript

**Why strict mode:**
- Catches type errors at build time before they become runtime crashes during the demo.
- Forces explicit null checks — important given the number of nullable fields in InspectionSession.
- `no any` rule enforced. All service interfaces are fully typed.
