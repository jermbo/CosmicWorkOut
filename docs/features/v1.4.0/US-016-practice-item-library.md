# US-016 — Item Library (Discipline-scoped)

> **Status: Shipped — v1.4.0**
>
> Builds on the Discipline engine (US-015): the library of **Items** (the generalized Exercise). Belly dance items ship as the first non-strength instance; strength exercises are Items of the Strength Discipline. See the [Glossary](../../glossary.md).

As an **active user**, I want to browse and manage a library of items tagged by section and focus, scoped to each Discipline,
so that I can build dance routines from a useful starter catalog and add my own moves as my repertoire grows.

---

## Requirements

1. Item model
   a. The app shall store items as the atomic unit of any routine.
   b. Each item shall have a name and optional description or cue text shown during a session.
   c. Each item shall have a **section/type** tag drawn from its Discipline's sections (for belly dance: warm-up, conditioning, move, cool-down).
   d. Each item shall have one or more **focus** tags (e.g. hips, core, arms, full-body).
   e. Each item shall belong to a **Discipline**; belly dance is the first Discipline beyond strength, whose existing exercises become Items.
   f. Each item shall be marked as built-in or custom.

2. Built-in catalog
   a. The app shall ship a seeded belly dance item catalog covering all four type tags.
   b. Built-in items shall be upserted on app boot (same pattern as exercises).
   c. Built-in items shall not be editable or deletable.

3. Browsing and filtering
   a. The user shall be able to browse the item library from the routine editor (US-017).
   b. The library shall display item name, type, and focus tags.
   c. The user shall be able to search items by name.
   d. The user shall be able to filter items by type and by focus.
   e. When adding items to a routine section, the picker shall default to filtering by that section's type.
   f. Custom items shall be visually distinguishable from built-in items.

4. Custom items
   a. The user shall be able to create a custom item with a name, type, focus tag(s), and optional cue text.
   b. Custom items shall appear in the library alongside built-in items and be selectable for any routine.
   c. The user shall be able to edit the name, type, focus tags, and cue text of a custom item.
   d. The user shall be able to delete a custom item. If the item is used in any routine, deletion shall be prevented and the user informed.
   e. Built-in items shall not be deletable.

5. Logging metric
   a. Each item shall resolve to a logging **metric** (see [Glossary](../../glossary.md)): `check` (done/not-done), `measure` (duration or reps), or `setsReps` (strength).
   b. The item's section/type shall determine its default metric: warm-up and cool-down → `check`; conditioning and move → `measure`. (Strength exercises → `setsReps`.)

---

## Acceptance Criteria

1. Item model
   a. Given the app loads for the first time, when practice seed data runs, then belly dance items exist for all four type tags with focus tags assigned.
   b. Given a item exists, when viewed in the library, then its name, type, focus tags, and built-in/custom status are shown.

2. Built-in catalog
   a. Given the app boots on a subsequent launch, when seed upsert runs, then built-in items remain available and user custom items are not overwritten.

3. Browsing and filtering
   a. Given the user opens the item library from a routine's move section, when the picker loads, then items are filtered to type "move" by default.
   b. Given the user searches for "shimmy", when results update, then only items whose name contains "shimmy" are shown.
   c. Given the user applies a focus filter of "hips", when applied, then only items tagged with hips are displayed.
   d. Given the library contains both built-in and custom items, when displayed together, then custom items show a distinguishable indicator.

4. Custom items
   a. Given the user creates a custom item with name, type, and focus tags, when saved, then it immediately appears in the library and is available in routine editors.
   b. Given the user edits a custom item's name or tags, when saved, then changes persist and appear in the library on return.
   c. Given a custom item is not used in any routine, when the user deletes it, then it is removed from the library.
   d. Given a custom item is used in one or more routines, when the user attempts to delete it, then deletion is blocked with a message explaining it is in use.

5. Logging mode hint
   a. Given a warm-up item is added to a routine, when the session flow renders that item (US-019), then it appears as a checkbox step.
   b. Given a move item is added to a routine, when the session flow renders that item, then it supports duration or reps entry.

---

## Related Docs

- [v1.4.0 README](./README.md)
- [Data Model](../../architecture/data-model.md)
- [US-015 — Discipline Engine Foundation](./US-015-discipline-engine-foundation.md)
- [US-006 — Exercise Library](../v1.1.0/US-006-exercise-library.md)
- [US-017 — Belly Dance Discipline, Program & Routines](./US-017-belly-dance-program-routines.md)
