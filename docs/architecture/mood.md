---
name: Mood
description: 'How the mood check-in works: an eleven-step scale from −5 to +5 with a word for each step, one value a day, its two colours, and why it is a protected habit.'
altitude: part
tags:
  - habits
  - mood
parent: habits.md
---

[Wiki](../README.md) / [Habits](habits.md) / Mood

# Mood

Mood answers one question each day: how did you feel? It sits at the top of the Habits screen, and one tap records it. Over weeks, Insights shows whether your mood follows your habits or your training.

## The scale

Mood is a row of eleven buttons, from −5 to +5. Each step has a word:

| Value | Word      | Value | Word     |
| ----- | --------- | ----- | -------- |
| +5    | Happy     | −1    | Tired    |
| +4    | Excited   | −2    | Agitated |
| +3    | Focused   | −3    | Sad      |
| +2    | Energized | −4    | Angry    |
| +1    | Content   | −5    | Stressed |
| 0     | Normal    |       |          |

When you tap a step, the header of the scale shows its word and its value. Mood has one value for each date, so a second tap on a different step replaces the first. A tap on the step that is already selected sets the day back to 0, Normal.

## A protected habit

Mood is stored as a habit of the type `mood`, but it does not act like the others. It has no goal and no progress blocks, and it does not count toward the habits that are done on the Overview. You cannot make a second mood habit, and you cannot turn Mood off or delete it in Settings → Habits. It does hide with the Habits toggle, like every habit.

## Two colours

A mood can be good or bad, so Mood has two colours: green for a value above zero, and orange for a value below zero, by default. You can change both in Settings → Habits. The charts and the week strip use them.

## Where mood shows

On the Habits screen, the week strip in the header shows a dot for each day with a mood, in the good or the bad colour. In Insights, Mood vs Habits sets your mood next to coffee and water, and On Days When… compares your mood on days when a thing occurred with days when it did not. All Habits and Day of Week include it too.

### Example

On Monday you tap +3, Focused. In the evening you feel worse and tap −1, Tired; the day now holds −1. The week strip shows an orange dot on Monday. A month later, On Days When… shows that your mood is higher on days with a workout.

## Further reading

- [Insights](insights.md): the charts that use mood.
- [Tracker records](tracker-records.md): how a mood value is stored.
