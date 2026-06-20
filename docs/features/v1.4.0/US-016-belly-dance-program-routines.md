# US-016 — Belly Dance Program & Routines

> **Status: ❌ Planned — v1.4.0**
>
> Defines the belly dance program structure, rotating routines, bookend inheritance, and routine editor. Mirrors the strength program model.

As an **active user**, I want a belly dance program with rotating routines I can customize
so that I can follow a structured A/B/C rotation with shared warm-up and cool-down but different conditioning and move focus each session.

---

## Requirements

1. Practice program model
   a. The app shall support practice programs separate from strength programs.
   b. Each practice program shall have a name, description, duration in weeks, days per week, and a practice type (belly dance for MVP).
   c. The app shall ship one built-in belly dance program (e.g. "Belly Dance Foundations": 12 weeks, 3 days/week).
   d. Built-in practice programs shall be read-only; editing shall require creating a personal copy (same pattern as strength programs).
   e. Only one active practice program per practice type may be active at a time.

2. Rotating routines
   a. Each practice program shall define routines identified by letter (A, B, C) aligned to days per week.
   b. Each routine shall have a name and optional focus description (e.g. "Hip isolations & shimmies").
   c. The app shall suggest the next routine using linear progression: `completedPracticeSessionCount % routineCount` (same model as strength workouts).
   d. Routine position within the week cycle shall be derived from session count modulo days per week.

3. Routine sections
   a. Each routine shall be composed of four ordered sections: warm-up, conditioning, moves, cool-down.
   b. Each section shall contain an ordered list of practice items from the library (US-015).
   c. Routine items shall not store upfront targets (no prescribed duration or reps at build time).

4. Bookend inheritance
   a. Routine A shall define the canonical warm-up and cool-down item lists for the program.
   b. Routines B and C shall inherit Routine A's warm-up and cool-down by default.
   c. The user shall be able to override warm-up or cool-down on Routines B or C independently; once overridden, that routine's bookends are independent until reset to inherit.
   d. When a routine inherits bookends and Routine A's bookends change, the inheriting routine shall reflect the updated lists unless it has an override.
   e. The routine editor shall clearly indicate whether bookends are inherited or overridden.

5. Routine editor
   a. The user shall be able to view and edit routines from a practice program page (sub-route, not in main nav).
   b. The editor shall allow adding, removing, and reordering items within each section using the item library picker (US-015).
   c. The picker shall filter by section type when adding items.
   d. The user shall be able to reset overridden bookends on B or C back to inherit from Routine A.

6. Program selection
   a. The user shall be able to select an active belly dance program from a program selection sheet.
   b. Active practice program selection shall persist across app sessions.
   c. Switching practice programs shall not delete historical practice session logs.
   d. Progress in a practice program shall be calculated from sessions logged under that program's ID.

---

## Acceptance Criteria

1. Practice program model
   a. Given the app loads for the first time, when practice seed data runs, then the built-in belly dance program exists with 3 routines (A, B, C).
   b. Given the user views a built-in practice program, when they attempt to edit a routine, then a copy prompt appears before changes are allowed.

2. Rotating routines
   a. Given the user has completed 0 dance sessions, when they view the suggested routine, then Routine A is suggested.
   b. Given the user has completed 2 dance sessions, when they view the suggested routine, then Routine C is suggested (3-day rotation).
   c. Given the user has completed 3 dance sessions, when they view the suggested routine, then Routine A is suggested again.

3. Routine sections
   a. Given the user opens Routine A in the editor, when all four sections are populated, then warm-up, conditioning, moves, and cool-down each show an ordered item list.
   b. Given a routine item is added to the moves section, when saved, then it appears in order with no target duration or rep count stored.

4. Bookend inheritance
   a. Given Routine B has not overridden bookends, when Routine A's warm-up list is edited, then Routine B's effective warm-up reflects the change.
   b. Given the user overrides cool-down on Routine B, when Routine A's cool-down is edited, then Routine B's cool-down remains unchanged.
   c. Given Routine B has an overridden warm-up, when the user chooses "Reset to inherit", then Routine B's warm-up matches Routine A again.

5. Routine editor
   a. Given the user opens the moves section picker, when the library loads, then items are filtered to type "move" by default.
   b. Given the user reorders items in the conditioning section, when saved, then the new order persists on return.

6. Program selection
   a. Given the user selects the belly dance program, when they close and reopen the app, then the same program remains active.
   b. Given the user completed 4 sessions under Program A then switches to a custom copy, when they switch back to Program A, then progress still shows 4 completed sessions.

---

## Related Docs

- [v1.4.0 README](./README.md)
- [Program Progression](../../implementation/program-progression.md)
- [Program Management Requirements](../../requirements/program-management.md)
- [US-015 — Practice Item Library](./US-015-practice-item-library.md)
- [US-001 — Program Library & Selection](../v1.1.0/US-001-program-library.md)
- [US-017 — Practice Hub & Navigation](./US-017-practice-hub-navigation.md)
