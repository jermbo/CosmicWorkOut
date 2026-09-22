[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-054

# US-054 — This Month Card

> **Status:** Planned — decided in [v1.10.0 — Topic 14](./README.md#topic-14--this-month-card). Build after [US-053](./US-053-personal-records.md) (it shows the record count).

As a **fitness user**, I want a quick read on how this month is going at the top of Insights
so that I get the headline before the detailed charts.

---

## Key Decisions

| Topic        | Decision                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Position** | First card on Insights.                                                                        |
| **Period**   | Always the **current calendar month**. It ignores the range picker — it is the fixed headline. |
| **Numbers**  | Workouts · Week streak · Habit days · New records. Each shows only while its feature is on.    |
| **Not now**  | Comparisons with last month, sparklines, goal progress.                                        |

```
THIS MONTH — SEPTEMBER
 12          4 wk        18          3
 workouts    streak      habit days  new records
```

---

## Requirements

1. Placement
   a. The card shall be the first card on Insights and shall not follow the range picker.
   b. It shall be hideable like every other card (Settings → Insights and ⋯ → Hide).
2. Numbers
   a. **Workouts** — sessions logged this calendar month (shown while Workout is on).
   b. **Week streak** — the same week streak as the Overview badge (shown while Workout is on).
   c. **Habit days** — days this month with at least one habit logged (shown while Habits is on).
   d. **New records** — records set this month ([US-053](./US-053-personal-records.md)) (shown while Workout is on).
3. Empty
   a. With every relevant feature off, the card shall not render.

---

## Related Docs

- [US-053 — Personal Records](./US-053-personal-records.md)
- [US-043 — Show / Hide Insights Charts](./US-043-insights-chart-visibility.md)
- [US-047 — Retire History](./US-047-retire-history.md) — the month stats this card brings back
