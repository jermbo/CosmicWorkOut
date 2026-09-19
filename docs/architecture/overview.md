[Wiki](../README.md) › [15k — Architecture](../README.md#15k--architecture) › System Overview

# System Overview

CosmicWorkOut is a **client-only** SvelteKit web app. No backend, no API, no auth. All data lives on the user's device.

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph browser ["Browser"]
        UI["SvelteKit UI\nroutes + overlays"]
        Stores["Svelte Stores\nprogram · session · prefs · habits · activities\nhealth · goalPlans · baselines · loggingContext · toast"]
        IDB[("IndexedDB v10\nitems · programs · sessions · itemLastUsed\nhabits · habitLogs · activities\nhealthReadings · goalPlans\nbaselines · baselineLogs")]
        LS[("localStorage\nprefs · activeSession · activeProgramIds · lastActivityType")]
        SW["Service Worker\nprecaches app shell"]
    end

    UI <--> Stores
    Stores <--> IDB
    Stores <--> LS
    UI -.-> SW

    classDef ui fill:#3b3f8c,stroke:#23264f,color:#ffffff;
    classDef state fill:#1f6f6f,stroke:#0f3a3a,color:#ffffff;
    classDef store fill:#7a4f9e,stroke:#46295c,color:#ffffff;
    classDef worker fill:#465569,stroke:#28313e,color:#ffffff;
    class UI ui;
    class Stores state;
    class IDB,LS store;
    class SW worker;
```

After the first page load the app runs entirely in the browser. A service worker (`src/service-worker.ts`) precaches the app shell for offline launch and PWA install — see [Offline Strategy](offline-strategy.md).

---

## Layers

### UI Layer — Svelte 5 + SvelteKit

The shipped routes: **Overview** (`/`), **Habits** (`/habits`), **Workout** (`/workout`), **Activity Log** (`/log`), **Program** (`/program`), **Calendar** (`/calendar`), **Insights** (`/insights`), **Health** (`/health`), **Lift plans** (`/goals`, `/goals/new` — UI name; code may still say “goals”), **Practice hub** (`/practice`), **Practice group** (`/practice/[groupId]`), **Dance session** (`/practice/dance`), and **Settings** (`/settings`) with `habits` / `data` sub-routes — plus global overlays (active session, completion screen, crash recovery) in the root layout. **Planned (v1.9.0):** **Baselines** (`/baselines`, `/settings/baselines`). There is no `/settings/appearance` route; appearance prefs stay at fixed defaults.

The UI reads and writes through the Svelte stores — no REST, no server state.

See [App Structure](../implementation/app-structure.md) and [Tech Stack](tech-stack.md).

### Data Layer — IndexedDB + localStorage

Persistent data in IndexedDB (version **9**) via a thin Promise wrapper (`src/lib/db/database.ts`). Preferences, in-progress sessions, per-Discipline active programs, and last-used activity type in localStorage for synchronous access.

See [Data Model](data-model.md) and [State Management](../implementation/state.md).

### Service Worker — Implemented

`src/service-worker.ts` (SvelteKit's `$service-worker` module, no Workbox) precaches the app shell and serves a cached fallback for offline navigations, enabling PWA install. Requires a secure context (HTTPS or `localhost`).

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
    SS->>IDB: put itemLastUsed
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
    participant He as healthStore
    participant GP as goalPlanStore
    participant Sess as sessionStore
    participant UI as Overview

    Layout->>DB: open IndexedDB v10, seed data, run migrations
    Layout->>Prefs: load() + apply CSS vars
    Layout->>Prog: load() programs, items, sessions
    Layout->>Hab: load() habits, habit logs
    Layout->>Act: load() activities
    Layout->>He: load() health readings
    Layout->>GP: load() lift plans
    Layout->>Sess: checkForRecovery()
    alt unfinished session from today
        Sess-->>Layout: show resume banner
    end
    Layout->>UI: appReady = true
```

Boot failures surface a reload prompt instead of a permanent spinner — see [App Structure — Boot Sequence](../implementation/app-structure.md#boot-sequence).

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
- [Glossary](../glossary.md) — Discipline, Routine, Item, Lift plan, …
- [Data Model](data-model.md) — What gets stored (DB v10)
- [Tech Stack](tech-stack.md) — SvelteKit, IndexedDB, CSS tokens
- [Offline Strategy](offline-strategy.md) — Local-first persistence and caching
- [App Structure](../implementation/app-structure.md) — Routes, layout, boot
- [Implementation Status](../implementation/status.md) — Feature checklist
- [North Star](../vision/north-star.md) — Why this architecture
