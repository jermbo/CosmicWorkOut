---
name: Code names
description: 'The names in the code and the stored data that differ from the glossary, and the words that prose does not use, each with the word to write.'
altitude: exact
tags:
  - glossary
  - words
parent: ../glossary.md
---

[Wiki](../README.md) / [Glossary](../glossary.md) / Code names

# Code names

You read the code, a backup file, or the browser tools, and you find a name that the glossary does not use. This page is the contract that maps each such name to its word. Prose always uses the word.

## Names in the stored data

| Name              | Where you find it            | The word in prose  |
| ----------------- | ---------------------------- | ------------------ |
| `practiceEnabled` | A field of `cwout:prefs`     | The Workout toggle |
| `goalPlans`       | An IndexedDB store           | The goal of a plan |
| `goalPlan`        | One record of that store     | A goal             |
| `practice`        | A card id in `homeCardOrder` | The Workout card   |

## Words that prose does not use

| Do not write                     | Write            | Why                                                      |
| -------------------------------- | ---------------- | -------------------------------------------------------- |
| Exercise, for a stored record    | Item             | An item can belong to any Discipline                     |
| Workout, for one training day    | Routine          | "Workout" names the whole section                        |
| SessionLog                       | Session          | One word for every Discipline                            |
| Practice                         | Workout          | One section holds every plan and session                 |
| Lift plan, goal progression plan | Plan with a goal | A goal is an option on a plan, not a second kind of plan |

## Further reading

- [Settings object](settings-object.md): every field of `cwout:prefs`, with `practiceEnabled`.
- [IndexedDB stores](indexeddb-stores.md): every store, with `goalPlans`.
