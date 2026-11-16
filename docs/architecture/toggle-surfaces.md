---
name: What each toggle hides
description: 'Every surface that each of the five feature toggles shows or hides, and the charts that more than one toggle shows.'
altitude: exact
tags:
  - settings
  - toggles
parent: feature-toggles.md
---

[Wiki](../README.md) / [System](system.md) / [Feature toggles](feature-toggles.md) / What each toggle hides

# What each toggle hides

This page is the contract for each surface that a toggle controls. Use it to check a change to a toggle, or to test that a hidden surface is hidden. Each toggle is one field of the [settings object](settings-object.md), and each is off on a new device.

## The surfaces of each toggle

| Surface          | Habits                     | Activity log            | Workout                                                         | Health metrics               | Baselines                    |
| ---------------- | -------------------------- | ----------------------- | --------------------------------------------------------------- | ---------------------------- | ---------------------------- |
| Bottom bar       | —                          | —                       | Workout tab                                                     | —                            | —                            |
| Screen when off  | `/habits` goes to Overview | `/log` goes to Overview | every `/workout` screen goes to Overview                        | `/health` goes to Overview   | `/baselines` shows a message |
| Overview card    | Habits                     | Activity log            | Workout                                                         | Health                       | Baselines                    |
| Streak badge     | `H`                        | `A`                     | `T`                                                             | `P`                          | `B`                          |
| Week-strip marks | Habit dots                 | Activity dots           | Session dots                                                    | Health dots                  | —                            |
| Insights charts  | Mood vs Habits, All Habits | Activity Mix            | Weekly Volume                                                   | Health Summary               | —                            |
| Clear rows       | Habits                     | Activity log            | Custom exercises, Custom programs, Workout sessions, Plan goals | — (Health data always shows) | Baselines                    |
| Overlays         | —                          | —                       | Session overlay, result screen, crash-recovery banner           | —                            | —                            |

## Charts that more than one toggle shows

This Week vs Last Week shows while Habits, Baselines, or Workout is on. It is the only Insights chart for Baselines; each baseline keeps its own chart on the Baselines screen. A chart that you hid in `hiddenCharts` stays hidden whatever the toggles are.

## Further reading

- [Insights](insights.md): what each chart shows.
- [Data clearing](data-clearing.md): what each clear row deletes.
