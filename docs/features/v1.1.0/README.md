# v1.1.0 — Health Habit & Activity Expansion

**Status: ✅ Shipped** — remaining habit/calendar work tracked in [v1.3.0](../v1.3.0/README.md).

This version expands CosmicWorkOut from a structured gym program tracker into a broader daily health dashboard. Users can follow curated or custom workout programs, log off-program physical activities, and track daily wellness habits — all from a single fast home screen.

## Design North Star

> "Tap tap tap, phone back in pocket."

Every interaction in this version must be completable with minimal taps and zero decision fatigue. Pre-filled defaults, quick-log widgets, and a single unified dashboard are the primary tools for achieving this.

---

## User Stories

| ID                                     | Title                       | Status                                                                         |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| [US-001](./US-001-program-library.md)  | Program Library & Selection | ✅ Shipped                                                                     |
| [US-002](./US-002-custom-program.md)   | Custom Program Creation     | ✅ Shipped                                                                     |
| [US-003](./US-003-activity-logging.md) | Activity Logging            | ✅ Shipped                                                                     |
| [US-004](./US-004-habit-tracking.md)   | Habit Tracking              | ✅ Shipped — Settings CRUD & calendar history in [v1.3.0](../v1.3.0/README.md) |
| [US-005](./US-005-daily-dashboard.md)  | Daily Dashboard             | ✅ Shipped — superseded by v1.2.0 home redesign (US-007)                       |
| [US-006](./US-006-exercise-library.md) | Exercise Library            | ✅ Shipped                                                                     |

---

## New Data Requirements (Summary)

This version introduces two new data types not present in v1.0:

**Activity Log Entry**

- date, type (predefined or custom), duration (minutes), intensity (easy/moderate/hard)

**Habit System**

- Habit definitions: id, name, unit, type (count/duration/boolean), daily goal, active flag
- Daily habit logs: date, habitId, value

See [Data Model](../../architecture/data-model.md) for the full current model.

---

## Story Writing Standards

All stories in this folder follow the format defined in [\_guide.md](../../standards/user-story-standards.md).

---

## Dependencies

- US-003 and US-004 both surface on the dashboard defined in US-005. US-005 was superseded by v1.2.0 US-007.
- US-001 and US-002 are largely independent of the habit/activity work but share the Program page UI.
- Activity calendar integration shipped in US-003. Habit calendar history is tracked in [v1.3.0 US-010](../v1.3.0/US-010-habit-calendar-history.md).
