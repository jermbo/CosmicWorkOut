---
name: CosmicWorkOut wiki
description: 'What CosmicWorkOut is, the parts it has, and where to start reading.'
altitude: overview
tags:
  - home
---

Wiki

# CosmicWorkOut wiki

CosmicWorkOut is a training notebook on your phone. You follow a strength plan and log the rest of your day, and every record stays on the device. This wiki tells how the app works, one page for each part.

## What the app is for

Most fitness apps are too simple or too large, and most need a connection. This app keeps one promise: you log what you did in less than five seconds, with one hand, also with no network. The [vision](vision.md) tells why, and the [design principles](principles.md) give the tests for each decision.

## The parts of the app

Each tracker is off on a new device. You turn on the trackers that you want, and a toggle that is off only hides its screens. The page [feature toggles](architecture/feature-toggles.md) tells how this works.

- **[Workout](architecture/workout.md)** guides you through one multi-week strength plan, one session at a time.
- **[Habits](architecture/habits.md)** count daily things such as water and reading, plus a mood check-in.
- **[Activity log](architecture/activity-log.md)** keeps short records of runs, sports, and yoga.
- **[Baselines](architecture/baselines.md)** compare what you did each day with a low floor that you set.
- **[Health metrics](architecture/health-metrics.md)** keep weight and blood pressure.

Three parts are always on. The [Overview screen](architecture/overview-screen.md) shows the day at a glance. [Insights](architecture/insights.md) draws charts of all your records. [Settings](architecture/settings.md) holds the toggles, the personal options, and the backups.

## How the app is built

The app has no server. It runs in the browser, keeps data in the browser, and works offline after the first visit. The [system](architecture/system.md) page shows how the pieces connect, and [data and backup](architecture/data-and-backup.md) tells how your records leave one device and arrive on the next.

## How to read and write this wiki

Each page explains one thing at one altitude: the full picture, one part, one mechanism, or one exact rule. Start at a part, and follow a link down when you need more. The [glossary](glossary.md) gives the one word for each thing. The [project facts](standards/project.md) give the commands and the doc rules. Stories for each release are in the [features list](features/README.md). Design files for the look are in [inspiration](_inspiration).

## Further reading

- [Working agreement](standards/working-agreement.md): how code is written in this repo.
- [User story standards](standards/user-story-standards.md): the form of a story.
