# System Overview

CosmicWorkOut is a **client-only** SvelteKit web app. No backend, no API, no auth. All data lives on the user's device.

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph browser ["Browser"]
        UI["SvelteKit UI\n8 routes + overlays"]
        Stores["Svelte Stores\nprogram · session · prefs · habits · activities · loggingContext"]
        IDB[("IndexedDB\nexercises · programs · sessions\nhabits · habitLogs · activities")]
        LS[("localStorage\nprefs · activeSession · activeProgramId · lastActivityType")]
        SW["Service Worker\nplanned — not built"]
    end

    UI <--> Stores
    Stores <--> IDB
    Stores <--> LS
    UI -.-> SW
```

After the first page load the app runs entirely in the browser. A service worker for offline shell caching is **planned but not yet implemented** — see [Offline Strategy](offline-strategy.md).

---

## Layers

### UI Layer — Svelte 5 + SvelteKit

Eight routes: **Today** (`/`), **Habits** (`/habits`), **Workout** (`/workout`), **Activity Log** (`/log`), **Program** (`/program`), **Calendar** (`/calendar`), **Settings** (`/settings`), plus global overlays (active session, completion screen, crash recovery) in the root layout.

The UI reads and writes through six Svelte stores — no REST, no server state.

See [App Structure](../implementation/app-structure.md) and [Tech Stack](tech-stack.md).

### Data Layer — IndexedDB + localStorage

Persistent data in IndexedDB (version 2) via a thin Promise wrapper (`src/lib/db/database.ts`). Preferences, in-progress sessions, and last-used activity type in localStorage for synchronous access.

See [Data Model](data-model.md) and [State Management](../implementation/state.md).

### Service Worker — Planned

Not built yet. When added, it will cache the app shell for offline launch and PWA install. Core functionality already works offline after first load in a normal browser tab.

---

## Data Flow

### Logging a set

```mermaid
sequenceDiagram
    actor User
    participant Tile as SetTile
    participant SS as sessionStore
    participant IDB as IndexedDB
    participant LS as localStorage

    User->>Tile: tap set
    Tile->>SS: completeSet() or logSet()
    SS->>IDB: put exerciseLastUsed
    SS->>LS: persist activeSession
    SS-->>Tile: reactive update
    Tile-->>User: completed animation
```

### Starting the app

```mermaid
sequenceDiagram
    participant Layout as +layout.svelte
    participant DB as initDB()
    participant Prefs as prefsStore
    participant Prog as programStore
    participant Hab as habitStore
    participant Act as activityStore
    participant Sess as sessionStore
    participant UI as Today view

    Layout->>DB: open IndexedDB v2, seed data, run migrations
    Layout->>Prefs: load() + apply CSS vars
    Layout->>Prog: load() programs, exercises, sessions
    Layout->>Hab: load() habits, habit logs
    Layout->>Act: load() activities
    Layout->>Sess: checkForRecovery()
    alt unfinished session from today
        Sess-->>Layout: show resume banner
    end
    Layout->>UI: appReady = true
```

### Logging a habit

```mermaid
sequenceDiagram
    actor User
    participant HabitPage as /habits page
    participant HS as habitStore
    participant IDB as IndexedDB

    User->>HabitPage: tap +/−, toggle, or mood option
    HabitPage->>HS: increment() / toggle() / setMood()
    HS->>IDB: put habitLog (upsert by habitId + date)
    HS-->>HabitPage: reactive update
    HabitPage-->>User: ring fills / value updates
```

### Editing a program

```mermaid
sequenceDiagram
    actor User
    participant Editor as WorkoutEditor
    participant PS as programStore
    participant IDB as IndexedDB

    User->>Editor: save workout
    Editor->>PS: saveWorkoutExercises() or addWorkout()
    PS->>IDB: put program
    PS-->>Editor: reactive update
    Editor-->>User: updated workout cards
```

---

## Program Progression

Today's workout is **not calendar-based**. The app advances linearly through the program:

```mermaid
flowchart LR
    SC["completedSessionCount"] --> IDX["index = count % allWorkouts.length"]
    IDX --> TW["suggestedWorkout"]
    SC --> WK["week = floor(count / daysPerWeek) + 1"]
```

`completedSessionCount` = number of finished sessions for the active program. Week number is derived from session count ÷ days per week.

See [Program Progression](../implementation/program-progression.md).

---

## What Does Not Exist (By Design)

- **No backend API** — v1 is local-only
- **No authentication** — single-user per device
- **No cloud sync** — data stays on device
- **No analytics or telemetry**

---

## Related

- [How It Works](../implementation/behavior.md) — Mental model for the whole app
- [Data Model](data-model.md) — What gets stored
- [Tech Stack](tech-stack.md) — SvelteKit, IndexedDB, CSS tokens
- [Offline Strategy](offline-strategy.md) — What's built vs planned
- [Implementation Status](../implementation/status.md) — Feature checklist
- [North Star](../vision/north-star.md) — Why this architecture
