[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-051

# US-051 — Remove Belly Dance

> **Status:** Built — decided in [v1.10.0 — Topic 11](./README.md#topic-11--remove-belly-dance). Checked with type check, lint, unit tests (109), a production build, and a browser pass at phone width.
>
> **As built:** Every dance surface is gone — `/practice/dance`, `DanceSessionOverlay`, `DanceRoutineEditor`, `danceLibrary()`, the four `bellydance-*` seed files, and the `Dance` variant on `HomeCard`/`WeekStrip`. `discipline.ts` registers only Strength; `BELLYDANCE_DISCIPLINE_ID` is gone. Also removed as newly-dead code once dance was gone: `ItemFormSheet.svelte` (only the dance library path used it). No stored data was touched — old dance rows in IndexedDB, if any existed, are simply never read. Built together with [US-052](./US-052-one-workout-section.md) in one pass, since the Practice hub this story would have left behind is exactly what US-052 replaces.

As a **fitness user**, I want the app to be about the training I actually do
so that I'm not stepping around a feature nobody uses.

---

## Why

Belly Dance shipped in v1.4.0 (the Discipline model) and v1.6.0 (catalog and courses). Nobody in the current user group uses it, and it would work better as its own app than as a corner of this one. Taking it out simplifies everything after it: the Practice hub, the plan merge (US-052), records (US-053), and the discipline filter that no longer needs to exist.

---

## Key Decisions

| Topic             | Decision                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What goes**     | Everything dance: screens, session overlay, routine editor, the 39 moves, bookend items, the 6 course programs, dance cards / dots / indicators, dance copy.            |
| **What stays**    | The **Discipline model** in code. Strength stays the one registered discipline; `disciplineId` stays on every row. A future movement type can still be added as config. |
| **Existing data** | **No migration, no cleanup.** Nobody has dance data. Any leftover dance rows in IndexedDB are simply never shown.                                                       |
| **New users**     | Never see any sign dance existed.                                                                                                                                       |

---

## Requirements

1. Screens
   a. `/practice/dance`, the dance session overlay and the dance routine editor shall be removed.
   b. No screen, card, chip, dot, legend, filter or copy shall mention dance or Belly Dance.
2. Content
   a. Belly dance moves, bookend items and course programs shall no longer be seeded.
   b. No dance item, routine or program shall appear in any list, picker or library, even if an old row is still in IndexedDB.
3. Engine
   a. The Discipline registry and `disciplineId` fields shall remain, with Strength as the only registered discipline.
4. Data
   a. Nothing shall migrate or delete stored rows.

---

## Out of Scope

- Collapsing the Discipline model to strength-only code — decided against ([Topic 11](./README.md#topic-11--remove-belly-dance)).
- Restructuring Practice — that is [US-052](./US-052-one-workout-section.md).

---

## Related Docs

- [v1.4.0 — Belly Dance & the Discipline Model](../v1.4.0/README.md)
- [v1.6.0 — Belly Dance Catalog & Courses](../v1.6.0/README.md)
- [Glossary — Discipline](../../glossary.md)
