# US-036 — Baselines Progress Charts

> **Status: Planned — v1.9.0**
>
> Depends on [US-034](./US-034-baselines-setup.md) and [US-035](./US-035-baselines-logging.md).

As a **health-conscious user**, I want a simple line chart per baseline that shows my daily totals against my target
so that I can see growth over time (and for two-metric baselines, how the metrics move together) without waiting for a bigger Insights overhaul.

---

## Design North Star

> "See what you did — and what you were aiming at."

---

## Key Decisions

| Topic           | Decision                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Placement**   | Chart lives with the baseline (on `/baselines` detail or inline — implementer chooses; one chart per baseline) |
| **Type**        | Line chart (Chart.js, same stack as Insights)                                                                 |
| **Series**      | One metric → one line; two metrics → two lines                                                                |
| **Points**      | Each point = **that day’s summed total** for the metric                                                       |
| **Target**      | Flat horizontal line at the configured target for each metric (or equivalent readable target marker)          |
| **Date range**  | Same chip options as Insights — reuse `RangeBar` / `RANGE_OPTIONS` (`this-week`, `last-7`, `mtd`, `ytd`, `custom`) |
| **Default**     | Match Insights default (`last-7`) unless product copy prefers otherwise at implement time                     |

---

## Requirements

1. Chart content
   a. Each active baseline shall have a progress chart available from the Baselines experience.
   b. The chart shall plot daily totals for each metric over the selected range.
   c. The chart shall show the baseline’s target level so the user can see what they are measuring against.
   d. Days with no logs shall be treated consistently with other app charts (zero or gap — match Insights conventions where practical).
2. Date range
   a. The user shall be able to change the chart range using the same option set as Insights (`RangeBar`).
   b. Changing the range shall update the chart without leaving the Baselines flow.
3. Two-metric baselines
   a. Given a baseline with two metrics, when the user views its chart, then both series are visible (two lines) with distinguishable series labels (unit labels from Settings).

---

## Acceptance Criteria

1. Chart content
   a. Given a baseline with logs across several days, when the user opens its chart on Last 7d, then they see a line of daily totals and a target reference at the configured value.
   b. Given direction stay under and target 30, when totals are plotted, then the target reference still appears at 30.
2. Date range
   a. Given the chart is on Last 7d, when the user selects MTD, then the plotted span updates to month-to-date.
3. Two-metric baselines
   a. Given Walking with minutes and miles logged, when the user views the chart, then both metrics appear as separate series.

---

## Related Docs

- [US-034 — Baselines Setup](./US-034-baselines-setup.md)
- [US-035 — Baselines Daily Logging](./US-035-baselines-logging.md)
- [v1.5.0 Insights](../v1.5.0/README.md) — `RangeBar` / chart stack
- [Glossary — Baseline](../../glossary.md#baseline)
