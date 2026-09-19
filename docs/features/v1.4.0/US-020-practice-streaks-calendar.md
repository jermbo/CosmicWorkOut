[Wiki](../../README.md) › [Features](../README.md) › [v1.4.0](README.md) › US-020

# US-020 — Cross-Discipline Streaks & Calendar History

> **Status: Shipped — v1.4.0**
>
> Combined cross-Discipline streak on Today, per-Discipline breakdown in History, dance sessions in calendar day detail. See the [Glossary](../../glossary.md).

As an **active user**, I want my strength and dance consistency reflected in streaks and history
so that I can see overall momentum across Disciplines and drill into each one separately.

---

## Requirements

1. Combined practice streak
   a. The Today page shall display a combined practice streak counting consecutive weeks where the user logged at least one strength session or at least one dance session.
   b. Per-type streaks (requirement 2) use each program's full days-per-week threshold; the combined streak uses a lower bar so alternating between workout and dance days still builds momentum.
   c. The streak badge on Today shall replace or extend the existing week streak badge to reflect combined practice (exact label TBD during implementation — e.g. "4 week practice streak").
   d. A week with no logged strength or dance sessions shall reset the combined streak.

2. Per-type streak breakdown
   a. The History (calendar) page or a streak detail view shall show separate streak counts for strength workouts and belly dance.
   b. Each per-type streak shall use that program's days-per-week threshold (same logic as the existing strength week streak).
   c. Per-type streaks shall be informational — the primary badge on Today is the combined streak.

3. Calendar — dance sessions
   a. Dates with a logged dance session shall be visually indicated on the calendar month grid (distinct from or alongside strength session indicators).
   b. Tapping a date with a dance session shall include dance session summary in the day detail sheet.
   c. The day detail shall show routine name, duration, and items completed for the dance session.
   d. The user shall be able to navigate from day detail to edit the dance session (links to practice page edit flow from US-019).
   e. The user shall be able to delete a dance session log from day detail with confirmation.

4. Calendar — mixed days
   a. Dates with both a strength session and a dance session shall show both indicators on the calendar grid.
   b. The day detail sheet shall list both sessions with independent summaries and edit/delete actions.

5. Day actions sheet
   a. The day actions sheet (opened from calendar) shall include an action to log or edit a dance session, parallel to the existing workout action.
   b. When a dance session exists for the selected date, the action label shall reflect edit state.

6. Program progression display
   a. The dance program page shall show completed session count and current week number (same pattern as strength program page).
   b. Routine status badges (completed, current, upcoming) shall follow the same index-based logic as strength workouts.

---

## Acceptance Criteria

1. Combined practice streak
   a. Given the user logged at least one strength session in week 1 and no dance sessions, when week 1 is evaluated, then the combined streak counts week 1.
   b. Given the user logged at least one dance session in week 2 and no strength sessions, when week 2 is evaluated, then the combined streak counts week 2.
   c. Given the user logged nothing in week 3, when week 3 is evaluated, then the combined streak resets.
   d. Given the user has a 3-week combined streak, when Today loads, then the streak badge shows 3.

2. Per-type streak breakdown
   a. Given the user has 4 consecutive weeks meeting the strength threshold, when they view streak detail on History, then the strength streak shows 4 regardless of dance activity.
   b. Given the user has 2 consecutive weeks meeting the dance threshold, when they view streak detail, then the dance streak shows 2 independently.

3. Calendar — dance sessions
   a. Given a dance session was logged on June 10, when the user views June on the calendar, then June 10 shows a dance session indicator.
   b. Given the user taps June 10, when the day detail opens, then the dance routine name and duration are shown.
   c. Given the user deletes the dance session from day detail, when confirmed, then the session is removed and the calendar indicator disappears.

4. Calendar — mixed days
   a. Given both a strength and dance session were logged on June 10, when the user views June 10 on the calendar, then both session types are indicated.
   b. Given the user opens day detail for June 10, when the sheet loads, then both sessions are listed with separate edit actions.

5. Day actions sheet
   a. Given no dance session exists for the selected date, when the user opens day actions, then "Log dance session" (or equivalent) is available.
   b. Given a dance session exists, when the user opens day actions, then "Edit dance session" is shown instead.

6. Program progression display
   a. Given the user has completed 5 dance sessions, when they view the dance program page, then week 2 is shown as current (3 days/week program).
   b. Given Routine B is the suggested next routine, when they view routine cards, then Routine B is marked as current and A as completed within the cycle.

---

## Related Docs

- [v1.4.0 README](./README.md)
- [History & Calendar Requirements](../../requirements/history-calendar.md)
- [Program Progression](../../implementation/program-progression.md)
- [US-018 — Practice Hub & Navigation](./US-018-practice-hub-navigation.md)
- [US-019 — Dance Session Flow](./US-019-dance-session-flow.md)
- [v1.3.0 US-010 — Habit History in Calendar](../v1.3.0/US-010-habit-calendar-history.md)
