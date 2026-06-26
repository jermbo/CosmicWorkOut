# US-010 — Habit History in Calendar

> **Status: ✅ Shipped — v1.3.0**
>
> Carried from v1.2.0. Habit log data is stored and queryable by date; Calendar integration has not been started.

As a **health-conscious user**, I want to see my habit history in the Calendar view
so that I can understand my patterns over time and spot trends across weeks and months.

---

## Requirements

1. Calendar day detail
   a. When the user taps a past day on the Calendar, the day summary shall include the habit values logged for that day.
   b. Each habit entry shall show the habit name and the value logged (e.g., "Water · 6 cups", "Mood · Energized", "Reading · 25 min").
   c. If no habits were logged for a day, the habit section in the day summary shall be omitted.

2. Heat map
   a. The Calendar view shall include a habit consistency heat map showing intensity by day — days with more habits completed relative to their goals appear more intensely colored.
   b. The heat map shall cover the currently viewed month.
   c. Each day cell in the heat map shall be tappable to view that day's habit detail.
   d. Mood data shall be displayed separately from the habit completion heat map — it is directional, not a completion metric.

---

## Acceptance Criteria

1. Calendar day detail
   a. Given the user logged "Water · 6 glasses" and "Mood · Focus" on June 10, when they tap June 10 on the Calendar, then the day summary shows both entries.
   b. Given the user logged no habits on June 12, when they tap June 12, then no habit section appears in the day summary.

2. Heat map
   a. Given the user completed all habits on June 8 and none on June 9, when they view the Calendar heat map for June, then June 8 appears more intensely colored than June 9.
   b. Given the user taps a day on the heat map, when the detail opens, then individual habit values for that day are listed.

---

## Related Docs

- [v1.2.0 US-008 — Habit Log Page](../v1.2.0/US-008-habit-log-page.md)
- [US-009 — Habit Creation & Management](./US-009-habit-creation.md)
- [v1.1.0 US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
- [History & Calendar Requirements](../../requirements/history-calendar.md)
- [Data Model](../../architecture/data-model.md)
