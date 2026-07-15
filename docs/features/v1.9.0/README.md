# v1.9.0 — Goal Progression Plans

## Design North Star

> "Set a goal. Follow the wave. Get stronger without breaking yourself."

---

## What This Is

A **new program type** for the Strength discipline — distinct from today's course programs (e.g. Strength Foundation). The user picks a **focus exercise**, sets a **target weight × reps** (e.g. bench 250×5, deadlift 500×1), confirms a **starting point**, and the app **generates** a multi-month plan built from repeating **4-week wave blocks**.

Each plan instance is **isolated** (Max Bench 01, Max Bench 02, Max Deadlift 01 are separate records) so future visualizations can review or compare stints. The existing A → B → C → A session rotation and count-driven progression are unchanged.

Today's strength programs keep working as-is: manual weight via last-used prefill, no auto periodization.

---

## What's Planned

| Area                           | Detail                                                                 | Story                                        |
| ------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| Goal plan creation             | Template → focus + goal + starting point → generated blocks & timeline | [US-033](./US-033-goal-progression-plans.md) |
| Wave loading (focus)           | 4-week blocks: build → build → peak → deload; chain blocks toward goal | US-033                                       |
| Light progression (supporting) | Weekly +`weightIncrement` bumps; no full wave                          | US-033                                       |
| Block repeat                   | Re-run the **current** 4-week block from week 1                        | US-033                                       |
| Plan lifecycle                 | Active · Completed · Paused; one active goal plan at a time            | US-033                                       |
| Starter templates              | Built-in templates to scaffold A/B/C exercise lists                    | US-033                                       |
| Settings toggle                | Master on/off switch; off hides all UI, data persists                  | US-033                                       |

---

## Key Decisions (locked in design)

| Topic                   | Decision                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Program type**        | New goal-driven plan — not retrofitted onto every exercise in course programs                                                 |
| **Focus vs supporting** | One focus exercise per plan gets the full wave; all other exercises progress weekly via `weightIncrement`                     |
| **Goal format**         | Specific weight × reps per plan (user-defined: 250×5 bench, 500×1 deadlift, etc.)                                             |
| **Starting point**      | Prefill from session history when available; user confirms or overrides; manual entry when no history                         |
| **Timeline**            | App estimates 3–6 months from start → goal based on block count; longer gap = more blocks                                     |
| **Schedule**            | Same A → B → C → A rotation and count-driven week advance as today                                                            |
| **Increments**          | Reuse existing per-item `weightIncrement` (already on items; tune built-in defaults as needed)                                |
| **Repeat**              | First-class action: re-run the **current block** only (not a single week, not an earlier block)                               |
| **Plan instances**      | Each stint is its own plan record — back-to-back bench stints are separate instances                                          |
| **Naming**              | Auto-generated name with optional rename; exact format **TBD**                                                                |
| **Lifecycle end**       | User chooses **Complete** or **Pause**; resting = simply not training (plan holds position)                                   |
| **Concurrency**         | **One active goal plan at a time** — stated explicitly in product rules                                                       |
| **Optional feature**    | Settings master toggle (like [health metrics](../v1.7.0/US-029-health-metrics.md)); default **off**; off = no UI, data kept   |
| **Modularity**          | Self-contained module — own code, store, and storage; course programs work unchanged when off; removable without gutting core |
| **Data for later**      | Capture full plan metadata per instance for future charts/comparisons; visualizations **not** in v1.9.0                       |

---

## Deferred / Future

| Item                             | Notes                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Plan-switching handoff           | What happens when starting a new plan while another is active — complete vs auto-pause first |
| Auto-name format                 | Agreed pattern (auto + rename); wording not decided                                          |
| Pro-authored templates           | v1.9.0 ships built-in starter templates; professional plans come later                       |
| Plan comparison UI               | Data model should support it; Insights/charts are a follow-on                                |
| Supporting-exercise rep scheme   | Weekly weight bumps locked; whether reps stay flat or adjust is **TBD** at implementation    |
| Coexistence with course programs | v1.9.0 assumes goal plan is the active strength plan when running                            |

---

## Planned Stories

| ID                                           | Title                  | Status  |
| -------------------------------------------- | ---------------------- | ------- |
| [US-033](./US-033-goal-progression-plans.md) | Goal Progression Plans | Planned |

---

## Related

- [US-033 — Goal Progression Plans](./US-033-goal-progression-plans.md)
- [US-029 — Health Metrics](../v1.7.0/US-029-health-metrics.md) — reference toggle pattern
- [Program Progression](../../implementation/program-progression.md) — Existing count-driven rotation (unchanged)
- [Program Management](../../requirements/program-management.md) — Course programs (unchanged)
- [Glossary](../../glossary.md) — Goal plan, progression block, focus exercise
- [Roadmap](../../roadmap/README.md) — Training intelligence
- [Implementation Status](../../implementation/status.md)
