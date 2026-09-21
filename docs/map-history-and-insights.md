[Wiki](README.md) › Map — History & Insights

# Map — History & Insights

> Reading the past back: streaks and the Insights charts built on sessions, habits, activities,
> health readings and baselines. The History calendar was retired in v1.10.0 ([US-047](features/v1.10.0/US-047-retire-history.md)).

This is a **map of content**, not a spec. It cuts across altitudes so you can enter anywhere.

**Adjacent maps:** [Movement & Training](map-movement-and-training.md) · [Daily Tracking](map-daily-tracking.md) · [Interface & Navigation](map-interface-and-navigation.md)

---

## Start here

| If you want to…              | Read                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| Fix or backfill a past day   | [History & Past Days](requirements/history-calendar.md)                                   |
| Know how streaks are counted | [History & Past Days](requirements/history-calendar.md)                                   |
| Add or change a chart        | [v1.10.0](features/v1.10.0/README.md) · [Tech Stack — Charts](architecture/tech-stack.md) |

> Every chart reads data another map owns. Nothing here writes user data —
> Past days are edited on the owning tracker's page, with its header date set to that day.

---

## 15k — Shape and connections

- [Data Model](architecture/data-model.md) — the rows every chart aggregates
- [State Management](implementation/state.md) — stores the charts read from
- [System Overview](architecture/overview.md) — why aggregation happens in the client

## 5k — Detail

- [History & Past Days](requirements/history-calendar.md) — streaks, backfill, where each past-day job lives

## Ground — Stories by release

| Release                               | What it added                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [v1.3.0](features/v1.3.0/README.md)   | [Habit history in calendar](features/v1.3.0/US-010-habit-calendar-history.md) · [Activity edit from calendar](features/v1.3.0/US-013-activity-calendar-edit.md)                                                                                                                                                                                                                                                                                   |
| [v1.4.0](features/v1.4.0/README.md)   | [Cross-discipline streaks & calendar](features/v1.4.0/US-020-practice-streaks-calendar.md)                                                                                                                                                                                                                                                                                                                                                        |
| [v1.5.0](features/v1.5.0/README.md)   | [Insights hub](features/v1.5.0/US-022-insights-hub.md) · [Mood vs habits](features/v1.5.0/US-023-mood-habits-chart.md) · [Weekly volume](features/v1.5.0/US-024-weekly-volume-chart.md) · [Activity breakdown](features/v1.5.0/US-025-activity-breakdown-chart.md) · [Habit radar](features/v1.5.0/US-026-habit-radar-chart.md) · [Exercise progress](features/v1.5.0/US-027-exercise-progress-chart.md)                                          |
| [v1.9.0](features/v1.9.0/README.md)   | [Baselines progress charts](features/v1.9.0/US-036-baselines-charts.md)                                                                                                                                                                                                                                                                                                                                                                           |
| [v1.10.0](features/v1.10.0/README.md) | [TanStack Charts](features/v1.10.0/US-039-tanstack-charts-migration.md) · [Scrolling charts](features/v1.10.0/US-040-scrolling-charts.md) · [All-habits heat chart](features/v1.10.0/US-041-all-habits-heat-chart.md) · [Show / hide charts](features/v1.10.0/US-043-insights-chart-visibility.md) · [Experimental charts](features/v1.10.0/US-044-experimental-insights-charts.md) · [Retire History](features/v1.10.0/US-047-retire-history.md) |

## Where in the code

- [App Structure](implementation/app-structure.md) — `/insights`
- [Components](implementation/components.md) — `components/insights/`, week strip
- `src/lib/charts/` — TanStack chart plumbing (`ScrollChart`, `scale.ts`, `theme.ts`, `color.ts`)
- `src/lib/insights/` — chart list (`charts.ts`), pure aggregation (`logic.ts`), heat shading (`heat.ts`)
- `src/lib/chart-utils.ts` (date ranges) and `src/lib/streak.ts` — pure helpers behind the views

## Deferred

- [Roadmap](roadmap/README.md) — further analytics
- [July 2026 Hardening Audit](maintenance/audit-2026-07-hardening.md) — charts re-read whole tables; fine today, poor at scale

---

## Related

- [Map — Movement & Training](map-movement-and-training.md) — where Sessions come from
- [Map — Daily Tracking](map-daily-tracking.md) — where habit, activity, health and baseline rows come from
- [Map — Data & Persistence](map-data-and-persistence.md) — how those rows are stored and read
- [Glossary](glossary.md) — full vocabulary
