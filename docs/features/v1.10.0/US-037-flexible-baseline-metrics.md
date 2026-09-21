[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-037

# US-037 — Flexible Baseline Metrics

> **As built:** `BaselineMetric` is now `{ id, name, measure: 'duration' | 'distance' | 'count', baseline, unit?, label?, removed? }`; `Baseline` has no `direction`. Duration is stored in **minutes** and typed as minutes, `m:ss`, or `h:mm:ss` (`parseDuration` / `formatDuration` in `src/lib/baselines/logic.ts`). Edits go through `mergeMetrics`: matched by id, new drafts appended, missing ones soft-removed (`removed: true`, logs kept), measure locked once saved. The form (`BaselineForm.svelte`) lists metric cards with type buttons, reorder ↑↓, remove, and "+ Add a metric"; examples include Daily 10, Bike ride, Reading, Meditation, Writing, Phone locked away. **IndexedDB v11** clears `baselines` + `baselineLogs` when upgrading from v10. Backup restore drops v1.9.0-shaped baselines (`dropLegacyBaselines`) and restores everything else. Tests: `src/lib/baselines/logic.test.ts`, `src/lib/db/backupPayload.test.ts`.
>
> Replaces the metric rules

As a **growth-minded user**, I want to build a baseline from as many metrics as my practice needs — each measured as a duration, a distance, or a count
so that one baseline can hold my whole "Daily 10" (or a reading session, a bike ride, a meditation) without being squeezed into one or two free-typed units.

---

## Design North Star

> "Set the floor once. Measure it however the practice is measured."

---

## Key Decisions

| Topic                 | Decision                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Metric count**      | 1 to n. No fixed cap.                                                                                                                            |
| **Measurement types** | **Duration** (time) · **Distance** (unit per metric: mi, km, m, yd) · **Count** (user-typed label — reps, words, pages, laps). "Action" = Count. |
| **No direction**      | The up / under setting is removed. Baselines are phrased positively ("phone locked away: 30 minutes") — a copy suggestion, not a rule.           |
| **Baseline is fixed** | Each metric has a baseline value — the embarrassingly low floor. It is the yardstick; it is not auto-raised.                                     |
| **Not just physical** | Copy, examples, and placeholders must fit any pursuit — writing, reading, meditation, drawing, cooking, woodworking…                             |
| **No migration**      | v1.9.0 Baselines data is test data. On upgrade, existing baselines and baseline logs are **dropped**, not converted.                             |

### Examples

| Baseline             | Metrics                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Daily 10             | Pushups — Count 10 reps · Jumping jacks — Count 10 · Walk — Duration 10 min · Lunges — Count 10 |
| Bike ride            | Distance 5 mi · Duration 30 min                                                                 |
| Reading              | Duration 30 min · Count 20 pages                                                                |
| Meditation           | Duration 10 min                                                                                 |
| Walk (distance only) | Distance 0.5 mi                                                                                 |
| Writing              | Count 250 words                                                                                 |

---

## Requirements

1. Metrics
   a. The user shall be able to add one or more metrics to a baseline, with no fixed upper limit.
   b. Each metric shall have a name, a measurement type (Duration, Distance, or Count), and a baseline value.
   c. A Duration metric shall be entered and shown as time.
   d. A Distance metric shall let the user pick its unit (mi, km, m, yd) per metric.
   e. A Count metric shall let the user type its own label (e.g. reps, words, pages).
   f. The user shall be able to reorder metrics within a baseline.
2. Editing
   a. The user shall be able to edit a metric's name, baseline value, Distance unit, and Count label.
   b. The user shall be able to add a new metric to an existing baseline; past days simply have no value for it.
   c. The user shall be able to remove a metric from a baseline; its logged values are retained in storage but no longer shown.
   d. A metric's measurement type shall not change after creation.
3. No direction
   a. Baseline setup shall not ask for a direction (go up / stay under).
   b. Setup copy shall suggest phrasing the baseline so doing more is the win.
4. Upgrade
   a. On upgrading from v1.9.0, existing baselines and baseline logs shall be removed.
   b. After upgrade, Baselines shall work normally with an empty list.
   c. Backup export / import and Settings → Data clearing shall cover the new baseline shape.

---

## Acceptance Criteria

1. Metrics
   a. Given the user creates "Daily 10", when they add four Count / Duration metrics (pushups 10, jumping jacks 10, walk 10 min, lunges 10) and save, then all four metrics appear on the baseline.
   b. Given a new baseline, when the user adds a fifth, sixth, and seventh metric, then each is accepted — no limit message appears.
   c. Given a Distance metric, when the user picks km, then that metric shows km while another Distance metric on another baseline still shows mi.
   d. Given a Count metric, when the user types "pages", then the metric displays as pages.
2. Editing
   a. Given "Daily 10" with logs for last week, when the user adds a "Squats" metric, then last week's days show no squats value and today can log squats.
   b. Given a metric of type Count, when the user edits the baseline, then the type cannot be changed.
   c. Given a metric is removed, when the user views the baseline, then that metric is gone and the other metrics' history is unchanged.
3. No direction
   a. Given the user opens baseline setup, when the form renders, then there is no go up / stay under choice.
4. Upgrade
   a. Given a v1.9.0 install with baselines and logs, when the app upgrades to v1.10.0, then the Baselines list is empty and no error occurs.
   b. Given the upgraded app, when the user exports a backup and restores it, then baselines with 3+ typed metrics round-trip intact.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-038 — Baseline Logging & Comparison](./US-038-baseline-logging-comparison.md)
- [US-034 — Baselines Setup](../v1.9.0/US-034-baselines-setup.md) — superseded rules
- [Data Model](../../architecture/data-model.md)
- [US-028 — Data Export & Backup](../v1.7.0/US-028-data-export-backup.md)
- [Glossary — Baseline](../../glossary.md#baseline)
