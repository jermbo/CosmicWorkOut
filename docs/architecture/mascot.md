---
name: Mascot
description: 'The pixel star that is the face of the app: how it is drawn, its six actions, where it shows, when it talks and celebrates, and the switch and reduced motion that calm it.'
altitude: part
tags:
  - mascot
  - overview
  - design
parent: ../README.md
---

[Wiki](../README.md) / Mascot

# Mascot

The app records well, but nothing in it used to be glad that you came back. The Mascot is a small pixel star in the yellow of Health, with two eyes and a mouth, lit from the top left. It is the app icon, the browser-tab icon, and a picture in the Overview header. Reasons are in the [decision log](../initiatives/mascot/decision-log.md).

## Drawn frames only

Each pose and each face is a pixel map in `src/lib/mascot/sprite.ts`, drawn as SVG with square pixels. The star moves only by changing frames, and by whole pixels of its own grid. It is never rotated, squashed, stretched, or slid by a tween: pixel art looks cheap when it bends. The icons are drawn from the same maps by `npm run icons`. **Settings › Personalization › Mascot gallery** plays every action on a loop, with the same component and frames, so the gallery cannot drift from the app.

## Six actions

| Action    | When                                         | Frames                                                           |
| --------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Idle      | Always, in the Overview header               | Breathes every 700 ms; blinks or looks around every 1.8 to 4.6 s |
| Wave      | The first open of each day                   | An arm up and down, three times                                  |
| Talk      | A line types in, after a badge tap           | The mouth opens and closes                                       |
| Shrug     | A badge at 0                                 | Both arms up                                                     |
| Happy hop | A habit reaches its daily goal               | Crouch, jump, land                                               |
| Dance     | A session is done, or a plan goal is reached | Jumps, a turn, sways, sparkles                                   |

## Lines

A tap on a [streak](week-streak.md) badge makes the star say one line in a speech box, typed letter by letter: "Habits: 12 days! Log one today for 13." When today already counts: "Habits: 13 days. Today counts." At 0 it shrugs: "Activity: 0. Log one this week to start." The line goes 2.6 s after it is fully shown, or at the next tap. The speech box takes no taps, so it never blocks a button.

## The daily welcome

On the first open of each calendar day, the Overview star waves and names the longest streak that is going: "Morning! Habits: day 12", or "Morning!" with none. The date of the welcome is kept in `cwout:lastWelcome`, so a second open that day shows nothing. It covers nothing: you can tap a card while it plays.

## Calm it down

The **Mascot motion** switch in [Personalization](personalization.md) is on by default. Off, there is no welcome and no celebration; the star image, its idle, and its lines stay. With reduced motion on your device, the star stands still, a line shows at once, and nothing celebrates.

### Example

Monday morning, your Habits streak is 12 days. You open the app: the star waves, "Morning! Habits: day 12". You tap the grey `A 0` badge; it shrugs. Tonight you finish Day B, and the star dances above your totals.

## Further reading

- [Overview screen](overview-screen.md): where the star and the badges sit.
- [Tap feel](tap-feel.md): the other moments that need more.
