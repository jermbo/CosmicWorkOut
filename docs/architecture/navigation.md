---
name: Navigation
description: 'How you move around CosmicWorkOut: the four tabs, the cards that open each tracker, and the overlays that a session uses.'
altitude: part
tags:
  - navigation
  - screens
parent: system.md
---

[Wiki](../README.md) / [System](system.md) / Navigation

# Navigation

The app has few tabs and many cards. This page tells how you reach each screen, and why a session never makes you leave the screen that you are on.

## Four tabs at the bottom

The bottom bar has four tabs: **Overview**, **Workout**, **Insights**, and **Settings**. The Workout tab shows only while Workout is on. A tab is for a place that you visit many times a day. The trackers that you only log in — Habits, Activity log, Health, and Baselines — have no tab, because their card on the Overview is a faster way in.

## Cards open the trackers

Each card on the Overview is a door. You tap the Habits card, and the Habits screen opens for the logging date. You tap Back, and you are on the Overview again. So the bottom bar stays short, and each tracker is one tap away. The [Overview screen](overview-screen.md) page tells what each card shows.

## Overlays for the session

A session is not a page. When you start a routine, the session opens as an overlay above the app. The result screen and the crash-recovery banner are overlays too. They live in the root layout, so they work above any screen, and a tap on a tab cannot end a session by accident. The [session lifecycle](session-lifecycle.md) page tells how a session starts and ends.

## Page changes

When you change the page, the old page drops away and the new one rises in, and the bottom bar holds still. The motion is short, so it shows where you went without making you wait.

## Settings is a hub

The Settings tab opens a hub with one row for each feature and each app area. Each row opens its own page. The [settings](settings.md) page tells what is on each one.

## Old addresses

Some screens were merged or removed: the history calendar, the practice hub, the separate goal screens, and the old program page. Their addresses are gone, with no redirect. A link to one of them shows the default error page of SvelteKit.

The exact list of addresses, and which toggle each one needs, is in [routes](routes.md).

## Further reading

- [Feature toggles](feature-toggles.md): why a tab or a card can be hidden.
