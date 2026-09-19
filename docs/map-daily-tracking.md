[Wiki](README.md) › Map — Daily Tracking

# Map — Daily Tracking

> The trackers that sit beside structured practice: Habits, Activities, Health metrics and
> Baselines. Each is opt-in, each writes one row per day-ish, and none of them is a Discipline.

This is a **map of content**, not a spec. It cuts across altitudes so you can enter anywhere.

**Adjacent maps:** [Movement & Training](map-movement-and-training.md) · [History & Insights](map-history-and-insights.md) · [Interface & Navigation](map-interface-and-navigation.md)

---

## Start here

| If you want to…                          | Read                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| Know which tracker a new idea belongs in | [Glossary — the litmus test](glossary.md#the-litmus-test)      |
| See how the four differ                  | The table below                                                |
| Understand the opt-in contract           | [Settings & Preferences](requirements/settings-preferences.md) |

### The four trackers

| Tracker                                    | Answers                     | Shape                                  | Flag                   |
| ------------------------------------------ | --------------------------- | -------------------------------------- | ---------------------- |
| [Habit](glossary.md#habit)                 | "Did I do it today?"        | One row per (habit, date), upserted    | `habitsEnabled`        |
| [Activity](glossary.md#activity)           | "What else did I move for?" | One row per logged activity            | `activityLogEnabled`   |
| [Health metric](glossary.md#health-metric) | "What does my body read?"   | Weight once per date; BP many per date | `healthMetricsEnabled` |
| [Baseline](glossary.md#baseline)           | "Did I clear my floor?"     | Many entries per day; the day sums     | `baselinesEnabled`     |

---

## Vocabulary

[Habit](glossary.md#habit) · [Habit log](glossary.md#habit-log) · [Activity](glossary.md#activity) ·
[Activity type](glossary.md#activity-type) · [Health metric](glossary.md#health-metric) ·
[Health reading](glossary.md#health-reading) · [Baseline](glossary.md#baseline) ·
[Baseline log](glossary.md#baseline-log)

---

## 30k — Why

- [North Star](vision/north-star.md) — logging the rest of your day, without the noise
- [Design Principles](vision/principles.md) — why every tracker is opt-in

## 15k — Shape and connections

- [Data Model](architecture/data-model.md) — `habits`, `habitLogs`, `activities`, `healthReadings`, `baselines`, `baselineLogs`
- [State Management](implementation/state.md) — `habitStore`, `activityStore`, `healthStore`, `baselineStore`

## 5k — Detail

- [Settings & Preferences](requirements/settings-preferences.md) — the feature flags and their contract
- [History & Calendar](requirements/history-calendar.md) — how a tracked day is read back

## Ground — Stories by release

| Release                             | What it added                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [v1.1.0](features/v1.1.0/README.md) | [Activity logging](features/v1.1.0/US-003-activity-logging.md) · [Habit tracking](features/v1.1.0/US-004-habit-tracking.md)                                                                      |
| [v1.2.0](features/v1.2.0/README.md) | [Habit log page](features/v1.2.0/US-008-habit-log-page.md)                                                                                                                                       |
| [v1.3.0](features/v1.3.0/README.md) | [Habit creation & management](features/v1.3.0/US-009-habit-creation.md) · [Activity edit from calendar](features/v1.3.0/US-013-activity-calendar-edit.md)                                        |
| [v1.7.0](features/v1.7.0/README.md) | [Health metrics](features/v1.7.0/US-029-health-metrics.md) · [Default habits & mood scale](features/v1.7.0/US-031-default-habits-tweak.md)                                                       |
| [v1.9.0](features/v1.9.0/README.md) | [Baselines setup](features/v1.9.0/US-034-baselines-setup.md) · [Baselines logging](features/v1.9.0/US-035-baselines-logging.md) · [Baselines charts](features/v1.9.0/US-036-baselines-charts.md) |

## Where in the code

- [App Structure](implementation/app-structure.md) — `/habits`, `/log`, `/health`, `/baselines`
- [Components](implementation/components.md) — habit cards and rows, baseline rows, health sheets
- [Implementation Status](implementation/status.md) — built vs not

## Deferred

- [Roadmap — Baselines](roadmap/baselines.md) — the original pitch and what was cut from it
- [Roadmap](roadmap/README.md) — everything else deferred

---

## Related

- [Map — Movement & Training](map-movement-and-training.md) — the structured side of the app
- [Map — History & Insights](map-history-and-insights.md) — charts built on this data
- [Map — Data & Persistence](map-data-and-persistence.md) — where these rows live
- [Glossary](glossary.md) — full vocabulary
