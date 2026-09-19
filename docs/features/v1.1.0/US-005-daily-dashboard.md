[Wiki](../../README.md) › [Features](../README.md) › [v1.1.0](README.md) › US-005

# US-005 — Daily Dashboard

> **Status: Shipped — superseded by v1.2.0**
>
> The three-section dashboard (Workout, Habits, Activity) shipped in v1.1.0. v1.2.0 [US-007](../v1.2.0/US-007-home-screen-redesign.md) replaced it with overview cards routing to dedicated pages. Program-complete state shipped in v1.2.0 [US-011](../v1.2.0/US-011-program-complete-state.md).

As a **fitness user**, I want a daily dashboard as my home screen
so that I can log my workout, habits, and activities with the fewest taps possible — then put my phone away.

---

## Requirements

1. Dashboard layout
   a. The home screen shall be organized as a daily dashboard showing today's date and all loggable items for the day.
   b. The dashboard shall have three sections: Today's Workout, Habits, and Activity Log.
   c. Section order shall prioritize the most time-sensitive action: workout first, habits second, activity log third.
   d. The dashboard shall be usable one-handed in portrait orientation.

2. Workout section
   a. The Today's Workout section shall display the current program's suggested workout as the primary card.
   b. The workout card shall show the workout name, focus label, exercise count, and total set count.
   c. Tapping the workout card shall begin the active session immediately (one tap to start).
   d. If today's workout has already been completed, the card shall show a completed state with a summary (sets, volume, duration).
   e. If no program is active, the workout section shall display a prompt to select or create one.
   f. If all workouts in the active program have been completed, the workout section shall display a program-complete state with a prompt to select or create a new program.

3. Habits section
   a. The Habits section shall display all active habit widgets in a compact row or grid. If the number of active habits exceeds the available space, the row shall scroll horizontally — the section itself shall not push content below the fold.
   b. Each widget shall show the habit name, current value, and goal (if set).
   c. Habits shall be loggable directly from the widget without opening a separate screen.
   d. The habits section shall not be shown if the user has no active habits configured.

4. Activity section
   a. The Activity section shall display a single "+ Log Activity" button.
   b. If an activity has already been logged today, it shall appear as a summary chip below the button.
   c. Multiple activities may be logged in a single day.

5. Interaction standards
   a. All primary logging actions (start workout, increment habit, log activity) shall be reachable in 2 taps or fewer from the dashboard.
   b. The dashboard shall reflect logged data in real time — no manual refresh required.
   c. Tapping any completed item shall open a read-only detail view, not re-trigger the logging flow.

---

## Acceptance Criteria

1. Dashboard layout
   a. Given the user opens the app, when the home screen loads, then today's date is shown and all three sections are visible.
   b. Given the user has no habits configured, when the home screen loads, then the Habits section is hidden and the layout adjusts gracefully.
   c. Given the user rotates their phone, when in portrait mode, then all sections are reachable without horizontal scrolling.

2. Workout section
   a. Given the user has an active program, when the home screen loads, then the suggested workout for today is displayed as the primary card.
   b. Given the workout card is displayed, when the user taps it, then the session starts immediately without an intermediate confirmation screen.
   c. Given the user has already completed today's workout, when they view the home screen, then the workout card shows a done state with session stats.
   d. Given no program is active, when the home screen loads, then a "Choose a program" prompt replaces the workout card.
   e. Given the user has completed all sessions in their active program, when the home screen loads, then a program-complete state is shown in the workout section with a prompt to select or create a new program.

3. Habits section
   a. Given the user has 3 active habits, when they view the home screen, then all 3 habit widgets are visible in the Habits section without any vertical scrolling.
   b. Given a Count habit widget shows 2, when the user taps it, then it immediately shows 3 with no navigation away from the dashboard.
   c. Given the user has no habits configured, when the home screen loads, then the Habits section is not rendered.

4. Activity section
   a. Given the user taps "+ Log Activity", when the activity sheet opens, then they can complete the entry and return to the dashboard in 4 taps.
   b. Given the user has logged a Run today, when they view the dashboard, then a summary chip "Run · 45 min · Moderate" appears in the Activity section.
   c. Given the user has logged 2 activities today, when they view the dashboard, then both appear as summary chips.

5. Interaction standards
   a. Given the user wants to start a workout, when they tap the workout card, then the session begins (1 tap).
   b. Given the user wants to log a glass of water, when they tap the water widget, then the count increments (1 tap).
   c. Given the user completed their workout, when they tap the done state card, then a read-only session summary opens — the session is not re-started.
   d. Given any data is logged (habit, activity, or workout), when the user returns to the dashboard, then the updated state is shown immediately.

---

## Related Docs

- [Data Model](../../architecture/data-model.md)
- [Implementation: App Structure](../../implementation/app-structure.md)
- [Implementation: Behavior](../../implementation/behavior.md)
- [Vision: North Star](../../vision/north-star.md)
- [Vision: Principles](../../vision/principles.md)
- [US-001 — Program Library & Selection](./US-001-program-library.md)
- [US-003 — Activity Logging](./US-003-activity-logging.md)
- [US-004 — Habit Tracking](./US-004-habit-tracking.md)
