---
name: Workout
description: 'What the Workout section does: one active strength plan, made from a template or from scratch, with an optional goal, followed one session at a time.'
altitude: part
tags:
  - workout
  - plans
parent: ../README.md
---

[Wiki](../README.md) / Workout

# Workout

Workout is where you follow a strength plan. It answers one question each time that you open it: what do I train today? It is off until you turn it on in Settings.

## One plan at a time

The app lets only one [plan](../glossary.md) be active, so you always know which one to follow. The plan list shows the active plan on top, with **Start today's workout**, and your other plans below. To activate one pauses the active one. A paused or finished plan keeps its sessions.

## How you make a plan

You tap **New plan**, and a short wizard asks four things:

1. **Start from.** A built-in template, such as Beginner 101, or "Start from scratch". A template is copied, so your plan is yours to edit. From scratch, you build Days A, B, and C from the [item library](item-library.md), with three days each week and 1 to 52 weeks (12 by default).
2. **Routines.** Each day needs at least one exercise.
3. **Working toward a specific lift?** If yes, you pick a focus lift, a starting point, and a goal. The [goal wave](goal-wave.md) page tells what the app then builds.
4. **Review**, then save.

You can set a goal only when you make the plan. You can remove it later; the plan then continues to its end as a plain plan.

## How a plan moves

The app does not follow the calendar. It gives you the next routine by the number of sessions that you finished, so a missed Tuesday moves nothing. The [next routine](next-routine.md) page gives the rule.

The [session lifecycle](session-lifecycle.md) tells how a session starts, saves, and comes back after a crash, and [set logging](set-logging.md) tells how one tap logs a set.

## When you edit a plan

You edit a routine on the plan's page. The change goes to the routine of the same name in every week, so Day A stays the same plan across all weeks.

## When a plan ends

A plan ends after weeks × days sessions. The app then offers **Run it again** or **New plan**. A plain plan runs again as a fresh copy from week 1, so the old sessions stay with the old copy. A plan with a goal repeats its last block instead.

## What sits under Workout

Workout is built on the general [Discipline](disciplines.md) model, and Strength is its only Discipline. The stored shapes are in [workout records](workout-records.md).

## Further reading

- [Feature toggles](feature-toggles.md): what Workout hides when it is off.
- [Week streak](week-streak.md): how sessions become the streak on the Overview.
