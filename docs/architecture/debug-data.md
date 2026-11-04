---
name: Debug data
description: 'What the debug data row in Data & backup loads, what it keeps, and what it changes, so that you can test the charts with realistic records.'
altitude: exact
tags:
  - data
  - testing
parent: data-and-backup.md
---

[Wiki](../README.md) / [Data and backup](data-and-backup.md) / Debug data

# Debug data

A chart with three days of data tells you little about a chart with a year of data. So an advanced row in Data & backup loads about six months of realistic test data. This page is the contract for what that row does.

## What it loads

| Data            | What you get                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| Sessions        | Workout sessions on most training days of the last 180 days                  |
| Activities      | Activities on other days, some days with two                                 |
| Habit logs      | Values for the five built-in habits and Mood, across the 180 days            |
| Health readings | A weight that trends down from about 165 to 155, and blood-pressure readings |
| Baselines       | "Daily 10" and "Bike ride", each with its metrics and daily entries          |
| Plan goals      | Two goals on bench press: one completed, one in the middle of its plan       |

## Rules

- It keeps your data. It adds records and deletes none.
- It does not turn on a tracker. Data of a tracker that is off stays hidden, and the confirmation lists the trackers that are off.
- It takes over the active plan, because one plan is active at a time. It pauses any goal that was running, makes its own plan the active one, and then reloads the app.

## Further reading

- [Data clearing](data-clearing.md): the rows that remove the test data again.
- [Feature toggles](feature-toggles.md): why data of a tracker that is off stays hidden.
