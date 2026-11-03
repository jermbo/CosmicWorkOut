---
name: Item library
description: 'The list of exercises that a plan draws from: the built-in catalog, the body-part categories, custom items, and the weight step of each item.'
altitude: part
tags:
  - workout
  - items
parent: workout.md
---

[Wiki](../README.md) / [Workout](workout.md) / Item library

# Item library

When you build a routine, you pick exercises from one library. This page tells what is in it, what you can change, and why some items are read-only.

## Built-in items

The app ships a catalog of strength exercises. Each has a name, a cue to show during a session, its muscles and equipment, a unit, default sets and reps, and a weight step. The catalog is code. Each start writes it into the database again, so a fix reaches every phone with the next update.

You cannot edit a built-in item, because the next start would write over your change. So you make a custom item instead.

## Categories by body part

Each strength item has one category: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, or Full Body. When you add an exercise to a routine, the library opens as a sheet with a search field and a chip for each category. The search matches the name, the muscles, and the category.

## Custom items

You can make, edit, and delete your own items in the library. A custom item has the same fields as a built-in one. The app never writes over it. A clear row in Settings, **Custom exercises**, deletes all of them at once.

## The weight step

Each item has a weight step of 2.5, 5, or 10, and a new custom item starts at 5. The step decides how a typed weight is rounded, and how much a supporting exercise in a plan with a goal climbs each week.

## The unit

An item uses `lb`, `kg`, `band`, or `bodyweight`. A band or bodyweight item needs no number, so a tap logs it at once. A plain weight shows in your weight unit from Personalization; the unit is a label, and the app does not convert stored numbers.

### Example

Your gym has a shoulder machine that the catalog does not have. In the routine editor you open the library and make a new exercise. You name it "Shoulder Machine", select Shoulders, keep 3 × 8, and set the step to 5. It now shows in the Shoulders chip next to the built-in items, with a "Custom" badge, and your first session asks once for its weight.

## How items fit into the model

An item belongs to a [Discipline](disciplines.md) and to one section of it. Strength has one section, so each strength item belongs to the exercise list.

## Further reading

- [Set logging](set-logging.md): how the weight step rounds a weight.
- [Schema upgrades](schema-upgrades.md): how the catalog is written again on each start.
