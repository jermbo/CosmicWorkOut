[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-066

# US-066 — The Star Talks About a Streak

> **Status:** Built — waiting on hands-on testing · **As built:** lines come from `src/lib/mascot/lines.ts`, tested in `lines.test.ts`. Letters type in at 30 ms each; the 2.6 s count starts when the line is fully shown. A tap anywhere but a badge closes it; a badge tap replaces it. The speech box takes no taps.
>
> **Persona:** Growth-minded user · **Depends on:** [US-064](./US-064-meet-the-star.md) (the star), [US-065](./US-065-streak-per-tracker.md) (the badges)
>
> **Scope:** [Mascot spec](../../initiatives/mascot/spec.md), in scope 4 (talk, shrug), 8.

As a **growth-minded user**, I want the star to tell me about a streak when I tap its badge, so that I know where I stand and what keeps the streak going.

---

## Requirements

1. The line
   a. A tap on a badge shall show one line from the star, in a speech box next to it, typed in letter by letter.
   b. The line shall name the tracker, the count, and what makes it grow: "Habits: 12 days! Log one today for 13."
   c. When the current day or week already counts, the line shall say so: "Habits: 13 days. Today counts."
   d. The line shall go after 2.6 s, or at the next tap.
2. The actions
   a. While the line types, the star shall talk: its mouth opens and closes in drawn frames.
   b. On a badge at 0, the star shall shrug, in drawn frames, and the line shall say how to start: "Activity: 0. Log one this week to start."
3. Reduced motion
   a. With reduced motion, the line shall show at once, and the star shall not move.

---

## Acceptance Criteria

1. The line
   a. Given the Habits badge reads "H 12D" and no habit is logged today, when the user taps it, then the star says "Habits: 12 days! Log one today for 13."
   b. Given Water was logged today and the badge reads "H 13D", when the user taps it, then the line says that today counts.
   c. Given a line shows, when 2.6 s pass, then it goes.
2. The actions
   a. Given the Activity badge reads "A 0", when the user taps it, then the star shrugs and says "Activity: 0. Log one this week to start."
3. Reduced motion
   a. Given reduced motion is on, when the user taps a badge, then the full line shows at once and the star stands still.

---

## Related Docs

- [Mascot](../../architecture/mascot.md)
- [Week streak](../../architecture/week-streak.md) (the page of all streaks from US-065)
- [Overview screen](../../architecture/overview-screen.md)
