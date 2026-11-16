---
name: Mascot — spec
description: 'The agreed scope of Phase 1 of the Mascot: a pixel star that is the face of the app, a streak badge for each tracker, and drawn-frame celebrations.'
status: agreed
---

[Wiki](../../README.md) › [Backlog](../../features/backlog.md) › Mascot › Spec

# Spec: Mascot, Phase 1

Reasons are in the [decision log](decision-log.md). Words are in the [glossary](glossary.md). This spec is Phase 1. The Pet (Phase 2) gets its own round of questions after Phase 1 is in use (decision 9).

## The problem

You check in on your habits every day, but the only streak in the app counts weeks of workouts. So the days that you show up for water, mood or a baseline earn nothing that you can see. The app records well, but nothing in it is glad that you came back.

## The solution

A small pixel star lives in the app. It is the icon on your home screen, and it sits in the Overview header next to a row of streak badges, one for each tracker that you use.

On Monday morning you open the app. The star waves: "Morning! Habits: day 12". You tap the coral **H 12D** badge, and it says "Habits: 12 days! Log one today for 13." The Activity badge reads **A 0**, striped, and the star shrugs when you tap it. Tonight you finish Day B; the result screen opens, and the star runs in and dances above your totals.

## In scope

1. The Mascot is an original pixel star in the yellow of Health, with a face that blinks, looks around, and blushes (decisions 1, 2)
2. The star is the favicon, the home-screen app icon, and an image in the Overview header (decision 3)
   - a. The image shows even when Mascot motion is off (decision 4)
3. The star moves only in drawn frames, in whole pixels, never rotated or stretched (decision 13)
   - a. Each frame is a pixel map, drawn as SVG; the icons come from the same drawing (decision 19)
4. The star's actions: idle, wave, talk, happy hop, dance, shrug (decision 17), and its ways in and out (decisions 23, 24)
   - a. Idle: it breathes, does a bit of personality at random times, and sleeps when left alone (decisions 17, 24)
5. On the first open of each day, the star waves in the Overview header with one line, and it never blocks the screen (decision 14)
   - a. The line names your longest streak that is going (decision 22)
6. Each tracker has its own streak: Workout, Habits, Activity, Health, Baselines (decision 7)
   - a. Workout, Activity, and Health count weeks; Habits and Baselines count days (decision 7 a)
   - b. The current day or week only adds; it never breaks a streak (decision 7 b)
   - c. A Habits day counts when you log your mood or any habit (decision 7 c)
   - d. A Baselines day counts when you log toward any baseline (decision 20)
7. The Overview header shows one badge for each streak, in the colour of its tracker, in place of the week badge (decision 8)
   - a. A badge shows only while its tracker toggle is on (decision 8)
   - b. A badge at 0 is empty: diagonal stripes and a dashed border (decision 8 a)
   - c. A badge reads as the code, the count, and D or W: "H 12D" (decision 21)
8. A tap on a badge makes the star say one line about that streak; at 0 it shrugs (decisions 8 b, 17)
9. The star celebrates three moments, and it comes to the screen of the moment (decision 15, open to change)
   - a. A session is done: it dances on the session result screen, above the totals (decision 15 a)
   - b. A plan goal is reached, which is the session in which you log the focus lift at the goal weight × reps or more: it dances (decision 15 b)
   - c. A habit reaches its daily goal: it comes in along the bottom bar, hops, and leaves, a random way each time (decisions 15 a, 23, 24)
10. A "Mascot motion" switch in Settings › Personalization, on by default, turns off the welcome and the celebrations (decision 16)
    - a. With reduced motion, the star shows still frames (decision 16)

## Out of scope

1. The Pet: mood, level, sadness, sleep, poke, pet, and level up (decisions 6, 9)
2. A move for each streak on a badge tap: lift, check, heartbeat, run, stretch (decision 17; Phase 2)
3. A full-screen welcome (decision 14)
4. Any new full-page motion; the page change stays as today, with the gliding tab block that is built already (decision 18)
5. Motion by rotating, squashing, or stretching the pixels (decision 13)
6. A crab, an alien, or a flame (decisions 1, 2)
7. Badges on any screen but the Overview (decision 8)
8. A celebration for a small moment, such as one logged set (decision 15)

## What changes in the system

| Page                                                                                                               | The change                                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Mascot (new, `architecture/`)                                                                                      | The star: its drawing, its actions, where it shows, and the motion switch                       |
| [Week streak](../../architecture/week-streak.md)                                                                   | Becomes the page of all streaks: one for each tracker, its unit, and its rule for a day or week |
| [Overview screen](../../architecture/overview-screen.md)                                                           | The header has the star and the row of badges                                                   |
| [Tap feel](../../architecture/tap-feel.md)                                                                         | The celebrations of the star join "Moments that need more"                                      |
| [Session lifecycle](../../architecture/session-lifecycle.md), [Goal wave](../../architecture/goal-wave.md)         | The result screen shows the star; when a plan goal counts as reached                            |
| [Habits](../../architecture/habits.md)                                                                             | A habit at its goal brings the star running along the bottom bar                                |
| [Personalization](../../architecture/personalization.md), [Settings object](../../architecture/settings-object.md) | The Mascot motion switch                                                                        |
| [Local storage keys](../../architecture/local-storage-keys.md)                                                     | One key for the date of the last welcome                                                        |
| [Design system](../../architecture/design-system.md)                                                               | The star and the app icons                                                                      |
| [Glossary](../../glossary.md)                                                                                      | "Mascot" is new; "Streak" now means one streak for each tracker                                 |

**Stored data.** No record and no store changes: each streak is counted from the records that exist. The settings get one switch, and localStorage gets one key. Nothing here is a one-way door.

## How you test it

| Scope    | How you know that it works                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------- |
| 1, 2     | The home-screen icon, the browser tab, and the Overview header show the star                            |
| 3, 4     | Each action plays as drawn frames; nothing tilts or stretches                                           |
| 5        | The first open today waves with a line; a second open today does not                                    |
| 6, 7     | With Habits logged 12 days in a row, the coral badge reads "H 12D"; turn Habits off and the badge goes  |
| 7 b      | A tracker with no streak shows a striped badge at 0                                                     |
| 8        | Tap each badge; the star says its line; at 0 it shrugs                                                  |
| 9 a, 9 b | Finish a session, and one where the focus lift hits the goal; the star dances on the result screen      |
| 9 c      | Log Water to its goal on the Habits screen; the star runs in, hops, and jumps off                       |
| 10       | Turn Mascot motion off: no welcome, no celebrations, the image stays. With reduced motion, still frames |

**Worth an automatic test** (pure modules, as the project tests today):

- **Each streak:** the records of one tracker and today go in; the count comes out. It covers a week and a day unit, the current period with no log, a gap in the past, Habits with only mood, and no records.
- **The welcome:** the date of the last welcome and now go in; show or not comes out.
- **A plan goal reached:** a finished session and the goal go in; yes or no comes out. It covers more weight than the goal, the goal weight with fewer reps, and a plan with no goal.
