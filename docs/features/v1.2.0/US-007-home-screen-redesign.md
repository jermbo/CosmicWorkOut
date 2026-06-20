# US-007 — Home Screen Redesign

As a **fitness user**, I want a home screen that shows me the status of my day at a glance
so that I can immediately see what still needs to be done and tap into the right section in one go.

---

## Requirements

1. Layout
   a. The home screen shall display a date selector at the top followed by a vertical stack of overview cards: Habits, Workout, Log, and Journal.
   b. Each card shall act as an entry point to its respective page — tapping the card (or its CTA) navigates to that route.
   c. The layout shall be usable one-handed in portrait orientation with no horizontal scrolling.

2. Date selector
   a. The date selector shall display the currently selected date prominently at the top of the screen.
   b. The selected date shall default to today on first load each day.
   c. The user shall be able to change the selected date to any past date or today. Future dates shall not be selectable.
   d. The selected date shall be the active date for all pages in the app (`/habits`, `/log`, etc.) — changing it here changes the context everywhere.

3. Habits card
   a. The Habits card shall display a summary of today's habit completion: how many habits have been logged out of how many are active (e.g., "3 of 6 habits logged").
   b. Tapping the card shall navigate to `/habits` for the selected date.
   c. If no habits are configured, the card shall show a prompt to add habits.

4. Workout card
   a. The Workout card shall display the name and focus label of the suggested workout for the selected date.
   b. The card shall include a start button that begins the session immediately — this is the primary action and requires no intermediate confirmation.
   c. If today's workout has already been completed, the card shall show a done state with session stats and an edit option.
   d. If no program is active, the card shall show a prompt to select or create a program.
   e. If the active program is complete, the card shall show a program-complete state (see US-011).

5. Log card
   a. The Log card shall show a summary of activities logged for the selected date (e.g., "2 activities logged" or "No activities yet").
   b. Tapping the card shall navigate to `/log` for the selected date.

6. Journal card
   a. The Journal card shall be present but marked as coming soon. No logging interaction is required in this version.
   b. Full journal page is tracked in [v1.3.0 US-012](../v1.3.0/US-012-journal-page.md).

---

## Acceptance Criteria

1. Layout
   a. Given the user opens the app, when the home screen loads, then the date selector and all four cards are visible without scrolling on a standard phone screen.
   b. Given the user taps any card, when the navigation occurs, then the correct page opens.

2. Date selector
   a. Given the app opens, when the home screen loads, then today's date is shown in the date selector.
   b. Given the user changes the date to June 10, when they navigate to `/habits`, then June 10's habit data is shown.
   c. Given the user attempts to select a future date, when the picker is open, then future dates are not selectable.
   d. Given the user changes the date on the home screen, when they return from a sub-page and navigate to another, then the same date is still active.

3. Habits card
   a. Given the user has 6 active habits and has logged 3, when the home screen loads, then the Habits card shows "3 of 6 habits logged".
   b. Given the user has no habits configured, when the home screen loads, then the Habits card shows a prompt to add habits.

4. Workout card
   a. Given the user has an active program, when the home screen loads, then the card shows the suggested workout name and focus label.
   b. Given the workout card is shown, when the user taps the start button, then the session begins immediately.
   c. Given today's workout is already done, when the home screen loads, then the card shows a done state with session stats.
   d. Given no program is active, when the home screen loads, then the card shows a prompt to select or create a program.

5. Log card
   a. Given the user has logged 2 activities today, when the home screen loads, then the Log card shows "2 activities logged".
   b. Given no activities are logged, when the home screen loads, then the Log card shows "No activities yet".

6. Journal card
   a. Given the home screen loads, when the user views the Journal card, then it is visible but indicates it is not yet available.

---

## Related Docs

- [US-008 — Habit Log Page](./US-008-habit-log-page.md)
- [US-011 — Program Completion State](./US-011-program-complete-state.md)
- [v1.1.0 US-005 — Daily Dashboard](../v1.1.0/US-005-daily-dashboard.md)
- [Implementation: App Structure](../../implementation/app-structure.md)
