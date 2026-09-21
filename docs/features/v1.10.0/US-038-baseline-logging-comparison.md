[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-038

# US-038 — Baseline Logging & Comparison

> Replaces "cleared" in [US-035](../v1.9.0/US-035-baselines-logging.md): **logging = done**, and every metric shows a **neutral comparison** against its baseline. Depends on [US-037](./US-037-flexible-baseline-metrics.md). Decisions: [v1.10.0 — Topic 1](./README.md#topic-1--baselines-1-to-n-metrics).

As a **growth-minded user**, I want logging a baseline to count as showing up, and to see plainly how each metric compared to my baseline
so that low-motivation days still count, and on high-motivation days I can see exactly where I went above and beyond.

---

## Design North Star

> "You showed up. Here's how it compared."

---

## Key Decisions

| Topic                  | Decision                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Done = logged**      | Any entry for a baseline on a day marks that baseline **done** for the day. Hitting or missing a baseline value never decides done.               |
| **Log what you did**   | The user enters real amounts (30 pushups, 5.5 mi). The app works out the difference.                                                              |
| **Neutral comparison** | Each metric shows its day total vs its baseline value as plain numbers with a sign: **+20**, **−2**, **0**. No good / bad colors, no pass / fail. |
| **User interprets**    | The app does not decide what "better" means. A runner may want duration to fall; a walker may want distance to rise.                              |
| **Unchanged**          | Many entries per day, summed per metric; global date context; edit / delete any entry; prefill from last entry.                                   |

---

## Requirements

1. Done
   a. A baseline shall show as done for a date when it has at least one entry on that date, regardless of the values.
   b. Overview, calendar, and week-strip baseline indicators shall use "logged" as done.
   c. The app shall not show a "cleared" / "not cleared" state based on baseline values.
2. Logging
   a. An entry shall accept a value for any subset of the baseline's metrics; blank metrics count as nothing for that entry.
   b. Duration values shall be entered as time; Distance values in the metric's unit; Count values as a number.
   c. Multiple entries per day, summing, backdating, edit, delete, and prefill shall behave as in US-035.
3. Comparison
   a. For each metric, the baseline card shall show the day's total, the baseline value, and the signed difference (total − baseline).
   b. The difference shall use the same neutral styling whether positive, negative, or zero.
   c. A metric with nothing logged on a done day shall show as not logged, not as a negative difference.

---

## Acceptance Criteria

1. Done
   a. Given "Daily 10" with no entries today, when the user logs only 5 pushups, then Daily 10 shows as done for today.
   b. Given a baseline logged yesterday but not today, when the user views the week strip, then yesterday shows the baseline indicator and today does not.
2. Logging
   a. Given "Bike ride" (5 mi / 30 min), when the user logs 5.5 mi in 30 min, then the entry saves and the day totals read 5.5 mi and 30 min.
   b. Given two entries today of 15 and 15 pushups, when the user views the card, then pushups total 30.
3. Comparison
   a. Given pushups baseline 10 and 30 logged, when the user views the card, then pushups shows **+20**.
   b. Given bike duration baseline 30 min and 28 min logged, when the user views the card, then duration shows **−2 min** in the same neutral style as a positive number.
   c. Given "Daily 10" logged with pushups only, when the user views the card, then jumping jacks, walk, and lunges show as not logged — not −10.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-037 — Flexible Baseline Metrics](./US-037-flexible-baseline-metrics.md)
- [US-035 — Baselines Daily Logging](../v1.9.0/US-035-baselines-logging.md) — superseded "cleared" rules
- [US-044 — Experimental Insights Charts](./US-044-experimental-insights-charts.md) — baseline growth line, personal bests
- [Glossary — Baseline](../../glossary.md#baseline)
