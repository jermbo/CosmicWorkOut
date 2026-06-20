# US-026 — Habit Balance Radar Chart

> **Status: ✅ Done — v1.5.0**
>
> A radar chart showing average logged value per habit over the last 45 days. Visualizes balance (or imbalance) across the user's habit set at a glance.

As a **health-conscious user**, I want to see a radar chart of my average habit scores
so that I can see which habits I'm consistent with and which ones need more attention.

---

## Requirements

1. Chart data
   a. The chart shall compute the average logged value per habit over the last 45 days.
   b. Each habit shall appear as one axis on the radar. Habits with zero logs shall be included with a value of 0 so all habits are always visible.
   c. Values shall be normalized to a 0–1 scale per habit using the habit's expected range:
      - `boolean`: 0 or 1 (proportion of days logged as `true`)
      - `times` / `count` / `minutes`: average ÷ habit target (capped at 1.0)
      - `mood`: (average + 5) ÷ 10 (maps −5 to 0, +5 to 1)
   d. The chart shall use habit display names (not raw IDs) as axis labels.

2. Visual design
   a. The filled area shall use the app accent color at reduced opacity.
   b. The radar border (line) shall use the accent color at full opacity.
   c. Grid lines shall use the app's `--color-border` token.
   d. The chart shall include no legend (axis labels already identify each habit).

3. Section header
   a. The chart shall be preceded by a section title "Habit Balance" and a one-line description "Average habit consistency over the last 45 days."

4. Empty state
   a. If no habits are defined or no habit logs exist, the section shall not render and a message "No habit data yet" shall appear in its place.

---

## Acceptance Criteria

1. Chart data
   a. Given 3 habits are defined, when the chart renders, then the radar has 3 axes.
   b. Given a habit with no logs, when the chart renders, then that habit's axis shows value 0 (not an error).
   c. Given a `boolean` habit logged `true` on 30 of 45 days, when the chart renders, then that axis shows approximately 0.67.
   d. Given a `mood` habit averaging +2.5 over 45 days, when the chart renders, then that axis shows approximately 0.75.

2. Visual design
   a. Given the chart renders, when the user views it, then the filled area uses the accent color at reduced opacity.
   b. Given the user has a custom accent color, when the page loads, then the radar fill and border use that color.

3. Section header
   a. Given habit logs exist, when Insights loads, then the title "Habit Balance" is visible above the chart.

4. Empty state
   a. Given no habits are defined, when Insights loads, then the Habit Balance section shows "No habit data yet" instead of an empty radar.

---

## Related Docs

- [v1.5.0 README](./README.md)
- [US-022 — Insights Hub](./US-022-insights-hub.md)
- [US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
- [US-023 — Mood vs Coffee & Water](./US-023-mood-habits-chart.md)
