# Session Logging

The core action of the app — recording a completed workout.

**Tied to:** [Data Model — SessionLog](../architecture/data-model.md) | [Offline Strategy](../architecture/offline-strategy.md) | [Design Principles — Speed](../vision/principles.md)

---

## Goal

Logging a set should take under 5 seconds, one-handed. Everything else in the logging flow is secondary to this constraint.

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

- Each set tile shows the target reps and last-used weight
- Tapping the tile instantly marks it complete with spring animation + haptic feedback
- Weight defaults to the last weight I used for this exercise (`exerciseLastUsed`)
- If no previous weight exists, the tile prompts for first-time input before confirming

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

- Long press (or stepper/numpad mode) opens an input sheet
- I can adjust weight and reps, then confirm
- The confirmed values are logged and become the new `exerciseLastUsed`

Logging mode is a user preference (see [Settings](settings-preferences.md)):
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

- A "Finish Session" button is always accessible during an active session
- Tapping it prompts confirmation if there are unlogged sets
- On confirm:
  - `SessionLog.finishedAt` is set
  - Total volume is calculated and stored
  - Session is written to IndexedDB `sessions` store
  - `activeSession` key is cleared from localStorage
  - Full-screen completion overlay: check circle pops, confetti (configurable via `completionFeel`)

---

### Abandoning a Session

> As a user, I want to discard an in-progress session if I need to stop early, so my history isn't cluttered with incomplete entries.

- An "Abandon" option is available during an active session
- Confirmation prompt before discarding
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
- Animations must respect `prefers-reduced-motion` — show end state, skip keyframes
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

- [Data Model — SessionLog, LoggedSet](../architecture/data-model.md)
- [Offline Strategy — Crash Recovery](../architecture/offline-strategy.md)
- [Program Management](program-management.md) — Where the workout definition comes from
- [Settings & Preferences](settings-preferences.md) — Logging mode, completion feel
- [History & Calendar](history-calendar.md) — Where completed sessions go
