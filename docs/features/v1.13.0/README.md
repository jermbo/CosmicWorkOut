[Wiki](../../README.md) › [Features](../README.md) › v1.13.0

# v1.13.0 — Insights Cleanup

> **Status:** Built. US-059 and US-060 are checked with the type check, unit tests, lint and the docs check, and clicked through in the browser at phone and desktop width with the debug data. Waiting on hands-on testing.

v1.10.0 made Insights a testing ground: many charts, each one hideable. Use has shown which ones earn their place. This release keeps those and drops the rest. It also turns the three health cards into one card that a nurse can read at a glance.

Design and reasons: [Insights Cleanup](../../initiatives/insights-cleanup/README.md).

---

## What's Shipping

| Story                                      | Title                    | Status |
| ------------------------------------------ | ------------------------ | ------ |
| [US-059](./US-059-trim-insights-charts.md) | Keep Six Insights Charts | Built  |
| [US-060](./US-060-health-card.md)          | One Health Card          | Built  |

---

## Key Decisions

| Decision                  | Detail                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Six charts stay**       | Mood vs Habits, All Habits, This Week vs Last Week, Weekly Volume, Activity Mix, Health Summary. Eight others are **Removed**.            |
| **Trial charts graduate** | All Habits and This Week vs Last Week lose the "Experimental" label.                                                                      |
| **One Health card**       | Weight Trend and Blood Pressure merge into Health Summary.                                                                                |
| **Clinician view first**  | Blood pressure shows each reading as a bar over the American Heart Association zones. The line view of daily averages stays as **Trend**. |
| **Labels, not advice**    | The zones are labels from a public chart. No alerts and no advice.                                                                        |
| **No data change**        | Nothing new is stored, and no migration is needed. The ids of removed charts in `hiddenCharts` are ignored.                               |

---

## Architecture pages to change

Per the [user story standards](../../standards/user-story-standards.md#the-page-comes-first), these change before the code, in this branch:

- [Insights](../../architecture/insights.md): the chart table, the Experimental list, the example
- [Health metrics](../../architecture/health-metrics.md): "Where readings show"
- [What each toggle hides](../../architecture/toggle-surfaces.md): the Insights charts row
- [Settings object](../../architecture/settings-object.md): the `hiddenCharts` example uses `day-of-week`, which goes away
- [Local storage keys](../../architecture/local-storage-keys.md): the key that remembers the Health view, if it is not in the settings object
