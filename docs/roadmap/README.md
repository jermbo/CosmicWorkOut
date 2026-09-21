[Wiki](../README.md) › Roadmap

# Roadmap

> **Current phase:** Use the app, gather feedback. Versions v1.1–v1.10 are built; new work waits on what we learn from real usage.

Ideas that were deferred, cut, or only partially built live here — not scattered as "Out of Scope" tables in shipped feature folders. When something ships, move it back to a feature story and mark it Built in [Implementation Status](../implementation/status.md).

---

## Backlog

### Data & portability

| Item                          | Notes                                                           | Spec                                                              |
| ----------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| Device-to-device sync         | QR pairing + LAN/WebRTC transfer + merge engine                 | [device-sync.md](device-sync.md)                                  |
| Include preferences in backup | Optional toggle on export — prefs in `localStorage` today       | [US-028 Phase 1](../features/v1.7.0/US-028-data-export-backup.md) |
| Merge-on-import               | File restore stays replace-only; merge belongs with device sync | [device-sync.md](device-sync.md)                                  |
| CSV export                    | Analytics-only; cannot round-trip                               | —                                                                 |
| Automatic background backup   | File System Access API or scheduled export                      | —                                                                 |

**Shipped:** per-session delete on `/workout` and `/practice/dance` ([US-047](../features/v1.10.0/US-047-retire-history.md)). JSON file export/import (replace-only restore) on Settings → Data — [US-028 Phase 1](../features/v1.7.0/US-028-data-export-backup.md). Web Share on export (Save to Files / Mail / AirDrop when `canShare({ files })`) — [device-sync.md](device-sync.md#web-share-api-shipped).

---

### Habits, baselines & tracking

| Item      | Notes                                                                                  | Spec                                                                    |
| --------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Baselines | **Shipped** v1.9.0, reshaped v1.10.0 (US-037–038). Separate from Habits and Lift plans | [baselines.md](baselines.md) · [v1.10.0](../features/v1.10.0/README.md) |

---

### UX polish

| Item                                            | Origin                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Remove `chart.js` from `package.json`           | [v1.10.0](../features/v1.10.0/US-039-tanstack-charts-migration.md) — nothing imports it; user removes it after testing TanStack Charts |
| Program week-by-week schedule preview in picker | [US-001](../features/v1.1.0/US-001-program-library.md) req 1c — picker shows name, duration, frequency only                            |
| Habit icons                                     | v1.2/v1.3 — text-first habits ship today                                                                                               |
| Per-item session notes                          | v1.4.0 deferred                                                                                                                        |
| Health metrics extended history view            | [US-029](../features/v1.7.0/US-029-health-metrics.md) — context-date view ships; dedicated history link deferred                       |

---

### Activity & insights

| Item                             | Notes                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Activity distance / pace fields  | Cardio stays on Activity path, not Discipline                                                                                        |
| Chart drill-down / interactivity | Tap bar, zoom, filter series — **being decided in [v1.11.0 Topic 5](../features/v1.11.0/README.md#topics-4--7--insights-open)**      |
| Per-discipline chart filtering   | Insights shows all sessions today — **being decided in [v1.11.0 Topic 6](../features/v1.11.0/README.md#topics-4--7--insights-open)** |
| Nutrition tracking               | Out of product identity                                                                                                              |

**Shipped:** Insights hub with date-range chips (45d, week, MTD, YTD, custom) — beyond original v1.5.0 read-only scope.

---

### Training intelligence

| Item                           | Notes                                                                                                                       | Spec                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Lift plans (goal progression)  | Wave-loading Strength plans — **shipped in v1.9.0** as “Goal progression plans”; UI name → **Lift plans**; follow-ons below | [v1.9.0](../features/v1.9.0/README.md) · [Glossary](../glossary.md#lift-plan)                      |
| Plan comparison visualizations | Compare isolated plan instances (e.g. Bench Goal 01 vs 02) — data captured in v1.9.0, UI later                              | [US-033](../features/v1.9.0/US-033-goal-progression-plans.md)                                      |
| Plan-switching handoff         | UX when starting a new lift plan while another exists                                                                       | [US-033 deferred](../features/v1.9.0/US-033-goal-progression-plans.md#deferred--out-of-scope-v190) |
| Pro-authored goal templates    | Scaffold choices in v1.9.0; professional templates later                                                                    | [v1.9.0](../features/v1.9.0/README.md)                                                             |
| Additional Disciplines         | Engine supports more; only strength + belly dance ship                                                                      | —                                                                                                  |
| Day-of-week scheduling         | Progression stays count-driven (`completedSessionCount % routineCount`)                                                     | —                                                                                                  |

**Course programs (unchanged):** Strength Foundation etc. still use last-used prefill + manual adjustment — no auto periodization unless the user runs a lift plan.

---

### Exercise catalog depth

Discussed July 2026: enriching the catalog with muscle diagrams, video links, and a per-body-type view. [MuscleWiki](https://musclewiki.com/) and [Muscle & Strength](https://www.muscleandstrength.com/workout-routines) are useful references for _coverage_ — which exercises and program shapes are worth having. Their diagrams and written content are copyrighted and are not to be reproduced; any diagram here is drawn in-house.

| Item                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Structured muscle data        | `Item.muscles` is a display string today (`'Chest · Triceps · Anterior delts'`). Splitting to `primaryMuscles[]` / `secondaryMuscles[]` is the prerequisite for diagrams and muscle-based filtering                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Muscle diagram                | If built: one shared front/back body SVG with muscle regions as targetable IDs, tinted from the structured data. Not per-exercise images — hundreds of assets bloat the precache and weaken the offline story                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Body-type diagram toggle      | Only ever a preference for which body SVG renders. The exercise list does not vary by sex — do not encode that                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| More built-in programs        | Pure seed data in the existing `strength-programs.ts` shape; no maintenance tail. Cheapest item here if the catalog is ever revisited                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Exercise video links          | **Not planned** — an outbound link is the first thing in the app that fails with the network pulled (violates [Offline First](../vision/principles.md#2-offline-first-always)), and links rot silently across the long gaps between updates                                                                                                                                                                                                                                                                                                                                                                                                                              |
| SQLite (wasm) for the catalog | **Not planned** — the catalog is ~121 rows of static seed data compiled into the bundle, not mutable user data. A `.filter()` beats opening a connection; a ~1MB WASM blob plus an OPFS VFS violates [Small Surface Area](../vision/principles.md#5-small-surface-area) and [Web Tech, Web Idioms](../vision/principles.md#6-web-tech-web-idioms). It would also force hand-written schema migrations and break the JSON round-trip in `backup.ts`. IndexedDB (version **9**, upsert-on-boot) covers the mutable data at this volume. Revisit only with tens of thousands of rows, full-text search, or user-authored queries — none of which this app's identity allows |

---

### Infrastructure (if needed later)

| Item                       | Notes                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Cloud sync / user accounts | Violates client-only constraint — not planned                                        |
| Journal                    | Shipped in v1.3, **removed** in `0af33ff`; not on roadmap unless feedback demands it |

---

## How to add ideas

1. Add a row to the right section above (or a new section if it's a new theme).
2. If it needs a full spec, add a `docs/roadmap/<name>.md` and link it.
3. When work starts, create or revive a `docs/features/vX.Y.Z/` story and link back here.

---

## Related

- [Implementation Status](../implementation/status.md) — What's built today
- [North Star](../vision/north-star.md) — What we're not building
- [June 2026 Audit](../maintenance/audit-2026-06.md) — Pre–user-testing doc/code review
- [July 2026 Hardening Audit](../maintenance/audit-2026-07-hardening.md) — Perf / security / correctness concerns (mostly deferred)
