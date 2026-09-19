[Wiki](README.md) › Map — History & Insights

# Map — History & Insights

> Reading the past back: the calendar, day detail, streaks, and the Insights charts built on
> sessions, habits, activities, health readings and baselines.

This is a **map of content**, not a spec. It cuts across altitudes so you can enter anywhere.

**Adjacent maps:** [Movement & Training](map-movement-and-training.md) · [Daily Tracking](map-daily-tracking.md) · [Interface & Navigation](map-interface-and-navigation.md)

---

## Start here

| If you want to…                      | Read                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| Understand the calendar and day view | [History & Calendar](requirements/history-calendar.md) |
| Know how streaks are counted         | [History & Calendar](requirements/history-calendar.md) |
| Add or change a chart                | [v1.5.0 — Insights](features/v1.5.0/README.md)         |

> Every chart reads data another map owns. Nothing here writes user data —
> except editing a past day, which routes back through the owning tracker.

---

## 15k — Shape and connections

- [Data Model](architecture/data-model.md) — the rows every chart aggregates
- [State Management](implementation/state.md) — stores the charts read from
- [System Overview](architecture/overview.md) — why aggregation happens in the client

## 5k — Detail

- [History & Calendar](requirements/history-calendar.md) — calendar, day detail, streaks

## Ground — Stories by release

| Release                             | What it added                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [v1.3.0](features/v1.3.0/README.md) | [Habit history in calendar](features/v1.3.0/US-010-habit-calendar-history.md) · [Activity edit from calendar](features/v1.3.0/US-013-activity-calendar-edit.md)                                                                                                                                                                                                                                          |
| [v1.4.0](features/v1.4.0/README.md) | [Cross-discipline streaks & calendar](features/v1.4.0/US-020-practice-streaks-calendar.md)                                                                                                                                                                                                                                                                                                               |
| [v1.5.0](features/v1.5.0/README.md) | [Insights hub](features/v1.5.0/US-022-insights-hub.md) · [Mood vs habits](features/v1.5.0/US-023-mood-habits-chart.md) · [Weekly volume](features/v1.5.0/US-024-weekly-volume-chart.md) · [Activity breakdown](features/v1.5.0/US-025-activity-breakdown-chart.md) · [Habit radar](features/v1.5.0/US-026-habit-radar-chart.md) · [Exercise progress](features/v1.5.0/US-027-exercise-progress-chart.md) |
| [v1.9.0](features/v1.9.0/README.md) | [Baselines progress charts](features/v1.9.0/US-036-baselines-charts.md)                                                                                                                                                                                                                                                                                                                                  |

## Where in the code

- [App Structure](implementation/app-structure.md) — `/calendar`, `/insights`
- [Components](implementation/components.md) — `components/insights/`, week strip, day sheets
- `src/lib/chart-utils.ts` and `src/lib/streak.ts` — pure helpers behind the views

## Deferred

- [Roadmap](roadmap/README.md) — further analytics
- [July 2026 Hardening Audit](maintenance/audit-2026-07-hardening.md) — charts re-read whole tables; fine today, poor at scale

---

## Related

- [Map — Movement & Training](map-movement-and-training.md) — where Sessions come from
- [Map — Daily Tracking](map-daily-tracking.md) — where habit, activity, health and baseline rows come from
- [Map — Data & Persistence](map-data-and-persistence.md) — how those rows are stored and read
- [Glossary](glossary.md) — full vocabulary
