# US-002 — Habit History in Calendar

> **Status: Draft**

As a **health-conscious user**, I want to see my habit history in the Calendar view
so that I can understand my patterns over time and stay motivated by my streaks.

---

## Background

Carried over from v1.1.0 US-004 requirements 4b. The habit log data is already stored with dates and is queryable — it just isn't surfaced in the Calendar yet.

---

## Requirements

1. Calendar day detail
   a. When the user taps a past day on the Calendar, the day summary shall include the habit values logged for that day.
   b. If no habits were logged for a day, the habit section in the day detail shall be omitted.

2. Heat map
   a. The Calendar view shall include a GitHub-style heat map showing habit consistency — intensity of color per day based on how many habits were completed that day relative to their goals.
   b. The heat map shall be navigable across weeks or months.
   c. Each day cell in the heat map shall be tappable to view that day's habit detail.

---

## Acceptance Criteria

1. Calendar day detail
   a. Given the user logged 5 glasses of water on June 10, when they tap June 10 on the Calendar, then the day summary shows "Water · 5 / 8".
   b. Given the user logged no habits on June 12, when they tap June 12, then no habit section appears in the day summary.

2. Heat map
   a. Given the user has 30 days of habit data, when they view the heat map, then days with more habits completed appear more intensely colored.
   b. Given the user taps a day cell on the heat map, when the detail opens, then individual habit values for that day are listed.

---

## Related Docs

- [v1.1.0 US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
- [History & Calendar Requirements](../../requirements/history-calendar.md)
- [Data Model](../../architecture/data-model.md)
