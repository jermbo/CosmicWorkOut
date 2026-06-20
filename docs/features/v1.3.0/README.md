# v1.3.0 — Habit Management, Calendar History & Journal

This version finishes the habit and calendar work deferred from v1.2.0, adds the Journal page promised on the home screen, and closes a small activity-logging gap from v1.1.0.

## Design North Star

> "Set it up once, see it forever."

Habits should be fully personalizable in Settings. Historical data — habits, workouts, activities — should be visible in one place on the Calendar. Journal is a quick daily note, not a second app.

---

## User Stories

| ID                                                       | Title                            | Status     | Origin                          |
| -------------------------------------------------------- | -------------------------------- | ---------- | ------------------------------- |
| [US-009](./US-009-habit-creation.md)                     | Habit Creation & Management      | ✅ Built   | Carried from v1.2.0             |
| [US-010](./US-010-habit-calendar-history.md)             | Habit History in Calendar        | ✅ Built   | Carried from v1.2.0             |
| [US-012](./US-012-journal-page.md)                       | Journal Page                     | ✅ Built   | Deferred from v1.2.0 US-007     |
| [US-013](./US-013-activity-calendar-edit.md)             | Activity Edit from Calendar      | ✅ Built   | Gap from v1.1.0 US-003          |
| [US-014](./US-014-journal-speech-input.md)               | Journal Speech Input & Auto-Save | ❌ Planned | Extension of US-012             |

---

## What's Already Built (from prior versions)

These foundations exist — v1.3.0 adds the missing UI and calendar integration on top.

| Area                    | Shipped in | What exists today                                                                 |
| ----------------------- | ---------- | --------------------------------------------------------------------------------- |
| Habit logging           | v1.2.0     | `/habits` page with progress rings, stepped inputs, mood strip, 7 built-in habits |
| Habit data layer        | v1.2.0     | IndexedDB habits + daily logs, `dailyGoal` migration, store `reorder()` method    |
| Home journal placeholder| v1.2.0     | Journal card on home screen marked "Coming soon"                                  |
| Activity calendar view  | v1.1.0     | Activity indicators on calendar, day detail with delete                             |
| Workout calendar        | v1.1.0     | Session highlighting, day summary sheet, edit/delete sessions                     |

---

## Carried Over from v1.2.0

| Origin story | Requirement                         | Target story |
| ------------ | ----------------------------------- | ------------ |
| US-009       | Settings UI for habit CRUD          | US-009       |
| US-009       | Drag-to-reorder habits in Settings  | US-009       |
| US-009       | Active/inactive toggle in Settings  | US-009       |
| US-010       | Habit values in calendar day detail | US-010       |
| US-010       | Habit consistency heat map          | US-010       |
| US-007       | Journal page (card is placeholder)  | US-012       |

---

## Carried Over from v1.1.0

| Origin story | Requirement                              | Target story |
| ------------ | ---------------------------------------- | ------------ |
| US-004 req 1 | Habit definitions configurable in Settings | US-009     |
| US-004 req 4 | Habit history in Calendar view           | US-010       |
| US-004 req 4 | GitHub-style heat map                    | US-010       |
| US-003       | Edit activity from calendar day detail   | US-013       |

---

## Out of Scope for v1.3.0

| Item                | Notes                                                        |
| ------------------- | ------------------------------------------------------------ |
| Service worker / PWA | Infrastructure — tracked in [Offline Strategy](../../architecture/offline-strategy.md) |
| Habit icons         | Text-first habits remain; icons are a future expansion       |
| Volume trend graphs | v2 — see [History & Calendar](../../requirements/history-calendar.md) |

---

## Story Writing Standards

All stories follow the format defined in [user-story-standards.md](../../standards/user-story-standards.md).
