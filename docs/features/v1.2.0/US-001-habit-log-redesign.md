# US-001 — Habit Log Section Redesign

> **Status: Draft — requirements in progress**

As a **health-conscious user**, I want a habit section on the home screen that is expressive and fast to use
so that I can log my daily habits with one tap and see my progress at a glance.

---

## Background

v1.1.0 shipped compact horizontal-scrolling habit widgets (small tap targets, icon + count label). This story redesigns that section based on a richer card-style pattern while preserving the one-tap logging speed. It also brings in two deferred capabilities from v1.1.0: habit reorder in Settings and count correction from the dashboard.

---

## Requirements

> ⚠️ Requirements are being defined — this section will be updated as discovery conversations complete.

### Carried over from US-004 v1.1.0 (deferred)

1. Habit reorder
   a. The user shall be able to reorder habits in Settings by dragging them to a new position.
   b. The reordered sequence shall be immediately reflected in the dashboard habit section.

2. Count correction
   a. The user shall be able to correct the current-day value of a Count habit from the dashboard widget (e.g., after an accidental tap).
   b. The correction flow shall complete in 2 taps or fewer.

---

## Acceptance Criteria

> ⚠️ Acceptance criteria will be added once requirements are finalized.

---

## Related Docs

- [v1.1.0 US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
- [v1.1.0 US-005 — Daily Dashboard](../v1.1.0/US-005-daily-dashboard.md)
- [Data Model](../../architecture/data-model.md)
