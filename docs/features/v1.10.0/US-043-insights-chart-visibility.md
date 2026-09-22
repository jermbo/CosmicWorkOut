[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-043

# US-043 — Show / Hide Insights Charts

> **As built:** `src/lib/insights/charts.ts` lists every Insights chart (id, title, desc, features, experimental, wide); the page renders from it. `prefs.hiddenCharts` stores hidden ids (unknown ids ignored, new charts visible). `InsightCard.svelte` gives each card ⋯ → Hide chart. `/settings/insights` lists every chart with a switch; charts whose feature is off say which feature ("Habits is off — turn it on to see this chart"). When everything is hidden, Insights links to Settings → Insights. Also offers **Show all charts**.
>
> Makes the Insights page a testing ground: many charts, each hideable. Settings home lives in [US-045](./US-045-settings-feature-hub.md). Decisions: [v1.10.0 — Topic 5](./README.md#topic-5--more-insights-experiments).

As a **health-conscious user**, I want to hide the Insights charts that feel like noise and bring them back later
so that my Insights page shows only what I actually find useful — and what I keep visible tells me which views matter.

---

## Design North Star

> "Try everything. Keep what earns its place."

---

## Key Decisions

| Topic              | Decision                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Hide from card** | Each chart card has a menu ("⋯ → Hide").                                                   |
| **Bring back**     | Settings → Insights lists every chart with a show / hide switch.                           |
| **Default**        | All charts, including new experimental ones, start **visible**.                            |
| **Scope**          | Insights page charts only. Charts on feature pages (e.g. Baselines) are not hideable here. |

---

## Requirements

1. Hiding
   a. Every chart card on Insights shall offer a Hide action.
   b. Hiding a chart shall remove it from Insights immediately.
   c. Hidden state shall persist across reloads.
2. Showing again
   a. Settings → Insights shall list every Insights chart with its name and a show / hide switch.
   b. Turning a chart back on shall make it reappear on Insights in its normal position.
3. Defaults and gating
   a. Charts shall be visible by default, including charts added in future versions.
   b. A chart whose feature is off (e.g. Habits disabled) shall stay hidden regardless of its switch; the Settings list shall say why.
4. Empty state
   a. If every chart is hidden, Insights shall show a short message linking to Settings → Insights.

---

## Acceptance Criteria

1. Hiding
   a. Given the Habit radar is visible, when the user chooses ⋯ → Hide, then it disappears from Insights.
   b. Given a hidden chart, when the user reloads the app, then it is still hidden.
2. Showing again
   a. Given Habit radar hidden, when the user turns it on in Settings → Insights, then it reappears in its usual spot.
3. Defaults and gating
   a. Given a fresh install, when the user opens Insights, then every available chart is visible.
   b. Given Health metrics off, when the user opens Settings → Insights, then the Weight chart row notes that Health is off.
4. Empty state
   a. Given all charts hidden, when the user opens Insights, then a message links to Settings → Insights.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-044 — Experimental Insights Charts](./US-044-experimental-insights-charts.md)
- [US-045 — Settings Feature Hub](./US-045-settings-feature-hub.md)
- [US-022 — Insights Hub](../v1.5.0/US-022-insights-hub.md)
- [Settings & Preferences](../../requirements/settings-preferences.md)
