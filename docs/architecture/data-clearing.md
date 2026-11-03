---
name: Data clearing
description: 'The exact effect of each clear row in Settings → Data & backup: which stores and keys it empties, what it keeps, and when it shows.'
altitude: exact
tags:
  - data
  - clear
parent: data-and-backup.md
---

[Wiki](../README.md) / [Data and backup](data-and-backup.md) / Data clearing

# Data clearing

Each clear row deletes one kind of data and keeps the rest. This page is the contract for each row. Every row asks for confirmation, and the app reloads after it.

## The rows

| Row              | Shows while  | Deletes                                                                                 | Keeps                                                                     |
| ---------------- | ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Custom exercises | Workout      | Each item that is not built-in                                                          | Built-in items, sessions                                                  |
| Custom programs  | Workout      | Each plan that is not built-in and has no goal                                          | Templates, plans with a goal, sessions, items                             |
| Workout sessions | Workout      | `sessions`, `itemLastUsed`, the session in progress, the active plan                    | Plans, items, activities                                                  |
| Activity log     | Activity log | `activities`                                                                            | Everything else                                                           |
| Habits           | Habits       | `habits`, `habitLogs`                                                                   | Everything else. Built-in habits come back on the reload                  |
| Health data      | Always       | `healthReadings`                                                                        | Everything else                                                           |
| Plan goals       | Workout      | `goalPlans`, and the plan that each goal made; removes those plans from the active list | Sessions                                                                  |
| Baselines        | Baselines    | `baselines`, `baselineLogs`                                                             | Everything else                                                           |
| Clear everything | Always       | Every IndexedDB store, the session in progress, the active plan                         | Your settings in `cwout:prefs`. Built-in content comes back on the reload |

## Rules

- A row shows only while its tracker is on, so you cannot clear data that you cannot see. Health data is the one exception: it always shows.
- **Custom programs** skips each plan with a goal, so a goal never points to a plan that is gone. Use **Plan goals** to delete those.
- **Plan goals** also deletes the plans that the goals made. The sessions of those plans stay, as history.
- No row deletes your settings. To reset them, you change each option in Personalization.

### Example

You tested the app with debug data and want a clean start, but you want to keep your two custom exercises. You clear Workout sessions, Plan goals, Activity log, Habits, Health data, and Baselines, one at a time. Your custom exercises and templates stay, and the built-in habits come back.

## Further reading

- [IndexedDB stores](indexeddb-stores.md): what each named store holds.
- [Feature toggles](feature-toggles.md): why a toggle hides data but never deletes it.
