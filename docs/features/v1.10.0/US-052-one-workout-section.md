[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-052

# US-052 — One Workout Section

> **Status:** Planned — decided in [v1.10.0 — Topic 12](./README.md#topic-12--one-workout-section). Build after [US-051](./US-051-remove-belly-dance.md). Rows marked **Proposed** were filled in while writing this story and still need a yes.

As a **fitness user**, I want one place for my workout plan, with an optional goal,
so that I can stay focused on one plan and see my progress without juggling two features that do the same job.

---

## Why

Today there are two ways to follow a strength plan: **Practice** (programs, reached through a hub and a group page) and **Lift plans** (`/goals`, with their own Settings switch). They share one job: follow routines A/B/C week by week. The only real difference is that a lift plan also has **one focus lift with a goal** that the app turns into weekly targets. So they become one thing: a **plan**, where the goal is optional.

---

## Design North Star

> "One plan at a time. A goal if you want one. One tap to start today."

---

## Key Decisions

| Topic               | Decision                                                                                                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One concept**     | A **plan** is routines A/B/C over a number of weeks. A plan **may have a goal**: one focus lift, where you are now, and a target weight × reps.                                                                                                      |
| **One active plan** | Exactly one plan is active, **enforced** — the point is focus. Starting another asks "Switch to this plan?" and pauses the current one.                                                                                                              |
| **New plan**        | Start from a **template** (one of the six built-in strength programs, copied so it's yours) or **from scratch**. Then: "Working toward a specific lift?" — No / Yes.                                                                                 |
| **Goal timing**     | A goal is set **only when the plan is created**. It can be **removed** later; the plan then carries on as a plain plan to its end. Adding one later is out of scope.                                                                                 |
| **Every plan ends** | A plain plan runs for its weeks; a plan with a goal runs for its wave. At the end: a finish moment, then **Run it again** or **New plan**.                                                                                                           |
| **One switch**      | One Settings switch turns the whole section on or off. The separate Lift plans switch goes away.                                                                                                                                                     |
| **Name**            | **Workout** — tab, Settings row, Overview card. ("Training" was considered; it may mean something else to a wider audience.)                                                                                                                         |
| **URLs**            | See [URL map](#url-map). Old URLs just disappear — no redirects.                                                                                                                                                                                     |
| **Storage**         | **Unchanged.** Programs and goal plans stay as separate records; only the screens merge. A plain plan is a Program; a plan with a goal is a Program with a goal-plan record attached. Merging storage is a possible follow-up once this feels right. |
| **Scaffolds**       | The lift-plan wizard's "Priority week / Focus only / From scratch" scaffolds go away. "Focus only" is just scratch + goal.                                                                                                                           |

---

## URL map

| Today                        | Becomes                  | What it is                                                                         |
| ---------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `/practice` (hub)            | **`/workout`**           | Active plan on top with **Start today's workout**; other plans below; **New plan** |
| `/practice/[groupId]`        | _(gone)_                 | Folded into `/workout`                                                             |
| `/practice/dance`            | _(gone)_                 | Removed by [US-051](./US-051-remove-belly-dance.md)                                |
| `/workout` (today's routine) | **`/workout/today`**     | Today's routine, Start, the logged-session card (Edit / Delete)                    |
| `/goals`                     | _(gone)_                 | Plans with goals are just plans on `/workout`                                      |
| `/goals/new`                 | **`/workout/new`**       | New plan: template or scratch, then optional goal                                  |
| `/program`                   | **`/workout/plan/[id]`** | One plan: weeks, routines, editing, and the goal wave if it has one                |
| `/settings/practice`         | **`/settings/workout`**  | The one on / off switch                                                            |

---

## Screens

```
Workout                                   /workout
┌──────────────────────────────────────┐
│ ACTIVE PLAN                          │
│ Beginner 102 · Week 2 of 4           │
│ Goal: Bench 185 × 5  (if it has one) │
│ Today: B — DB Push & Pull            │
│ [ Start today's workout ]            │
└──────────────────────────────────────┘
Other plans
  My Push/Pull      paused   ›
  Beginner 101      done     ›
[ + New plan ]
```

```
New plan                                  /workout/new
1. Start from     ( Template ▾ | Scratch )
2. Routines       edit A / B / C
3. Goal?          Working toward a specific lift?  [No] [Yes]
                  Yes → focus lift · now (weight × reps) · goal (weight × reps)
4. Review         length, weekly targets (if goal) → [ Start plan ]
```

---

## Requirements

1. Navigation
   a. The bottom-nav tab shall be named **Workout** and open `/workout`.
   b. The Practice hub, the group page, `/goals` and `/program` shall no longer exist; the routes in the [URL map](#url-map) replace them.
   c. Old URLs shall not redirect.
2. Plans list (`/workout`)
   a. The active plan shall show at the top with its week, today's routine, its goal (if any), and **Start today's workout**.
   b. Other plans shall be listed below with their state (paused / done) and open their plan page.
   c. With no plans, the screen shall offer **New plan**.
3. One active plan
   a. At most one plan shall be active.
   b. Activating another plan shall ask for confirmation and pause the current one.
4. New plan (`/workout/new`)
   a. The user shall start from one of the built-in templates (copied before use) or from scratch.
   b. The user shall be asked whether they are working toward a specific lift. **No** creates a plain plan.
   c. **Yes** shall ask for a focus lift, where they are now (weight × reps) and the goal (weight × reps), and generate the weekly wave as lift plans do today.
   d. The review step shall show the plan's length and, with a goal, its weekly targets, before **Start plan**.
   e. Starting a new plan shall make it the active plan (with the switch confirmation from 3b when another is active).
5. Goals
   a. A goal shall only be set when a plan is created.
   b. A goal shall be removable from the plan page; the plan then continues as a plain plan to its original end.
   c. While a goal is active, `/workout/today` shall show that week's target for the focus lift, as today.
6. Plan end
   a. When a plan's last session is logged, `/workout` and `/workout/today` shall show a finish moment with **Run it again** and **New plan**.
   b. **Run it again** shall restart the plan's session count; records and history are kept.
7. Settings
   a. Settings shall have one **Workout** row and page (`/settings/workout`) with a single on / off switch covering the whole section.
   b. The Lift plans switch shall be removed.
8. Wording
   a. The UI shall say **plan** and **goal**. "Lift plan", "Practice" and "program" shall not appear as separate concepts.
9. Data
   a. No stored record shall change shape.

---

## Proposed — confirm while reading

| #   | Detail                              | Proposal                                                                                                                                                          |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **"Lift plan" as a word**           | Retires from the UI. A plan either has a **Goal** or doesn't. (US-049 put "Lift plan" everywhere a few hours ago — this replaces it.)                             |
| P2  | **Which lift can be the focus**     | Any exercise already in the plan's routines. From scratch, you add exercises first, then pick.                                                                    |
| P3  | **Supporting lifts in a goal plan** | Behave as they do in lift plans today (climb by their increment each week). Plain plans keep last-used prefill.                                                   |
| P4  | **Run it again, with a goal**       | Repeats the **last block** of the wave (today's "Repeat block"), not the whole wave from the start weight — starting over would drop you back to where you began. |
| P5  | **Plain plan length**               | Template: its own weeks (the built-ins are 4). Scratch: the weeks field you have today (1–52, default 12).                                                        |
| P6  | **Data & backup clear rows**        | "Custom programs" → **Custom plans**; "Lift plans" → **Plan goals** (clears goals, keeps the plans).                                                              |
| P7  | **Overview card**                   | Named **Workout**; shows the active plan and today's routine, as the Practice card does now.                                                                      |

---

## Out of Scope

- Adding or changing a goal on an existing plan.
- "Copy one of my plans" as a starting point.
- Several active plans.
- Merging Program and goal-plan storage into one record.

---

## Related Docs

- [US-033 — Goal Progression Plans](../v1.9.0/US-033-goal-progression-plans.md) — the wave generator this keeps
- [US-021 — Practice Groups & Plans](../v1.4.0/US-021-practice-groups-plans.md) — the hub this replaces
- [US-045 — Settings Feature Hub](./US-045-settings-feature-hub.md)
- [US-051 — Remove Belly Dance](./US-051-remove-belly-dance.md)
- [Program Management](../../requirements/program-management.md)
