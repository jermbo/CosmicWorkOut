# Session Logging

The core action of the app — recording a completed workout.

**Tied to:** [Data Model](../architecture/data-model.md) | [State Management](../implementation/state.md) | [Components](../implementation/components.md)

---

## Implementation Status

| Story | Status |
|-------|--------|
| Start session from Today | ✅ Built |
| Instant-mode one-tap logging | ✅ Built |
| Stepper/numpad via LogSetSheet | ✅ Built |
| Exercise completion animation + haptics | ✅ Built |
| Finish session + completion overlay | ✅ Built | No confirm dialog; saves completed sets only |
| Abandon session | ✅ Built | Back arrow → confirm; nothing saved |
| Crash recovery (resume/discard) | ✅ Built |
| First-time weight prompt | ⚠️ Defaults to 0/BW, no prompt |
| Set tile shows weight before log | ❌ Shows "+" only until completed |
| Haptic on set tap | ❌ Haptic only on exercise completion |
| Long press to adjust | ❌ Use stepper/numpad logging mode instead |

---

## Goal

Logging a set should take under 5 seconds, one-handed. Everything else in the logging flow is secondary to this constraint.

---

## Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle: app open
    Idle --> Active: Start Session
    Active --> Active: Log set
    Active --> Complete: Finish Session
    Active --> Idle: Abandon
    Complete --> Idle: Dismiss overlay
    Active --> Active: Resume (crash recovery)
    note right of Active: activeSession in localStorage
    note right of Complete: SessionLog in IndexedDB
```

---

## User Stories

### Starting a Session

> As a user, I want to start today's workout with one tap from the home screen, so I don't waste time navigating.

- The Today view shows today's scheduled workout
- A single "Start Session" CTA begins the session
- The active session overlay appears immediately — no loading state
- The session is written to `activeSession` in localStorage immediately (crash recovery)

---

### Logging a Set (Instant Mode — Default)

> As a user, I want to log a set with one tap, so I can do it between sets without breaking focus.

**Built today:**
- Incomplete tiles show a "+" and set number only — weight/reps appear after logging
- One tap logs at pre-filled weight/reps (from `exerciseLastUsed` or defaults)
- Spring pop + white flash animation on tap; no haptic on individual sets
- Weight 0 displays as "BW" on completed tiles

**Target (not yet):**
- Show last-used weight on the tile before tapping
- Prompt for first-time weight input when no history exists

The tap animation sequence (from design reference):
```
tap → scale down (0.93) immediately
  → white flash overlay (opacity 0.4→0, 280ms)
  → tile bg transitions to accent (220ms ease-out)
  → spring pop: scale 0.93→1.06→1 (220ms)
  → weight/reps text fades in
```

---

### Adjusting Weight or Reps Before Confirming

> As a user, I want to be able to change the weight or reps before logging a set, so my data is accurate.

- Stepper/numpad logging mode opens an input sheet on tap (no long press)
- I can adjust weight and reps, then confirm
- The confirmed values are logged and become the new `exerciseLastUsed`

Logging mode is a user preference (see [Settings](settings-preferences.md)):

```mermaid
flowchart TD
    Tap[User taps set tile] --> Mode{loggingMode?}
    Mode -->|instant| Complete[completeSet at last-used values]
    Mode -->|stepper| Sheet[Open LogSetSheet +/-]
    Mode -->|numpad| Sheet
    Sheet --> Confirm[User confirms weight + reps]
    Confirm --> Log[logSet with explicit values]
    Complete --> Persist[Write exerciseLastUsed + activeSession]
    Log --> Persist
```

- **Instant** — one tap logs at last-used values (default)
- **Stepper** — tap opens a +/- stepper for weight/reps before confirming
- **Numpad** — tap opens a full numeric input

---

### Completing an Exercise

> As a user, I want to see a clear signal when I've finished all sets for an exercise, so I know to move on.

When the last set for an exercise is logged:
- Card border pulses accent (ripple animation)
- Checkmark fades in with spring pop
- Card background gets a subtle accent tint
- Haptic: `navigator.vibrate([12, 40, 18])`

---

### Finishing a Session

> As a user, I want to finish my session and see a completion moment, so I feel the workout is done.

**Built today:**
- Footer button always visible — label changes to "Finish early · X/Y sets" when incomplete
- **No confirmation dialog** — tap finishes immediately
- Only completed sets are saved; unlogged sets are silently dropped
- SessionLog written to IndexedDB, activeSession cleared, completion overlay shown

**Target (not yet):**
- Confirmation prompt when finishing with unlogged sets

---

### Abandoning a Session

> As a user, I want to discard an in-progress session if I need to stop early, so my history isn't cluttered with incomplete entries.

- Back arrow in session header triggers "End this session?" confirmation
- Nothing is saved to IndexedDB
- On confirm: `activeSession` cleared, SessionLog not written to permanent storage
- Partial session data is lost — this is intentional and expected

---

### Resuming a Crashed Session

> As a user, I want to resume an interrupted session without re-logging sets I already did, so I don't lose my work.

- On app boot, if `cwout:activeSession` exists in localStorage and `date === today`, offer to resume
- Resuming restores the session overlay with all previously logged sets pre-filled
- Discarding clears the key and starts fresh

See [Offline Strategy — Crash Recovery](../architecture/offline-strategy.md).

---

## Constraints

- Every set write must hit localStorage (`activeSession`) immediately — no batching
- `prefers-reduced-motion` is handled globally in `app.css` (animations/transitions reduced to ~0)
- All tap targets minimum 44×44px
- No network dependency at any point in the logging flow

---

## Out of Scope for v1

- Rest timer between sets (designed as v2 feature in inspiration)
- Progressive overload nudge (v2)
- Personal record detection (v2)
- Post-session notes beyond what's in the log

---

## Related

- [How It Works](../implementation/behavior.md) — Actual session behavior today
- [Data Model — SessionLog, LoggedSet](../architecture/data-model.md)
- [Offline Strategy — Crash Recovery](../architecture/offline-strategy.md)
- [Program Management](program-management.md) — Where the workout definition comes from
- [Settings & Preferences](settings-preferences.md) — Logging mode, completion feel
- [History & Calendar](history-calendar.md) — Where completed sessions go
