---
name: Streaks
description: 'How the Overview counts one streak for each tracker: the days or weeks in a row with a record, and why the current day or week cannot break it.'
altitude: mechanism
tags:
  - overview
  - streak
parent: overview-screen.md
---

[Wiki](../README.md) / [Overview screen](overview-screen.md) / Streaks

# Streaks

A streak rewards you for coming back. Each tracker has its own, so a day of water and mood counts as much as a week of workouts. This page tells how the app counts them. The page keeps its old address, `week-streak.md`, so old links still work.

## One streak for each tracker

| Tracker   | Badge | Unit | A day or week counts with            |
| --------- | ----- | ---- | ------------------------------------ |
| Workout   | `T`   | Week | One session of any plan              |
| Habits    | `H`   | Day  | One log of any habit, Mood included  |
| Activity  | `A`   | Week | One activity                         |
| Health    | `P`   | Week | One weight or blood-pressure reading |
| Baselines | `B`   | Day  | One entry toward any baseline        |

A week is an ISO week: Monday to Sunday. A habit log counts when its value is above 0, because a yes/no habit that you toggle back off keeps a log of 0. Mood counts at any value, since its scale holds 0 and below. Nothing is stored: each streak is counted from the records on each view.

## How the count runs

1. Look at the current day or week. If it has a record, add one.
2. Go back one day or week.
3. While that one has a record, add one and go back one more.
4. Stop at the first full past day or week with no record.

## Why the current one cannot break it

On Monday morning you have not trained yet this week. If an empty current week broke the streak, every week streak would fall to zero each Monday, and every day streak each morning. So step 1 only adds; it never stops the count.

### Example

You trained in the weeks of 12 October and 26 October, but not the week of 19 October. Today is Tuesday 3 November, and you have not trained this week. Step 1 adds nothing; step 2 finds the week of 26 October, and step 3 stops at the empty week of 19 October. The Workout badge reads `T 1W`. For Habits, you logged on each of the last 12 days but not yet today: the badge reads `H 12D`, and after you log Water it reads `H 13D`.

## The badges

The Overview header shows one badge for each tracker that is on, in its colour, read as the code, the count, and D or W. A badge at 0 is empty, as the [design system](design-system.md) draws empty: stripes and a dashed border, `A 0`. Tap a badge, and the [Mascot](mascot.md) tells you about that streak. No other screen shows the badges.

## Further reading

- [Feature toggles](feature-toggles.md): a badge shows only while its tracker is on.
- [Session lifecycle](session-lifecycle.md): when a session is stored and gets its date.
