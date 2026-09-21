[Wiki](../README.md) › [Implementation](../README.md#ground--implementation) › Implementation Status

# Implementation Status

What's built today. **Current phase:** user testing and feedback — new work starts on the [roadmap](../roadmap/README.md).

Verified against the codebase (July 2026).

---

## v1.1.0 — Core Workout Flows

| Feature                                                   | Status  | Notes                                                                                 |
| --------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| Today view + start session                                | Built   | Home practice card navigates to `/practice`; workout page handles start/edit          |
| Session logging — smart tap (instant or first-time entry) | Built   | Instant if weight known; opens sheet for first-time weight entry                      |
| Session logging — adjust completed set                    | Built   | Tap any completed tile to reopen sheet; cascades forward                              |
| Weight remembered across sessions (`itemLastUsed`)        | Built   | Pre-fills on session start                                                            |
| Per-item weight increment (2.5 / 5 / 10)                  | Built   | Configured on item form; weights round to nearest increment                           |
| Finish / abandon session                                  | Built   | Finish saves completed sets only; abandon has confirm dialog                          |
| Crash recovery                                            | Built   | Resume/discard banner on boot                                                         |
| Session complete overlay                                  | Built   | Stats + confetti                                                                      |
| Program view + week progress                              | Built   | Routine cards from the current week's templates                                       |
| Workout/routine editor                                    | Built   | Edit items, add new routines                                                          |
| Item library browser                                      | Built   | Category-filtered sheet in editor                                                     |
| Calendar + day summary                                    | Removed | v1.10.0 — [US-047](../features/v1.10.0/US-047-retire-history.md)                      |
| IndexedDB persistence                                     | Built   | Raw API wrapper, seed data                                                            |
| Preferences store                                         | Built   | Accent, density, roundness, weight unit — editable again on Personalization (v1.10.0) |
| Settings UI                                               | Built   | `/settings` hub — one row per feature since v1.10.0 (US-045)                          |
| Program selection screen                                  | Built   | Bottom sheet; built-in programs deep-clone before activating                          |
| Create new program                                        | Built   | 2-step full-screen flow — details then routine names; scaffolds all weeks             |
| Copy built-in before editing                              | Built   | Guard dialog prompts copy+switch when editing a built-in program                      |
| Custom item CRUD                                          | Built   | Create/edit/delete in the item library; built-in items are read-only                  |
| Browse all program weeks                                  | Built   | Week picker chevrons on program page                                                  |
| Weekly consistency streak                                 | Built   | Consecutive weeks where sessions ≥ daysPerWeek; shown on home                         |
| Scheduled/skipped day status                              | Removed | Went with the calendar (v1.10.0)                                                      |

---

## v1.2.0 — Daily Dashboard & Habits

| Feature                             | Status | Notes                                                                                                           |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| Home screen as overview dashboard   | Built  | Summary cards: Habits, Workout/Practice, Activity                                                               |
| Global date context                 | Built  | `loggingContext` store; date picker on home taps to any past day                                                |
| Activity log page (`/log`)          | Built  | List, add, edit, delete activities; date-filtered                                                               |
| Dedicated workout page (`/workout`) | Built  | Full session UI; back button to home                                                                            |
| Habit log page (`/habits`)          | Built  | Progress rings, stepped +/− inputs, boolean toggles, exact-value modal                                          |
| Mood tracking                       | Built  | Inline always-visible mood strip on `/habits`; separate from habit grid                                         |
| Habit progress rings                | Built  | SVG rings fill based on logged / goal                                                                           |
| Pre-seeded habits                   | Built  | Water, Coffee, Meditation, Writing, Reading, Mood ([US-031](../features/v1.7.0/US-031-default-habits-tweak.md)) |
| Habit `dailyGoal` migration         | Built  | `initDB()` patches `dailyGoal` onto pre-existing built-in habit records missing it                              |
| Program complete state              | Built  | Shown on `/workout` with CTA to choose a new program                                                            |

---

## v1.3.0 — Habit Management & Calendar History

| Feature                           | Status  | Doc reference                                                                                                                             |
| --------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Custom habit CRUD in Settings     | Built   | US-009                                                                                                                                    |
| Habit history heatmap on Calendar | Removed | US-010; calendar retired in v1.10.0 ([US-047](../features/v1.10.0/US-047-retire-history.md))                                              |
| Activity edit from calendar       | Removed | US-013; edit from `/log` instead                                                                                                          |
| Journal page                      | Removed | Shipped in v1.3 (US-012/US-014), then **removed** in commit `0af33ff`. Not on [roadmap](../roadmap/README.md) unless feedback demands it. |
| Journal speech input & auto-save  | Removed | Removed with the Journal page (US-014).                                                                                                   |

---

## v1.4.0 — Belly Dance & the Discipline Model

| Feature                                    | Status | Doc reference |
| ------------------------------------------ | ------ | ------------- |
| Discipline engine foundation               | Built  | US-015        |
| Item library (Discipline-scoped)           | Built  | US-016        |
| Belly Dance Discipline, program & routines | Built  | US-017        |
| Practice hub & navigation                  | Built  | US-018        |
| Dance session flow                         | Built  | US-019        |
| Cross-Discipline streaks & calendar        | Built  | US-020        |
| Practice groups & plans                    | Built  | US-021        |

---

## v1.5.0 — Insights Hub

| Feature                    | Status  | Doc reference                                                                                                  |
| -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Insights hub (`/insights`) | Built   | US-022                                                                                                         |
| Mood × habits chart        | Built   | US-023                                                                                                         |
| Weekly volume chart        | Built   | US-024                                                                                                         |
| Activity breakdown chart   | Built   | US-025                                                                                                         |
| Habit radar chart          | Built   | US-026                                                                                                         |
| Exercise progress chart    | Removed | US-027 — `ChartStrengthProgress` was removed in commit `9798644`; not in the code today (found during v1.10.0) |

Charts originally rendered with Chart.js; since **v1.10.0** they render with **TanStack Charts** (see below). Date-range chips shipped beyond original v1.5.0 scope.

---

## v1.6.0 — Belly Dance Catalog & Course Programs

| Feature                           | Status | Notes                                                                    |
| --------------------------------- | ------ | ------------------------------------------------------------------------ |
| Full belly dance move catalog     | Built  | 39 moves (`bellydance-moves.ts`) + 10 warm-up/cool-down bookends         |
| Six belly dance "course" programs | Built  | Beginner 101–103, Intermediate 101–103 (`bellydance-programs.ts`); DB v6 |

See [v1.6.0 feature README](../features/v1.6.0/README.md).

---

## v1.7.0 — Full Strength Catalog & PWA

| Feature                        | Status | Notes                                                                                                                                                                                     |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full gym exercise catalog      | Built  | 72 exercises (`strength-exercises.ts`); body-part categories; DB v7                                                                                                                       |
| Six strength "course" programs | Built  | `strength-programs.ts`                                                                                                                                                                    |
| Service worker / PWA           | Built  | `src/service-worker.ts`; static adapter + PWA capabilities                                                                                                                                |
| Data export / backup           | Built  | [US-028](../features/v1.7.0/US-028-data-export-backup.md) — JSON export (share sheet or download) + staged restore on `settings/data`. Device sync → [roadmap](../roadmap/device-sync.md) |
| Health metrics (weight, BP)    | Built  | [US-029](../features/v1.7.0/US-029-health-metrics.md) — `/health` + home card + Insights; DB v8                                                                                           |
| Settings hub restructure       | Built  | [US-030](../features/v1.7.0/US-030-settings-restructure.md) — hub + `/settings/habits`, `/settings/data` (Appearance sub-route later removed; prefs stay at defaults)                     |
| Default habits tweak           | Built  | [US-031](../features/v1.7.0/US-031-default-habits-tweak.md)                                                                                                                               |

---

## v1.8.0 — Granular Data Clearing

| Feature                | Status | Notes                                                                                                                                                                                                                           |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-section data clear | Built  | [US-032](../features/v1.8.0/US-032-granular-data-clearing.md) — independent Custom exercises / Custom programs / Workout sessions / Activity log / Habits / Health clears, plus a "clear everything" action, on `settings/data` |

See [v1.8.0 feature README](../features/v1.8.0/README.md).

---

## v1.9.0 — Lift Plans & Baselines

| Feature                                          | Status | Notes                                                                                                                                                                                       |
| ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goal progression plan type (Lift plans)          | Built  | [US-033](../features/v1.9.0/US-033-goal-progression-plans.md) — isolated stint per focus lift; DB v9                                                                                        |
| Settings toggle (`goalProgressionPlansEnabled`)  | Built  | Default off; hides UI, data persists — same pattern as health metrics                                                                                                                       |
| Modular implementation                           | Built  | `src/lib/goalPlans/` + `goalPlanStore`; thin hooks at workout/practice UI                                                                                                                   |
| Plan generator (goal + start → blocks)           | Built  | Wave blocks; final peak snaps to goal weight × reps; duration estimate                                                                                                                      |
| Starter scaffolds                                | Built  | Priority week / Focus only / From scratch                                                                                                                                                   |
| Focus wave (4-week block)                        | Built  | Build → build → peak → deload                                                                                                                                                               |
| Supporting weekly increment                      | Built  | Uses frozen `weightIncrement`; reps stay flat                                                                                                                                               |
| Block repeat                                     | Built  | Re-run current block from week 1 via `countOffset`                                                                                                                                          |
| Plan lifecycle (complete / pause)                | Built  | One active lift plan; sole active Strength program; backing programs hidden from generic pickers                                                                                            |
| Baselines feature flag + Settings CRUD           | Built  | [US-034](../features/v1.9.0/US-034-baselines-setup.md) — `baselines` / `baselineLogs` in DB v10                                                                                             |
| Baselines daily logging (multi-entry, edit past) | Built  | [US-035](../features/v1.9.0/US-035-baselines-logging.md) — `/baselines`, global date context                                                                                                |
| Baselines progress charts                        | Built  | [US-036](../features/v1.9.0/US-036-baselines-charts.md) — inline per baseline; reuses `RangeBar`                                                                                            |
| Practice feature flag (`practiceEnabled`)        | Built  | Default off. Hides nav tab, `/practice*`, `/workout`, `/program`, session overlays, and session marks on Insights; data persists. Lift plans nest inside it via derived `liftPlansEnabled`. |
| Habits + Activity log feature flags              | Built  | `habitsEnabled` (incl. mood) and `activityLogEnabled`, both default off. Every tracking feature is now opt-in, so Overview shows a "choose what to track" empty state on a fresh install.   |

See [v1.9.0 feature README](../features/v1.9.0/README.md) and [Roadmap — Baselines](../roadmap/baselines.md).

---

## v1.10.0 — Baselines & Insights Refresh

| Feature                               | Status  | Notes                                                                                                                                                           |
| ------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flexible baseline metrics             | Built   | [US-037](../features/v1.10.0/US-037-flexible-baseline-metrics.md) — 1 to n Duration / Distance / Count metrics, no direction; DB v11 drops v1.9.0 baseline data |
| Baseline logging & neutral comparison | Built   | [US-038](../features/v1.10.0/US-038-baseline-logging-comparison.md) — logging = done; signed difference vs baseline                                             |
| TanStack Charts                       | Built   | [US-039](../features/v1.10.0/US-039-tanstack-charts-migration.md) — every chart; `src/lib/charts/`. `chart.js` still installed until the user removes it        |
| Scrolling charts                      | Built   | [US-040](../features/v1.10.0/US-040-scrolling-charts.md) — `ScrollChart.svelte`, 48 px columns, pinned value rails                                              |
| All-habits heat chart (experimental)  | Built   | [US-041](../features/v1.10.0/US-041-all-habits-heat-chart.md) — strips + calendar grid                                                                          |
| Habit colors                          | Built   | [US-042](../features/v1.10.0/US-042-habit-colors.md) — `Habit.color` / `negativeColor`, defaults on load                                                        |
| Show / hide Insights charts           | Built   | [US-043](../features/v1.10.0/US-043-insights-chart-visibility.md) — `prefs.hiddenCharts`; `/settings/insights`                                                  |
| Experimental Insights charts          | Built   | [US-044](../features/v1.10.0/US-044-experimental-insights-charts.md) — growth + bests, showing up, week vs week, day of week, on days when, time of day         |
| Settings feature hub                  | Built   | [US-045](../features/v1.10.0/US-045-settings-feature-hub.md) — `/settings/{habits,baselines,practice,activity,health,insights}`                                 |
| Personalization                       | Built   | [US-046](../features/v1.10.0/US-046-personalization.md) — `/settings/personalization`; light mode deferred                                                      |
| Retire History (`/calendar`)          | Removed | [US-047](../features/v1.10.0/US-047-retire-history.md) — History tab gone; session Delete moved to `/workout` and `/practice/dance`                             |

Not yet verified in a browser — built and checked with type check, lint, unit tests, and a production build only.

---

## v1.11.0 — Finish the Threads, Then Sharpen Insights

| Feature                                  | Status | Doc reference                                                                                                    |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Light mode (Dark / Light / Match device) | Built  | [US-048](../features/v1.11.0/US-048-light-mode.md) — default Dark; `data-theme` on `<html>`; charts follow theme |
| Lift plan wording in the UI              | Built  | [US-049](../features/v1.11.0/US-049-lift-plan-rename.md)                                                         |
| Cheap hardening (audit Phase A)          | Built  | [US-050](../features/v1.11.0/US-050-cheap-hardening.md) — backup size cap, save-error resets, streak tests       |
| Insights improvements                    | Open   | [v1.11.0 Topics 4 – 7](../features/v1.11.0/README.md#topics-4--7--insights-open) — not decided yet               |

Checked with type check, lint, unit tests (109), a production build, and a light-mode browser pass at phone width.

---

## Built-In Content

- **12 programs:** 6 Strength + 6 Belly Dance course programs (Beginner/Intermediate 101–103 each).
- **121 items:** 72 strength exercises + 39 belly dance moves + 10 bookend (warm-up/cool-down) items, all derived from catalog seeds (`db/seeds/`).
- **8 strength categories** (body-part): Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Full Body.
- **5 built-in trackable habits** + Mood (always on): Water, Coffee, Meditation, Writing, Reading, plus Mood.
- Items and programs are **upserted on every boot**; habits seed on first run only. Schema upgrades are **non-destructive** (no wipe) — new stores/indexes are added idempotently and user data is preserved. See [Data Model](../architecture/data-model.md#indexeddb-stores).

---

## Related

- [Roadmap](../roadmap/README.md) — Deferred and future ideas
- [How It Works](behavior.md) — Full behavioral mental model
- [Glossary](../glossary.md) — Shared vocabulary
- [Data Model](../architecture/data-model.md) — Entities, stores, DB version
- [App Structure](app-structure.md) — Routes and layout
- [State Management](state.md) — Store details
- [v1.11.0 Features](../features/v1.11.0/README.md) — Light mode, Lift plan wording, hardening; Insights next
- [v1.10.0 Features](../features/v1.10.0/README.md) — Baselines & Insights refresh, Settings
- [v1.9.0 Features](../features/v1.9.0/README.md) — Lift plans + Baselines
- [v1.5.0 Features](../features/v1.5.0/README.md) — Insights hub (shipped)
- [v1.4.0 Features](../features/v1.4.0/README.md) — Discipline model (shipped)
- [July 2026 Hardening Audit](../maintenance/audit-2026-07-hardening.md) — Known deferred concerns
