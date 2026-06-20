# v1.4.0 — Belly Dance & the Discipline Model

This version adds **belly dance** — and, to do it without bolting on a parallel engine, generalizes the strength model into a single, schema-driven **Discipline** engine. Strength and belly dance become two Disciplines on the same machinery. Cardio and sports stay on the lightweight Activity path.

See the [Glossary](../../glossary.md) for the vocabulary (Discipline, Routine, Item, Section, Metric) used throughout.

## Design North Star

> "Same engine, different movement."

A belly dance session should feel as familiar as a strength session — rotating routines, linear progression, Today as the hub — because it runs on the _same engine_. What differs is **data**: belly dance declares its own sections (warm-up · conditioning · moves · cool-down) and how each is logged, while the engine stays generic.

---

## Key Decisions

- **One Discipline engine, not two.** Instead of a belly-dance-shaped "Practice" model living beside the strength "Workout" model, both are **Disciplines**. A Discipline declares its sections, the logging **metric** per section, its seed content, and its labels. Adding a future structured practice = new Discipline config + seed, not a new model.
- **Strength folds in now.** The existing strength code (Workout / SessionLog / Exercise) migrates onto the Discipline engine this version. No two-engine interim.
- **Wipe and re-seed — no data migration.** The app has no users yet (pre-beta), so we reset IndexedDB and re-seed both Disciplines rather than writing a migration. Clean end state, cheap.
- **Cardio/sports do _not_ become Disciplines.** Running, biking, pickleball, swimming stay on the **Activity** quick-log path. The litmus test (see Glossary): _guided routine → Discipline; just record it → Activity type._
- **Rotating routines A / B / C** — unchanged linear progression: `completedSessionCount % routineCount`, now a Discipline-level behavior.
- **Hybrid item library** — built-in seed items plus user-created custom items, scoped per Discipline. Strength exercises and belly dance moves are both **Items**.
- **Item tags** — each Item has a **section/type** (warm-up, conditioning, move, cool-down) and **focus** tags (hips, core, arms…).
- **Shared bookends** — Routine A defines warm-up and cool-down; Routines B and C inherit until overridden (template inheritance, generalized to any Discipline).
- **Session logging by metric** — `check` for warm-up/cool-down; `measure` (duration or reps) for conditioning/moves; `setsReps` for strength. No upfront targets on dance routine items.
- **Streaks** — combined cross-Discipline streak on Today plus a per-Discipline breakdown in History.
- **Same-day rules** — one session per program per day; a strength session and a dance session may both be logged on the same date.

---

## Architecture Impact

This version is the first that touches the **shared engine**, not just one feature surface. The model generalizes as follows (full entity list in [Data Model](../../architecture/data-model.md)):

| Today (strength-only) | Generalized    | Note                                  |
| --------------------- | -------------- | ------------------------------------- |
| Exercise              | **Item**       | scoped to a Discipline                |
| Workout               | **Routine**    | a single training/practice day        |
| Program               | **Program**    | now belongs to a Discipline           |
| SessionLog            | **Session**    | one concept across Disciplines        |
| —                     | **Discipline** | new — sections, metrics, seed, labels |

US-015 introduces the Discipline engine and these generalized entities (and re-seeds strength onto them with no observable change); US-016 and US-017 then add the belly-dance Items, program, and routines on top.

---

## User Stories

Implement in order — each story builds on the previous.

| ID                                                    | Title                                       | Status     | Depends on |
| ----------------------------------------------------- | ------------------------------------------- | ---------- | ---------- |
| [US-015](./US-015-discipline-engine-foundation.md)    | Discipline Engine Foundation                | ❌ Planned | —          |
| [US-016](./US-016-practice-item-library.md)           | Item Library (Discipline-scoped)            | ❌ Planned | US-015     |
| [US-017](./US-017-belly-dance-program-routines.md)    | Belly Dance Discipline, Program & Routines  | ❌ Planned | US-016     |
| [US-018](./US-018-practice-hub-navigation.md)         | Practice Hub & Navigation                   | ❌ Planned | US-017     |
| [US-019](./US-019-dance-session-flow.md)              | Dance Session Flow                          | ❌ Planned | US-018     |
| [US-020](./US-020-practice-streaks-calendar.md)       | Cross-Discipline Streaks & Calendar History | ❌ Planned | US-019     |

---

## What's Already Built (from prior versions)

The Discipline engine generalizes patterns and infrastructure proven on strength.

| Area                    | Shipped in    | What exists today                                                 |
| ----------------------- | ------------- | ----------------------------------------------------------------- |
| Program model           | v1.1.0        | Multi-week programs, routines A/B/C, linear session progression   |
| Session flow            | v1.1.0        | Start, finish, abandon, edit, crash recovery, session overlay     |
| Item (Exercise) library | v1.1.0        | Built-in seed + custom CRUD, category filter, in-use delete guard |
| Today hub               | v1.2.0        | Summary cards, global date context, week streak badge             |
| Calendar history        | v1.1.0–v1.3.0 | Sessions, activities, habits in day detail                        |

---

## Built-In Content (v1.4.0 target)

- **Strength Discipline** — existing Strength Foundation program, re-seeded as a Discipline.
- **Belly Dance Discipline** — 1 program: Belly Dance Foundations (12 weeks, 3 days/week, routines A/B/C).
- **Belly dance item catalog** — starter warm-ups, conditioning exercises, dance moves, and cool-downs with section/type + focus tags.
- Items seeded from each Discipline's seed data; custom items stored alongside built-ins.

Exact catalog contents are defined during US-016 implementation.

---

## Out of Scope for v1.4.0

| Item                                      | Notes                                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Per-item session notes                    | Deferred — log during session without a notes field in MVP                             |
| Additional Disciplines                    | Beyond strength + belly dance — engine supports them; only these two ship              |
| Cardio/sports as Disciplines              | Stay on the Activity quick-log path — not in scope to restructure                      |
| Activity distance / pace fields           | Deferred — enriching ActivityLog (e.g. distance for bike/run) is the likely _next_ version; confirms cardio stays on the Activity path, not a Discipline |
| Prescribed targets on dance routine items | Routines are ordered lists; values entered during the session                          |
| Separate Dance nav tab                    | Today + Practice destination covers alternating-day usage                              |
| Data migration                            | Pre-beta — wipe and re-seed instead of migrating shipped records                       |
| Service worker / PWA                      | Infrastructure — tracked in [Offline Strategy](../../architecture/offline-strategy.md) |

---

## Story Writing Standards

All stories follow the format defined in [user-story-standards.md](../../standards/user-story-standards.md).
