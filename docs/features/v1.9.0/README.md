# v1.9.0 — Lift Plans & Baselines

Two opt-in tracks in this release:

1. **Lift plans** (shipped as “Goal progression plans”) — Strength wave-loading toward a lift target
2. **Baselines** — daily floor/ceiling growth tracking

Vocabulary: [Glossary — Lift plan](../../glossary.md#lift-plan) · [Glossary — Baseline](../../glossary.md#baseline)

---

## Part A — Lift plans (built)

### Design North Star

> "Set a goal. Follow the wave. Get stronger without breaking yourself."

### What This Is

A **new program type** for the Strength discipline — distinct from today's course programs (e.g. Strength Foundation). The user picks a **focus exercise**, sets a **target weight × reps** (e.g. bench 250×5, deadlift 500×1), confirms a **starting point**, and the app **generates** a multi-month plan built from repeating **4-week wave blocks**.

Each plan instance is **isolated** (Bench Goal 01, Bench Goal 02, Deadlift Goal 01 are separate records) so future visualizations can review or compare stints. The existing A → B → C → A session rotation and count-driven progression are unchanged.

Today's strength programs keep working as-is: manual weight via last-used prefill, no auto periodization.

**UI name:** Prefer **Lift plans**. Routes/code may still say `goalPlan` / `/goals`.

### What's Shipping (Lift plans)

| Area                           | Detail                                                                 | Story                                        |
| ------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| Goal plan creation             | Scaffold → focus + goal + starting point → generated blocks & timeline | [US-033](./US-033-goal-progression-plans.md) |
| Wave loading (focus)           | 4-week blocks: build → build → peak → deload; final peak snaps to goal | US-033                                       |
| Light progression (supporting) | Weekly +`weightIncrement` bumps; reps stay flat                        | US-033                                       |
| Block repeat                   | Re-run the **current** 4-week block from week 1                        | US-033                                       |
| Plan lifecycle                 | Active · Completed · Paused; one active goal plan at a time            | US-033                                       |
| Starter scaffolds              | Priority week / Focus only / From scratch                              | US-033                                       |
| Settings toggle                | Master on/off switch; off hides all UI, data persists                  | US-033                                       |

### Key Decisions (as built)

| Topic                   | Decision                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Program type**        | New goal-driven plan — not retrofitted onto every exercise in course programs                                                     |
| **Focus vs supporting** | One focus exercise per plan gets the full wave; all other exercises progress weekly via `weightIncrement`                         |
| **Goal format**         | Specific weight × reps per plan (user-defined: 250×5 bench, 500×1 deadlift, etc.)                                                 |
| **Starting point**      | Prefill from session history when available; user confirms or overrides; manual entry when no history                             |
| **Timeline**            | App estimates months from block count; farther start→goal = more blocks (capped at 12)                                            |
| **Schedule**            | Same A → B → C → A rotation and count-driven week advance as today                                                                |
| **Increments**          | Reuse existing per-item `weightIncrement` (frozen on the plan at generation)                                                      |
| **Repeat**              | First-class action: re-run the **current block** only (not a single week, not an earlier block)                                   |
| **Plan instances**      | Each stint is its own plan record — back-to-back bench stints are separate instances                                              |
| **Naming**              | Auto-name `"<Focus> Goal NN"` + optional rename                                                                                   |
| **Lifecycle end**       | User chooses **Complete** or **Pause**; resting = simply not training (plan holds position)                                       |
| **Concurrency**         | **One active goal plan at a time**; activating it makes its backing program the **sole active Strength program**                  |
| **Backing programs**    | Generated `Program` rows power rotation/sessions but are hidden from Add Practice / Programs / plan pickers — managed on `/goals` |
| **Optional feature**    | Settings master toggle (like [health metrics](../v1.7.0/US-029-health-metrics.md)); default **off**; off = no UI, data kept       |
| **Modularity**          | Self-contained module — `src/lib/goalPlans/` + `goalPlanStore`; thin hooks at session/program UI                                  |
| **Data for later**      | Capture full plan metadata per instance for future charts/comparisons; visualizations **not** in this story                       |

### Deferred / Future (Lift plans)

| Item                             | Notes                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Plan-switching handoff           | What happens when starting a new plan while another is active — complete vs auto-pause first |
| Pro-authored templates           | Scaffold choices ship; professional plans come later                                         |
| Plan comparison UI               | Data model supports it; Insights/charts are a follow-on                                      |
| Coexistence with course programs | Activating a course program pauses the active goal plan; richer handoff UX later             |

---

## Part B — Baselines (built)

### Design North Star

> "Make the bar so low you’d be embarrassed to miss it — then watch yourself grow."

### What This Is

**Baselines** — opt-in daily floors/ceilings, multi-entry logging, and growth-over-time charts. Separate from Habits and from Lift plans. Discovery: [Roadmap — Baselines](../../roadmap/baselines.md).

### What's Shipping (Baselines)

| Area                         | Detail                                                                                        | Story                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| Feature flag + Settings CRUD | Master toggle; create/edit/deactivate with direction, 1–2 metrics, user-typed labels, targets | [US-034](./US-034-baselines-setup.md)   |
| Daily logging                | `/baselines`; many logs per day (summed); edit/delete including past                          | [US-035](./US-035-baselines-logging.md) |
| Progress charts              | Per-baseline line chart(s) + target line; Insights `RangeBar` options                         | [US-036](./US-036-baselines-charts.md)  |

### Key Decisions (Baselines)

| Topic                  | Decision                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Not Habits**         | Separate domain — multi-entry days, 1–2 metrics, up/under direction, growth charts    |
| **Not Lift plans**     | Lift plans stay on `/goals`; Baselines use `/baselines`                               |
| **Placement**          | Sibling of Habits                                                                     |
| **Settings**           | Setup under **Settings → Baselines**; main route for logging + chart                  |
| **Feature gate**       | `baselinesEnabled` — default **off**; off = hide UI, data persists                    |
| **Direction**          | **go up** or **stay under**                                                           |
| **Metrics**            | One or two; unit label(s) user-typed                                                  |
| **Daily aggregation**  | Always many logs per day; totals = **sum**                                            |
| **Target changes**     | Manual only — no auto-raise                                                           |
| **Date / corrections** | Global date context; edit/delete any entry including past                             |
| **Charts**             | Line + flat target; same Insights range chips                                         |
| **DB**                 | IndexedDB **v10** — `baselines` + `baselineLogs` in their own bump (v9 is Lift plans) |

### Deferred / Future (Baselines)

| Item                                      | Notes                                |
| ----------------------------------------- | ------------------------------------ |
| Auto-raising the daily target             | User-driven only                     |
| “Time to raise the baseline?” nudges      | Later                                |
| Chart drill-down / Insights hub embedding | Line + target on Baselines is enough |
| Shared persisted range across Insights    | Page-local range OK for v1           |

---

## Stories

| ID                                           | Title                     | Status |
| -------------------------------------------- | ------------------------- | ------ |
| [US-033](./US-033-goal-progression-plans.md) | Goal Progression Plans    | Built  |
| [US-034](./US-034-baselines-setup.md)        | Baselines Setup           | Built  |
| [US-035](./US-035-baselines-logging.md)      | Baselines Daily Logging   | Built  |
| [US-036](./US-036-baselines-charts.md)       | Baselines Progress Charts | Built  |

---

## Related

- [US-033 — Goal Progression Plans](./US-033-goal-progression-plans.md)
- [US-034 — Baselines Setup](./US-034-baselines-setup.md)
- [US-035 — Baselines Daily Logging](./US-035-baselines-logging.md)
- [US-036 — Baselines Progress Charts](./US-036-baselines-charts.md)
- [Roadmap — Baselines](../../roadmap/baselines.md)
- [US-029 — Health Metrics](../v1.7.0/US-029-health-metrics.md) — toggle pattern
- [Program Progression](../../implementation/program-progression.md)
- [Glossary](../../glossary.md)
- [Implementation Status](../../implementation/status.md)
