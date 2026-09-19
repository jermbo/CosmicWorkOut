# Baselines

> **Status:** Specced as **v1.9.0** (Planned — not built)  
> **Stories:** [US-034](../features/v1.9.0/US-034-baselines-setup.md) · [US-035](../features/v1.9.0/US-035-baselines-logging.md) · [US-036](../features/v1.9.0/US-036-baselines-charts.md) · [v1.9.0 README](../features/v1.9.0/README.md)  
> **Origin:** Real usage (walking, stretching, tiny daily movement, writing/drawing intent)  
> **Product name:** Baselines. Distinct from [Lift plans](../features/v1.9.0/US-033-goal-progression-plans.md) (Strength wave-loading; older docs may say “Goal progression plans”).

A separate tracking surface for **embarrassingly low, achievable daily targets** — show up even when motivation is gone — plus **growth over time** so improvement is visible. Inspired by “embarrassing low” habit floors and Atomic Habits (make the good thing the easy default).

Vocabulary: [Glossary — Baseline](../glossary.md#baseline) · [Glossary — Lift plan](../glossary.md#lift-plan)

This roadmap page remains the discovery record. **Authoritative build requirements** live in the v1.9.0 user stories.

---

## Design North Star

> "Make the bar so low you’d be embarrassed to miss it — then watch yourself grow."

Two jobs at once:

1. **Today** — a tiny floor (or ceiling) that is hard to skip, so you do the thing.
2. **Over time** — proof that numbers moved, so showing up fuels motivation.

---

## Why not Habits / Activity / Practice?

| Existing                  | What it is today                                       | Why it isn’t enough alone                                       |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| **Habits**                | Daily check-in (did I / how much) toward a simple goal | Pass/fail or single daily value — not multi-metric growth story |
| **Activity**              | Quick-log movement (type + duration + intensity)       | No personal floor/ceiling, no “same time, farther” pairing      |
| **Practice / Lift plans** | Guided strength sessions + wave-loading lift targets   | Heavy / structured — often dormant when motivation is low       |

**Decision (locked):** Baselines are **totally separate** from daily Habits.

- **Habits** = daily check-ins (“did I do it?”)
- **Baselines** = small floor/ceiling + log what you did + see change over time
- **Lift plans** = Strength wave-loading toward a lift target (not this feature)

Do not merge Baselines into the Habits list. Do not reuse the Lift plan `/goals` product name for this.

---

## Product shape

### Placement

Sibling destinations (same altitude as Habits):

```
Habits · Baselines · Practice · Activity · Health
```

- **Main route** — daily logging, today’s totals vs target, per-baseline line chart
- **Settings → Baselines** — create / edit / deactivate (set up once, then rarely touch)
- **Feature flag** — off by default (same contract as Health metrics / Lift plans). Data may persist when the flag is off; UI stays hidden until discovered and enabled.

### Route note

Lift plans today occupy `/goals` (+ `/goals/new`) in code. Baselines need their **own** route (e.g. `/baselines`). UI copy for Lift plans should prefer **Lift plans** over “Goals” so the words stay distinct. Code identifier rename can lag.

---

## Creating a baseline (Settings)

Required fields:

1. **Name** — e.g. Walking, Writing, Pushups, Phone time
2. **Direction** — **go up** (hit or exceed) or **stay under** (ceiling)
3. **Metric count** — one metric (majority) or two (e.g. walk time + distance)
4. **Unit label(s)** — **user-typed** in Settings (e.g. `minutes`, `miles`, `words`, `pages`). No fixed unit enum for v1.
5. **Daily target** — the embarrassing-low floor or ceiling

**Not configurable:** multiple logs per day. Always allowed; entries **always sum** into the day’s total(s).

The user raises the target **manually when ready**. Auto-raising is out of v1. Optional future nudge copy (“you’ve been clearing this for weeks — time to raise it?”) is deferred.

---

## Daily use (Baselines screen)

- Each baseline shows **today’s total(s)** next to **the target** (e.g. did 12, target 10; or phone 18 / limit 30).
- Primary action: **pick a baseline → add what you just did** (one log entry).
- Many entries per day are normal (short walks, pushup breaks, two writing sessions); the day total is the sum.
- Prefill / carry-forward of last values for easy adjust-and-save is desirable; exact UX TBD at build time.
- **Edit / delete logs:** any entry is editable or removable, including **past dates** (same expectation as other logged history in the app).

Examples the design must support:

| Baseline     | Direction  | Metric(s)       | Notes                                      |
| ------------ | ---------- | --------------- | ------------------------------------------ |
| Walking      | Go up      | Time + distance | Same time farther, or same distance faster |
| Writing      | Go up      | Words           | e.g. 250 words                             |
| Drawing      | Go up      | Pages           | e.g. 1 page                                |
| Tiny workout | Go up      | Count           | e.g. 10 pushups / squats / etc.            |
| Meditation   | Go up      | Minutes         |                                            |
| Phone time   | Stay under | Minutes         | Reduction goal                             |

Topics are **independent**. Movement, creative work, and screen-time baselines all live in the same list; each is configured on its own.

---

## Charts (v1)

- Each baseline has **its own** chart.
- Default: **line chart**.
- One metric → one series; two metrics → **two lines**.
- Each point = **that day’s total** for the metric.
- Also draw a **flat target line** (floor or ceiling) so “what I’m measuring against” is always visible.
- **Date range:** same chip options as Insights — reuse `RangeBar` / `RANGE_OPTIONS` (`this-week`, `last-7`, `mtd`, `ytd`, `custom`; Insights default is `last-7`). Do not invent a separate Baselines-only range set. (Insights keeps the selected range in page state today; if an app-wide shared range preference is added later, Baselines should use it too.)
- Richer Insights-style chart work beyond this line + target is a **future enhancement**.

---

## Fit vs build (quick take)

| Piece                         | Fit today                                    | Likely need                                        |
| ----------------------------- | -------------------------------------------- | -------------------------------------------------- |
| Feature-flagged surface       | Same pattern as Health / Lift plans          | New pref + Settings hub row                        |
| Settings CRUD + main log page | Habits pattern (settings manage, route logs) | New stores + routes (not habit types)              |
| Daily sum of entries          | Habit logs are typically one value per day   | Multi-entry day model + aggregation                |
| Direction (up / under)        | Habits goals are “reach N”                   | Explicit direction on the baseline                 |
| One or two metrics            | Activity is duration-focused; habits are one | Baseline schema with 1–2 metrics                   |
| User-typed unit labels        | Habits already have unit labels              | Same idea on each baseline metric                  |
| Line chart + target + range   | Insights `RangeBar` + Chart.js               | Per-baseline chart wired to same range options     |
| Edit/delete past logs         | Activity / habit history patterns            | Per-entry edit/delete on any date                  |
| Embarrassing-low psychology   | Not a first-class product concept            | Copy + UX around floor/ceiling, not auto-periodize |

**Verdict:** a **new feature area**, not a new Habit type or a stretch of Activity. Reuse patterns (flag, settings CRUD, IndexedDB, chart components, range chips) — not the Habit data model.

---

## Deferred (explicit)

- Auto-raising the daily target
- Motivational “time to raise the baseline?” prompts
- Advanced / Insights-hub chart experiments (drill-down, series filtering)
- Merging Baselines into Habits
- Renaming Lift plan code paths / prefs away from `goalPlan*`
- Persisting one app-wide chart range shared by Insights + Baselines (nice-to-have; v1 can mirror Insights’ page-local range UX)

---

## Review checklist

- [x] Product name: **Baselines** (not “Goals”)
- [x] Strength wave plans: **Lift plans** (not “Goals” in UI)
- [x] Chart range: same options as Insights (`RangeBar` / `RANGE_OPTIONS`)
- [x] Unit label(s): user-chosen in Settings (free text)
- [x] Logs editable/deletable, including past dates
- [ ] Baselines ≠ Habits (separate sibling destination)
- [ ] Flag off by default
- [ ] Settings for setup; main Baselines screen for logging + chart
- [ ] Direction: go up **or** stay under
- [ ] One or two metrics per baseline
- [ ] Always multi-log per day; totals add up
- [ ] User raises target when ready (no auto bump in v1)
- [ ] Per-baseline line chart + flat target line

---

## Related

- [v1.9.0 — Baselines](../features/v1.9.0/README.md) — feature stories (authoritative for build)
- [Roadmap index](README.md)
- [Glossary — Baseline](../glossary.md#baseline)
- [Glossary — Lift plan](../glossary.md#lift-plan)
- [Habits — creation](../features/v1.3.0/US-009-habit-creation.md)
- [Activity logging](../features/v1.1.0/US-003-activity-logging.md)
- [US-033 — Goal Progression Plans](../features/v1.9.0/US-033-goal-progression-plans.md) — Lift plans (spec filename may lag)
- [v1.5.0 Insights](../features/v1.5.0/README.md) — date-range chips / `RangeBar`
