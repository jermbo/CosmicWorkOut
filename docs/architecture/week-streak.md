---
name: Week streak
description: 'How the Overview counts your week streak: the weeks in a row that each have at least one session, and why the current week cannot break it.'
altitude: mechanism
tags:
  - workout
  - streak
parent: overview-screen.md
---

[Wiki](../README.md) / [Overview screen](overview-screen.md) / Week streak

# Week streak

A streak rewards you for coming back. The badge in the Overview header shows how many weeks in a row you trained. This page tells how the app counts it.

## What counts as a week

A week is an ISO week: Monday to Sunday. A week counts when it has at least one session of any plan. The number of sessions that a plan asks for does not matter here. A busy week with one session still keeps the streak, because the point is to keep the habit alive, not to punish a short week.

## How the count runs

1. Look at the current week. If it has a session, add one.
2. Go back one week.
3. While that week has a session, add one and go back one more week.
4. Stop at the first week with no session.

## Why the current week cannot break the streak

On Monday morning you have not trained yet this week. If an empty current week broke the streak, every streak would fall to zero each Monday. So step 1 only adds; it never stops the count. The streak breaks only when a full week in the past has no session.

### Example

You trained in the weeks of Monday 12 October, 19 October, and 26 October. Today is Tuesday 3 November, and you have not trained yet this week. Step 1 adds nothing. Steps 2 and 3 find three weeks in a row, so the badge shows 3. You train today, and the badge shows 4. If you had skipped the week of 19 October, the badge would show 1.

## Where the streak shows

The badge shows only while Workout is on, because the sessions belong to Workout. A session on a past day counts in its own week, so a session that you add later for last week can mend a gap.

## Further reading

- [Session lifecycle](session-lifecycle.md): when a session is stored and gets its date.
- [Insights](insights.md): the "Showing Up" chart for a longer view of gaps.
