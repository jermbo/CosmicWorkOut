---
name: Tracker records
description: 'The exact shape of the records behind Habits, Activity log, Health metrics, and Baselines, with the rules for each field.'
altitude: exact
tags:
  - storage
  - trackers
  - data
parent: storage.md
---

[Wiki](../README.md) / [System](system.md) / [Storage](storage.md) / Tracker records

# Tracker records

This page is the contract for the records of the four daily trackers. Each date is year-month-day, and each time is in ISO form.

## Habit and habit log

| Field       | Rule                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| `type`      | `times`, `minutes`, `count`, `boolean`, or `mood`                             |
| `unit`      | A label only, such as `cups` or `words`. It can be empty                      |
| `dailyGoal` | The target for the progress ring. None for `boolean` and `mood`               |
| `active`    | A habit that is not active hides from the daily screen. Mood is always active |
| `sortOrder` | The place of the habit in the list                                            |
| `color`     | The colour in charts. Mood also has `negativeColor` for a bad day             |

A habit log has the key `<habitId>:<date>`, the `habitId`, the `date`, and one `value`: 0 or 1 for `boolean`, −5 to +5 for `mood`, and a count for the rest.

## Activity

| Field             | Rule                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `type`            | Run, Walk, Bike, Swim, Hike, Pickleball, Tennis, Basketball, Yoga, Stretching, Cardio, or Other |
| `customType`      | The name that you type when the type is Other                                                   |
| `durationMinutes` | A whole number of minutes                                                                       |
| `intensity`       | Easy, Moderate, or Hard                                                                         |
| `date`            | The logging date                                                                                |

## Health reading

| Field        | Rule                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| `metricId`   | `weight` or `bloodPressure`. The app defines these; you cannot add one       |
| `date`       | The logging date. A weight has at most one reading for each date             |
| `recordedAt` | The time of the reading. It orders more than one blood pressure on one date  |
| `values`     | `{ value }` for weight; `{ systolic, diastolic, pulse? }` for blood pressure |

## Baseline and baseline log

A baseline has a `name`, an `active` flag, a `sortOrder`, and one or more metrics:

| Metric field | Rule                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| `id`         | Made once and never used again. Logs refer to it, so it must not change |
| `measure`    | `duration`, `distance`, or `count`. Fixed when you make the metric      |
| `baseline`   | The floor. A duration is in minutes                                     |
| `unit`       | For distance only: `mi`, `km`, `m`, or `yd`                             |
| `label`      | For count only: a word that you type, such as `reps`                    |
| `removed`    | A removed metric hides, but its logs stay                               |

A baseline log has the `baselineId`, the `date`, a `recordedAt` time, and `values`: a map from metric id to an amount. A log holds only the metrics that you filled in.

```json
{
	"baselineId": "bl_daily10",
	"date": "2026-11-03",
	"recordedAt": "2026-11-03T07:42:00.000Z",
	"values": { "m_pushups": 12, "m_walk": 20 }
}
```

## Further reading

- [Baselines](baselines.md): how a day's total and the difference come from these logs.
- [Habits](habits.md): how the screen uses type, goal, and colour.
