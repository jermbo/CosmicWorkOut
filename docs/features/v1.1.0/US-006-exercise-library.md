# US-006 — Exercise Library

> **Status: ✅ Shipped**
> Browse, search, category filter, custom exercise create/edit/delete (with in-use guard), built-in exercises read-only — all implemented.

As a **fitness user**, I want to browse, search, and manage exercises
so that I can find the right movement for any workout and add my own when the built-in list doesn't cover my needs.

---

## Requirements

1. Browsing and search
   a. The exercise library shall be accessible from the workout editor.
   b. The library shall display all exercises with their name, category, and unit type (lb, kg, band, or bodyweight).
   c. The user shall be able to search exercises by name.
   d. The user shall be able to filter exercises by category.
   e. Custom exercises shall be visually distinguishable from built-in exercises.

2. Exercise details
   a. The user shall be able to view the details of any exercise before adding it to a workout.
   b. Exercise details shall include: name, category, unit type, and default sets and reps.
   c. From the detail view, the user shall be able to add the exercise directly to the open workout.

3. Custom exercises
   a. The user shall be able to create a custom exercise with a name, unit type, and default sets and reps.
   b. Custom exercises shall appear in the exercise library alongside built-in exercises and be selectable for any workout.
   c. The user shall be able to edit the name, unit type, and defaults of a custom exercise.
   d. The user shall be able to delete a custom exercise. If the exercise is currently used in any program, deletion shall be prevented and the user informed.
   e. Built-in exercises shall not be deletable.

---

## Acceptance Criteria

1. Browsing and search
   a. Given the user taps "Browse exercise library" in the workout editor, when the library opens, then all exercises are listed with name, category, and unit type.
   b. Given the user types "squat" in the search field, when results update, then only exercises with "squat" in their name are shown.
   c. Given the user selects a category filter, when applied, then only exercises in that category are displayed and the active filter is visually indicated.
   d. Given the library contains both built-in and custom exercises, when displayed together, then custom exercises show a "Custom" badge or equivalent indicator.

2. Exercise details
   a. Given the user taps an exercise in the library, when the detail view opens, then name, category, unit type, and default sets and reps are shown.
   b. Given the user is viewing an exercise detail from inside the workout editor, when they tap "Add to Workout", then the exercise is added and the library closes.

3. Custom exercises
   a. Given the user taps "New Exercise" in the library, when they enter a name, select a unit type, and set default sets and reps, then the exercise is saved and immediately appears in the library.
   b. Given the user selects a custom exercise, when they choose Edit, then name, unit type, and defaults are editable and changes persist on save.
   c. Given a custom exercise is not used in any program, when the user deletes it, then it is removed from the library.
   d. Given a custom exercise is currently used in one or more programs, when the user attempts to delete it, then a message explains it is in use and deletion is blocked until it is removed from all programs.
   e. Given the user views a built-in exercise, when they view its options, then no delete action is available.

---

## Related Docs

- [Data Model](../../architecture/data-model.md)
- [Program Management Requirements](../../requirements/program-management.md)
- [US-002 — Custom Program Creation](./US-002-custom-program.md)
