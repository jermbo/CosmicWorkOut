---
name: Disciplines
description: 'The general model under Workout: a Discipline declares its sections and metrics, so a new structured practice is configuration, not new code.'
altitude: part
tags:
  - workout
  - model
parent: workout.md
---

[Wiki](../README.md) / [Workout](workout.md) / Disciplines

# Disciplines

Strength is the only structured practice in the app today. But the session engine does not know that it is strength. This page tells why, and what a second practice would need.

## The problem it solves

The app began as a strength tracker, with "exercise", "workout", and "sets × reps" in every part of the code. A dance practice, or a mobility flow, has no weight and no sets. To add one would mean a second copy of the engine. So the engine became general, and each practice describes itself as data.

## What a Discipline declares

A Discipline is configuration in the code, not data on the device, and you cannot edit it. It declares:

- its **sections**, in order — for example a warm-up, a main part, and a cool-down;
- the **metric** of each section, which decides how you log an item;
- its **built-in content** — items and templates;
- its **label**, colour, and icon.

Strength declares one section, the exercise list, with the metric sets × reps × weight.

## The three metrics

| Metric      | You log                        | Counts toward volume |
| ----------- | ------------------------------ | -------------------- |
| Sets × reps | Weight and reps for each set   | Yes                  |
| Measure     | A duration or a number of reps | No                   |
| Check       | Done or not done               | No                   |

Strength uses only the first. The other two are in the engine, and a session can already log them.

## Bookends

A Discipline can mark a section as a bookend: a warm-up or cool-down that each routine shares. Day A defines the list, and the other days use it unless they set their own. Strength does not use bookends.

## The test for a new practice

Ask: do you want to be guided through a routine that repeats? If yes, it is a Discipline. You write its configuration and its seed content; you do not fork the engine. If you only want a record that you did it, it is an [activity type](activity-log.md) instead, which is one line.

### Example

A second Discipline, Mobility, could declare three sections: warm-up as check, flow as measure, and cool-down as check, marked as bookends. Its items would be stretches. The session overlay, the next-routine count, and the plan list would work with no change.

## What is not general yet

One plan is active at a time, for all Disciplines together, and the screens say "Workout", not the name of a Discipline. A second Discipline would need a decision about both.

## Further reading

- [Glossary](../glossary.md): the words Discipline, Section, Metric, and Item.
- [Workout records](workout-records.md): where the Discipline id is stored.
