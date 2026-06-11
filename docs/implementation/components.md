# Components

Inventory of UI components in `src/lib/components/`. Each is a self-contained Svelte file with scoped styles.

---

## Navigation & Layout

| Component | Used by | Purpose |
|-----------|---------|---------|
| `BottomNav` | Layout | Fixed 3-tab nav (Today, Program, Calendar) |
| `BottomSheet` | Multiple | Reusable slide-up panel with backdrop |

---

## Today Page

| Component | Purpose |
|-----------|---------|
| `TodayWorkout` | Workout preview card with exercise list + Start button |
| `WeekStrip` | 7-day mini calendar showing this week's activity |

---

## Session Flow

| Component | Purpose |
|-----------|---------|
| `SessionOverlay` | Full-screen active session: timer, progress bar, exercise list |
| `ExerciseCard` | Exercise header + set tiles + completion animation |
| `SetTile` | Set button — shows "+" until logged, then weight × reps |
| `LogSetSheet` | Stepper/numpad input for weight and reps |
| `ProgressRing` | Circular progress indicator on exercise card |
| `SessionComplete` | Post-workout stats overlay |
| `Confetti` | Celebration particles (respects `completionFeel`) |

---

## Program Page

| Component | Purpose |
|-----------|---------|
| `WorkoutEditor` | Full-screen workout editor (name, exercises, sets/reps) |
| `ExerciseLibrarySheet` | Browse/filter exercise library by category |

---

## Calendar Page

| Component | Purpose |
|-----------|---------|
| `DaySummarySheet` | Read-only session detail for a completed day |

---

## Component Hierarchy

```mermaid
flowchart TB
    subgraph layout ["Root Layout"]
        BN[BottomNav]
        SO[SessionOverlay]
        SC[SessionComplete]
    end

    subgraph today ["Today Page"]
        TW[TodayWorkout]
        WS[WeekStrip]
    end

    subgraph session ["Session Overlay"]
        EC[ExerciseCard]
        PR[ProgressRing]
        ST[SetTile]
        LS[LogSetSheet]
        CF[Confetti]
    end

    subgraph program ["Program Page"]
        WE[WorkoutEditor]
        ELS[ExerciseLibrarySheet]
        BS[BottomSheet]
    end

    subgraph calendar ["Calendar Page"]
        DSS[DaySummarySheet]
    end

    SO --> EC
    EC --> PR & ST
    SO --> LS
    SC --> CF
    WE --> ELS & BS
    DSS --> BS
```

### Session flow detail

```mermaid
flowchart TB
    SO[SessionOverlay]
    SO --> EC1[ExerciseCard]
    SO --> EC2[ExerciseCard ...]
    SO --> LS[LogSetSheet]
    EC1 --> PR[ProgressRing]
    EC1 --> ST1[SetTile ×N]
```

---

## Exercise Unit Handling

`LogSetSheet` adapts input by exercise unit:

| Unit | Input |
|------|-------|
| `lb` / `kg` | Numeric weight stepper or numpad |
| `band` | Light / Med / Heavy selector |
| `bodyweight` | Reps only (weight shown as BW) |

---

## Related

- [How It Works](behavior.md) — What each screen does
- [App Structure](app-structure.md) — Where components are mounted
- [Session Logging](../requirements/session-logging.md) — Interaction requirements
- [Design tokens](../../src/app.css) — CSS custom properties
