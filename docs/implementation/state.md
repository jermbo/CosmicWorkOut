[Wiki](../README.md) › [Implementation](../README.md#ground--implementation) › State Management

# State Management

Eight Svelte 5 class stores hold application state (plus a small `toastStore` for transient notifications). No external state library.

---

## programStore

**File:** `src/lib/stores/program.svelte.ts`

Owns the long-lived workout data — programs, items, sessions, and derived schedule logic.

| State           | Source                   | Purpose                  |
| --------------- | ------------------------ | ------------------------ |
| `programs`      | IndexedDB                | All programs             |
| `items`         | IndexedDB                | Item library             |
| `sessions`      | IndexedDB                | Completed session logs   |
| `activeProgram` | IndexedDB + localStorage | Currently active program |

**Key derived values:**

- `suggestedWorkoutInCurrentWeek` — next workout in linear progression
- `workoutsForCurrentWeek` — all workouts for the current week (for WorkoutPicker)
- `sessionForDate(date)` — completed session for a given date (if any)
- `currentWeekNumber` — derived from session count
- `itemMap` — `Map<id, Item>` for fast lookups
- `isProgramComplete` — true when all sessions are logged
- `weekStreak` — consecutive weeks meeting daysPerWeek target

**Key actions:**

- `load()` — boot-time data load
- `saveRoutine(programId, name, updates)` / `addRoutine(programId, routine)` / `removeRoutine(programId, name)` — edit a routine by program id, whether or not it's active (v1.10.0, US-052 — editing used to silently target the active program even when viewing a different one)
- `refreshSessions()` — reload sessions after finish
- `getRoutineById(id)` — lookup by ID
- `getRoutineForSession(session)` — lookup routine for a completed session
- `setActiveProgram(id)` — activate one program, deactivating every other active program (v1.10.0, US-052 — exactly one plan is ever active)

---

## sessionStore

**File:** `src/lib/stores/session.svelte.ts`

Owns the ephemeral active session lifecycle.

| State              | Storage      | Purpose                            |
| ------------------ | ------------ | ---------------------------------- |
| `active`           | localStorage | In-progress session                |
| `isActive`         | derived      | True when a session is in progress |
| `isComplete`       | memory       | Triggers completion overlay        |
| `completedSession` | memory       | Stats for completion screen        |

**Key actions:**

- `start(workout, program, exerciseMap, opts)` — build ActiveSession from workout template; `opts.date` sets the session date; `opts.prescribed` applies goal-plan targets when present
- `editSession(session, workout, exerciseMap)` — reopen a completed session for editing
- `completeSet(ex, set)` — instant mode: mark set done at current weight/reps
- `logSet(ex, set, weight, reps)` — sheet mode: mark set done with explicit values
- `finish(durationSeconds?)` — save completed sets only to IndexedDB, clear active
- `abandon()` — discard without saving to IndexedDB
- `checkForRecovery()` / `recoverSession()` — crash recovery

Every set write calls `persist()` → `localStorage:cwout:activeSession`.

---

## prefsStore

**File:** `src/lib/stores/prefs.svelte.ts`

User preferences. Loaded once at boot, saved on every change.

| Pref                          | Default       | Applied via                                                                                        |
| ----------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| `accentColor`                 | `#b2f042`     | `--color-accent` CSS var + ink color                                                               |
| `theme`                       | `dark`        | `data-theme` on `<html>` (resolved: `system` follows the device; also set pre-paint in `app.html`) |
| `density`                     | `comfortable` | `data-density` on `<html>`                                                                         |
| `roundness`                   | `default`     | `data-roundness` on `<html>`                                                                       |
| `weightUnit`                  | `lb`          | Display in SetTile, LogSetSheet                                                                    |
| `homeCardOrder`               | see below     | Order of the Overview summary cards                                                                |
| `habitsEnabled`               | `false`       | Gates `/habits`, mood, and related UI                                                              |
| `activityLogEnabled`          | `false`       | Gates `/log` and related UI                                                                        |
| `practiceEnabled`             | `false`       | Gates the whole Workout section (below) — code name lags the "Workout" rename (v1.10.0, US-052)   |
| `healthMetricsEnabled`        | `false`       | Gates `/health` and related UI                                                                     |
| `baselinesEnabled`            | `false`       | Gates `/baselines` and related UI                                                                  |

All settings are editable via `/settings` and sub-routes ([US-030](../features/v1.7.0/US-030-settings-restructure.md)).

### Overview card order

No tracking feature owns the top of Overview. `homeCardOrder` is a user-set list of card ids, edited by drag or arrow buttons on `/settings/overview`. Registry and pure logic live in `src/lib/homeCards.ts` (tested in `homeCards.test.ts`); default order is `habits · practice · activity · baselines · health` — the `practice` id's label is now **Workout** (v1.10.0, US-052).

The stored value comes from localStorage, so `resolveHomeCardOrder()` repairs it on every read: unknown and duplicate ids are dropped, and **any card the stored order doesn't mention is appended in default order**. That last rule is what makes a newly shipped card appear for existing users instead of silently vanishing — adding a card means adding it to `HOME_CARD_IDS`, nothing more.

Order is stored for every card, including ones whose feature is off; Overview filters by the flags at render time, and the settings list marks those rows "Turned off" so their position still makes sense.

### Feature flags hide UI; data always persists

**Every tracking feature is opt-in and defaults off** — Habits, Activity log, Workout, Health metrics, and Baselines. A flag only controls visibility: IndexedDB rows and localStorage keys are untouched (boot still runs every store's `load()` and `seedHabitsIfEmpty()`), so flipping a flag back on restores the feature with its history intact. Route guards use `redirectWhenDisabled()` from `src/lib/featureGate.svelte.ts`, which bounces to Overview; `/baselines` additionally shows a short "turned off" panel.

Because nothing is on for a fresh install, `prefsStore.anyTrackingEnabled` drives an Overview empty state pointing at Settings.

Each flag covers its own Overview card, week-strip indicator, Insights charts, and Settings → Data clear row. One wrinkle is worth knowing:

- **Mood belongs to Habits.** Mood is a protected `Habit` row (`type: 'mood'`) that can't be deactivated _within_ Habits, but it is not exempt from the flag — the mood strip, the week-strip mood pips, and the Mood vs Habits chart all hide with `habitsEnabled`.

**`practiceEnabled` reaches furthest.** Workout is the session engine, not a single screen, so the flag covers: the Workout bottom-nav tab; every `/workout*` route; the Overview workout card, week-streak badge, and week-strip session indicators; the session overlay, completion screen, and crash-recovery banner in `+layout.svelte`; the Insights weekly volume chart; and the exercise / program / session clear rows in Settings → Data. A plan's own goal, if it has one, is part of the same Program/GoalPlan record pair and needs no separate flag (v1.10.0, US-052 folded the old, separate Lift plans toggle into this one).

---

## habitStore

**File:** `src/lib/stores/habits.svelte.ts`

Owns habits and their daily logs.

| State    | Source    | Purpose                          |
| -------- | --------- | -------------------------------- |
| `habits` | IndexedDB | All habit definitions            |
| `logs`   | IndexedDB | All habit log entries (all time) |

**Key derived values:**

- `activeHabits` — sorted by `sortOrder`, filtered to `active === true`
- `getLog(habitId)` — log entry for `habitId` on the current context date
- `loggedCountForDate(date)` — count of habits with any value logged on a date

**Key actions:**

- `load()` — boot-time data load
- `setDate(date)` — switch which date logs are read from
- `increment(habitId)` — add 1 to a count/times habit for the current date
- `decrement(habitId)` — subtract 1 (min 0)
- `toggle(habitId)` — flip boolean habit between 0 and 1
- `setDuration(habitId, minutes)` — set minutes value directly
- `setExact(habitId, value)` — set any numeric value directly
- `setMood(habitId, value)` — set mood value (-5 to +5)

---

## activityStore

**File:** `src/lib/stores/activities.svelte.ts`

Owns non-workout activity logs (runs, walks, yoga, etc.).

| State          | Source       | Purpose                                |
| -------------- | ------------ | -------------------------------------- |
| `activities`   | IndexedDB    | All activity log entries               |
| `lastUsedType` | localStorage | Pre-selects type on new activity sheet |

**Key derived values:**

- `activitiesByDate` — `Map<dateStr, ActivityLog[]>` for fast per-date lookup
- `todayActivities` — shorthand for today's activities

**Key actions:**

- `load()` — boot-time data load
- `add(data)` — create new activity entry
- `update(activity)` — overwrite existing entry
- `remove(id)` — delete entry

---

## loggingContext

**File:** `src/lib/stores/loggingContext.svelte.ts`

Global context shared across pages: the date being logged for and the selected workout.

| State       | Default            | Purpose                                   |
| ----------- | ------------------ | ----------------------------------------- |
| `date`      | today's date (ISO) | Which day all pages read/write logs for   |
| `workoutId` | null               | Overrides suggested workout on `/workout` |

**Key actions:**

- `setDate(date)` — change the active logging date
- `resetToToday()` — snap back to today
- `setWorkoutId(id)` — select a specific workout on `/workout`

This store has **no persistence** — it resets to today on every page load. The home page also syncs it from the `?date=` query param.

---

## healthStore

**File:** `src/lib/stores/health.svelte.ts`

Owns optional body measurement readings — weight and blood pressure ([US-029](../features/v1.7.0/US-029-health-metrics.md)). Gated by `prefsStore.healthMetricsEnabled`.

| State      | Source    | Purpose             |
| ---------- | --------- | ------------------- |
| `readings` | IndexedDB | All health readings |

**Key derived values:**

- `weightForDate(date)` — single weight reading or null
- `bpReadingsForDate(date)` — all BP readings for a date, sorted by `recordedAt`
- `hasAnyReadingForDate(date)` — drives calendar / home week indicators
- `dailyBpAverages(dates)` — systolic/diastolic averages for Insights charts

**Key actions:**

- `load()` — boot-time data load
- `upsertWeight(date, value)` — one weight per date
- `addBpReading(date, values)` — new BP row with auto `recordedAt`
- `updateReading(reading)` / `deleteReading(id)` — corrections

Reads `loggingContext.date` for the active logging date (same as `habitStore` and `activityStore`).

---

## goalPlanStore

**File:** `src/lib/stores/goalPlans.svelte.ts`

Owns the goal a plan can optionally have ([US-033](../features/v1.9.0/US-033-goal-progression-plans.md); merged into one Workout section in [US-052](../features/v1.10.0/US-052-one-workout-section.md)). Pure logic lives in `src/lib/goalPlans/`. Gated by `prefsStore.practiceEnabled`. `src/lib/plans/actions.ts` is the layer above this and `programStore` that the UI actually calls — `activatePlan`/`pausePlan`/`runItAgain` dispatch to whichever store owns a given program id, so exactly one plan (goal-bearing or not) is ever active.

| State   | Source    | Purpose          |
| ------- | --------- | ---------------- |
| `plans` | IndexedDB | All goal records |

**Key derived values:**

- `activePlan` — the single active plan, or null
- `pausedPlans` / `completedPlans` — history lists
- `prescribedTargets(plan)` — this week's focus + supporting targets for session start

**Key actions:**

- `load()` — boot-time data load
- `createPlan(input)` — generate blocks, upsert backing Program, store paused plan
- `activatePlan(id)` — sole active Strength program via `programStore.setActiveProgram`
- `pausePlan(id)` / `completePlan(id)` — lifecycle; deactivate backing program
- `removeGoal(id)` — drop the goal only; the backing program keeps running as a plain plan to its original end (v1.10.0, US-052)
- `repeatCurrentBlock(id)` — rewind targets via `countOffset`; extend backing program weeks
- `renamePlan(id, name)` — rename plan + backing program

---

## baselineStore _(planned — v1.9.0)_

**File:** TBD (e.g. `src/lib/stores/baselines.svelte.ts`)

Owns Baseline definitions and BaselineLog entries ([US-034](../features/v1.9.0/US-034-baselines-setup.md), [US-035](../features/v1.9.0/US-035-baselines-logging.md)). Gated by `prefsStore.baselinesEnabled`.

Expected responsibilities: load definitions + logs; CRUD baselines; add/edit/delete log entries; day totals by sum; chart series helpers for [US-036](../features/v1.9.0/US-036-baselines-charts.md). Reads `loggingContext.date` for the active logging date.

---

## Data Flow Diagram

```mermaid
flowchart TB
    IDB[("IndexedDB")]
    LS[("localStorage")]
    PS[programStore]
    SS[sessionStore]
    PR[prefsStore]
    HS[habitStore]
    AS[activityStore]
    HeS[healthStore]
    GP[goalPlanStore]
    BS[baselineStore]
    LC[loggingContext]
    UI[Svelte UI]

    IDB <-->|load / put| PS
    IDB <-->|put on finish| SS
    IDB <-->|load / put| HS
    IDB <-->|load / put| AS
    IDB <-->|load / put| HeS
    IDB <-->|load / put| GP
    IDB <-->|load / put| BS
    LS <-->|persist activeSession| SS
    LS <-->|read/write prefs| PR
    LS <-->|lastActivityType| AS
    LC -->|date| HS
    LC -->|date| AS
    LC -->|date| HeS
    LC -->|date| BS
    LC -->|date + workoutId| PS
    GP -->|prescribed targets| SS
    GP -->|setSoleActiveProgram| PS
    PS -->|suggestedWorkout, sessions| UI
    SS -->|isActive / isComplete| UI
    HS -->|activeHabits, logs| UI
    AS -->|activitiesByDate| UI
    HeS -->|readings, charts| UI
    GP -->|activePlan, timelines| UI
    BS -->|baselines, day totals, charts| UI
    PR -->|accent, density, feature toggles| UI

    classDef storage fill:#7a4f9e,stroke:#46295c,color:#ffffff;
    classDef store fill:#1f6f6f,stroke:#0f3a3a,color:#ffffff;
    classDef ui fill:#3b3f8c,stroke:#23264f,color:#ffffff;
    class IDB,LS storage;
    class PS,SS,PR,HS,AS,HeS,GP,BS,LC store;
    class UI ui;
```

---

## Related

- [How It Works](behavior.md) — What stores do in practice
- [Data Model](../architecture/data-model.md) — Type definitions
- [Program Progression](program-progression.md) — Schedule derivation
- [Session Logging](../requirements/session-logging.md) — User-facing flow
- [US-029 — Health Metrics](../features/v1.7.0/US-029-health-metrics.md) — Health store
- [US-033 — Goal Progression Plans](../features/v1.9.0/US-033-goal-progression-plans.md) — Lift plan store
