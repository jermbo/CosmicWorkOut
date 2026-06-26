# US-023 — Mood vs Coffee & Water Chart

> **Status: Done — v1.5.0**
>
> A multi-axis line chart plotting mood alongside coffee and water intake over the last 45 days. The most personal chart in the set — reveals whether caffeine or hydration correlate with how the user feels.

As a **health-conscious user**, I want to see my mood plotted against my coffee and water intake over time
so that I can spot patterns between my habits and how I feel each day.

---

## Requirements

1. Chart data
   a. The chart shall plot three series over the last 45 days: **Mood** (left Y axis, −5 to +5), **Coffee** (right Y axis, cups), and **Water** (right Y axis, cups).
   b. Only dates where at least one of the three values was logged shall appear as data points; dates with no logs for a given series shall render as gaps (not zero).
   c. The X axis shall show date labels, thinned to avoid overlap (e.g. every 7th day labelled).

2. Visual design
   a. Each series shall use a distinct color: Mood uses the app accent color; Coffee uses an amber/warm tone; Water uses a blue tone.
   b. Mood shall be plotted on the left Y axis (−5 to +5, with labelled tick marks at −5, 0, +5).
   c. Coffee and Water shall share the right Y axis, starting at 0, with a max derived from the data.
   d. The chart shall include a legend identifying each series.
   e. Points shall be visible on the line (small filled circles) so individual day values are legible.

3. Section header
   a. The chart shall be preceded by a section title "Mood vs Habits" and a one-line description "Mood compared to daily coffee and water intake."

---

## Acceptance Criteria

1. Chart data
   a. Given habit logs exist for mood, coffee, and water, when the chart renders, then three lines appear on the canvas.
   b. Given a date where only mood was logged (no coffee or water), when the chart renders, then only the mood point appears on that date; the other two series show a gap.
   c. Given 45 days of data, when the X axis renders, then labels are spaced to avoid overlap.

2. Visual design
   a. Given the chart renders, when the user inspects the legend, then three labelled series — Mood, Coffee, Water — are visible.
   b. Given the user has set a custom accent color, when Insights loads, then the Mood line uses that accent color.
   c. Given mood values range from −5 to +5, when the left Y axis renders, then it spans that full range with 0 centred.

3. Section header
   a. Given the Insights page loads and habit log data exists, when the section renders, then the title "Mood vs Habits" is visible above the chart.

---

## Related Docs

- [v1.5.0 README](./README.md)
- [US-022 — Insights Hub](./US-022-insights-hub.md)
- [US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
