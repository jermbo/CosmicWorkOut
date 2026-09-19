[Wiki](../../README.md) › [Features](../README.md) › [v1.1.0](README.md) › US-001

# US-001 — Program Library & Selection

> **Status: Shipped**
> All core requirements implemented. Week-by-week schedule preview in the program picker is on the [roadmap](../../roadmap/README.md#ux-polish).

As a **fitness user**, I want to browse and select from a library of curated workout programs
so that I can follow a professionally designed training plan without having to build one from scratch.

---

## Requirements

1. Program library
   a. The app shall provide a curated library of built-in programs, each with a name, description, duration in weeks, and days per week.
   b. The user shall be able to view all available programs (built-in and custom) from the Program page.
   c. The user shall be able to preview any program's full schedule — its weeks, workouts, and exercise list — before activating it.
   d. The user shall be able to select any program to make it the active program.
   e. The active program selection shall persist across app sessions (app close, device restart).
   f. Only one program may be active at a time.

2. Built-in program protection
   a. Built-in programs shall be read-only and cannot be modified directly.
   b. When a user attempts to edit a built-in program, the app shall prompt them to create a personal copy first.
   c. Creating a copy shall duplicate all weeks, workouts, and exercises into a new user-owned program.

3. Program switching
   a. The user shall be able to switch the active program at any time from the Program page.
   b. Switching programs shall not delete or affect historical session logs.
   c. When switching programs, the user's position in the new program shall be calculated from sessions logged under that program's ID.
   d. Selecting the already-active program shall have no effect and require no confirmation.

---

## Acceptance Criteria

1. Program library
   a. Given the user opens the Program page, when it loads, then all available programs are listed with name, description, week duration, and days-per-week.
   b. Given a user has both built-in and custom programs, when they open the Program page, then both appear in the same list distinguished by a "Built-in" badge.
   c. Given the user taps a program in the list, when the preview opens, then the full week-by-week schedule with workout names and exercises is shown before any selection is confirmed.
   d. Given the user selects a program, when they confirm the selection, then the Program page reflects the newly active program immediately.
   e. Given the user has selected a program, when they close and reopen the app, then the same program is still active.
   f. Given the user switches from Program A to Program B, when they view the Program page, then Program B's workouts and progress are displayed.

2. Built-in program protection
   a. Given the user is viewing a built-in program, when they tap Edit on any workout, then a confirmation dialog appears explaining that a copy will be created.
   b. Given the user confirms "Copy & Edit", when the copy is created, then the active program switches to the copy and the editor opens.
   c. Given the user cancels the copy dialog, when dismissed, then no copy is created and the built-in program remains unchanged.

3. Program switching
   a. Given the user has completed 6 sessions under Program A, when they switch to Program B and back to Program A, then Program A still shows 6 sessions of progress.
   b. Given the user switches to a program they have never used, when the program loads, then progress starts from Week 1, Workout A.
   c. Given the user taps the already-active program, when the list is shown, then no change occurs and no confirmation is required.

---

## Related Docs

- [Data Model](../../architecture/data-model.md)
- [Program Management Requirements](../../requirements/program-management.md)
- [US-002 — Custom Program Creation](./US-002-custom-program.md)
- [US-005 — Daily Dashboard](./US-005-daily-dashboard.md)
