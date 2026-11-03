---
name: Design system
description: 'How CosmicWorkOut looks and why: a dark grid, one solid colour field for each part, hard shadows on what you can press, and big figures.'
altitude: part
tags:
  - design
  - ui
parent: system.md
---

[Wiki](../README.md) / [System](system.md) / Design system

# Design system

The app looks like a piece of gym equipment. You can see its structure, and each thing that you can press has a hard shadow. This page tells the visual rules and why each one is there.

## The idea: equipment, not decoration

A gym machine shows its frame, its labels, and its plates. The app does the same. A grid sits behind every screen. Each field has a short code, such as `[T] WORKOUT`. A thing that you can press has a solid shadow with no blur, offset by 6 px. When you press it, it moves into its shadow, so you know that the tap counted.

## The rules

| Rule                 | What you see                                                             |
| -------------------- | ------------------------------------------------------------------------ |
| Dark only            | One palette. There is no light theme                                     |
| Grid behind it all   | A 24 px grid on near-black                                               |
| One colour per part  | Each part has one solid field; black text sits on the field              |
| Square corners       | Every corner is square                                                   |
| Thick rules          | Lines of 3 px draw the structure; 2 px for quiet lines                   |
| Shadow means press   | A hard shadow marks every thing that you can press                       |
| Stripes mean empty   | A thing that is not logged yet has diagonal stripes and a dashed border  |
| Paper means selected | The selected tab, day, or chip is filled with off-white, with black text |
| Big figures          | Weights, reps, and counts are huge, in a heavy display font              |

## One colour for each part

| Part      | Colour | Code  |
| --------- | ------ | ----- |
| Workout   | Blue   | `[T]` |
| Habits    | Coral  | `[H]` |
| Baselines | Purple | `[B]` |
| Health    | Yellow | `[P]` |
| Activity  | Green  | `[A]` |

The colour tells you where you are without a word. Blue is also the accent of the app. Charts use the same colours, so a habit chart is coral like the Habits card. A habit tile uses the colour of its own habit.

## Type

Two fonts ship inside the app, so it makes no network request for them. Unbounded, in heavy weights and capitals, sets titles and big figures. JetBrains Mono sets labels, codes, data, and body text.

## Density

You can make the spacing compact, comfortable, or spacious. Each setting scales every spacing value — compact by 0.75, spacious by 1.25 — so each component follows with no change of its own.

## How the patterns are built

Tokens — colours, rules, shadows, timing, fonts — are global. A pattern, such as a colour field or a progress bar of blocks, is a small component with its own styles, never a global class. So a component cannot break a pattern by accident.

The motion that goes with these rules is in [tap feel](tap-feel.md). The original mockups are in the [inspiration folder](../_inspiration).

## Further reading

- [Design principles](../principles.md): why the app must feel tactile.
- [Personalization](personalization.md): where you set the density.
