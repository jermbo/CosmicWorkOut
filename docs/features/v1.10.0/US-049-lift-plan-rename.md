[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-049

# US-049 — Lift Plan Wording in the UI

> **As built:** Every user-facing "Goal plan(s)" / "Goal progression plan(s)" string now reads **Lift plan(s)**. That covers `/goals` and `/goals/new` (titles, empty states, toasts, "turned off" notes), the Practice hub and group links, the Add Practice sheet, the `/workout` header link (was "Goals") and its "Or start a lift plan" link, and aria labels on the plan card and workout header chip. New backing programs get the description "Lift plan — {weight} x {reps}". Programs created before this keep their old description. Code names (`goalPlanStore`, `GoalPlan`, the `/goals` route) are unchanged.
>
> Closes the [Roadmap](../../roadmap/README.md) item "Lift plan UI rename". Decisions: [v1.10.0 — Topic 9](./README.md#topic-9--lift-plan-wording).

As a **fitness user**, I want the app to call lift plans by one name everywhere
so that I'm not left wondering whether "Goal plans" and "Lift plans" are different things.

---

## Requirements

1. Wording
   a. No screen, toast, page title or aria label shall say "Goal plan" or "Goal progression plan".
   b. Links to `/goals` shall be labelled **Lift plans**.
2. Scope
   a. Code identifiers and routes may keep the old name.
   b. Stored program descriptions shall not be rewritten.

---

## Related Docs

- [Glossary — Lift plan](../../glossary.md#lift-plan)
- [US-033 — Goal Progression Plans](../v1.9.0/US-033-goal-progression-plans.md)
