# State Management

Three Svelte 5 class stores hold all application state. No external state library.

---

## programStore

**File:** `src/lib/stores/program.svelte.ts`

Owns the long-lived data layer — programs, exercises, sessions, and derived schedule logic.

| State | Source | Purpose |
|-------|--------|---------|
| `programs` | IndexedDB | All programs |
| `exercises` | IndexedDB | Exercise library |
| `sessions` | IndexedDB | Completed session logs |
| `activeProgram` | IndexedDB + localStorage | Currently active program |

**Key derived values:**

- `todaysWorkout` — next workout in linear progression (see [Program Progression](program-progression.md))
- `todaySession` — completed session for today (if any)
- `currentWeekNumber` — derived from session count
- `exerciseMap` — `Map<id, Exercise>` for fast lookups

**Key actions:**

- `load()` — boot-time data load
- `saveWorkoutExercises(name, exercises)` — update workout across all weeks
- `addWorkout(workout)` — add new workout template to all weeks
- `refreshSessions()` — reload sessions after finish

---

## sessionStore

**File:** `src/lib/stores/session.svelte.ts`

Owns the ephemeral active session lifecycle.

| State | Storage | Purpose |
|-------|---------|---------|
| `active` | localStorage | In-progress session |
| `isComplete` | memory | Triggers completion overlay |
| `completedSession` | memory | Stats for completion screen |

**Key actions:**

- `start(workout, program, exerciseMap)` — build ActiveSession from workout template
- `completeSet(ex, set)` — instant mode: mark set done at current weight/reps
- `logSet(ex, set, weight, reps)` — sheet mode: mark set done with explicit values
- `finish(durationSeconds?)` — save **completed sets only** to IndexedDB, clear active
- `abandon()` — discard without saving to IndexedDB
- `checkForRecovery()` / `recoverSession()` — crash recovery

Every set write calls `persist()` → `localStorage:cwout:activeSession`.

---

## prefsStore

**File:** `src/lib/stores/prefs.svelte.ts`

User preferences. Loaded once at boot, saved on every change.

| Pref | Default | Applied via |
|------|---------|-------------|
| `accentColor` | `#b2f042` | `--color-accent` CSS var + ink color |
| `loggingMode` | `instant` | SessionOverlay tap behavior |
| `completionFeel` | `full` | Confetti on/off |
| `density` | `comfortable` | `data-density` on `<html>` |
| `roundness` | `default` | `data-roundness` on `<html>` |
| `weightUnit` | `lb` | Display in SetTile, LogSetSheet |

**Note:** No settings UI exists yet. Public setters exist for `accentColor`, `loggingMode`, `completionFeel`, and `weightUnit` only — not density or roundness.

---

## Data Flow Diagram

```mermaid
flowchart TB
    IDB[("IndexedDB")]
    LS[("localStorage")]
    PS[programStore]
    SS[sessionStore]
    PR[prefsStore]
    UI[Svelte UI]

    IDB <-->|load / put| PS
    IDB <-->|put on finish| SS
    IDB <-->|put per set| SS
    LS <-->|persist activeSession| SS
    LS <-->|read/write prefs| PR
    PS -->|todaysWorkout| UI
    PS -->|start()| SS
    SS -->|isActive / isComplete| UI
    PR -->|accent, loggingMode| UI
```

---

## Related

- [How It Works](behavior.md) — What stores do in practice
- [Data Model](../architecture/data-model.md) — Type definitions
- [Program Progression](program-progression.md) — Schedule derivation
- [Session Logging](../requirements/session-logging.md) — User-facing flow
