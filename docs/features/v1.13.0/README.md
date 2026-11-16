[Wiki](../../README.md) › [Features](../README.md) › v1.13.0

# v1.13.0 — Insights Cleanup, Custom Activity Types, Mascot

> **Status:** Built — waiting on hands-on testing. All ten stories (US-059 to US-068) are checked with the type check, unit tests, lint and the docs check, and clicked through in the browser at phone and desktop width with the debug data.

v1.10.0 made Insights a testing ground: many charts, each one hideable. Use has shown which ones earn their place. This release keeps those and drops the rest. It also turns the three health cards into one card that a nurse can read at a glance.

Design and reasons: [Insights Cleanup](../../initiatives/insights-cleanup/README.md).

---

## What's Shipping

| Story                                      | Title                    | Status |
| ------------------------------------------ | ------------------------ | ------ |
| [US-059](./US-059-trim-insights-charts.md) | Keep Six Insights Charts | Built  |
| [US-060](./US-060-health-card.md)          | One Health Card          | Built  |

---

## Key Decisions

| Decision                  | Detail                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Six charts stay**       | Mood vs Habits, All Habits, This Week vs Last Week, Weekly Volume, Activity Mix, Health Summary. Eight others are **Removed**.            |
| **Trial charts graduate** | All Habits and This Week vs Last Week lose the "Experimental" label.                                                                      |
| **One Health card**       | Weight Trend and Blood Pressure merge into Health Summary.                                                                                |
| **Clinician view first**  | Blood pressure shows each reading as a bar over the American Heart Association zones. The line view of daily averages stays as **Trend**. |
| **Labels, not advice**    | The zones are labels from a public chart. No alerts and no advice.                                                                        |
| **No data change**        | Nothing new is stored, and no migration is needed. The ids of removed charts in `hiddenCharts` are ignored.                               |

---

## Architecture pages to change

Per the [user story standards](../../standards/user-story-standards.md#the-page-comes-first), these change before the code, in this branch:

- [Insights](../../architecture/insights.md): the chart table, the Experimental list, the example
- [Health metrics](../../architecture/health-metrics.md): "Where readings show"
- [What each toggle hides](../../architecture/toggle-surfaces.md): the Insights charts row
- [Settings object](../../architecture/settings-object.md): the `hiddenCharts` example uses `day-of-week`, which goes away
- [Local storage keys](../../architecture/local-storage-keys.md): the key that remembers the Health view, if it is not in the settings object

---

## Custom Activity Types

Each user builds their own list of activity types, and each type gets its own slice in Activity Mix. Scope: [spec](../../initiatives/custom-activity-types/spec.md). Reasons: [decision log](../../initiatives/custom-activity-types/decision-log.md).

| Story                                       | Title                                  | Persona     | Depends on | Status |
| ------------------------------------------- | -------------------------------------- | ----------- | ---------- | ------ |
| [US-061](./US-061-own-activity-types.md)    | Your Own Activity Type List            | Active user | —          | Built  |
| [US-062](./US-062-activity-types-backup.md) | Activity Types in Backups and Clearing | Active user | US-061     | Built  |
| [US-063](./US-063-manage-activity-types.md) | Hide, Show, and Rename Activity Types  | Active user | US-061     | Built  |

## Mascot, Phase 1

A pixel star that is the face of the app, a streak badge for each tracker, and drawn-frame celebrations. Scope: [spec](../../initiatives/mascot/spec.md). Reasons: [decision log](../../initiatives/mascot/decision-log.md).

| Story                                    | Title                         | Persona            | Depends on     | Status |
| ---------------------------------------- | ----------------------------- | ------------------ | -------------- | ------ |
| [US-064](./US-064-meet-the-star.md)      | Meet the Star                 | Growth-minded user | —              | Built  |
| [US-065](./US-065-streak-per-tracker.md) | A Streak for Each Tracker     | Growth-minded user | —              | Built  |
| [US-066](./US-066-star-talks-streak.md)  | The Star Talks About a Streak | Growth-minded user | US-064, US-065 | Built  |
| [US-067](./US-067-daily-welcome.md)      | The Daily Welcome             | Growth-minded user | US-066         | Built  |
| [US-068](./US-068-star-celebrates.md)    | The Star Celebrates           | Fitness user       | US-064, US-067 | Built  |

## Steps of the work

The stories of one step can be built at the same time.

1. US-061, US-064, US-065
2. US-062, US-063, US-066
3. US-067
4. US-068

Each story changes its architecture pages before its code, per the [user story standards](../../standards/user-story-standards.md#the-page-comes-first). US-064 writes the new Mascot page.
