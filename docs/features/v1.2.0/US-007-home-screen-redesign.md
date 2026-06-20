# US-007 — Overview Screen Redesign

As a **fitness user**, I want a home screen that shows me the status of my day at a glance
so that I can immediately see what still needs to be done and tap into the right section in one go.

---

## Requirements

1. Layout
   a. The root route shall be presented as **Overview**, not **Today**, because the selected date may be any past day or today.
   b. The Overview screen shall keep the weekly date selector with per-day indicators near the top.
   c. The Overview screen shall have two distinct layers:
      - an **overview snapshot** for cross-app scanning
      - a **selected day** summary that balances focus and progress for the currently selected date
   d. Overview cards shall act as entry points to their focused pages.
   c. The layout shall be usable one-handed in portrait orientation with no horizontal scrolling.

2. Date selector
   a. The date selector shall display the currently selected date prominently at the top of the screen, but the page identity shall remain Overview.
   b. The selected date shall default to today on first load each day.
   c. The user shall be able to change the selected date to any past date or today. Future dates shall not be selectable.
   d. The selected date shall be the active date for all pages in the app (`/habits`, `/log`, etc.) — changing it here changes the context everywhere.

3. Habits card
   a. The Habits card shall display a summary of the selected day's habit completion: how many habits have been logged out of how many are active (e.g., "3 of 6 habits logged").
   b. Tapping the card shall navigate to `/habits` for the selected date.
   c. If no habits are configured, the card shall show a prompt to add habits.

4. Practice card
   a. The Overview screen shall show a single combined Practice card instead of separate practice cards.
   b. The Practice card shall summarize practice state at a high level, such as active disciplines, live session state, recent completion, or the next suggested routine.
   c. Tapping the card shall navigate to `/practice`, where the user can focus on a specific discipline.
   d. The Overview screen shall avoid listing every practice area independently when multiple practice types exist.

5. Activity card
   a. The Activity card shall show a summary of activities logged for the selected date (e.g., "2 activities logged" or "No activities yet").
   b. Tapping the card shall navigate to `/log` for the selected date.

6. Selected day summary
   a. Below the overview snapshot, the screen shall show a compact selected-day area.
   b. The selected-day area shall present both what is in focus and what has already been logged for that date.
   c. The selected-day area shall be informational first, helping the user decide which focused page to enter next.

7. Navigation
   a. The bottom navigation shall label the root destination as **Overview**.
   b. The bottom navigation shall reduce permanent top-level destinations so specialized work can be reached from Overview.

## Acceptance Criteria

1. Layout
   a. Given the user opens the app, when the home screen loads, then the page title reads Overview.
   b. Given the Overview screen loads, when the user scans the first screen, then the weekly selector, overview snapshot, and selected-day summary are visible without horizontal scrolling.
   b. Given the user taps any card, when the navigation occurs, then the correct page opens.

2. Date selector
   a. Given the app opens, when the Overview screen loads, then today's date is shown in the date selector.
   b. Given the user changes the date to June 10, when they navigate to `/habits`, then June 10's habit data is shown.
   c. Given the user attempts to select a future date, when the picker is open, then future dates are not selectable.
   d. Given the user changes the date on the home screen, when they return from a sub-page and navigate to another, then the same date is still active.

3. Habits card
   a. Given the user has 6 active habits and has logged 3, when the home screen loads, then the Habits card shows "3 of 6 habits logged".
   b. Given the user has no habits configured, when the home screen loads, then the Habits card shows a prompt to add habits.

4. Practice card
   a. Given the user has multiple practice areas active, when the Overview screen loads, then only one Practice card is shown on Overview.
   b. Given the Practice card is shown, when the user taps it, then the `/practice` page opens.
   c. Given a practice session is live or already logged, when the Overview screen loads, then the Practice card reflects that state.

5. Activity card
   a. Given the user has logged 2 activities today, when the home screen loads, then the Activity card shows "2 activities logged".
   b. Given no activities are logged, when the home screen loads, then the Log card shows "No activities yet".

6. Navigation
   a. Given the user looks at the bottom navigation, when the app is on `/`, then the active destination label is Overview.
   b. Given the user wants habits, when they are on Overview, then they can reach Habits from the Habits card even though it is no longer a permanent tab.

---

## Related Docs

- [US-008 — Habit Log Page](./US-008-habit-log-page.md)
- [US-011 — Program Completion State](./US-011-program-complete-state.md)
- [v1.1.0 US-005 — Daily Dashboard](../v1.1.0/US-005-daily-dashboard.md)
- [Implementation: App Structure](../../implementation/app-structure.md)
