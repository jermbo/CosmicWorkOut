[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-065

# US-065 — A Streak for Each Tracker

> **Status:** Built — waiting on hands-on testing · **Persona:** Growth-minded user · **Depends on:** none
>
> **As built:** `computeStreak` and `habitStreakDates` in `src/lib/streak.ts`, tested in `streak.test.ts`; `streakStore` gives the Overview the streaks of the trackers that are on. A habit log counts above 0 (a toggled-off yes/no habit keeps a 0 log); Mood counts at any value. `WeekStreakBadge`, `combinedWeekStreak` and the unused `weekStreakFor` are gone.
>
> **Scope:** [Mascot spec](../../initiatives/mascot/spec.md), in scope 6, 7.
>
> **Changes:** the one week-streak badge of [US-020](../v1.4.0/US-020-practice-streaks-calendar.md).

As a **growth-minded user**, I want a streak badge for each tracker that I use, so that the days that I show up for habits, health or a baseline count as much as a workout week.

---

## Requirements

1. The streaks
   a. Workout, Habits, Activity, Health, and Baselines shall each have their own streak.
   b. Workout, Activity, and Health shall count ISO weeks (Monday to Sunday). Habits and Baselines shall count days.
   c. A Workout week counts with one session; an Activity week with one activity; a Health week with one health reading.
   d. A Habits day counts with one habit log of any habit, Mood included.
   e. A Baselines day counts with one baseline log of any baseline.
   f. The current day or week shall only add to a streak; it shall never break it.
   g. A streak breaks at the first full past day or week with no record.
2. The badges
   a. The Overview header shall show one badge for each streak, in place of the week badge.
   b. Each badge shall have the colour of its tracker and read as its code, the count, and D or W: "T 4W", "H 12D", "A 2W", "P 3W", "B 6D".
   c. A badge shall show only while its tracker toggle is on.
   d. A badge at 0 shall be empty: diagonal stripes, a dashed border, and the count 0: "A 0".
   e. No other screen shall show the badges.

---

## Acceptance Criteria

1. The streaks
   a. Given a habit log on each of the last 12 days and none today, when the Overview opens, then the Habits badge reads "H 12D".
   b. AND given the user logs Water today, then it reads "H 13D".
   c. Given only Mood logs on the last 3 days, when the Overview opens, then the Habits badge reads "H 3D".
   d. Given a weight reading in each of the last 3 weeks and none this week, when the Overview opens, then the Health badge reads "P 3W".
   e. Given sessions in the weeks of 12 and 26 October and none in the week of 19 October, when the Overview opens on 3 November, then the Workout badge reads "T 1W".
2. The badges
   a. Given Activity is on and no activity in the last full week, when the Overview opens, then the Activity badge reads "A 0", striped, with a dashed border.
   b. Given Health is turned off, when the Overview opens, then there is no Health badge.
   c. Given the user opens Habits, when the screen shows, then it has no badges.

---

## Tests

- **Each streak:** the records of one tracker and today go in; the count comes out. Cases: a day unit and a week unit, the current period with no record, a gap in the past, Habits with only Mood, no records.

---

## Related Docs

- [Week streak](../../architecture/week-streak.md): becomes the page of all streaks
- [Overview screen](../../architecture/overview-screen.md)
- [Feature toggles](../../architecture/feature-toggles.md)
- [Glossary](../../glossary.md): "Streak" changes its meaning
