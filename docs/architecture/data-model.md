# Data Model

All data is stored locally on the device. See [Offline Strategy](offline-strategy.md) for where each entity lives and when it's written.

---

## Entities

### Exercise

A single movement — the atomic unit of any workout.

```typescript
type Exercise = {
  id: string;            // uuid
  name: string;          // "Goblet Squat"
  cue: string;           // short coaching note, optional
  unit: "lb" | "kg" | "band" | "bodyweight";
  defaultSets: number;
  defaultReps: string;   // "8-10" or "5" — string to support ranges
  defaultRestSec?: number;
  incrementUnit?: number; // suggested weight jump for progressive overload
};
```

Exercises live in a library. Built-in exercises ship with the app; users can add custom ones.

---

### Program

A full training plan. Contains one or more weeks, each containing scheduled workout days.

```typescript
type Program = {
  id: string;
  name: string;           // "My 3-Month Strength Plan"
  description?: string;
  durationWeeks: number;  // total length
  daysPerWeek: number;    // how many training days per week
  weeks: Week[];
  createdAt: string;      // ISO date
  isBuiltIn: boolean;     // true for shipped plans, false for user-created
};

type Week = {
  weekNumber: number;
  workouts: Workout[];    // one per training day
};
```

---

### Workout

A single training day — a named list of exercises with prescribed sets/reps.

```typescript
type Workout = {
  id: string;
  name: string;           // "Day A", "Lower Body", "Week 1 – Day 1"
  exercises: WorkoutExercise[];
};

type WorkoutExercise = {
  exerciseId: string;     // references Exercise.id
  sets: number;
  reps: string;           // "8-10"
  notes?: string;
};
```

---

### SessionLog

A completed workout session. Written as the user logs sets; finalized when session ends.

```typescript
type SessionLog = {
  id: string;             // uuid
  date: string;           // ISO date "2025-06-10"
  workoutId: string;      // which workout was performed
  programId: string;
  startedAt: string;      // ISO datetime
  finishedAt?: string;    // set on session complete
  totalVolumeLbs?: number;
  exercises: LoggedExercise[];
};

type LoggedExercise = {
  exerciseId: string;
  sets: LoggedSet[];
};

type LoggedSet = {
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: string;    // ISO datetime
};
```

---

### TrainingDay

Represents a calendar day's status relative to the active program.

```typescript
type TrainingDay = {
  date: string;           // ISO date
  status: "completed" | "today" | "scheduled" | "skipped" | "rest";
  sessionId?: string;     // references SessionLog.id if completed
};
```

This is derived from the program schedule + session logs, not stored separately.

---

### UserPrefs

Lightweight user preferences. Stored in localStorage, not IndexedDB.

```typescript
type UserPrefs = {
  accentColor: string;    // hex, default "#B2F042"
  loggingMode: "instant" | "stepper" | "numpad";
  completionFeel: "full" | "subtle";
  density: "comfortable" | "compact";
  roundness: "sharp" | "rounded" | "pill";
  weightUnit: "lb" | "kg";
};
```

---

## Relationships

```
Program
  └── Week[]
        └── Workout[]
              └── WorkoutExercise[] ──► Exercise (library)

SessionLog ──► Workout
SessionLog
  └── LoggedExercise[] ──► Exercise
        └── LoggedSet[]
```

---

## IndexedDB Stores

| Store | Key | Contents |
|-------|-----|----------|
| `exercises` | `id` | Exercise library (built-in + custom) |
| `programs` | `id` | All Program records |
| `sessions` | `id` | All SessionLog records, indexed by `date` |
| `exerciseLastUsed` | `exerciseId` | Last logged weight + reps per exercise |

---

## localStorage Keys

| Key | Contents |
|-----|----------|
| `cwout:prefs` | UserPrefs JSON |
| `cwout:activeSession` | In-progress SessionLog (crash recovery) |
| `cwout:activeProgramId` | Which Program is currently active |

---

## Open Questions

- Should `TrainingDay` status be fully derived at runtime, or materialized for performance?
- When a user edits a workout mid-program, do historical session logs reflect the old or new exercise list?
- Multiple active programs simultaneously, or one at a time?

---

## Related

- [Offline Strategy](offline-strategy.md) — When and how each store is written
- [Tech Stack](tech-stack.md) — IndexedDB wrapper choice
- [Program Management](../requirements/program-management.md) — Program editing requirements
- [Session Logging](../requirements/session-logging.md) — How SessionLog is built up during a workout
