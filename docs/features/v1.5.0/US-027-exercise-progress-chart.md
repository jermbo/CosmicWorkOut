# US-027 — Top Exercise Progress Chart

> **Status: Done — v1.5.0**
>
> A multi-line chart showing max weight lifted per session for the top exercises by frequency. The clearest signal of strength progress over time.

As a **strength-training user**, I want to see a line chart of my max weight per exercise over time
so that I can track whether I'm getting stronger on my key lifts.

---

## Requirements

1. Chart data
   a. The chart shall identify the top 5 exercises by session frequency (most sessions logged with that `itemId`) over the last 45 days.
   b. For each of those exercises, the chart shall plot one data point per session: the maximum weight (`value`) across all sets for that item in that session.
   c. Each series shall only include sessions where the exercise appears; sessions where the exercise was not logged shall produce a gap (not a zero).
   d. The X axis shall be date-based, spanning the 45-day window.

2. Visual design
   a. Each exercise shall use a distinct line color drawn from a fixed 5-color palette.
   b. The chart shall include a legend mapping each color to the exercise name.
   c. The Y axis shall be labelled in pounds (lb) and start at 0.
   d. Points shall be visible on each line (small filled circles) so individual session values are legible.
   e. Tooltips shall show the exercise name, date, and max weight on hover/tap.

3. Section header
   a. The chart shall be preceded by a section title "Strength Progress" and a one-line description "Max weight per session for your top 5 exercises."

4. Empty state
   a. If no sessions with strength items exist, the section shall not render and a message "No strength data yet" shall appear in its place.

---

## Acceptance Criteria

1. Chart data
   a. Given 6 different exercises logged, when the chart renders, then only the top 5 by session count appear.
   b. Given an exercise appears in 4 sessions, when the chart renders, then that exercise has 4 data points — not 45.
   c. Given a session where an exercise was skipped (`skipped: true`), when the chart renders, then that session does not contribute a data point for that exercise.
   d. Given two sets for an exercise in one session with weights 100 lb and 120 lb, when the chart renders, then that session's data point is 120.

2. Visual design
   a. Given 5 exercise lines render, when the user reads the legend, then each line is labelled with the exercise name.
   b. Given the user taps a data point, when the tooltip appears, then it shows the exercise name, date, and max weight in lb.

3. Section header
   a. Given session data exists, when Insights loads, then "Strength Progress" is visible above the chart.

4. Empty state
   a. Given no sessions have been logged, when Insights loads, then the Strength Progress section shows "No strength data yet" instead of an empty chart.

---

## Related Docs

- [v1.5.0 README](./README.md)
- [US-022 — Insights Hub](./US-022-insights-hub.md)
- [US-024 — Weekly Training Volume](./US-024-weekly-volume-chart.md)
- [US-002 — Workout Logging](../v1.1.0/US-002-workout-logging.md)
