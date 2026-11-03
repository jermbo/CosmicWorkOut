---
name: Settings
description: 'How Settings is laid out: one hub row for each feature and each app area, a page behind each row, and where the rare and risky actions live.'
altitude: part
tags:
  - settings
parent: ../README.md
---

[Wiki](../README.md) / Settings

# Settings

Settings is the place where you decide what the app tracks and how it feels. It has few options on purpose: each one costs attention, so an option must earn its row.

## One row for each feature

The Settings tab opens a hub, like the Settings app of a phone. It has two groups.

**Features** has one row each for Habits, Baselines, Workout, Activity, and Health. Each row shows On or Off, and some show a count, such as "4 active". You tap a row, and the page of that feature opens. The page holds the switch of the feature and everything that you manage for it: the list of habits with their order and colours, the list of baselines with their metrics. A feature page is never hidden, because it holds the switch that turns the feature on. The [feature toggles](feature-toggles.md) page tells what a switch does.

**App** has three rows: Insights, Personalization, and Data & backup. Insights holds a switch for each chart. [Personalization](personalization.md) holds the weight unit, the density, haptics, sound, and the order of the Overview cards.

## Why each feature has its own page

The design rule is "one row per feature; everything about it, one tap away". Each page stays short, and the hub shows at a glance what is on and what is off.

## Rare and risky actions live apart

Backups, restores, and clears are rare, and a clear cannot be undone. So they are not next to the switches that you use often. They are all on one page, Data & backup, which the [data and backup](data-and-backup.md) page tells about. Each clear asks for confirmation.

## Changes apply at once

There is no Save button. A switch or an option changes the app as soon as you tap it, and the app writes your settings to localStorage at once. A file backup and a full QR backup carry your settings. A QR backup of recent days does not, so each phone keeps its own feel when you only sync new records.

### Example

You want to start tracking your weight. You open Settings. Under Features, Health shows Off. You tap it, turn on the switch, and go back. The hub now shows Health On, a Health card appears on the Overview, and three health charts appear in Insights.

## Further reading

- [Routes](routes.md): the address of each Settings page.
- [What each toggle hides](toggle-surfaces.md): every stored setting and its default.
