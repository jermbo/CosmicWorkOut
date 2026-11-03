---
name: What each toggle hides
description: 'The exact list of settings in cwout:prefs, their defaults, and every surface that each of the five feature toggles shows or hides.'
altitude: exact
tags:
  - settings
  - toggles
parent: feature-toggles.md
---

[Wiki](../README.md) / [System](system.md) / [Feature toggles](feature-toggles.md) / What each toggle hides

# What each toggle hides

This page is the contract for the settings object and for each surface that a toggle controls. Use it to check a change to a toggle, or to test that a hidden surface is hidden.

## The settings object

Every setting is one field of the JSON object in `cwout:prefs`. A field that is missing takes its default. The docs check fails when a field in the code is not on this page.

| Field                  | Values                               | Default                                          | Where you set it     |
| ---------------------- | ------------------------------------ | ------------------------------------------------ | -------------------- |
| `habitsEnabled`        | `true`, `false`                      | `false`                                          | Settings → Habits    |
| `activityLogEnabled`   | `true`, `false`                      | `false`                                          | Settings → Activity  |
| `practiceEnabled`      | `true`, `false`                      | `false`                                          | Settings → Workout   |
| `healthMetricsEnabled` | `true`, `false`                      | `false`                                          | Settings → Health    |
| `baselinesEnabled`     | `true`, `false`                      | `false`                                          | Settings → Baselines |
| `weightUnit`           | `lb`, `kg`                           | `lb`                                             | Personalization      |
| `density`              | `compact`, `comfortable`, `spacious` | `comfortable`                                    | Personalization      |
| `hapticsEnabled`       | `true`, `false`                      | `true`                                           | Personalization      |
| `soundEnabled`         | `true`, `false`                      | `false`                                          | Personalization      |
| `homeCardOrder`        | A list of card ids                   | Habits, Workout, Activity log, Baselines, Health | Personalization      |
| `hiddenCharts`         | A list of chart ids                  | Empty                                            | Settings → Insights  |

## The surfaces of each toggle

| Surface          | Habits                                                   | Activity log            | Workout                                                         | Health metrics                               | Baselines                    |
| ---------------- | -------------------------------------------------------- | ----------------------- | --------------------------------------------------------------- | -------------------------------------------- | ---------------------------- |
| Bottom bar       | —                                                        | —                       | Workout tab                                                     | —                                            | —                            |
| Screen when off  | `/habits` goes to Overview                               | `/log` goes to Overview | every `/workout` screen goes to Overview                        | `/health` goes to Overview                   | `/baselines` shows a message |
| Overview card    | Habits                                                   | Activity log            | Workout, and the week-streak badge                              | Health                                       | Baselines                    |
| Week-strip marks | Habit dots                                               | Activity dots           | Session dots                                                    | Health dots                                  | —                            |
| Insights charts  | Mood vs Habits, All Habits, On Days When…, Habit Balance | Activity Mix            | Weekly Volume                                                   | Health Summary, Weight Trend, Blood Pressure | Baseline Growth, Time of Day |
| Clear rows       | Habits                                                   | Activity log            | Custom exercises, Custom programs, Workout sessions, Plan goals | — (Health data always shows)                 | Baselines                    |
| Overlays         | —                                                        | —                       | Session overlay, result screen, crash-recovery banner           | —                                            | —                            |

## Charts that more than one toggle shows

Showing Up and Day of Week show while Habits or Baselines is on. This Week vs Last Week shows while Habits, Baselines, or Workout is on. A chart that you hid in `hiddenCharts` stays hidden whatever the toggles are.

## Further reading

- [Insights](insights.md): what each chart shows.
- [Data clearing](data-clearing.md): what each clear row deletes.
