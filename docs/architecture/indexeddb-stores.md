---
name: IndexedDB stores
description: 'The exact list of IndexedDB stores in CosmicWorkOut: the database name and version, each store, its key, its indexes, and what it holds.'
altitude: exact
tags:
  - storage
  - indexeddb
parent: storage.md
---

[Wiki](../README.md) / [System](system.md) / [Storage](storage.md) / IndexedDB stores

# IndexedDB stores

This page is the contract for the database. Use it to read the data in the browser tools, to write a migration, or to check that a backup covers each store.

## The database

The database name is `cosmic-workout`. Its version is `11`. The version goes up only when a store or an index is added, or when a store changes shape. The [schema upgrades](schema-upgrades.md) page tells how an upgrade keeps your data.

## The stores

| Store            | Key      | Indexes                  | What it holds                                   |
| ---------------- | -------- | ------------------------ | ----------------------------------------------- |
| `items`          | `id`     | —                        | Each item: built-in and custom                  |
| `programs`       | `id`     | —                        | Each plan, with its weeks and routines          |
| `sessions`       | `id`     | `by_date`                | Each finished session                           |
| `itemLastUsed`   | `itemId` | —                        | The last weight and reps of each item           |
| `activities`     | `id`     | `by_date`                | Each activity                                   |
| `habits`         | `id`     | —                        | Each habit, with Mood                           |
| `habitLogs`      | `id`     | `by_date`, `by_habit`    | One value for each habit and date               |
| `healthReadings` | `id`     | `by_date`, `by_metric`   | Each weight or blood-pressure reading           |
| `goalPlans`      | `id`     | `by_status`              | The goal of a plan, with its progression blocks |
| `baselines`      | `id`     | —                        | Each baseline and its metrics                   |
| `baselineLogs`   | `id`     | `by_date`, `by_baseline` | Each entry toward a baseline                    |

## Rules that each store follows

- A store with a `by_date` index holds records that each carry a `date` in the form year-month-day. A QR backup of a date window replaces exactly these records.
- The key of a habit log is the habit id and the date, joined by a colon: `habit-water:2026-11-03`. So one habit has one value for each date, and a tap overwrites it.
- `itemLastUsed` changes each time that you log a set, not only when you finish. So the next session knows your weight, also after a crash.
- The app writes the built-in rows of `items` and `programs` again on each start. It never writes a row whose `isBuiltIn` is false.
- When you delete a baseline or a habit, its logs stay. A clear in Settings removes both.

The fields of each record are in [workout records](workout-records.md) and [tracker records](tracker-records.md).

## Further reading

- [localStorage keys](local-storage-keys.md): the small values that are not in the database.
- [Data clearing](data-clearing.md): which stores each clear in Settings empties.
