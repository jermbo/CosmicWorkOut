# US-025 — Activity Type Breakdown Chart

> **Status: ✅ Done — v1.5.0**
>
> A doughnut chart showing the count of each activity type logged over the last 45 days. Quick, colorful, and a fun summary of movement variety outside the gym.

As an **active user**, I want to see a breakdown of my activity types as a chart
so that I can understand how varied my movement is and whether I'm over-relying on one type.

---

## Requirements

1. Chart data
   a. The chart shall count the number of activity logs per `ActivityType` over the last 45 days.
   b. Activity types with zero logs shall be omitted from the chart (no zero-count slices).
   c. The chart shall display a legend listing each activity type and its count.

2. Visual design
   a. Each slice shall use a distinct color drawn from a fixed palette (not the accent color, to ensure contrast between adjacent slices).
   b. The chart shall render as a doughnut (hollow centre) with the total activity count displayed in the centre.
   c. Tooltips shall show the activity type name and count on hover/tap.

3. Section header
   a. The chart shall be preceded by a section title "Activity Mix" and a one-line description "Breakdown of activities logged in the last 45 days."

4. Empty state
   a. If no activities have been logged, the chart section shall not render and a message "No activities logged yet" shall appear in its place.

---

## Acceptance Criteria

1. Chart data
   a. Given 10 Walk logs and 3 Run logs exist, when the chart renders, then two slices appear — Walk and Run — with proportional sizes.
   b. Given a `Swim` type has never been logged, when the chart renders, then no Swim slice appears.
   c. Given the legend renders, when the user reads it, then each type shows its name and count.

2. Visual design
   a. Given multiple activity types exist, when the chart renders, then adjacent slices use visually distinct colors.
   b. Given the doughnut renders, when the user looks at the centre, then the total activity count is displayed.
   c. Given the user taps a slice, when the tooltip appears, then it shows the type name and count.

3. Section header
   a. Given activity logs exist, when Insights loads, then "Activity Mix" is visible above the chart.

4. Empty state
   a. Given no activity logs exist, when Insights loads, then the Activity Mix section shows "No activities logged yet" instead of an empty chart.

---

## Related Docs

- [v1.5.0 README](./README.md)
- [US-022 — Insights Hub](./US-022-insights-hub.md)
- [US-003 — Activity Logging](../v1.1.0/US-003-activity-logging.md)
