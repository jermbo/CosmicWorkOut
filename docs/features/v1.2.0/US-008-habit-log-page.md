[Wiki](../../README.md) › [Features](../README.md) › [v1.2.0](README.md) › US-008

# US-008 — Habit Log Page

As a **health-conscious user**, I want a dedicated page for logging my daily habits
so that I can quickly check off or record each habit for the active date and move on with my day.

---

## Requirements

1. Page context
   a. The habit log page (`/habits`) shall display habits for the date set on the home screen.
   b. The active date shall be shown clearly at the top of the page.
   c. The page shall not have its own date picker — the date is set on the home screen.

2. Habit list
   a. All active habits shall be displayed as a vertical list of log rows.
   b. Habits shall appear in the fixed order set in Settings, regardless of their completion state. The order shall not change within a session or between days.
   c. Each row shall show the habit name, its type/unit, the current logged value for the date, and its daily goal (if set).

3. Logging interactions
   a. **Count habits** — tapping the increment button shall add 1 to today's count. A correction control shall allow the user to set the count to a specific value in case of accidental taps.
   b. **Minutes habits** — tapping the row shall open a focused numeric input for entering minutes. The interaction shall complete in 2 taps.
   c. **Yes/No habits** — tapping the row shall toggle the state between incomplete and complete.
   d. **Mood habits** — tapping the row shall open a focused selector showing all 11 mood states as large, clearly-labeled radio buttons. The user selects one state and confirms. The interaction shall complete in 2 taps.
   e. All logging interactions shall update the displayed value immediately with no loading state.

4. Completion state
   a. When a habit's daily goal is met (or a Yes/No is toggled on), the row shall display a visual completion indicator.
   b. Completion styling shall be distinct from the incomplete state but shall not move or reorder the row.

5. Daily reset
   a. On a new day, all habit rows shall show their default empty state (count = 0, minutes = 0, yes/no = incomplete, mood = unset).
   b. Viewing a past date shall show the values logged on that date. Past-date values remain fully editable (backfill/correction), consistent with sessions and activities elsewhere in History — see [History & Calendar](../../requirements/history-calendar.md).

---

## Mood Selector

When logging a mood habit, the selector shall display all 11 states as tappable radio buttons in order from most positive to most negative:

| Value | Label     |
| ----- | --------- |
| +5    | Happy     |
| +4    | Excited   |
| +3    | Focus     |
| +2    | Energized |
| +1    | Content   |
| 0     | Normal    |
| -1    | Tired     |
| -2    | Agitated  |
| -3    | Sad       |
| -4    | Angry     |
| -5    | Stressed  |

Each option shall be large enough to tap comfortably with a finger. The currently selected state shall be clearly highlighted. One tap selects; a confirm tap saves.

---

## Acceptance Criteria

1. Page context
   a. Given the user sets the date to June 10 on the home screen, when they navigate to `/habits`, then June 10's habit data is shown and the date is displayed at the top.

2. Habit list
   a. Given the user has 5 active habits in a set order, when they view the habit log page, then all 5 habits appear in that order.
   b. Given the user logs their first habit, when the row updates, then no other rows change position.

3. Logging interactions
   a. Given a Count habit shows 2, when the user taps increment, then it immediately shows 3.
   b. Given a Count habit shows 5 due to an accidental tap, when the user uses the correction control and enters 4, then the habit shows 4.
   c. Given a Minutes habit, when the user taps the row and enters 20, then the habit shows "20 min" after confirming.
   d. Given a Yes/No habit is incomplete, when the user taps it, then it toggles to complete.
   e. Given a Mood habit is unset, when the user taps it, then the mood selector opens showing all 11 labeled states as large tap targets.
   f. Given the mood selector is open, when the user taps "Focus", then the habit row shows "Focus" after confirming.

4. Completion state
   a. Given a Count habit has a goal of 8 and shows 8, when the page renders, then the row shows a completion indicator.
   b. Given a habit reaches its goal, when the indicator appears, then the habit remains in its original position in the list.

5. Daily reset
   a. Given the user logged habits on June 10, when they view the habit log for June 11, then all rows show empty/default values.
   b. Given the user views June 10 two days later, when the page loads, then June 10's values are shown and the inputs remain editable (add, subtract, toggle, enter exact value).

---

## Related Docs

- [US-007 — Home Screen Redesign](./US-007-home-screen-redesign.md)
- [US-009 — Habit Creation & Management](../v1.3.0/US-009-habit-creation.md)
- [v1.1.0 US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
- [Data Model](../../architecture/data-model.md)
