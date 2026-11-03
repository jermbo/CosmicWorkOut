---
name: Glossary
description: 'The one word for each thing in CosmicWorkOut, the test that sorts a new movement type, and the old names that are gone.'
altitude: overview
tags:
  - glossary
  - words
parent: README.md
---

[Wiki](README.md) / Glossary

# Glossary

Each page and each screen uses one word for one thing. This page gives that word. When a page uses a different word for a thing here, the page is wrong.

## Three ways to record movement

Each record of movement in the app is one of three kinds. A new idea does not get a new design; it goes into one of these kinds.

| Kind       | What it is                                      | How you log it                                  | Examples        |
| ---------- | ----------------------------------------------- | ----------------------------------------------- | --------------- |
| Structured | A multi-week plan that guides you, step by step | Start a session, work through the items, finish | Strength        |
| Quick-log  | A thing that you did and want on the record     | One short entry: type, duration, intensity      | Run, Pickleball |
| Habit      | A value that recurs each day                    | Tap a counter, a toggle, or the mood scale      | Water, Mood     |

## The test for a new movement type

Ask one question: do you want the app to guide you through a routine that repeats, or do you only want to record that you did it? A guided routine is a new Discipline, which is configuration and seed data. A record is a new activity type, which is one line of configuration. Pickleball is an activity type, and it cost no design work. Baselines and health metrics are not movement kinds; they are separate trackers.

## The words

| Word                | Meaning                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Discipline          | The configuration of one structured practice: its sections, metrics, and built-in content. Strength is the only one |
| Section             | An ordered part of a routine. Strength has one section, the exercise list                                           |
| Metric              | The rule for how you log an item: sets × reps × weight, a measured value, or done / not done                        |
| Item                | One movement, such as Bench Press. Built-in items are read-only; custom items are yours                             |
| Focus tag           | A label on an item for filtering, such as "core" or "legs"                                                          |
| Plan                | Routines over a number of weeks that you follow in the Workout section. One plan is active at a time                |
| Template            | A built-in plan. You start from a copy, so the template never changes                                               |
| Program             | The stored record of a plan. Use "plan" in prose; "program" names only the record                                   |
| Routine             | One training day of a plan, shown as Day A, B, or C                                                                 |
| Session             | One finished routine on one date, with what you logged                                                              |
| Active session      | A session in progress. It becomes a session when you finish                                                         |
| Goal                | An optional target on a plan: one focus lift at a weight × reps                                                     |
| Focus lift          | The one exercise that a goal is about. It follows the progression blocks                                            |
| Supporting exercise | Each other exercise in a plan with a goal. It climbs by its weight step each week                                   |
| Progression block   | Four weeks of a goal: build, build, peak, deload                                                                    |
| Weight step         | The amount by which an item's weight goes up or down: 2.5, 5, or 10                                                 |
| Activity            | One quick-log entry: a type, a duration, and an intensity                                                           |
| Activity type       | One value in the list of activities, such as Run or Yoga                                                            |
| Habit               | A daily value with a type, an optional daily goal, a unit, and a colour                                             |
| Mood                | The protected habit on a scale of −5 to +5. It hides with Habits                                                    |
| Habit log           | One day's value for one habit                                                                                       |
| Baseline            | A daily floor that you set, with one or more metrics of duration, distance, or count                                |
| Baseline log        | One entry toward a baseline. A day can have many                                                                    |
| Health metric       | A measurement that the app defines: weight or blood pressure                                                        |
| Health reading      | One logged measurement                                                                                              |
| Logging date        | The one date that every tracker reads and writes                                                                    |
| Feature toggle      | The switch that shows or hides one tracker. It never deletes data                                                   |
| Built-in            | Content that ships with the app and comes back on each start                                                        |
| Custom              | Content that you make. The app never changes it                                                                     |

## Old names that are gone

| Old name                         | Word now         | Why it changed                                           |
| -------------------------------- | ---------------- | -------------------------------------------------------- |
| Exercise (as a record)           | Item             | An item can belong to any Discipline                     |
| Workout (one training day)       | Routine          | "Workout" now names the whole section                    |
| SessionLog                       | Session          | One word across all Disciplines                          |
| Practice                         | Workout          | The section was merged and renamed                       |
| Lift plan, goal progression plan | Plan with a goal | A goal is an option on a plan, not a second kind of plan |

Code names can lag behind a word here. The toggle for Workout is `practiceEnabled`, and the stored goal is a `goalPlan`. Prose uses the words in this page.

## Further reading

- [Workout](architecture/workout.md): plans, routines, and sessions in use.
- [Vision](vision.md): why a new movement type must be configuration.
