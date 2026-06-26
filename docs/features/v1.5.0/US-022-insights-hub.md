# US-022 — Insights Hub & Navigation

> **Status: Done — v1.5.0**
>
> Adds the `/insights` route and nav entry that all v1.5.0 charts live inside. Must be built first; chart stories (US-023–027) slot into it.

As a **fitness user**, I want a dedicated Insights page in the app
so that I can view visualizations of my training and habit data without leaving the app.

---

## Requirements

1. Route & page
   a. The app shall expose a `/insights` route that renders a scrollable page of charts.
   b. The page shall have a header title "Insights".
   c. The page shall display a note indicating the data window (e.g. "Last 45 days").

2. Navigation
   a. The bottom nav shall include an "Insights" tab that links to `/insights`.
   b. The Insights tab shall show as active when the current path is `/insights`.

3. Chart.js setup
   a. Chart.js shall be registered once at the module level (only the components needed for v1.5.0 charts: `LineController`, `BarController`, `DoughnutController`, `RadarController`, `CategoryScale`, `LinearScale`, `RadialLinearScale`, `PointElement`, `LineElement`, `BarElement`, `ArcElement`, `Legend`, `Tooltip`).
   b. Chart canvases shall be responsive and fill their container width.
   c. Chart colors shall use the app's CSS custom properties (`--color-accent`, `--color-text-secondary`, `--color-surface-3`, `--color-border`) so they adapt to the user's accent color and theme.

4. Empty state
   a. When no sessions, activities, or habit logs exist, the page shall display an empty state message prompting the user to log some data.
   b. Individual chart sections shall not render if they have no data to display.

---

## Acceptance Criteria

1. Route & page
   a. Given the app is open, when the user navigates to `/insights`, then a page titled "Insights" renders with no console errors.
   b. Given the page loads, when any chart data exists, then at least one chart section is visible.

2. Navigation
   a. Given the user is on any page, when they tap the Insights nav tab, then they land on `/insights`.
   b. Given the user is on `/insights`, when the nav renders, then the Insights tab is highlighted as active.

3. Chart.js setup
   a. Given the Insights page mounts, when Chart.js initializes, then no "module not registered" warnings appear in the console.
   b. Given the user rotates their device or resizes the window, when the layout reflows, then charts resize to fill their containers without overflow.

4. Empty state
   a. Given no data has been logged, when the user opens Insights, then an empty-state message is shown instead of blank chart areas.

---

## Related Docs

- [v1.5.0 README](./README.md)
- [US-023 — Mood vs Coffee & Water](./US-023-mood-habits-chart.md)
- [US-024 — Weekly Training Volume](./US-024-weekly-volume-chart.md)
- [US-025 — Activity Type Breakdown](./US-025-activity-breakdown-chart.md)
- [US-026 — Habit Balance Radar](./US-026-habit-radar-chart.md)
- [US-027 — Top Exercise Progress](./US-027-exercise-progress-chart.md)
