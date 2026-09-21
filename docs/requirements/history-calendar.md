[Wiki](../README.md) › [5k — Requirements](../README.md#5k--requirements) › History & Past Days

# History & Past Days

Looking back at what you did, and fixing or backfilling past days.

**Tied to:** [Data Model](../architecture/data-model.md) | [App Structure](../implementation/app-structure.md)

> **The History calendar (`/calendar`) was removed in v1.10.0** — see [US-047](../features/v1.10.0/US-047-retire-history.md). Insights covers looking back; each tracker's date picker covers changing the past. The file keeps its old name so existing links still work.

---

## Implementation Status

> **See [Implementation Status](../implementation/status.md)** for the full checklist.

| Area                             | Status  | Notes                                                                                  |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| Monthly calendar + navigation    | Removed | v1.10.0 — Insights charts show gaps and streaks instead                                |
| Day summary / day actions sheets | Removed | v1.10.0 — edit on the tracker's own page                                               |
| Habit heatmap on calendar        | Removed | v1.10.0 — replaced by the All Habits heat chart on Insights                            |
| Week strip on home               | Built   | Also sets the logging date                                                             |
| Weekly consistency streak        | Built   | Per active program / discipline                                                        |
| Backfill past days               | Built   | Date picker in each tracker's page header, or a week-strip tap                         |
| Edit / delete a logged session   | Built   | **Edit** and **Delete** on the logged-session card on `/workout` and `/practice/dance` |

---

## Goal

Users can see what they've done over time, and correct or backfill any past day.

---

## Where each job lives

| Job                                   | Where                                                                |
| ------------------------------------- | -------------------------------------------------------------------- |
| See consistency and gaps              | Insights — All Habits heat chart, Showing Up, Weekly Volume          |
| See a streak                          | Home header (week streak) · Practice hub (combined streak)           |
| Log or edit habits for a past day     | `/habits` with the header date set to that day                       |
| Log, edit or delete a past session    | `/workout` or `/practice/dance` with the header date set to that day |
| Log, edit or delete a past activity   | `/log` with the header date set to that day                          |
| Log or edit health / baseline entries | `/health` or `/baselines` with the header date set to that day       |

---

## Streak Behavior

| Location         | What it shows   | How it works                                                          |
| ---------------- | --------------- | --------------------------------------------------------------------- |
| **Home header**  | Week streak     | `computeWeekStreak` — consecutive weeks with sessions ≥ `daysPerWeek` |
| **Practice hub** | Combined streak | Cross-discipline streak when multiple plans are active                |

See `programStore.weekStreakFor` and `combinedWeekStreak` in [State Management](../implementation/state.md).

---

## Constraints

- Everything works offline — all data comes from IndexedDB.
- **No date-based edit lock, anywhere.** Any past date is editable exactly like today — this applies to every trackable domain (habit logs, workout/practice sessions, activities, health readings) and to any domain added later. There is no "read-only after N days" rule, no built-in cutoff, and no per-feature exception. If a date-based restriction is ever proposed, it must be re-approved explicitly here before being implemented; it should never be added incidentally as part of an unrelated feature.

---

## Out of Scope

Volume trends and export shipped in v1.5.0 Insights and v1.7.0 backup. Other deferred ideas: [roadmap](../roadmap/README.md).

---

## Related

- [US-047 — Retire History](../features/v1.10.0/US-047-retire-history.md) — why the calendar went away
- [How It Works](../implementation/behavior.md#reviewing-and-fixing-past-days) — past-day behavior
- [Data Model — Session](../architecture/data-model.md)
- [Session Logging](session-logging.md) — How sessions are created
- [Program Management](program-management.md) — Where the schedule comes from
