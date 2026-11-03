---
name: Next routine
description: "How the app picks today's routine and the current week from the number of finished sessions, not from the calendar."
altitude: mechanism
tags:
  - workout
  - progression
parent: workout.md
---

[Wiki](../README.md) / [Workout](workout.md) / Next routine

# Next routine

The app does not know your weekly schedule, and it does not want to. It gives you the next routine in the plan, whenever you show up. This page gives the rule.

## Why the count, not the calendar

A plan tied to weekdays breaks the first time that life moves a session. You miss Tuesday, and the app either skips a routine or nags you. A count has neither problem. You train when you can, and the plan waits for you. The cost: the app cannot tell you that you are behind. For this app, that is the right trade.

## The rule

The app lays out every routine of the plan in order, week by week. Then it counts the sessions that you finished for that plan.

```text
next routine  = all routines [ finished sessions  mod  number of all routines ]
current week  = floor( finished sessions / days per week ) + 1, at most the number of weeks
day letter    = the letter at position ( finished sessions mod days per week ): 0 → A, 1 → B, 2 → C
plan is done  = finished sessions ≥ weeks × days per week
```

A plan with a goal uses the same count. It only moves its week back when you repeat a block, as the [goal wave](goal-wave.md) page tells.

## One session for each plan on each date

When a session already exists for the logging date, the routine screen shows that session — its routine, time, exercises, and volume — with Edit and Delete. It does not offer a second start. So the count rises by at most one each day.

### Example

Beginner 101 has 4 weeks and 3 days per week: 12 routines in all.

| Finished sessions | Next routine  | Week | Letter |
| ----------------- | ------------- | ---- | ------ |
| 0                 | Week 1, Day A | 1    | A      |
| 1                 | Week 1, Day B | 1    | B      |
| 2                 | Week 1, Day C | 1    | C      |
| 3                 | Week 2, Day A | 2    | A      |
| 12                | —             | 4    | —      |

At 12 sessions the plan is done, and the app offers **Run it again** or **New plan**.

## What the rule does not do

It does not raise the weight of a plain plan. Each session starts from the last weight that you logged for each item, and you raise it by hand. A plan with a goal is different: it gives the weight of each week.

## Further reading

- [Workout records](workout-records.md): the fields that the rule reads.
- [Week streak](week-streak.md): a second count that uses the same sessions.
