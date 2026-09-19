[Wiki](../../README.md) › [Features](../README.md) › [v1.1.0](README.md) › US-002

# US-002 — Custom Program Creation

> **Status: Shipped**
> Program creation flow, workout editing (add/remove/reorder exercises via up/down buttons), rename workouts, remove workout slots, delete programs, and copy built-in programs all implemented.

As a **fitness user**, I want to create my own workout program
so that I can follow a personalized training plan tailored to my specific goals and schedule.

---

## Requirements

1. Program creation
   a. The user shall be able to create a new program by providing a name, description, duration in weeks, and days per week.
   b. The creation flow shall generate named workout slots (A, B, C…) based on the days-per-week setting, repeated across all weeks.
   c. Each workout slot shall have an editable name and optional focus label (e.g., "Push Day", "Lower Body").
   d. A newly created program shall appear in the program library and be selectable as the active program.

2. Workout editing
   a. The user shall be able to add exercises to any workout from the exercise library.
   b. The user shall be able to set sets and reps for each exercise within a workout.
   c. The user shall be able to reorder exercises within a workout.
   d. The user shall be able to remove exercises from a workout.
   e. Changes to a workout shall propagate to all weeks in the program. Workouts are templates — there is no per-week variation in v1.1. Week-specific overrides are out of scope.

3. Program management
   a. The user shall be able to add a new workout slot to an existing program.
   b. The user shall be able to rename any workout in a custom program.
   c. The user shall be able to remove a workout slot from a custom program, provided at least one slot remains.
   d. The user shall be able to delete a custom program entirely. Deleting a program shall not remove historical session logs associated with it.
   e. Custom programs shall be saved locally and persist across app sessions.

4. Copying programs
   a. The user shall be able to copy any built-in program to use as a starting point for a custom program.
   b. A copied program shall be fully editable without affecting the original built-in program.

---

## Acceptance Criteria

1. Program creation
   a. Given the user taps "New Program" in the program switcher, when they complete the creation form, then a new program with the specified name, duration, and frequency is saved.
   b. Given the user sets duration to 8 weeks and 3 days/week, when the program is created, then it contains workout slots A, B, and C repeated across all 8 weeks.
   c. Given the user names a workout slot "Push Day", when they view the Program page, then the card displays "Push Day" as the workout name.
   d. Given a user creates a program, when creation is confirmed, then the new program appears in the library and is set as the active program.

2. Workout editing
   a. Given the user opens the workout editor, when they tap "Browse exercise library", then the full exercise list is displayed and searchable.
   b. Given the user adds an exercise, when it appears in the editor, then sets and reps default to the exercise's defaults and are editable.
   c. Given the user has 3 exercises in a workout, when they tap the up/down reorder buttons, then the exercise order updates immediately.
   d. Given the user taps remove on an exercise, when confirmed, then the exercise is removed from the workout list.
   e. Given the user edits Workout A in Week 1, when they save, then Workout A in all other weeks reflects the same changes.

3. Program management
   a. Given the user is on the Program page of a custom program, when they tap "New Workout", then a blank workout editor opens and a new slot is added to all weeks on save.
   b. Given the user renames a workout from "Workout A" to "Upper Body", when saved, then all weeks show "Upper Body" for that slot.
   c. Given a custom program has 3 workout slots, when the user removes one slot, then the program retains the other 2 and the remove option is unavailable when only 1 slot remains.
   d. Given the user deletes a custom program, when confirmed, then the program no longer appears in the library and previously logged sessions for that program remain visible in the calendar.

4. Copying programs
   a. Given the user taps "Copy & Edit" on a built-in program, when the copy is complete, then a new custom program with "(Copy)" appended to the name is created and set as active.
   b. Given the user edits a copied program, when they save changes, then the original built-in program is unmodified.

---

## Related Docs

- [Data Model](../../architecture/data-model.md)
- [Program Management Requirements](../../requirements/program-management.md)
- [Implementation: Program Progression](../../implementation/program-progression.md)
- [US-001 — Program Library & Selection](./US-001-program-library.md)
