# US-034 — Baselines Setup

> **As built:** `baselines` + `baselineLogs` stores at **DB_VERSION 10**; pure logic in `src/lib/baselines/logic.ts` with tests; `baselineStore` in `src/lib/stores/baselines.svelte.ts`; routes `/baselines` + `/settings/baselines`; Settings toggle `baselinesEnabled` (default off). Overview gets a gated `HomeBaselinesCard` beside Habits. Deleting a baseline retains its logs. Clearing is wired into Settings → Data, and both stores are in the backup envelope.
>
> **Deviation from plan:** this story specified folding the stores into the existing v9 bump. That only works on a fresh database — `onupgradeneeded` runs only when the version increases, so any install already at v9 would silently lack the two stores and every read would fail. Shipped as **v10** instead, which upgrades existing installs without a wipe.
>
> Feature flag, Settings CRUD, IndexedDB schema, and navigation surfaces for Baselines. Logging UX: [US-035](./US-035-baselines-logging.md). Charts: [US-036](./US-036-baselines-charts.md). Discovery: [Roadmap — Baselines](../../roadmap/baselines.md).

As a **health-conscious user**, I want to define small daily baselines (floors or ceilings) for the things I care about — walking, writing, phone time, tiny workouts —
so that I can set an embarrassingly low bar once in Settings and use it day to day without rebuilding the Habit or Lift-plan systems.

---

## Design North Star

> "Set the bar once. Keep it stupidly achievable."

---

## Key Decisions

| Topic         | Decision                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **Separate**  | Not a Habit type; not a Lift plan                                                                   |
| **Gate**      | Master Settings toggle; default off; data persists when off                                         |
| **CRUD home** | **Settings → Baselines** (create / edit / deactivate / reorder); main `/baselines` is for daily use |
| **Fields**    | Name, direction (up / under), 1 or 2 metrics, user-typed unit label(s), daily target per metric     |
| **Multi-log** | Not a setting — always on (see US-035)                                                              |
| **Routes**    | `/baselines`, `/settings/baselines` — do **not** reuse `/goals` (Lift plans)                        |

---

## Data Model (planned)

IndexedDB **v10** (shipped as its own bump — see the deviation note above): add stores `baselines` + `baselineLogs`. Exact TypeScript names may vary at implement time; shapes below are the contract.

```typescript
type BaselineDirection = 'up' | 'under';

type BaselineMetric = {
	id: string; // stable within the baseline
	label: string; // user-typed unit label, e.g. "minutes", "miles", "words"
	target: number; // daily floor or ceiling for this metric
};

type Baseline = {
	id: string;
	name: string;
	direction: BaselineDirection;
	metrics: BaselineMetric[]; // length 1 or 2
	sortOrder: number;
	active: boolean;
	createdAt: string;
};

type BaselineLog = {
	id: string;
	baselineId: string;
	date: string; // ISO date — global logging date
	recordedAt: string; // ISO datetime — orders multiple entries per day
	values: Record<string, number>; // metricId → amount for this entry
};
```

- **Feature gate:** `UserPrefs.baselinesEnabled` (default `false`). When off, hide Baselines UI; rows remain in IndexedDB.
- **Backup:** include `baselines` + `baselineLogs` in the [US-028](../v1.7.0/US-028-data-export-backup.md) envelope when this ships.
- **Clear data:** Settings → Data gains a Baselines clear action (definitions + logs), consistent with [US-032](../v1.8.0/US-032-granular-data-clearing.md).

---

## Requirements

1. Feature gate
   a. The app shall expose a Settings master toggle for Baselines (default `false`).
   b. When the toggle is off, Baselines routes, Settings → Baselines management, and home/nav entry points for Baselines shall be hidden.
   c. When the toggle is off, existing Baseline and BaselineLog data shall remain in IndexedDB.
2. Settings → Baselines
   a. The user shall be able to create a baseline with name, direction (go up / stay under), one or two metrics, a user-typed unit label per metric, and a daily target per metric.
   b. The user shall be able to edit name, direction, unit labels, and targets. Metric count changes that would corrupt history shall be disallowed or clearly handled (prefer: metric count fixed after creation, same spirit as habit type immutability).
   c. The user shall be able to deactivate a baseline so it no longer appears on the main Baselines screen; historical logs remain.
   d. The user shall be able to reorder active baselines; order is reflected on the main Baselines screen.
   e. The user shall be able to delete a baseline; historical logs for that baseline remain queryable for charts/history or are retained per implementer choice documented in the as-built note (prefer retain like habits). **As built:** logs are retained.
3. Navigation
   a. When enabled, Baselines shall appear as a sibling destination to Habits (home card and/or equivalent entry), not nested under Habits.
   b. Main logging route shall be `/baselines`. Lift plans remain on `/goals`.
4. Persistence
   a. Baseline definitions and logs shall persist in IndexedDB across reloads and offline use.
   b. Export/import and granular clear shall include Baselines data when this version ships.

---

## Acceptance Criteria

1. Feature gate
   a. Given Baselines are off by default, when the user opens Settings, then a Baselines toggle is present and unchecked.
   b. Given the toggle is off, when the user visits Overview, then no Baselines entry is shown.
   c. Given the user enables Baselines, when they return to Overview, then a Baselines entry is available.
   d. Given the user disables Baselines after creating data, when they re-enable, then prior baselines and logs are still present.
2. Settings → Baselines
   a. Given the user creates “Walking” with two metrics (minutes target 30, miles target 1.25) and direction go up, when they save, then the baseline appears in Settings and on `/baselines`.
   b. Given the user creates “Phone time” with one metric (minutes target 30) and direction stay under, when they save, then the baseline is stored with direction under.
   c. Given a baseline exists, when the user edits its target and unit label and saves, then `/baselines` reflects the new values.
   d. Given a baseline is deactivated, when the user opens `/baselines`, then that baseline is not listed for new logging.
3. Navigation
   a. Given Baselines are enabled, when the user opens `/baselines`, then the page loads (logging details covered in US-035).
   b. Given Baselines are enabled, when the user opens `/goals`, then Lift plan UI still loads (unchanged routes).

---

## Related Docs

- [v1.9.0 README](./README.md)
- [US-035 — Baselines Daily Logging](./US-035-baselines-logging.md)
- [US-036 — Baselines Progress Charts](./US-036-baselines-charts.md)
- [Data Model](../../architecture/data-model.md)
- [US-029 — Health Metrics](../v1.7.0/US-029-health-metrics.md) — toggle pattern
- [US-009 — Habit Creation](../v1.3.0/US-009-habit-creation.md) — Settings CRUD pattern
- [Glossary — Baseline](../../glossary.md#baseline)
