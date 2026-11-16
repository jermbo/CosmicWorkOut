[Wiki](../../README.md) › [Backlog](../../features/backlog.md) › Mascot › Decision log

# Decision log: Mascot

The owner wants a small pet in the app, inspired by the Claude crab: it shows on the loading screen, dances when you do something good, and can grow over time. This page records the decisions for it.

## The state of today

| Part               | Fact                                                                                                                                                  | Where                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Loading screen     | A spinner with "Loading…". The app shows no screen until the database, settings and stores are ready. On a phone this is often under a second         | `src/routes/+layout.svelte`, [Boot](../../architecture/boot.md) |
| Moments of success | Named feedback kinds: `success` (a set is logged; a habit reaches its goal) and `win` (an exercise is done; the session is done)                      | [Tap feel](../../architecture/tap-feel.md)                      |
| Big moments        | A stamp when an exercise is done; five coloured bars sweep the screen when a session is done                                                          | [Tap feel](../../architecture/tap-feel.md)                      |
| Reduced motion     | When the device asks for it, motion does not run                                                                                                      | [Tap feel](../../architecture/tap-feel.md)                      |
| Streak             | The week streak on the Overview: weeks in a row with a session. The current week cannot break it, so it never punishes Monday                         | [Week streak](../../architecture/week-streak.md)                |
| "Goal"             | In the glossary, a goal is a target on a plan (one focus lift at a weight × reps). A habit also has a "daily goal"                                    | [Glossary](../../glossary.md)                                   |
| Mascot or pet      | None. No art assets except the app icons                                                                                                              | `static/`                                                       |
| The vision limits  | "A personal notebook, not a fitness product". Small surface area: remove a thing before you add one. Tactile feedback "is why people continue to log" | [Vision](../../vision.md), [Principles](../../principles.md)    |

## Decisions

### The character

1. **The Mascot is an original character of CosmicWorkOut.** Its style is inspired by the Claude crab (simple shapes, small and friendly), but it is not a crab and not a copy. The reason: it must fit this app, and the crab belongs to Anthropic. An option that was rejected: a crab.
2. **The Mascot is a star.** A small pixel star in the yellow of Health, with a face: eyes that blink and look around, a mouth, and blush on happy moments. The reason: the owner chose it from a prototype of three looks, and a star fits "Cosmic". Options that were rejected: an alien (green, with antennae); a living flame.
3. **The Mascot is the face of the app: the favicon, the home-screen app icon, and the Overview header.** The reason: one character across the whole app. An option that was rejected: keep the app icon of today.
4. **Two words: Mascot and Pet.** The Mascot is the character everywhere. The Pet is the part that you interact with, with mood and level, behind the Pet toggle. The image in the favicon, the app icon and the header always shows. The reason: one word for each thing; some users want a calm app, but the brand stays the same.

### Phases

5. **Phase 1 ships first: the Mascot and the streak badges.** The look, the favicon, app icon and header, the daily welcome, the dance on big moments, and one streak badge for each tracker. The reason: the owner wants to see the streaks work first, and they do not need the Pet. An option that was rejected: badges in Phase 2 with the Pet.
6. **Phase 2 follows: the Pet.** Mood, level, how it reacts to each streak, and tapping it.

### Streaks

7. **Each tracker has its own streak: Workout, Habits, Activity, Health, Baselines.** Each one counts apart, and each one resets when it breaks. The reason: the week streak today counts only workouts, so a user who checks in on habits each day gets nothing.
   - a. **Each streak counts in the time that fits it.** Workout: weeks, as today. Habits: days. Baselines: days, because a baseline is a daily floor. Activity: weeks. Health: weeks, because many people weigh once a week. An option that was rejected: every streak in days, which would break a health streak all the time.
   - b. **The current day or week never breaks a streak.** It can only add, as the week streak does today. The reason: no streak falls to zero in the morning before you log.
   - c. **A Habits day counts when you log your mood or any habit.** Only a day with no habit log at all breaks it. The reason: many habits are things that you track, not targets; a day with no coffee is not a miss. Options that were rejected: mood only; only habits with a daily goal, when the goal is met.
8. **Each streak has its own badge, in the colour of its tracker, in the Overview header only.** The row of badges takes the place of the one week badge. A badge shows only while its tracker toggle is on. The reason: the badges should be fun to see and bring you back, and every other page stays clean. This changes the [Week streak](../../architecture/week-streak.md) page, which tells of one badge. An option that was rejected: the badges in the header of every page.
   - a. **A streak at 0 shows as an empty badge,** with the diagonal stripes and dashed border that mean "not logged yet" across the app. The reason: you see which streak to start again. An option that was rejected: hide a badge at 0.
   - b. **In Phase 1, a tap on a badge makes the star say one short line about that streak,** such as "Habits: 12 days. Log one today for 13." In Phase 2, the Pet also reacts to it. An option that was rejected: no tap until Phase 2.

### Mood and growth (Phase 2)

9. **The Pet is decided after Phase 1 is in use.** Its mood, level and tapping get their own round of questions then. The decisions below are its starting point. The reason: the owner wants to feel the Mascot first.

10. **The Pet never dies, but it can be sad.** Its model mixes a streak (it resets) with needs (it reacts to how you care for it). The reason: being sad pushes you to come back, and death is too harsh for a personal notebook. Options that were rejected: growth only, which never shows sadness; a pet that dies.
11. **Level comes from all your logging and never goes down.** The reason: growth that you never lose. An option that was rejected: missed days lower the level.
    - a. Any record counts toward the level: a set, a habit, an activity, a health reading, a baseline log. An option that was rejected: only workouts count.
12. **The Pet is sad after 2 days with nothing logged. One log makes it happy again, with a dance.**

### Motion

13. **The Mascot moves in drawn frames, like a game sprite.** Each action is 4 to 8 frames of pixel art, played in steps. The pixels are never rotated or stretched. The reason: two prototypes moved one drawing with tweens (rotation, squash and stretch, springs), and the owner found both "stiff, cheesy, and uninspired"; pixel art looks cheap when it is bent. The Claude crab works because each pose is drawn. An option that was rejected: a smooth vector star that can stretch and bend.
14. **The daily welcome happens in place, on the Overview.** On the first open of each day, the star waves in the Overview header with a short line, such as "Morning! Habits: day 12". It never blocks the screen. The reason: the app promises a log in five seconds, and a full-screen welcome stands in the way. Options that were rejected: a full-screen welcome once a day that you tap to skip (shooting star, or sunrise wake-up).
15. **Three moments make the Mascot celebrate.** A session is done, and a plan goal is reached: it dances. A habit reaches its daily goal: it does a happy hop. Smaller moments, such as one logged set, do not. **This decision is open to change:** the owner wants to try it in use first.
    - a. **The star comes to the moment.** On the session result screen, it dances above the totals. When a habit reaches its goal, it peeks up above the bottom bar, hops, and drops away. The reason: the star lives in the Overview header, and these moments happen on other screens. Options that were rejected: save the celebration for the next visit to the Overview; celebrate only on the Overview.
    - b. **"A plan goal is reached" is the session in which you log the focus lift at the goal weight × reps, or more.** The reason: the app has no such moment today, and this is the one that a lifter feels.

16. **A "Mascot motion" switch in Settings › Personalization turns off the welcome and the dances.** The star still shows in the icons and the header. It is on by default. With reduced motion, the star shows still frames. The reason: some users want a calm app.
17. **The range of actions is the one in the gallery prototype.** Phase 1: idle, wave, talk, happy hop, dance, and shrug (a badge at 0). Phase 2: one move for each streak on a badge tap (Workout lifts a dumbbell, Habits pops a check mark, Health shows a beating heart, Activity runs in place, Baselines stretches), and the Pet's sad, cheer up, sleep, level up, poke, and pet. Each one is drawn frames only. The reason: the owner saw all of them loop side by side and said "love it". An option that was rejected: four actions only (idle, wave, hop, dance).

### Screens

18. **The change from one screen to the next was reviewed, and only the tab bar gets livelier.** The reason: the owner felt that the screens "jump around" and wanted the app to feel alive, but no full-page motion beat today's. The variants were tried in the real app, before the Mascot's motion, because the page change is the motion that you see most.
    - a. **The page change stays as it is today, with one addition: the paper block of the current tab glides to the new tab.** It moves with a small spring, and the labels cross-fade inside it. The owner liked it in a prototype and wants nothing more. This decision is built, and the [Navigation](../../architecture/navigation.md) page tells it.
    - b. **Six variants were rejected.** A push in the direction of travel: "a bit amateurish". The blocks of the page rising in turn: it did not run, so it could not be judged. A wipe in the colour of the part: the part colours are used too often already. The page that sinks into its shadow: it did not work on every page. A title that flips like a departure board, and a scan line that prints the new page: not better than today.

## Choices that are not confirmed

1. **Each frame is a pixel map in the code, drawn as SVG.** The favicon and the app icon come from the same drawing. The reason: no image files to keep in step, and the frames stay sharp at every size.
