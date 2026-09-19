# US-035 — Baselines Daily Logging

> **Status: Planned — v1.9.0**
>
> Depends on [US-034](./US-034-baselines-setup.md). Charts: [US-036](./US-036-baselines-charts.md).

As a **health-conscious user**, I want to quickly log what I just did toward each baseline — sometimes several times a day — and fix mistakes on past days
so that today’s total stays honest and the embarrassing-low target stays visible while I build the habit of showing up.

---

## Design North Star

> "Log the bit you did. Watch the day add up."

---

## Key Decisions

| Topic             | Decision                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Main screen**   | `/baselines` — list active baselines with **today’s total(s)** vs **target(s)**                  |
| **Primary action**| Pick a baseline → add a log entry (values for each metric on that baseline)                      |
| **Aggregation**   | Many entries per `(baseline, date)`; day total per metric = **sum** of entry values              |
| **Date**          | Uses **global date context** (same as habits / health); backdating logs against the selected date |
| **Corrections**   | Edit or delete any single entry, including on past dates                                         |
| **Prefill**       | Prefill last-used values when adding is desirable; exact UX at implement time                    |

---

## Requirements

1. Daily list
   a. When Baselines are enabled, `/baselines` shall list active baselines in Settings sort order.
   b. Each row shall show the selected date’s total(s) and the configured target(s) for that baseline.
   c. For direction **go up**, meeting or exceeding all targets for the day shall be visually distinguishable as cleared (exact treatment at implement time).
   d. For direction **stay under**, staying at or below all targets shall be visually distinguishable as cleared.
2. Add log entry
   a. The user shall be able to add a log entry for a baseline on the current global date.
   b. An entry shall capture a numeric value for each metric on that baseline.
   c. After save, the day’s displayed total(s) shall equal the sum of all entries for that baseline and date.
3. Multiple entries
   a. The user shall be able to add more than one entry for the same baseline on the same date without replacing prior entries.
4. Edit and delete
   a. The user shall be able to edit the values of an existing entry.
   b. The user shall be able to delete an existing entry.
   c. Edit and delete shall work for entries on past dates (via global date context or an equivalent history affordance on the Baselines screen).
5. Empty and gated states
   a. Given Baselines are enabled but none exist, `/baselines` shall prompt the user to create one in Settings.
   b. Given Baselines are disabled, `/baselines` shall not be reachable from normal navigation (direct URL may redirect or show a short gated message).

---

## Acceptance Criteria

1. Daily list
   a. Given an active baseline “Pushups” with target 10 (go up) and no logs today, when the user opens `/baselines` on today, then the row shows 0 toward 10.
   b. Given logs totaling 12 for that baseline today, when the user views the row, then it shows 12 toward 10.
2. Add log entry
   a. Given baseline “Walking” with metrics minutes + miles, when the user adds an entry of 30 and 1.25, then those values appear in the day’s entry list and totals.
3. Multiple entries
   a. Given one walking entry of 15 min / 0.6 mi, when the user adds a second of 15 min / 0.7 mi, then day totals are 30 min and 1.3 mi.
4. Edit and delete
   a. Given an entry logged yesterday, when the user selects yesterday in the global date context and edits that entry, then yesterday’s totals update and today is unchanged.
   b. Given two entries today, when the user deletes one, then today’s totals reflect only the remaining entry.
5. Empty state
   a. Given Baselines enabled and zero baselines, when the user opens `/baselines`, then they see guidance to open Settings → Baselines.

---

## Related Docs

- [US-034 — Baselines Setup](./US-034-baselines-setup.md)
- [US-036 — Baselines Progress Charts](./US-036-baselines-charts.md)
- [US-008 — Habit Log Page](../v1.2.0/US-008-habit-log-page.md) — date context pattern
- [Glossary — Baseline](../../glossary.md#baseline)
