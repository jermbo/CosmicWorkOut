[Wiki](../../README.md) › [Features](../README.md) › [v1.1.0](README.md) › US-004

# US-004 — Habit Tracking

> **Status: Shipped (v1.1.0 / v1.2.0)**
>
> **Shipped:**
>
> - Habit logging on `/habits` with progress rings, stepped inputs, boolean toggles, and mood strip (v1.2.0 US-008)
> - 7 built-in habits pre-seeded; daily reset via date-scoped log storage
> - Historical log data stored and queryable by date
> - Count correction UI on habit log page (v1.2.0 US-008)
>
> **Remaining — tracked in [v1.3.0](../v1.3.0/README.md):**
>
> - Settings UI for habit CRUD, reorder, and active toggle → [US-009](../v1.3.0/US-009-habit-creation.md)
> - Habit history in Calendar view and heat map → [US-010](../v1.3.0/US-010-habit-calendar-history.md)

As a **health-conscious user**, I want to track daily wellness habits alongside my workouts
so that I can monitor my overall health, not just my fitness performance.

---

## Requirements

1. Habit definitions
   a. The user shall be able to define personal habits to track each day.
   b. Each habit shall have a name, a unit label, a type, and an optional daily goal.
   c. Habit types shall be:
   - **Count** — a numeric value incremented by tapping (e.g., glasses of water, cups of coffee)
   - **Duration** — a time value in minutes (e.g., meditation, screen-free time)
   - **Boolean** — a yes/no toggle (e.g., took vitamins, no alcohol)
     d. Habit definitions shall be configurable in Settings (add, edit, reorder, delete).
     e. The user shall be able to mark a habit as active or inactive without deleting it.
     f. Deleting a habit shall preserve all previously logged data for that habit.

2. Dashboard widgets
   a. All active habits shall be displayed on the home screen dashboard as quick-log widgets.
   b. Tapping a Count widget shall increment the value by 1 for today.
   c. Tapping a Boolean widget shall toggle it between complete and incomplete.
   d. Tapping a Duration widget shall open a minimal input (numeric field or stepper) to enter minutes.
   e. All habit interactions shall update the display immediately with no loading state.
   f. The user shall be able to correct the current-day value of a Count habit (e.g., after an accidental tap) from the dashboard or detail view.

3. Goals & daily reset
   a. When a habit has a daily goal set, the widget shall display progress toward that goal.
   b. When a goal is reached or a boolean is toggled on, the widget shall display a completion state.
   c. Habit counts shall reset to zero (or false for boolean) at the start of each new day.

4. Data & history
   a. Daily habit logs shall be stored with a date and be queryable for charting.
   b. Habit history shall support a GitHub-style heat map view (intensity by day over weeks/months).
   c. The user shall be able to view habit history in the Calendar view.

---

## Acceptance Criteria

1. Habit definitions
   a. Given the user opens Settings and taps "Manage Habits", when the habit list loads, then all defined habits are shown with their name, type, and goal.
   b. Given the user taps "Add Habit" in Settings, when they enter a name, select a type, and set a goal, then the habit is saved and appears on the home dashboard.
   c. Given the user selects "Count" as the type and enters "glasses" as the unit with a goal of 8, when they view the home screen, then a widget labeled with the habit name and "0 / 8 glasses" is displayed.
   d. Given the user marks a habit as inactive in Settings, when they return to the home screen, then that habit's widget is no longer shown.
   e. Given the user has 3 habits in Settings, when they drag a habit to a new position in the list, then the reordered sequence is reflected on the home screen dashboard.
   f. Given the user deletes a habit, when confirmed, then the habit no longer appears in Settings or on the dashboard, and its historical data remains visible in the Calendar for past dates.

2. Dashboard widgets
   a. Given the user has 4 active habits configured, when they view the home screen, then all 4 habit widgets are visible.
   b. Given a Count widget shows 3, when the user taps it, then it immediately shows 4 with no delay.
   c. Given a Boolean widget is in the incomplete state, when the user taps it, then it toggles to complete and vice versa.
   d. Given the user taps a Duration widget, when a duration entry appears, then they can enter a number and confirm in 2 taps.
   e. Given any habit widget is tapped, when the value updates, then there is no spinner or loading indicator.
   f. Given a Count widget shows 5 and the user accessed the correction option, when they enter 3 and confirm, then the widget immediately shows 3 and today's log is updated.

3. Goals & daily reset
   a. Given the user's water goal is 8 glasses and they have logged 5, when they view the widget, then progress shows "5 / 8".
   b. Given the user logs their 8th glass, when the widget updates, then a visual completion state (e.g., color fill, checkmark) is displayed.
   c. Given the user logged habits yesterday, when the app is opened the next day, then all Count habits show 0 and all Boolean habits show incomplete.

4. Data & history
   a. Given the user has logged water intake for 30 days, when that data is queried for charting, then daily counts per habit are available by date.
   b. Given the user navigates to the Calendar, when they view a past day, then the habit values logged for that day are shown in the detail view.

---

## Related Docs

- [Data Model](../../architecture/data-model.md)
- [Settings & Preferences Requirements](../../requirements/settings-preferences.md)
- [US-005 — Daily Dashboard](./US-005-daily-dashboard.md)
- [History & Calendar Requirements](../../requirements/history-calendar.md)
