[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-039

# US-039 — Move All Charts to TanStack Charts

> Foundation for [US-040](./US-040-scrolling-charts.md), [US-041](./US-041-all-habits-heat-chart.md), and [US-044](./US-044-experimental-insights-charts.md). Decisions: [v1.10.0 — Topic 3](./README.md#topic-3--tanstack-charts).

As a **health-conscious user**, I want every chart in the app to look and behave the same way
so that Insights and Baselines feel like one product, and new views (scrolling, heat charts) can be added without fighting the chart library.

---

## Design North Star

> "One chart library. Same questions answered, better tools to answer new ones."

---

## Key Decisions

| Topic            | Decision                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Scope**        | Every chart moves: Mood & Habits, Weekly volume, Activity mix, Habit radar, Weight, Blood pressure, and the Baselines chart. |
| **Library**      | `@tanstack/charts` with its Svelte adapter. **Exact version pin** (0.18.0 today).                                            |
| **Remove old**   | `chart.js` is uninstalled once nothing uses it.                                                                              |
| **Alpha risk**   | Accepted. Upgrade only deliberately; fix breaks when upgrading.                                                              |
| **Same meaning** | Each chart answers the same question as before. Visual refresh is fine; lost information is not.                             |

---

## Requirements

1. Parity
   a. Each existing chart shall be rebuilt showing the same data series, axes meaning, and date range behavior as before.
   b. Charts with gaps for missing days (health) shall keep gaps; charts that plot missing days as zero (baselines) shall keep zeros.
   c. The Mood & Habits combined chart shall remain (Mood, Water, Coffee together).
   d. Tooltips shall show the exact value and date for a point or bar.
2. Look
   a. Charts shall follow the app's theme tokens (accent, text, grid colors) and update when the accent color changes.
   b. Charts shall resize with their container without distortion.
3. Accessibility
   a. Each chart shall have a descriptive accessible name.
   b. Chart values shall be reachable by keyboard focus.
4. Cleanup
   a. The old chart library shall be removed from dependencies.
   b. The chart library version shall be pinned exactly.

---

## Acceptance Criteria

1. Parity
   a. Given 7 days of mood, water, and coffee logs, when the user opens Insights, then the Mood & Habits chart shows all three series for those days.
   b. Given weight readings on 3 of 7 days, when the user views the Weight chart, then the line has gaps on the 4 missing days.
   c. Given a baseline with no log on one day, when the user views its chart, then that day plots at zero.
   d. Given the user hovers or taps a point, when the tooltip opens, then it shows the date and exact value.
2. Look
   a. Given the user changes the accent color, when they return to Insights, then chart accents use the new color.
3. Accessibility
   a. Given a screen reader, when focus reaches a chart, then its name describes what it shows (e.g. "Weight over the last 7 days").
4. Cleanup
   a. Given the release build, when dependencies are inspected, then `chart.js` is not present and `@tanstack/charts` has an exact version.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [v1.5.0 — Insights](../v1.5.0/README.md) — the charts being migrated
- [US-036 — Baselines Progress Charts](../v1.9.0/US-036-baselines-charts.md)
- [Tech Stack](../../architecture/tech-stack.md)
- TanStack Charts docs: `node_modules/@tanstack/charts/docs` (bundled with the package)
