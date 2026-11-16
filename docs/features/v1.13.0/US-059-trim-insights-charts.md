[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-059

# US-059 — Keep Six Insights Charts

> **Status:** Built — waiting on hands-on testing. Design: [Insights Cleanup](../../initiatives/insights-cleanup/README.md). The Health card is [US-060](./US-060-health-card.md).
>
> **As built:** `src/lib/insights/charts.ts` lists six charts; no entry sets `experimental` (the field and badge stay for a future trial). The six removed chart components, `ChipPicker.svelte`, and the logic only they used (`showUpRate`, `weekdayAverages`, `splitByCondition`, `hourHistogram`, `hourLabel`, `baselineLoggedDates`) and its tests are gone. Unknown ids in `hiddenCharts` were already ignored, so no migration.

As a **fitness user**, I want Insights to show only the charts I use, so that I can read my month at a glance without scrolling past noise.

---

## Decisions

| Area           | Decision                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Stay**       | Mood vs Habits, All Habits, This Week vs Last Week, Weekly Volume, Activity Mix, Health Summary.                                        |
| **Removed**    | Baseline Growth, Showing Up, Day of Week, On Days When…, Time of Day, Habit Balance. Weight Trend and Blood Pressure merge into US-060. |
| **Graduate**   | All Habits and This Week vs Last Week lose the "Experimental" label. No chart is Experimental after this story.                         |
| **Hidden ids** | An id of a removed chart in `hiddenCharts` is ignored. A chart the user hid stays hidden if it stays in the app.                        |
| **Code**       | The removed charts' components, the logic that only they use, and their tests leave the code.                                           |
| **Baselines**  | Baselines keep their own chart on the Baselines screen. On Insights, only This Week vs Last Week counts them.                           |

---

## Requirements

1. Chart list
   a. Insights shall show only these charts, in this order: Mood vs Habits, All Habits, This Week vs Last Week, Weekly Volume, Activity Mix, Health Summary.
   b. Each kept chart shall show while the same toggles are on as today.
   c. No chart shall carry the "Experimental" label.
2. Settings → Insights
   a. Settings → Insights shall list a switch only for the six kept charts.
   b. Show all charts shall still bring back every hidden chart.
3. Saved settings
   a. A saved `hiddenCharts` list that names a removed chart shall cause no error and no empty card.
   b. A kept chart that the user hid before the update shall stay hidden after it.
4. Baselines
   a. The Baselines screen shall still show each baseline's own chart.

---

## Acceptance Criteria

1. Chart list
   a. Given every toggle is on and no chart is hidden, when the user opens Insights, then exactly the six kept charts show, in the order of requirement 1a.
   b. Given only Activity log is on, when the user opens Insights, then only Activity Mix shows.
   c. Given only Baselines is on, when the user opens Insights, then only This Week vs Last Week shows.
   d. Given All Habits shows, when the user looks at its card, then it has no "Experimental" label.
2. Settings → Insights
   a. Given the user opens Settings → Insights, when they read the list, then it has six switches and no switch for Day of Week.
   b. Given Weekly Volume is hidden, when the user taps Show all charts, then Weekly Volume shows on Insights.
3. Saved settings
   a. Given `hiddenCharts` holds `day-of-week` and `habit-radar`, when the user opens Insights, then the page shows the kept charts and no error.
   b. Given `hiddenCharts` holds `activity-mix`, when the user opens Insights after the update, then Activity Mix is still hidden.
   c. Given every kept chart is hidden, when the user opens Insights, then the page says so and links to Settings, as it does today.
4. Baselines
   a. Given a baseline with entries, when the user opens the Baselines screen, then its chart shows as before.

---

## Related Docs

- [Insights Cleanup — design](../../initiatives/insights-cleanup/README.md)
- [Insights](../../architecture/insights.md)
- [What each toggle hides](../../architecture/toggle-surfaces.md)
- [Settings object](../../architecture/settings-object.md)
- [US-043 — Show / Hide Insights Charts](../v1.10.0/US-043-insights-chart-visibility.md)
- [US-044 — Experimental Insights Charts](../v1.10.0/US-044-experimental-insights-charts.md)
