# v1.5.0 — Data Insights & Visualization

This version adds the first analytics layer to CosmicWorkOut — an **Insights** page that surfaces patterns across workout sessions, activities, and habits using Chart.js charts. The goal is to make the data the app already collects feel meaningful and motivating.

## Design North Star

> "Your history, made visible."

The charts don't introduce new data — they reveal patterns in what you're already logging. A user who has been training for 6 weeks should be able to see their volume trend, their mood patterns, and where their time goes, without exporting anything.

---

## Key Decisions

- **Chart.js only.** Already in the project at v4.5.1. No additional charting dependency.
- **Insights is a new nav tab.** History/Calendar stays focused on the date-grid view. Insights gets its own route (`/insights`) and a nav slot.
- **45-day rolling window by default.** Aligns with the debug seed data range and gives enough data for meaningful patterns without overwhelming the UI. Not user-configurable in this version.
- **Date range chips shipped** (45d, week, MTD, YTD, custom). Chart drill-down / series filtering is on the [roadmap](../../roadmap/README.md#activity--insights).
- **Responsive canvas.** Charts use `responsive: true` and `maintainAspectRatio: false` inside fixed-height containers so they work on both mobile and tablet.
- **Dark/light theme aware.** Charts read CSS custom properties for colors so they adapt to the app's accent color and surface tokens.

---

## Charts Shipped

| ID                                             | Chart                   | Type            | Data sources       |
| ---------------------------------------------- | ----------------------- | --------------- | ------------------ |
| [US-023](./US-023-mood-habits-chart.md)        | Mood vs Coffee & Water  | Multi-axis line | `habitLogs`        |
| [US-024](./US-024-weekly-volume-chart.md)      | Weekly Training Volume  | Bar             | `sessions`         |
| [US-025](./US-025-activity-breakdown-chart.md) | Activity Type Breakdown | Doughnut        | `activities`       |
| [US-026](./US-026-habit-radar-chart.md)        | Habit Balance Radar     | Radar           | `habitLogs`        |
| [US-027](./US-027-exercise-progress-chart.md)  | Top Exercise Progress   | Multi-line      | `sessions → items` |

---

## User Stories

Implement in order — US-022 (hub + nav) must land first; charts can be built in parallel after.

| ID                                             | Title                         | Status  | Depends on |
| ---------------------------------------------- | ----------------------------- | ------- | ---------- |
| [US-022](./US-022-insights-hub.md)             | Insights Hub & Navigation     | ✅ Done | —          |
| [US-023](./US-023-mood-habits-chart.md)        | Mood vs Coffee & Water Chart  | ✅ Done | US-022     |
| [US-024](./US-024-weekly-volume-chart.md)      | Weekly Training Volume Chart  | ✅ Done | US-022     |
| [US-025](./US-025-activity-breakdown-chart.md) | Activity Type Breakdown Chart | ✅ Done | US-022     |
| [US-026](./US-026-habit-radar-chart.md)        | Habit Balance Radar Chart     | ✅ Done | US-022     |
| [US-027](./US-027-exercise-progress-chart.md)  | Top Exercise Progress Chart   | ✅ Done | US-022     |

---

## Also Shipped (beyond original scope)

| Item              | Notes                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Date range picker | Chip bar: 45d (default), This week, Last 7d, MTD, YTD, Custom. Charts + subtitle update reactively. |

## Out of Scope for v1.5.0

Deferred items are on the [roadmap](../../roadmap/README.md) (chart interactivity, per-discipline filtering, activity distance/pace, nutrition).
