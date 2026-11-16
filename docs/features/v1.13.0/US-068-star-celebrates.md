[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-068

# US-068 — The Star Celebrates

> **Status:** Built — waiting on hands-on testing · **As built:** `planGoalReached` (`src/lib/goalPlans/goalReached.ts`) and `reachesDailyGoal` (`src/lib/mascot/celebrate.ts`), each tested. The result screen shows the star in place of the check mark: after the bars, it runs in and dances; with Mascot motion off or reduced motion, the check mark shows. A reached goal also makes the subtitle read "Goal reached." `activityStore.add`, `healthStore.addBloodPressure`, `healthStore.logWeight` (a new day only) and `baselineStore.addEntry` ask `mascotStore.celebrateLog` for the same celebration. `habitStore.logValue` asks `mascotStore` for a celebration when a log crosses the goal; `MascotPeek` in the layout brings the star in along the bottom bar from the side away from the last tap, hops, and sends it off, a random way in and out each time, by whole star pixels (decisions 23, 24).
>
> **Persona:** Fitness user · **Depends on:** [US-064](./US-064-meet-the-star.md) (the star), [US-067](./US-067-daily-welcome.md) (the Mascot motion switch)
>
> **Scope:** [Mascot spec](../../initiatives/mascot/spec.md), in scope 4 (happy hop, dance), 9. Decision 15 is open to change after use.

As a **fitness user**, I want the star to come and celebrate when I finish a session, reach my plan goal, or hit a habit's goal, so that the moments that I worked for feel like a win. Every new log in Activity, Health, and Baselines brings it too.

---

## Requirements

1. A session is done
   a. On the session result screen, the star shall run in and dance above the totals, in drawn frames, with drawn sparkles.
   b. The dance shall play once; the totals and the buttons stay usable while it plays.
2. A plan goal is reached
   a. A plan goal counts as reached in the session in which the focus lift is logged at the goal weight × reps, or more.
   b. On the result screen of that session, the star shall dance.
3. A habit reaches its daily goal
   a. When a habit reaches its daily goal, the star shall come in along the top of the bottom bar, do a happy hop, and leave. The way in and the way out are random, and never the same as the time before.
   b. It shall not cover the habit that the user is logging.
   c. A habit with no goal (or a goal of 0), and a Yes / No habit, reaches its goal with its first log of the day, as its card shows it done.
4. No celebration
   a. One logged set, or a habit log under its goal, shall not bring the star.
   b. With Mascot motion off, or with reduced motion, there shall be no celebration.
5. A new log in another tracker (decision 25)
   a. A new activity, a blood pressure reading, the day's first weigh-in, and a new baseline entry shall each bring the star, the same way as a habit goal.
   b. An edit to a log, and a second weigh-in on the same day, shall not.

---

## Acceptance Criteria

1. A session is done
   a. Given Day B is in progress, when the user finishes it, then the star runs in on the result screen and dances above the totals.
2. A plan goal is reached
   a. Given a goal of Bench Press 185 × 5, when the user logs Bench Press at 185 × 5 and finishes, then the star dances on the result screen.
   b. Given the same goal and a log of 185 × 4, when the rule decides, then the goal is not reached (an automatic test; the session-done dance still plays).
3. A habit reaches its daily goal
   a. Given Water at 3 of its goal of 4 cups, when the user taps plus, then the star comes in along the bottom bar, hops, and leaves.
   b. Given Water at 1 of 4, when the user taps plus, then the star does not come.
   c. Given Coffee with a goal of 0 and nothing logged today, when the user taps plus, then the star comes; on the next tap, it does not.
4. No celebration
   a. Given Mascot motion is off, when the user finishes Day B, then the result screen shows no star.
5. A new log in another tracker
   a. Given the Activity sheet, when the user saves 30 min of Pickleball, then the star comes in, hops, and leaves.
   b. Given today's weight is logged, when the user changes it, then the star does not come.

---

## Tests

- **A plan goal reached:** a finished session and the goal go in; yes or no comes out. Cases: more weight than the goal, the goal weight with fewer reps, a plan with no goal.

---

## Related Docs

- [Mascot](../../architecture/mascot.md)
- [Session lifecycle](../../architecture/session-lifecycle.md)
- [Goal wave](../../architecture/goal-wave.md)
- [Habits](../../architecture/habits.md)
- [Tap feel](../../architecture/tap-feel.md): "Moments that need more"
