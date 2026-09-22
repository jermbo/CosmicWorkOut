[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-053

# US-053 — Personal Records

> **Status:** Planned — decided in [v1.10.0 — Topic 13](./README.md#topic-13--personal-records). Build after [US-052](./US-052-one-workout-section.md).

As a **fitness user**, I want the app to tell me when I've done something I've never done before
so that I can see I'm getting stronger without digging through old sessions.

---

## Design North Star

> "A record means you beat something."

---

## Key Decisions

| Topic                 | Decision                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What counts**       | A set is a record if you have **never lifted at least that weight for at least that many reps** on that exercise. 135 × 6 counts when your best at 135 was 5 reps; 140 × 3 counts when you've never done 140. |
| **No numeric weight** | Bodyweight and band sets count **reps only** — more reps than ever on that exercise.                                                                                                                          |
| **Scope**             | **Strength only.** No records for activities or baselines (Baselines already rings their best day).                                                                                                           |
| **First time**        | The first session with an exercise **sets the baseline silently** — no records until the second time.                                                                                                         |
| **Where**             | The **completion screen** and an Insights **Records** card. Not on the logging screen for now.                                                                                                                |
| **Not chosen**        | Heaviest-weight-only (ignores reps) and estimated 1-rep max (abstract — lift plans already chose weight × reps).                                                                                              |

---

## Examples

History for Bench Press: 115 × 8, then 135 × 5.

| Next set | Record? | Why                                            |
| -------- | ------- | ---------------------------------------------- |
| 135 × 6  | Yes     | Never done 135 for 6+                          |
| 140 × 3  | Yes     | Never done 140 at all                          |
| 130 × 5  | No      | 135 × 5 already covers "≥130 for ≥5"           |
| 115 × 9  | Yes     | Never done 115 or more for 9+                  |
| 120 × 8  | Yes     | 115 × 8 is too light; 135 × 5 has too few reps |
| 115 × 8  | No      | Done exactly that before                       |

A set is only "covered" by an earlier set that is **both** at least as heavy **and** at least as many reps.

---

## Requirements

1. Detection
   a. A logged strength set with a numeric weight shall be a record when no earlier set of the same exercise has both weight ≥ and reps ≥ it.
   b. A bodyweight or band set shall be a record when its reps are more than any earlier set of that exercise.
   c. An exercise's first logged session shall produce no records.
   d. Records shall be computed from logged sessions — editing or deleting a session shall update them.
2. Completion screen
   a. After Finish, the completion screen shall list the session's records under **New bests**, one line per exercise (the best set), e.g. "Bench Press — 135 × 6".
   b. With no records, the section shall not appear.
3. Insights — Records card
   a. Insights shall have a **Records** card listing records set in the selected range, newest first.
   b. Each line shall show the date, exercise, the record, and what it beat, e.g. "Sep 18 · Bench Press · 135 × 6 (was 135 × 5)".
   c. The card shall follow the range picker and the show / hide setting like every other card, and show an empty state when there are none.
4. Units
   a. Weights shall display in the user's weight unit label, as everywhere else.

> **"What it beat"** is the best earlier set at the same weight when there is one (135 × 5 → 135 × 6); otherwise the heaviest earlier set (135 × 5 → 140 × 3).

---

## Out of Scope

- A "Best: 135 × 6" hint on the logging screen during a session.
- All-time bests table ("what's my best bench, ever?").
- Records for activities, baselines, or time-based items.

---

## Related Docs

- [US-052 — One Workout Section](./US-052-one-workout-section.md)
- [US-054 — This Month Card](./US-054-this-month-card.md)
- [US-033 — Goal Progression Plans](../v1.9.0/US-033-goal-progression-plans.md) — why weight × reps, not 1RM
