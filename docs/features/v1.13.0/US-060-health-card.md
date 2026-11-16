[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-060

# US-060 — One Health Card

> **Status:** Built — waiting on hands-on testing. Design: [Insights Cleanup — The Health card](../../initiatives/insights-cleanup/README.md#the-health-card).
>
> **As built:** `ChartHealth.svelte` is the card; it switches between `ChartHealthReadings` (range bars: `barY` with `y1`/`y2`; days with two or more readings use `layout: group()` by slot, a lone reading gets its own mark so it stays centred), `ChartHealthTrend` (the old Blood Pressure lines) and `ChartHealthLog`, with `ChartHealthWeight` under Readings and Trend. Log leaves the weight line out, since each date already shows its weight. Zones, readings, averages and the log come from the pure `src/lib/health/bpZones.ts`, tested in `bpZones.test.ts`. The view is `healthChartView` in `cwout:prefs`. `rollingBpAverage` was removed; the headline now averages every reading in the range.

As a **health-conscious user**, I want my weight and blood pressure in one card, in the form a nurse expects, so that I can see where I stand at a glance and show it at an appointment.

---

## Decisions

| Area               | Decision                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **One card**       | Health Summary holds the headline numbers, blood pressure and weight. Weight Trend and Blood Pressure cards are **Removed**.           |
| **Three views**    | Blood pressure has a switch: **Readings** (default), **Trend**, **Log**. The last choice is remembered on this device.                 |
| **Readings**       | One vertical bar per reading, from diastolic up to systolic, in the colour of its zone. Dashed lines at 120 and 80.                    |
| **Trend**          | The lines of daily averages for systolic, diastolic and pulse, as the Blood Pressure chart draws them today.                           |
| **Log**            | A table of every reading in the range, newest first, grouped by date, with the weight of that date.                                    |
| **Zones**          | American Heart Association categories: Normal, Elevated, Stage 1, Stage 2, Severe. A reading takes the higher zone of its two numbers. |
| **Headline**       | Last weight with its change over the range. Average blood pressure over the range, with its zone.                                      |
| **Weight**         | A small line under the blood-pressure view, on the same dates.                                                                         |
| **No advice**      | Zones are labels. No alert, no advice. A short note names the source of the zones.                                                     |
| **No data change** | Uses the readings, times and pulse that are already stored.                                                                            |

---

## Requirements

1. Headline
   a. The card shall show the last weight in the range, in the user's weight unit, and its change from the first weight in the range.
   b. The card shall show the average systolic/diastolic of every reading in the range, and the zone of that average.
   c. A part with no data in the range shall be left out, not shown as zero.
2. View switch
   a. The card shall offer Readings, Trend and Log, with Readings as the default.
   b. The card shall remember the last view on this device.
3. Readings view
   a. Each blood-pressure reading in the range shall show as its own bar, from its diastolic to its systolic.
   b. Two readings on one date shall show as two bars, in time order.
   c. Each bar shall take the colour of its zone, and dashed lines shall mark 120 and 80, the top of Normal.
   d. Touching or hovering a bar shall show its date, time, values, pulse if logged, and zone.
4. Trend view
   a. The view shall show daily averages of systolic, diastolic and pulse, as lines.
5. Log view
   a. The view shall list every reading in the range, newest first, grouped by date.
   b. Each reading shall show its time, systolic/diastolic, pulse if logged, and zone.
   c. A date with a weight shall show it.
6. Weight
   a. A line of daily weights shall show under the blood-pressure view, on the same dates as the range.
7. Zones
   a. A reading shall take the higher zone of its systolic and its diastolic.
   b. The card shall name the source of the zones, and shall give no advice and no alert.
8. Card list
   a. Weight Trend and Blood Pressure shall no longer show as cards or as switches in Settings → Insights.
   b. The card shall keep its id, so a user who hid Health Summary keeps it hidden.

---

## Acceptance Criteria

1. Headline
   a. Given weights of 184.0 on the first day and 182.4 on the last day of the range, when the card shows, then it reads 182.4 with a change of −1.6.
   b. Given readings 128/82 and 122/78 in the range, when the card shows, then the average reads 125/80, Stage 1.
   c. Given no weight in the range, when the card shows, then there is no weight number and no "0".
2. View switch
   a. Given a first visit, when the card shows, then Readings is selected.
   b. Given the user picks Log and leaves, when they come back, then Log is selected.
3. Readings view
   a. Given 128/82 at 07:00 and 122/78 at 21:00 on Monday, when Readings shows, then Monday has two bars, the 07:00 one first.
   b. Given a reading of 118/76, when Readings shows, then its bar has the Normal colour and sits under the 120 line.
   c. Given the user touches the 07:00 bar, when the tooltip opens, then it shows the date, 07:00, 128/82, the pulse, and Stage 1.
4. Trend view
   a. Given the same Monday readings, when Trend shows, then Monday has one point of 125 systolic and one of 80 diastolic.
5. Log view
   a. Given readings on Monday and Tuesday, when Log shows, then Tuesday's readings come first.
   b. Given a reading with no pulse, when Log shows, then its pulse cell is empty, not zero.
   c. Given a weight on Tuesday, when Log shows, then the Tuesday group shows that weight.
6. Weight
   a. Given weights on three days of the range, when the card shows, then the weight line has three points under the blood-pressure view.
7. Zones
   a. Given a reading of 128/84, when its zone shows, then it reads Stage 1.
   b. Given a reading of 185/100, when the card shows, then it reads Severe and no alert or pop-up appears.
8. Card list
   a. Given Health is on, when the user opens Insights, then there is one health card, not three.
   b. Given Health Summary was hidden before the update, when the user opens Insights, then it is still hidden.

---

## Related Docs

- [Insights Cleanup — design](../../initiatives/insights-cleanup/README.md)
- [US-059 — Keep Six Insights Charts](./US-059-trim-insights-charts.md)
- [Health metrics](../../architecture/health-metrics.md)
- [Insights](../../architecture/insights.md)
- [US-029 — Health metrics](../v1.7.0/US-029-health-metrics.md)
