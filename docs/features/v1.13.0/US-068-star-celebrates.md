[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-068

# US-068 — The Star Celebrates

> **Status:** Built — waiting on hands-on testing · **As built:** `planGoalReached` (`src/lib/goalPlans/goalReached.ts`) and `reachesDailyGoal` (`src/lib/mascot/celebrate.ts`), each tested. The result screen shows the dancing star in place of the check mark, after the bars; with Mascot motion off or reduced motion, the check mark shows. A reached goal also makes the subtitle read "Goal reached." `habitStore.logValue` asks `mascotStore` for a peek when a log crosses the goal; `MascotPeek` in the layout comes up on the side away from the last tap, by whole star pixels.
>
> **Persona:** Fitness user · **Depends on:** [US-064](./US-064-meet-the-star.md) (the star), [US-067](./US-067-daily-welcome.md) (the Mascot motion switch)
>
> **Scope:** [Mascot spec](../../initiatives/mascot/spec.md), in scope 4 (happy hop, dance), 9. Decision 15 is open to change after use.

As a **fitness user**, I want the star to come and celebrate when I finish a session, reach my plan goal, or hit a habit's goal, so that the moments that I worked for feel like a win.

---

## Requirements

1. A session is done
   a. On the session result screen, the star shall dance above the totals, in drawn frames, with drawn sparkles.
   b. The dance shall play once; the totals and the buttons stay usable while it plays.
2. A plan goal is reached
   a. A plan goal counts as reached in the session in which the focus lift is logged at the goal weight × reps, or more.
   b. On the result screen of that session, the star shall dance.
3. A habit reaches its daily goal
   a. When a habit reaches its daily goal, the star shall peek up above the bottom bar, do a happy hop, and drop away.
   b. It shall not cover the habit that the user is logging.
4. No celebration
   a. One logged set, or a habit log under its goal, shall not bring the star.
   b. With Mascot motion off, or with reduced motion, there shall be no celebration.

---

## Acceptance Criteria

1. A session is done
   a. Given Day B is in progress, when the user finishes it, then the result screen shows the star dancing above the totals.
2. A plan goal is reached
   a. Given a goal of Bench Press 185 × 5, when the user logs Bench Press at 185 × 5 and finishes, then the star dances on the result screen.
   b. Given the same goal and a log of 185 × 4, when the rule decides, then the goal is not reached (an automatic test; the session-done dance still plays).
3. A habit reaches its daily goal
   a. Given Water at 3 of its goal of 4 cups, when the user taps plus, then the star peeks up above the bottom bar, hops, and drops away.
   b. Given Water at 1 of 4, when the user taps plus, then the star does not come.
4. No celebration
   a. Given Mascot motion is off, when the user finishes Day B, then the result screen shows no star.

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
