---
name: Goal wave
description: 'How a plan with a goal turns a start and a target into four-week progression blocks, what each week prescribes, and how a block repeats.'
altitude: mechanism
tags:
  - workout
  - goal
  - progression
parent: workout.md
---

[Wiki](../README.md) / [Workout](workout.md) / Goal wave

# Goal wave

A plain plan leaves the weight to you. A plan with a goal tells you the weight of each week for one focus lift, until you reach the target. This page tells how the app builds that schedule.

## Why a wave, not a straight line

A weight that goes up every week stops working after a few weeks: you get tired, and you stall. A wave goes up for three weeks, then drops for one week of rest, and starts again a little higher. So you climb, recover, and climb again.

## One block is four weeks

Each block starts from a baseline weight × reps. The weight step is the step of the focus lift, such as 5 lb.

| Week | Phase  | Weight             | Reps                |
| ---- | ------ | ------------------ | ------------------- |
| 1    | Build  | baseline           | baseline reps       |
| 2    | Build  | baseline + 2 steps | 2 fewer             |
| 3    | Peak   | baseline + 4 steps | 4 fewer, at least 1 |
| 4    | Deload | baseline           | baseline reps       |

The next block starts at the peak weight of this block, at the baseline reps. Each weight rounds to the weight step.

## How the chain stops

The app adds blocks until a peak reaches the goal weight. It then sets that peak to exactly the goal — your weight and your reps — so the plan prescribes the target that you asked for. It always makes at least one block, and at most 12. The plan shows an estimate in months, which assumes that you keep the days per week.

### Example

Start 150 × 10, goal 185 × 5, step 5.

- Block 1: 150 × 10, 160 × 8, 170 × 6, deload 150 × 10.
- Block 2 starts at 170 × 10: 170 × 10, 180 × 8, then the peak reaches 190, so the app sets it to the goal, 185 × 5, then deload 170 × 10.

Two blocks: 8 weeks, about 2 months.

## The other exercises

Each supporting exercise starts at its last weight when you made the plan, or 0. It climbs by its own weight step each week, with no wave. Its reps stay as the routine sets them.

## Weeks come from the session count

A goal uses the same count as every plan, as [next routine](next-routine.md) tells: the week is the number of finished sessions divided by the days per week. The weight of the focus lift in a session is the weight of that week.

## Repeat a block

When a block was too hard, you can repeat it. The app does not delete sessions. It stores an offset, so the count of the plan starts again at week 1 of the current block, and it adds four weeks to the plan. When a plan with a goal ends, **Run it again** repeats its last block in the same way.

## Further reading

- [Workout records](workout-records.md): the fields of a goal and its blocks.
- [Set logging](set-logging.md): how the prescribed weight fills the set tiles.
