[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-047

# US-047 — Retire History

> **As built:** The **History** tab and `/calendar` route are gone. Removed with it: `DaySummarySheet`, `DayActionsSheet`, `DayActionItem`, `DayActionsActivityList`, `DayActionsWorkoutSummary`, `HabitHistorySheet`, and the calendar-only helpers in `date.ts`, `habits.ts`, `habitStore` and `healthStore`. The session-complete screen lost its "See it in calendar" button. **Delete** (with a confirm) moved onto the logged-session card on `/workout` and `/practice/dance`, next to **Edit**. No data changes — nothing in IndexedDB is touched.
>
> Decisions: [v1.10.0 — Topic 7](./README.md#topic-7--is-history-still-needed).

As a **user**, I want one place to look back at my data
so that I'm not choosing between two screens that show the same thing.

---

## Why

After v1.10.0's Insights refresh, the History calendar no longer did anything that wasn't done better somewhere else:

| History did…                            | Now covered by                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Show consistency / gaps (habit shading) | Insights — All Habits heat chart, Showing Up                                 |
| Mood per day                            | Insights — Mood vs Habits                                                    |
| Month stats (workouts, lb lifted, …)    | Insights — Weekly Volume, Activity Mix                                       |
| Open a past day to log or edit          | The date picker in each tracker's page header, and the home week strip       |
| Edit a past session                     | `/workout` and `/practice/dance` already showed **Edit** for the chosen date |
| Delete a past session                   | **Was History-only** — moved to `/workout` and `/practice/dance`             |

The user doesn't use the page and it wasn't adding value. Delete was the only thing that would have been lost, so it moved rather than going away.

---

## Requirements

1. Navigation
   a. The bottom nav shall not show a History tab.
   b. `/calendar` shall no longer exist.
   c. The session-complete screen shall not link to the calendar.
2. Deleting a session
   a. When a session is logged for the chosen date, `/workout` and `/practice/dance` shall show **Delete** next to **Edit**.
   b. Delete shall ask for confirmation ("This cannot be undone.") before removing the session.
3. Data
   a. No stored data shall change. Past days stay fully editable ([no date-based edit lock](../../requirements/history-calendar.md#constraints)).

---

## Related Docs

- [History & Past Days](../../requirements/history-calendar.md)
- [How It Works — Reviewing and Fixing Past Days](../../implementation/behavior.md#reviewing-and-fixing-past-days)
- [v1.10.0 README](./README.md)
