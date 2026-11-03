---
name: Overview screen
description: 'What the Overview shows for the logging date: one card for each tracker that is on, in your order, a week strip, a streak, and the empty state.'
altitude: part
tags:
  - overview
  - screens
parent: ../README.md
---

[Wiki](../README.md) / Overview screen

# Overview screen

The Overview is the first tab and the first screen. It answers one question: how is this day going? It shows one card for each tracker that is on, for one date.

## The day at the top

The header holds the date and a week strip of seven days, Monday to Sunday. The same header is on each tracker screen. Each day of the strip has small marks for what you logged on it: a session, an activity, a habit, a health reading. You tap a past day, and the whole app moves to that day; on a tracker screen, you stay on that screen. You cannot tap a day in the future. The [logging date](logging-date.md) page tells how one date drives every tracker.

While Workout is on, a badge in the header shows your week streak. The [week streak](week-streak.md) page tells how it counts.

## One card for each tracker

| Card         | What it shows for the date                                                                  |
| ------------ | ------------------------------------------------------------------------------------------- |
| Habits       | How many habits are done, out of the active ones, with progress blocks. Mood does not count |
| Workout      | The next routine of the active plan, a live session, or "Logged for today"                  |
| Activity log | Each activity that you logged                                                               |
| Baselines    | How many baselines are done, such as `2/3`. When all are, "You showed up for all of them."  |
| Health       | Your weight and blood pressure, or "Not logged"                                             |

A card shows only while its tracker is on. Each card is a door: tap it, and the screen of that tracker opens for the same date. Each card has the colour of its part, from the [design system](design-system.md).

## Your order, not a fixed one

One person starts the day with habits; a second person starts with the workout. So you set the order of the cards, by drag or by arrows, in Personalization. The app stores the order as a list. When it reads the list, it drops an unknown card and adds a card that the list does not name, at the end. So a new card appears for every person after an update, and an old or damaged list never hides a card.

## When nothing is on

On a new device every tracker is off, so there are no cards. The Overview then shows "Nothing is being tracked yet" and a link, **Choose what to track**, to Settings. It does not show an empty page that looks broken.

### Example

You turn on Habits and Workout, with Workout first. On Tuesday the Overview shows the Workout card with the name of your next routine, above the Habits card with "3/5". You tap Monday in the week strip. The cards now show Monday: the Workout card says "Logged for today", and Habits shows "5/5" — all five habits reached their goal.

## Further reading

- [Feature toggles](feature-toggles.md): why a card appears or goes away.
- [Personalization](personalization.md): where you set the order of the cards.
