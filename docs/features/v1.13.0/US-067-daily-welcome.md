[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-067

# US-067 — The Daily Welcome

> **Status:** Built — waiting on hands-on testing · **As built:** `shouldWelcome` and `welcomeLine` in `lines.ts`. The welcome plays when the Overview is shown first on a day, and writes `cwout:lastWelcome` (device only, not in backups). `mascotMotion` joins the settings object, with the switch under Personalization › Feedback. The greeting is always "Morning!", as the spec says, whatever the hour.
>
> **Persona:** Growth-minded user · **Depends on:** [US-066](./US-066-star-talks-streak.md) (the speech line)
>
> **Scope:** [Mascot spec](../../initiatives/mascot/spec.md), in scope 4 (wave), 5, 10.

As a **growth-minded user**, I want the star to wave and greet me on my first open of the day, without anything in my way, so that the app starts my day with a small hello and I can still log in five seconds.

---

## Requirements

1. The welcome
   a. On the first open of each calendar day, the star in the Overview header shall wave, in drawn frames, and say one line.
   b. The line shall name the longest streak that is going: "Morning! Habits: day 12". With no streak going, it shall say "Morning!".
   c. The welcome shall never cover or block the screen; the user can tap and log at once.
   d. A second open on the same day shall show no welcome.
   e. The app shall keep the date of the last welcome on the device.
2. The Mascot motion switch
   a. Settings › Personalization shall have a "Mascot motion" switch, on by default.
   b. With the switch off, there shall be no welcome and no celebration; the star image stays.
   c. With reduced motion, there shall be no wave; the line shows at once.

---

## Acceptance Criteria

1. The welcome
   a. Given the Habits streak is 12 days and the longest one going, when the user opens the app for the first time on Monday, then the star waves and says "Morning! Habits: day 12".
   b. Given the welcome showed this morning, when the user opens the app again at noon, then there is no welcome.
   c. Given the welcome is playing, when the user taps the Habits card, then the Habits screen opens at once.
   d. Given every streak is 0, when the first open of the day comes, then the star says "Morning!".
2. The Mascot motion switch
   a. Given a new install, when the user opens Settings › Personalization, then Mascot motion is on.
   b. Given Mascot motion is off, when the user opens the app for the first time on Tuesday, then there is no welcome, and the star image shows in the header.

---

## Tests

- **The welcome:** the date of the last welcome and now go in; show or not comes out. Cases: no date yet, the same day, the next day.

---

## Related Docs

- [Mascot](../../architecture/mascot.md)
- [Personalization](../../architecture/personalization.md)
- [Settings object](../../architecture/settings-object.md): the new switch
- [Local storage keys](../../architecture/local-storage-keys.md): the date of the last welcome
