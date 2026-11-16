[Wiki](../../README.md) › [Backlog](../../features/backlog.md) › Insights Cleanup

# Insights Cleanup

> **Status:** Built in **[v1.13.0](../../features/v1.13.0/README.md)**. Waiting on hands-on testing.  
> **Stories:** [US-059](../../features/v1.13.0/US-059-trim-insights-charts.md) (keep six charts) · [US-060](../../features/v1.13.0/US-060-health-card.md) (one Health card)  
> **Origin:** Real use of the v1.10.0 trial charts ([US-043](../../features/v1.10.0/US-043-insights-chart-visibility.md), [US-044](../../features/v1.10.0/US-044-experimental-insights-charts.md)), and a nurse who found the blood-pressure chart unhelpful.

v1.10.0 made Insights a testing ground: many charts, each one hideable, so that use would show which ones earn their place. It did. This initiative keeps the winners and drops the rest. It also turns three health cards into one card that a nurse can read at a glance.

---

## Design North Star

> "Try everything. Keep what earns its place." — from [US-043](../../features/v1.10.0/US-043-insights-chart-visibility.md)

Now it's time for the "keep" part: fewer charts, and each one is useful at a glance.

---

## Which charts stay

| Chart                  | Verdict | Why                                                     |
| ---------------------- | ------- | ------------------------------------------------------- |
| Mood vs Habits         | Keep    | Used                                                    |
| All Habits             | Keep    | Used                                                    |
| This Week vs Last Week | Keep    | Used                                                    |
| Weekly Volume          | Keep    | The only Insights chart for lifting                     |
| Activity Mix           | Keep    | Used                                                    |
| Health Summary         | Reshape | Becomes the one Health card ([below](#the-health-card)) |
| Weight Trend           | Merge   | Moves into the Health card; a separate card repeats it  |
| Blood Pressure         | Merge   | Moves into the Health card, in a form a nurse can read  |
| Baseline Growth        | Drop    | Not used                                                |
| Showing Up             | Drop    | Not used                                                |
| Day of Week            | Drop    | Not used                                                |
| On Days When…          | Drop    | Not used                                                |
| Time of Day            | Drop    | Not used                                                |
| Habit Balance          | Drop    | Not used                                                |

So 14 charts become 6.

**Effect on Baselines.** The Baselines toggle no longer has its own chart on Insights. Only This Week vs Last Week still counts baselines. Each baseline keeps its own chart on the Baselines screen, so no data goes out of sight.

---

## The Health card

### The problem

Today, health shows in three cards:

- **Health Summary:** two numbers, the last weight and the 7-day average blood pressure.
- **Weight Trend:** a line of daily weights.
- **Blood Pressure:** three lines (systolic, diastolic, pulse) of daily averages.

The weight shows twice, and the blood-pressure chart is not what a nurse wants to see:

1. **Averages hide readings.** A morning reading and an evening reading become one point, but the gap between them is what a clinician looks for.
2. **No reference.** The lines float on a plain grid, with nothing to say whether a number is fine or high.
3. **Split pairs.** A reading is one pair, like 128/82. Two separate lines break that pair apart.

### The standard view

Clinicians read home blood pressure in two ways:

- **Range bars over zones.** Each reading is one vertical bar from the diastolic up to the systolic. Behind the bars are coloured bands for the standard categories, so you can see where each reading falls.
- **A log.** A plain table of every reading: date, time, systolic/diastolic, pulse. This is what you show at an appointment.

The zones follow the American Heart Association categories:

| Zone     | Systolic  |        | Diastolic |
| -------- | --------- | ------ | --------- |
| Normal   | under 120 | and    | under 80  |
| Elevated | 120 – 129 | and    | under 80  |
| Stage 1  | 130 – 139 | or     | 80 – 89   |
| Stage 2  | 140 or up | or     | 90 or up  |
| Severe   | over 180  | and/or | over 120  |

A reading takes the higher zone of its two numbers. 128/84 is Stage 1, because of the 84.

### The shape

One card, **Health Summary**, with three parts from top to bottom:

1. **Headline numbers.** The last weight, with its change over the range. The average blood pressure for the range, with its zone name.
2. **Blood pressure, with a view switch:**
   - **Readings** (the default): range bars in the colour of their zone, with dashed lines at 120 and 80. Each reading gets its own bar, so morning and evening show side by side. The bars carry the colour, not bands behind them: the systolic and diastolic cut-offs overlap on one axis, so one set of bands would mislabel one of the two numbers.
   - **Trend:** the lines of daily averages that the app has today. The owner likes this view, so it stays.
   - **Log:** a table of every reading in the range, newest first, with the weight of each date.
3. **Weight:** a small line under the chart, on the same dates, so the two read together.

The card remembers the last view on this device.

### What the card does not do

- **No advice and no alerts.** The zones are labels from a public chart. The app does not tell you what to do, and a Severe reading does not raise an alarm. A short note on the card names the source of the zones.
- **No low-pressure zone.** The AHA chart has none. Low readings sit in Normal.
- **No new data.** Readings, times and pulse are already stored ([Health metrics](../../architecture/health-metrics.md)). This is a change to what the card shows, not to what is saved.

---

## Key decisions

- **Six charts stay.** Mood vs Habits, All Habits, This Week vs Last Week, Weekly Volume, Activity Mix, Health Summary.
- **Kept trial charts graduate.** All Habits and This Week vs Last Week lose the "Experimental" label: they have earned their place.
- **One Health card.** Weight Trend and Blood Pressure merge into Health Summary. The card keeps the `health-summary` id, so a user who hid it keeps it hidden.
- **Readings is the default view.** It is the view a clinician expects. Trend and Log are one tap away.
- **The range drives the headline.** The average blood pressure uses the selected range, like every other chart, rather than a fixed 7 days.
- **Old hidden ids are harmless.** The ids of removed charts in `hiddenCharts` are ignored, as unknown ids are today ([US-043](../../features/v1.10.0/US-043-insights-chart-visibility.md)).
- **Removed charts leave the code.** Their components, the logic that only they use, and their tests go away. They are not kept behind a switch.

---

## Open questions

1. Is **Log** worth a view of its own, or is Readings with tooltips enough? The plan includes it.
2. Should the Readings view also draw the pulse? The plan shows the pulse only in the tooltip and the Log, to keep the bars clean.

---

## Related

- [Insights](../../architecture/insights.md): the charts as they are today
- [Health metrics](../../architecture/health-metrics.md): how readings are stored
- [What each toggle hides](../../architecture/toggle-surfaces.md)
- [US-029 — Health metrics](../../features/v1.7.0/US-029-health-metrics.md)
- [Backlog](../../features/backlog.md): "Health history view" is partly answered by the Log view
