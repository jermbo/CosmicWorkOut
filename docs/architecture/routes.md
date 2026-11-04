---
name: Routes
description: 'The exact list of addresses in CosmicWorkOut, what each screen does, and which feature toggle it needs.'
altitude: exact
tags:
  - navigation
  - routes
parent: navigation.md
---

[Wiki](../README.md) / [System](system.md) / [Navigation](navigation.md) / Routes

# Routes

This page is the contract for each address in the app. A screen that needs a toggle sends you to the Overview when its toggle is off, except where the table says otherwise.

## Tracker and main screens

| Address              | Screen                                                                             | Needs                  |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| `/`                  | Overview — the cards for the logging date                                          | —                      |
| `/workout`           | Plan list — the active plan on top, the others below, New plan                     | `practiceEnabled`      |
| `/workout/today`     | Today's routine — start, edit, or delete the session of the date                   | `practiceEnabled`      |
| `/workout/new`       | New plan — start from, routines, optional goal, review                             | `practiceEnabled`      |
| `/workout/plan/[id]` | One plan — weeks, routines, activate, pause, delete, and its goal                  | `practiceEnabled`      |
| `/habits`            | Habit log — tiles with progress blocks, steppers, Yes / No buttons, the mood scale | `habitsEnabled`        |
| `/log`               | Activity log — list, add, edit, delete                                             | `activityLogEnabled`   |
| `/health`            | Health — weight and blood pressure                                                 | `healthMetricsEnabled` |
| `/baselines`         | Baselines — entries and a chart for each baseline. Shows a message when off        | `baselinesEnabled`     |
| `/insights`          | Insights — the charts of every tracker that is on                                  | —                      |

## Settings screens

No Settings screen needs a toggle, because the feature pages hold the switches.

| Address                     | Screen                                                        |
| --------------------------- | ------------------------------------------------------------- |
| `/settings`                 | The hub: one row for each feature and each app area           |
| `/settings/habits`          | Habits switch; make, edit, order, colour habits; Mood colours |
| `/settings/baselines`       | Baselines switch; make and edit baselines                     |
| `/settings/workout`         | Workout switch                                                |
| `/settings/activity`        | Activity log switch                                           |
| `/settings/health`          | Health metrics switch                                         |
| `/settings/insights`        | Show or hide each chart                                       |
| `/settings/personalization` | Weight unit, density, haptics, sound, Overview card order     |
| `/settings/overview`        | Overview card order. Kept for old links                       |
| `/settings/data`            | Export, restore, QR backup, clear rows, debug data            |
| `/settings/data/send`       | Send a backup by QR                                           |
| `/settings/data/receive`    | Receive a backup by QR                                        |

## Rules for routes

- The app renders on the client only. The build makes one HTML page that serves every address.
- An address that is not in these tables shows the default error page of SvelteKit. There are no redirects for old addresses.
- Each screen reads the [logging date](logging-date.md). Two addresses take a query value. `/?date=2026-11-01` sets the logging date, but only to today or a past day. `/workout/today?program=<id>` shows a plan that is not the active one.

## Further reading

- [Feature toggles](feature-toggles.md): how a screen watches its toggle.
- [Settings](settings.md): what the Settings pages do.
