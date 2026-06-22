# US-015 — Discipline Engine Foundation

> **Status: ❌ Planned — v1.4.0**
>
> The substrate the rest of v1.4.0 builds on. Generalizes the strength-only model into one schema-driven **Discipline** engine and re-seeds existing strength as the first Discipline — with no change to how strength feels. Implement **first**; belly dance content (US-016, US-017) layers on top. See the [Glossary](../../glossary.md) and the [Data Model — Discipline Model](../../architecture/data-model.md#discipline-model--planned-v140).

As a **fitness user**, I want my existing strength program, history, and session flow to keep working exactly as before while the app gains a flexible foundation for other movement practices,
so that adding belly dance (and future practices) never forces me to relearn or lose what I already use.

---

## Requirements

1. Discipline model
   a. The app shall represent each structured practice as a **Discipline** that declares its ordered **sections** and the logging **metric** for each section.
   b. A Discipline shall carry display identity: a stable id, a label, and optional color/icon.
   c. Disciplines shall be seeded, read-only configuration — not user-created or editable in v1.4.0.
   d. The app shall support three logging metrics: `setsReps` (sets × reps × weight), `measure` (a duration or rep count), and `check` (done / not-done).
   e. Two Disciplines shall ship: **Strength** and **Belly Dance** (belly dance content defined in US-016 and US-017).

2. Generalized entities
   a. Items, routines, programs, and sessions shall each be associated with a Discipline.
   b. The current strength entities shall be generalized — Exercise → **Item**, Workout → **Routine**, SessionLog → **Session**, and Program gains a Discipline association — with behaviour preserved (see the [naming map](../../architecture/data-model.md#naming-map-current--generalized)).
   c. A routine shall be composed of one or more ordered sections; a strength routine has a single `setsReps` section.
   d. Linear progression — next routine = `completedSessionCount % routineCount`, week = `floor(count / daysPerWeek) + 1` — shall be a Discipline-level behaviour, identical to today's strength logic.
   e. The "one session per program per day" rule shall apply per Discipline, allowing one strength and one belly dance session on the same date.

3. Concurrent programs (per-Discipline active program)
   a. The app shall track **one active program per Discipline**, so a strength program and a belly dance program can be active at the same time.
   b. Active-program tracking shall be keyed by `disciplineId` (replacing the single global active-program key), and all progression values (`todaysRoutine`, `weekStreak`, `currentWeek`, `isComplete`) shall be derived per Discipline.
   c. The app shall not bind a Discipline to specific days of the week; the user chooses what to log on any day, and the next routine is recommended by count (A → B → C), exactly as strength does today.

4. Strength preserved (no observable regression)
   a. After the engine lands, the **Strength Foundation** program, its A/B/C routines, and the 31 built-in exercises shall be available as the Strength Discipline.
   b. Starting, logging (smart-tap), finishing, abandoning, editing, and crash-recovering a strength session shall behave exactly as before.
   c. Strength history (past sessions), volume totals, the weekly consistency streak, and scheduled/skipped day inference shall be unchanged.
   d. Per-exercise last-used weight and per-exercise weight increments shall continue to pre-fill on session start.
   e. Custom exercises, custom programs, and copy-before-edit on built-ins shall continue to work, now as Items and routines of the Strength Discipline.

5. Data reset on upgrade
   a. Because the app is pre-beta with no production users, the upgrade shall **reset local data and re-seed** both Disciplines rather than migrate existing records.
   b. After reset, the app shall boot into a clean, fully seeded state with no orphaned strength records and no console errors.
   c. Settings data controls shall clear or reset data in terms of the new model and shall never leave the app in a broken or un-seeded state.

6. Generalized routine editor
   a. A single routine editor shall edit any Discipline's routine by rendering that routine's sections.
   b. For a single-section (strength) routine, the editor shall present a flat item list as it does today.
   c. The editor shall be extensible to multi-section routines with bookend inheritance and per-section item pickers (defined for belly dance in US-017) without a second editor.

---

## Acceptance Criteria

1. Discipline model
   a. Given the app boots seeded, when Disciplines load, then exactly two exist — Strength and Belly Dance — each declaring its sections and per-section metric.
   b. Given a Discipline's section declares a metric, when the engine reads it, then it resolves to one of `setsReps`, `measure`, or `check`.

2. Generalized entities
   a. Given a strength routine, when it is loaded, then it presents a single `setsReps` section containing its exercises as Items.
   b. Given a Discipline with 3 routines and 2 completed sessions, when the next routine is suggested, then it is Routine C; at 3 completed sessions it returns to Routine A.
   c. Given a strength session is already logged today, when a belly dance session is started, then it is allowed.

3. Strength preserved
   a. Given the engine has landed, when the user opens the app, then the Strength Foundation program, its A/B/C routines, and all 31 exercises are present.
   b. Given an in-progress strength session, when the app is force-closed and reopened, then the resume/discard prompt appears and resuming restores logged sets.
   c. Given prior strength sessions exist after re-seed of content, when the user views the weekly streak and history, then totals and streak behave by the same rules as before.
   d. Given a strength exercise with a known last weight, when a new session starts, then that weight pre-fills.

4. Data reset on upgrade
   a. Given a device with pre-engine local data, when the app upgrades and boots, then local data is reset and both Disciplines are re-seeded cleanly with no errors.
   b. Given the user triggers a data reset in Settings, when it completes, then the app remains usable and re-seeds to a clean state.

5. Generalized routine editor
   a. Given a strength routine, when the user opens the editor, then a flat exercise list is shown and edits save as today.
   b. Given a multi-section routine (belly dance, US-017), when the same editor opens it, then each section renders with its own item list — confirming one editor serves both.

---

## Decisions & Non-Goals (locked)

These were decided up front so the engine doesn't grow scope it doesn't need. They sharpen, not contradict, the requirements above.

- **Concurrent Disciplines, one active program each.** Strength and belly dance run side by side; active program is tracked per `disciplineId`. The user runs them on whatever days they like — strength some days, dance others — with no enforced schedule. (Requirement 6.)
- **No day-of-week scheduling.** Progression stays **count-driven**: the recommended routine is `completedSessionCount % routineCount` per Discipline (log A → B is recommended next). The app never says "Tuesday is a dance day."
- **No load periodization / progression scheme.** Weeks are not auto-progressed (no light → heavy → deload engine). Carrying weight forward is the existing per-item **last-used prefill**, which the user adjusts manually. A progression engine is explicitly deferred — see [v1.4.0 Out of Scope](./README.md#out-of-scope-for-v140).
- **Streaks unchanged in this story.** The existing weekly strength streak keeps working as-is; the cross-Discipline streak rethink is [US-020](./US-020-practice-streaks-calendar.md), not US-015.

---

## Related Docs

- [v1.4.0 README](./README.md)
- [Data Model — Discipline Model](../../architecture/data-model.md#discipline-model--planned-v140)
- [Glossary](../../glossary.md)
- [Program Progression](../../implementation/program-progression.md)
- [US-016 — Item Library (Discipline-scoped)](./US-016-practice-item-library.md)
- [US-017 — Belly Dance Discipline, Program & Routines](./US-017-belly-dance-program-routines.md)
- [US-001 — Program Library & Selection](../v1.1.0/US-001-program-library.md)
- [US-006 — Exercise Library](../v1.1.0/US-006-exercise-library.md)
