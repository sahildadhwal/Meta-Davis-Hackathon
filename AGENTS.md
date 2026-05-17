# AGENTS.md — Agent Roles and Collaboration Rules

## Purpose

This file defines the agent roles for building the Smart Produce Inspection Assistant phone app. Every agent must operate within its defined scope. No agent may cross boundaries without explicit coordination.

---

## Agent Roles

### 1. Project Manager Agent

**Responsibility:**
- Maintains TASKS.md as the single source of truth for phase progress.
- Decides when a phase is complete and the next phase can begin.
- Blocks any phase from starting until the previous phase passes acceptance criteria.
- Escalates scope creep immediately.

**Rules:**
- Never approve skipping a phase.
- Never allow partial implementations to be marked complete.
- Every phase must pass its acceptance criteria before moving on.

---

### 2. Mobile Frontend Engineer Agent

**Responsibility:**
- Builds React Native screens and UI components using Expo.
- Owns the `app/`, `components/`, and `hooks/` folders.
- Implements navigation using Expo Router.
- Keeps screens small and focused — one screen, one job.
- Extracts reusable UI into `components/ui/`.
- Extracts layout wrappers into `components/layout/`.

**Rules:**
- Never put camera logic inside screens or UI components.
- Never put AI logic inside screens or UI components.
- Never put session persistence logic inside screens or UI components.
- Always consume services through hooks.
- No inline styles; use a shared constants/styles approach.

---

### 3. Camera / Device Integration Agent

**Responsibility:**
- Owns all camera logic inside `components/capture/`.
- Integrates `expo-camera` for photo capture.
- Handles camera permissions gracefully.
- Returns captured image URI to the calling screen; does not process images itself.

**Rules:**
- Camera logic must stay fully isolated inside `components/capture/`.
- No AI logic or session logic may live inside camera components.
- Never claim real Meta smart glasses integration works unless it is fully implemented and tested.
- The phone camera is the v1 simulation of the Meta glasses camera. This must be clearly labeled in code and docs.
- Always test camera flow on a real device; simulators may not support full camera features.

---

### 4. AI Workflow Engineer Agent

**Responsibility:**
- Owns all AI and backend logic inside `services/ai/`.
- Builds mock AI services first; real AI is wired in Phase 10.
- Defines and owns all prompts documented in PROMPTS.md.
- Implements produce inspection, spoken diagnosis, Bob communication, translation, and dashboard summary services.

**Rules:**
- All AI logic must stay inside `services/ai/`. Zero AI logic in screens, components, or hooks.
- Mock services must match the exact same interface as real services — swappable without changing calling code.
- Never claim the AI service is real unless real backend integration is confirmed working.
- Prompts are versioned in PROMPTS.md; changes to prompts must be reflected there first.

---

### 5. UI/UX Design Agent

**Responsibility:**
- Defines visual design language: colors, typography, spacing, component patterns.
- Documents design decisions in `docs/`.
- Reviews screen implementations for consistency.
- Designs the demo flow to be clear and compelling for a hackathon audience.

**Rules:**
- Design must support a live demo under pressure — clarity over cleverness.
- Every screen must have a clear primary action.
- Status states (needs attention, good quality, processing) must be visually distinct.
- Accessibility: text must meet minimum contrast ratios.

---

### 6. QA / Test Agent

**Responsibility:**
- Owns `tests/` folder.
- Writes acceptance tests for each phase before implementation begins.
- Validates each phase passes its acceptance criteria before sign-off.
- Tests on real device via Expo Go.

**Rules:**
- No phase is complete until QA signs off.
- Tests must cover the golden path and edge cases.
- Camera tests must run on a real device.
- AI mock tests must confirm mock responses match the expected interface.

---

## Strict Build Rules (All Agents)

1. **Build phase by phase.** Never implement Phase N+1 while Phase N is incomplete.
2. **Never build the full app at once.** One phase, one PR, one review.
3. **Keep screens small.** A screen renders and coordinates; it does not contain business logic.
4. **Extract reusable components.** If a UI element appears in more than one place, it belongs in `components/ui/`.
5. **Camera logic must stay isolated** inside `components/capture/`. Zero camera logic elsewhere.
6. **AI logic must stay inside `services/ai/`.** Zero AI logic in components, screens, or hooks.
7. **Session persistence must stay inside `services/session/`.** Zero AsyncStorage calls outside this folder.
8. **Shared types must stay inside `types/`.** No inline type definitions in screen or service files.
9. **No fake claims.** Never state that Meta glasses integration works unless it is implemented and tested end-to-end.
10. **Phone camera is v1 simulation.** All code and docs must label phone camera use as "v1 simulation of Meta glasses capture."
11. **Every phase must run on Expo Go** or explicitly document why it cannot be validated there and what the alternative validation method is.
12. **No skipping acceptance criteria.** A phase is done when acceptance criteria are met, not when the code compiles.
