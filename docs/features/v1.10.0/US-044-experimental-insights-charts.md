[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-044

# US-044 — Experimental Insights Charts

> **Experimental.** Seven new charts added to learn what is useful. Each can be hidden ([US-043](./US-043-insights-chart-visibility.md)); real use and feedback decide what stays. Depends on [US-039](./US-039-tanstack-charts-migration.md), [US-040](./US-040-scrolling-charts.md), and [US-038](./US-038-baseline-logging-comparison.md). Decisions: [v1.10.0 — Topic 5](./README.md#topic-5--more-insights-experiments).

As a **growth-minded user**, I want a range of different views of my data
so that I can find out which ones actually help me understand my progress — and drop the ones that don't.

---

## Design North Star

> "Each chart answers one real question."

---

## Key Decisions

| Topic           | Decision                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Experiments** | All seven ship visible and marked as experimental. No single "right" chart is chosen up front. |
| **Range**       | Every chart uses the Insights range picker.                                                    |
| **Neutral**     | Baseline charts follow US-038 — plain comparisons, no good / bad coloring.                     |
| **Gated**       | A chart only appears when its data source's feature is on and has data.                        |

| #   | Chart                  | Question it answers                                        | Data                                          |
| --- | ---------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| 1   | Baseline growth        | How far above my floor am I, and which metric is climbing? | Baselines                                     |
| 2   | Showing-up rate        | Am I showing up more or less than before?                  | Baselines, habits                             |
| 3   | Day-of-week pattern    | Which weekdays are strong or weak?                         | Baselines, habits                             |
| 4   | "On days when…"        | Does X go with Y?                                          | Mood, habits, workouts, activities, baselines |
| 5   | This week vs last week | Am I trending up right now?                                | Baselines, habits, workouts                   |
| 6   | Time of day            | When do I actually get it done?                            | Baseline entries                              |
| 7   | Personal bests         | When did I hit my best?                                    | Baselines                                     |

---

## Requirements

1. Baseline growth
   a. The user shall be able to pick a baseline; the chart shall show one line per metric of daily totals, with each metric's baseline value drawn as a flat reference line.
   b. The user shall be able to show a single metric at a time so its growth is clear.
   c. The chart shall scroll per US-040.
2. Showing-up rate
   a. For each baseline and habit, the chart shall show the percent of days logged, per week, across the range.
3. Day-of-week pattern
   a. For a chosen baseline metric or habit, the chart shall show the average value for each weekday (Mon–Sun) across the range.
   b. Weekdays with no data in the range shall be shown as empty, not zero.
4. "On days when…"
   a. The user shall pick an outcome (mood or a number habit) and a condition (a workout session was logged, an activity was logged, a baseline was logged, or a habit was done).
   b. The chart shall show the outcome's average on days the condition was true versus days it was false, with the number of days in each group.
   c. When either group has fewer than 3 days, the chart shall say there is not enough data yet.
5. This week vs last week
   a. The chart shall show this week's totals next to last week's for each baseline metric, number habit, and workout volume, with an up / down / same indicator.
   b. Comparison shall use the same days so far (e.g. Mon–Wed vs Mon–Wed) when the current week is not finished.
6. Time of day
   a. For a chosen baseline, the chart shall show how its entries spread across the hours of the day, using when each entry was recorded.
7. Personal bests
   a. On the baseline growth chart, each metric's highest day total in the range shall be marked.
   b. Tapping or focusing the marker shall show the date and value.
8. Common
   a. Each experimental chart shall carry a visible "Experimental" label.
   b. Each chart shall show a short empty state when its data is missing.

---

## Acceptance Criteria

1. Baseline growth
   a. Given "Daily 10" with pushups rising from 10 to 30 and other metrics flat at 10, when the user views the chart, then the pushups line climbs above its flat reference line and the others sit on theirs.
   b. Given the user selects only pushups, when the chart redraws, then only the pushups line and its reference show.
2. Showing-up rate
   a. Given a habit logged 5 of 7 days last week, when the user views the chart, then last week reads about 71%.
3. Day-of-week pattern
   a. Given coffee logged higher every Monday, when the user views the pattern for Coffee, then Monday shows the highest average.
4. "On days when…"
   a. Given mood logged on 10 workout days and 10 rest days, when the user picks mood + "workout logged", then two averages and "10 days" for each group show.
   b. Given only 2 workout days in range, when the user picks that condition, then the chart says there is not enough data yet.
5. This week vs last week
   a. Given it is Wednesday, when the user views the chart, then this week's Mon–Wed totals compare against last week's Mon–Wed.
6. Time of day
   a. Given most Daily 10 entries recorded between 6 and 8 am, when the user views the chart, then those hours stand out.
7. Personal bests
   a. Given pushups peaked at 35 on Sept 12, when the user views the growth chart, then Sept 12 is marked and shows 35 on tap.
8. Common
   a. Given the user opens Insights, when experimental charts render, then each shows an "Experimental" label.
   b. Given Baselines off, when the user opens Insights, then baseline-only charts are not shown.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-043 — Show / Hide Insights Charts](./US-043-insights-chart-visibility.md)
- [US-038 — Baseline Logging & Comparison](./US-038-baseline-logging-comparison.md)
- [US-040 — Scrolling Charts on Mobile](./US-040-scrolling-charts.md)
- [Map — History & Insights](../../map-history-and-insights.md)
