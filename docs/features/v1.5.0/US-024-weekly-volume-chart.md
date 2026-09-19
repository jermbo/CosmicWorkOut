[Wiki](../../README.md) › [Features](../README.md) › [v1.5.0](README.md) › US-024

# US-024 — Weekly Training Volume Chart

> **Status: Done — v1.5.0**
>
> A bar chart showing total pounds lifted per week over the last 45 days. The clearest signal of training load — deload weeks and heavy weeks stand out immediately.

As a **fitness user**, I want to see my total weekly training volume as a bar chart
so that I can understand my training load trends and whether I'm progressively overloading over time.

---

## Requirements

1. Chart data
   a. The chart shall group sessions by calendar week (Monday–Sunday) and sum `totalVolume` (lb) for each week.
   b. Weeks within the 45-day window that have no sessions shall render as a zero-height bar (not omitted), so gaps in training are visible.
   c. The X axis shall label each week by its start date (e.g. "May 6", "May 13").
   d. The Y axis shall start at 0 and be labelled in pounds (lb).

2. Visual design
   a. Bars shall use the app accent color with reduced opacity on weeks with no sessions.
   b. The chart shall include a Y axis label "lb lifted".
   c. Tooltips shall show the exact volume and session count for each week on hover/tap.

3. Section header
   a. The chart shall be preceded by a section title "Weekly Volume" and a one-line description "Total pounds lifted per week."

---

## Acceptance Criteria

1. Chart data
   a. Given sessions exist across multiple weeks, when the chart renders, then one bar per week appears spanning the 45-day window.
   b. Given a week with no sessions (e.g. a rest week), when the chart renders, then a zero-height bar appears for that week — it is not skipped.
   c. Given sessions exist with `totalVolume > 0`, when the chart renders, then bar heights reflect those totals proportionally.

2. Visual design
   a. Given the user taps or hovers a bar, when the tooltip appears, then it shows the week's total volume in lb and the number of sessions.
   b. Given the user has a custom accent color, when the chart renders, then bars use that color.

3. Section header
   a. Given session data exists, when the Insights page loads, then the "Weekly Volume" section title is visible above the chart.

---

## Related Docs

- [v1.5.0 README](./README.md)
- [US-022 — Insights Hub](./US-022-insights-hub.md)
- [US-001 — Program Library](../v1.1.0/US-001-program-library.md)
