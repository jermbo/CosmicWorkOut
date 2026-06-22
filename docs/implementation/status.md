# Implementation Status

What's built today vs. what's still requirements-only. Verified against the code on branch `feature/v1.6.0` (June 2026).

---

## v1.1.0 — Core Workout Flows

| Feature                                                   | Status   | Notes                                                                     |
| --------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| Today view + start session                                | ✅ Built | Home card navigates to `/workout`; workout page handles start/edit        |
| Session logging — smart tap (instant or first-time entry) | ✅ Built | Instant if weight known; opens sheet for first-time weight entry          |
| Session logging — adjust completed set                    | ✅ Built | Tap any completed tile to reopen sheet; cascades forward                  |
| Weight remembered across sessions (`itemLastUsed`)        | ✅ Built | Pre-fills on session start                                                |
| Per-item weight increment (2.5 / 5 / 10)                  | ✅ Built | Configured on item form; weights round to nearest increment               |
| Finish / abandon session                                  | ✅ Built | Finish saves completed sets only; abandon has confirm dialog              |
| Crash recovery                                            | ✅ Built | Resume/discard banner on boot                                             |
| Session complete overlay                                  | ✅ Built | Stats + confetti                                                          |
| Program view + week progress                              | ✅ Built | Routine cards from the current week's templates                           |
| Workout/routine editor                                    | ✅ Built | Edit items, add new routines                                              |
| Item library browser                                      | ✅ Built | Category-filtered sheet in editor                                         |
| Calendar + day summary                                    | ✅ Built | Month grid, tap completed days                                            |
| IndexedDB persistence                                     | ✅ Built | Raw API wrapper, seed data                                                |
| Preferences store                                         | ✅ Built | Accent, density, roundness, weight unit                                   |
| Settings UI                                               | ✅ Built | `/settings` — accent color, weight unit, density, roundness               |
| Program selection screen                                  | ✅ Built | Bottom sheet; built-in programs deep-clone before activating              |
| Create new program                                        | ✅ Built | 2-step full-screen flow — details then routine names; scaffolds all weeks |
| Copy built-in before editing                              | ✅ Built | Guard dialog prompts copy+switch when editing a built-in program          |
| Custom item CRUD                                          | ✅ Built | Create/edit/delete in the item library; built-in items are read-only      |
| Browse all program weeks                                  | ✅ Built | Week picker chevrons on program page                                      |
| Weekly consistency streak                                 | ✅ Built | Consecutive weeks where sessions ≥ daysPerWeek; shown on home + calendar  |
| Scheduled/skipped day status                              | ✅ Built | Calendar infers training days-of-week from session history                |

---

## v1.2.0 — Daily Dashboard & Habits

| Feature                             | Status   | Notes                                                                              |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| Home screen as overview dashboard   | ✅ Built | Summary cards: Habits, Workout/Practice, Activity                                  |
| Global date context                 | ✅ Built | `loggingContext` store; date picker on home taps to any past day                   |
| Activity log page (`/log`)          | ✅ Built | List, add, edit, delete activities; date-filtered                                  |
| Dedicated workout page (`/workout`) | ✅ Built | Full session UI; back button to home                                               |
| Habit log page (`/habits`)          | ✅ Built | Progress rings, stepped +/− inputs, boolean toggles, exact-value modal             |
| Mood tracking                       | ✅ Built | Inline always-visible mood strip on `/habits`; separate from habit grid            |
| Habit progress rings                | ✅ Built | SVG rings fill based on logged / goal                                              |
| Pre-seeded habits                   | ✅ Built | Meditation, Writing, Reading, Water, Coffee, Alcohol, Mood                         |
| Habit `dailyGoal` migration         | ✅ Built | `initDB()` patches `dailyGoal` onto pre-existing built-in habit records missing it |
| Program complete state              | ✅ Built | Shown on `/workout` with CTA to choose a new program                               |

---

## v1.3.0 — Habit Management & Calendar History

| Feature                           | Status     | Doc reference                                                                                                                                  |
| --------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom habit CRUD in Settings     | ✅ Built   | US-009                                                                                                                                         |
| Habit history heatmap on Calendar | ✅ Built   | US-010                                                                                                                                         |
| Activity edit from calendar       | ✅ Built   | US-013                                                                                                                                         |
| Journal page                      | ❌ Removed | Shipped in v1.3 (US-012/US-014), then **removed** in commit `0af33ff` ("remove journal feature components"). No journal route or code remains. |
| Journal speech input & auto-save  | ❌ Removed | Removed with the Journal page (US-014).                                                                                                        |

---

## v1.4.0 — Belly Dance & the Discipline Model

| Feature                                    | Status   | Doc reference |
| ------------------------------------------ | -------- | ------------- |
| Discipline engine foundation               | ✅ Built | US-015        |
| Item library (Discipline-scoped)           | ✅ Built | US-016        |
| Belly Dance Discipline, program & routines | ✅ Built | US-017        |
| Practice hub & navigation                  | ✅ Built | US-018        |
| Dance session flow                         | ✅ Built | US-019        |
| Cross-Discipline streaks & calendar        | ✅ Built | US-020        |
| Practice groups & plans                    | ✅ Built | US-021        |

---

## v1.5.0 — Insights Hub

| Feature                    | Status   | Doc reference |
| -------------------------- | -------- | ------------- |
| Insights hub (`/insights`) | ✅ Built | US-022        |
| Mood × habits chart        | ✅ Built | US-023        |
| Weekly volume chart        | ✅ Built | US-024        |
| Activity breakdown chart   | ✅ Built | US-025        |
| Habit radar chart          | ✅ Built | US-026        |
| Exercise progress chart    | ✅ Built | US-027        |

Charts render with **Chart.js** (`src/lib/components/insights/`, helpers in `src/lib/chart-utils.ts`).

---

## v1.6.0 — Belly Dance Catalog & Course Programs

| Feature                           | Status   | Notes                                                                    |
| --------------------------------- | -------- | ------------------------------------------------------------------------ |
| Full belly dance move catalog     | ✅ Built | 39 moves (`bellydance-moves.ts`) + 10 warm-up/cool-down bookends         |
| Six belly dance "course" programs | ✅ Built | Beginner 101–103, Intermediate 101–103 (`bellydance-programs.ts`); DB v6 |

> ⚠️ `docs/features/v1.6.0/` does not yet exist — this section is reconstructed from code + git history. A feature folder should be backfilled.

---

## v1.7.0 — Full Strength Catalog & PWA

| Feature                        | Status   | Notes                                                                                                                                              |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full gym exercise catalog      | ✅ Built | 72 exercises (`strength-exercises.ts`); categories are **body-part based** (Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Full Body); DB v7 |
| Six strength "course" programs | ✅ Built | `strength-programs.ts`                                                                                                                             |
| Service worker / PWA           | ✅ Built | `src/service-worker.ts`; static adapter + PWA capabilities (commit `86ea3b0`)                                                                      |

> ⚠️ `docs/features/v1.7.0/` does not yet exist — reconstructed from code + git history. A feature folder should be backfilled.

---

## Built-In Content

- **12 programs:** 6 Strength + 6 Belly Dance course programs (Beginner/Intermediate 101–103 each).
- **121 items:** 72 strength exercises + 39 belly dance moves + 10 bookend (warm-up/cool-down) items, all derived from catalog seeds (`db/seeds/`).
- **8 strength categories** (body-part): Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Full Body.
- **7 habits:** Meditation, Writing, Reading, Water, Coffee, Alcohol, Mood.
- Items and programs are **upserted on every boot**; habits seed on first run only. Content updates ride the `DB_VERSION` bump (wipe + re-seed). See [Data Model](../architecture/data-model.md).

---

## Related

- [How It Works](behavior.md) — Full behavioral mental model
- [Data Model](../architecture/data-model.md) — Entities, stores, DB version
- [App Structure](app-structure.md) — Routes and layout
- [State Management](state.md) — Store details
- [v1.5.0 Features](../features/v1.5.0/README.md) — Insights hub (shipped)
- [v1.4.0 Features](../features/v1.4.0/README.md) — Discipline model (shipped)
