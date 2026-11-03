---
name: Feature toggles
description: 'How each tracker turns on and off: why everything starts off, what a toggle hides, and why a toggle never deletes data.'
altitude: mechanism
tags:
  - settings
  - toggles
parent: system.md
---

[Wiki](../README.md) / [System](system.md) / Feature toggles

# Feature toggles

Each of the five trackers has one switch in Settings. This page tells what the switch does, and what it does not do.

## Why every tracker starts off

People come to the app for different things. One person wants only the strength plan; a second wants only habits and mood. A screen full of trackers that you do not use is noise, and it breaks the rule of a small surface. So on a new device every tracker is off, and the Overview shows "Nothing is being tracked yet" with a link to Settings. You turn on what you want.

## A toggle hides; it never deletes

A toggle changes only what you see. When it is off, the app hides the screens, the cards, the charts, and the clear rows of that tracker. The records stay in the database, and the store still loads them on each start. When you turn the toggle on again, the tracker comes back with all of its history.

The reason is trust. A switch that deletes data would make every person afraid to touch it. Deletion has its own place, with a confirmation, in [data clearing](data-clearing.md).

## How a hidden screen stays hidden

You can still type the address of a hidden screen, or have it open when you turn its toggle off. So each tracker screen watches its toggle. When the toggle is off, the screen sends you to the Overview. The Baselines screen is the one exception: it shows a short message that Baselines is off. The page of each tracker in Settings is never hidden, because it holds the switch.

## The five toggles

The toggles are Habits, Activity log, Workout, Health metrics, and Baselines. Mood has no toggle: it is a habit, so it hides with Habits. A goal has no toggle: it is an option on a plan, so it hides with Workout. Workout reaches furthest, because it also owns the session overlay, the result screen, and the crash-recovery banner.

### Example

You turn on Habits and Workout. The Overview shows two cards, the bottom bar shows the Workout tab, and Insights shows the habit and workout charts. You turn Workout off for a month. The tab, the card, and the volume chart go away, and a session in progress is not offered on start. You turn it on again, and your plan and every past session are there.

The exact list of what each toggle hides is in [what each toggle hides](toggle-surfaces.md).

## Further reading

- [Settings](settings.md): where the switches are.
- [Overview screen](overview-screen.md): the empty state and the cards that follow the toggles.
