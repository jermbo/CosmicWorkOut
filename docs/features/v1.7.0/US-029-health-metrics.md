# US-029 — Health Metrics

> **Status: ✅ Shipped — v1.7.0**
>
> Personal body measurements (weight, blood pressure) tracked over time. Optional feature toggled in Settings. Not a medical device — no clinical ranges, alerts, or diagnoses.
>
> **As built:** `healthReadings` store added at **DB_VERSION 8** (indexes `by_date`, `by_metric`); catalog + aggregation in `src/lib/health/metrics.ts`; `healthStore` in `src/lib/stores/health.svelte.ts`; `healthMetricsEnabled` added to `UserPrefs`/`prefsStore`. Surfaces: `/health` (weight + BP sheets), home `HomeHealthCard`, Insights summary row + `ChartHealthWeight` / `ChartHealthBP`, calendar dot + day-detail summary, all gated by the toggle. Week/calendar `health` indicator dot uses `--color-red`.

As a **health-conscious user**, I want to log body measurements like weight and blood pressure and see trends over time
so that I can monitor my overall health alongside my workouts and habits without leaving the app.

---

## Design North Star

> "Track it, see the trend — nothing more."

CosmicWorkOut is a personal fitness journal, not clinical software. Health metrics are **optional**, **local-only**, and **trend-focused**. Logging should be quick; charts should be readable over weeks and months.

---

## Key Decisions

| Topic              | Decision                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Not habits**     | Separate **Health metrics** domain — habits are one value/day with tap-counter UX; BP needs multiple readings/day and compound values |
| **Catalog**        | **App-defined metric types only** (Weight, Blood Pressure in v1). New types ship in app updates — no user-created metrics             |
| **Settings**       | One master toggle: `healthMetricsEnabled`. Off = hide all UI; **data stays in IndexedDB**                                             |
| **Surfaces**       | Home summary card → `/health`; Insights charts + summary stats; Calendar combined indicator                                           |
| **Weight**         | Once per day (upsert by date); reuses existing **`weightUnit`** pref (`lb` / `kg`)                                                    |
| **Blood pressure** | Multiple readings per day; **systolic + diastolic + optional pulse**; trend charts use **daily averages**                             |
| **Date**           | Follows **global date context** (same as habits) — backdating uses the selected Today date                                            |
| **Corrections**    | Edit and delete individual readings                                                                                                   |
| **Calendar**       | One combined **Health** dot if **any** health reading exists that day (not per-metric dots)                                           |
| **Insights (v1)**  | Two charts (weight trend; BP daily-average systolic/diastolic lines) **plus** summary stats (latest weight, 7-day BP average)         |
| **Backup**         | Include `healthReadings` in [US-028](./US-028-data-export-backup.md) export envelope when both ship                                   |

---

## Why Not Habits?

The [Habit](../v1.1.0/US-004-habit-tracking.md) model stores exactly **one numeric value per habit per day** (`HabitLog.value`). That fits water, mood, and yes/no toggles — not:

- **Decimals** (body weight)
- **Multi-field values** (120/80, optional pulse)
- **Multiple readings per day** (morning vs evening BP)
- **Aggregation for charts** (daily average systolic/diastolic)

Stretching habits would lose individual BP readings or corrupt historical data. Health metrics get their own store and UI.

---

## Metric Catalog (Code Only)

Definitions live in `src/lib/health/metrics.ts` — **not** IndexedDB. The catalog is versioned with the app.

| `metricId`      | Label          | Cardinality          | Values                                                    | Unit                              |
| --------------- | -------------- | -------------------- | --------------------------------------------------------- | --------------------------------- |
| `weight`        | Weight         | **Once per day**     | `{ value: number }`                                       | User's `weightUnit` (`lb` / `kg`) |
| `bloodPressure` | Blood Pressure | **Multiple per day** | `{ systolic: number; diastolic: number; pulse?: number }` | mmHg (pulse: bpm)                 |

**Future types** (out of v1 scope): resting heart rate, sleep duration, etc. — add a row to the catalog + reading shape; no schema fork.

---

## Data Model

### HealthReading (IndexedDB: `healthReadings`)

```typescript
type HealthMetricId = 'weight' | 'bloodPressure';

type WeightValues = { value: number };

type BloodPressureValues = {
	systolic: number;
	diastolic: number;
	pulse?: number;
};

type HealthReading = {
	id: string; // uuid
	metricId: HealthMetricId;
	date: string; // ISO date YYYY-MM-DD — global logging date
	recordedAt: string; // ISO datetime — orders multiple BP readings; weight uses log time
	values: WeightValues | BloodPressureValues;
};
```

**Weight:** upsert on `(metricId, date)` — at most one weight reading per calendar date. A new log for the same date replaces the existing row (same id or delete-then-insert).

**Blood pressure:** many rows per `date`; `recordedAt` distinguishes morning vs evening readings.

### UserPrefs extension

```typescript
type UserPrefs = {
	// ...existing fields
	healthMetricsEnabled: boolean; // default false
};
```

### Aggregation (for charts)

- **Weight:** plot raw daily value (null when no reading).
- **Blood pressure:** per date, compute `avg(systolic)`, `avg(diastolic)`, and `avg(pulse)` where pulse was provided. Day view lists individual readings; Insights uses daily averages.

### DB bump

`DB_VERSION` → **8** when implemented. Add store `healthReadings` with indexes `by_date`, `by_metric`.

---

## UI Surfaces

### Settings (hub)

- **Health metrics** row with inline toggle on `/settings` ([US-030](./US-030-settings-restructure.md)).
- When **off:** no home card, no `/health` nav entry, no Insights health section, no calendar health dot. Readings remain in IndexedDB.
- When **on:** all surfaces below appear.

### Home (`/`)

- **Health card** (same pattern as Habits / Activity): compact summary for `loggingContext.date` — e.g. today's weight if logged, latest BP or "not logged".
- Tap → `/health`.
- Week strip indicators: add `'health'` when any reading exists on that date (alongside habits, strength, dance, activity).

### Health page (`/health`)

- Header with global date (inherited from `loggingContext`).
- **Weight block:** numeric entry (stepper or numpad consistent with app patterns); shows today's value or empty.
- **Blood pressure block:** systolic / diastolic inputs; optional pulse field; list of today's readings with time; tap to edit/delete.
- **History:** context-date readings on main view ship today; extended history view on [roadmap](../../roadmap/README.md#ux-polish).

### Insights (`/insights`)

When `healthMetricsEnabled` and data exists:

1. **Summary row:** latest weight; 7-day rolling average for systolic and diastolic.
2. **Weight chart:** line chart over the Insights window (e.g. last 45 days).
3. **Blood pressure chart:** two lines (daily avg systolic, daily avg diastolic). Optional third line for pulse average when data exists.

When toggle is off, health section hidden entirely (even if readings exist).

### Calendar (`/calendar`)

- Combined **Health** legend item and day marker when any `healthReadings` row exists for that date.
- Day detail panel: show weight and BP summary for the selected day (readings list for BP).

---

## Requirements

### 1. Feature toggle

a. Settings hub shall expose a **Health metrics** row with an inline toggle (`healthMetricsEnabled`, default `false`). See [US-030](./US-030-settings-restructure.md).
b. When disabled, the app shall hide the home health card, `/health` route entry, Insights health section, and calendar health indicators.
c. When disabled, existing `healthReadings` shall remain in IndexedDB unchanged.
d. When re-enabled, all readings and charts shall restore without data loss.

### 2. Weight logging

a. The user shall log body weight once per calendar date (per global date context).
b. Weight shall display and store in the user's `weightUnit` preference (`lb` or `kg`).
c. Logging weight for a date that already has a reading shall replace the previous reading (upsert).
d. The user shall edit or delete the weight reading for the selected date.

### 3. Blood pressure logging

a. The user shall log systolic and diastolic values (mmHg) for each reading.
b. Pulse (bpm) shall be optional per reading.
c. The user may log multiple BP readings per day; each shall store `recordedAt` automatically.
d. The user shall edit or delete any BP reading.

### 4. Global date

a. All health logs shall use `loggingContext.date` as `HealthReading.date`.
b. Backdating shall follow the same confirmation pattern as habits when the selected date is not today.

### 5. Home card

a. When health metrics are enabled, the home page shall show a health summary card.
b. The card shall reflect the current context date.
c. Tapping the card shall navigate to `/health`.

### 6. Insights

a. When enabled and weight data exists, Insights shall show a weight trend chart and the latest weight value.
b. When enabled and BP data exists, Insights shall show a chart of daily average systolic and diastolic, plus 7-day rolling averages in the summary row.
c. Health charts shall not render when the feature toggle is off.

### 7. Calendar

a. When enabled, any date with at least one health reading shall show a combined health indicator.
b. The day detail view shall include health summary for that date.

### 8. Data export (with US-028)

a. Backup export shall include the `healthReadings` store when US-028 Phase 1 ships.
b. Restore shall re-import health readings with the rest of workout data.

---

## Acceptance Criteria

1. Given health metrics are **disabled**, when the user opens Today, then no health card appears and `/health` is not reachable from the UI.
2. Given health metrics are **enabled**, when the user logs weight on the selected date, then the home card and Insights weight chart update.
3. Given two BP readings on the same day, when the user opens Insights, then the BP chart shows one point per day equal to the average of those readings.
4. Given a logged weight, when the user deletes it on `/health`, then it disappears from home, calendar, and Insights.
5. Given health metrics were disabled with existing data, when the user re-enables the toggle, then all previous readings and charts return.
6. Given the user changes the global date to a past day, when they log weight, then the reading is stored with that `date` field.

---

## Implementation Notes

| Area     | Files / modules                                                                             |
| -------- | ------------------------------------------------------------------------------------------- |
| Catalog  | `src/lib/health/metrics.ts` — definitions + aggregation helpers                             |
| Types    | `src/lib/db/types.ts` — `HealthReading`, `HealthMetricId`, extend `UserPrefs`               |
| DB       | `src/lib/db/database.ts` — store `healthReadings`, `DB_VERSION` 8                           |
| Store    | `src/lib/stores/health.svelte.ts` — load, upsert weight, add/update/delete BP               |
| Route    | `src/routes/health/+page.svelte`                                                            |
| Home     | `src/lib/components/HomeHealthCard.svelte`; week indicators in `routes/+page.svelte`        |
| Insights | `src/lib/components/insights/ChartHealthWeight.svelte`, `ChartHealthBP.svelte`, summary row |
| Calendar | indicator + day panel in `routes/calendar/+page.svelte`                                     |
| Settings | inline toggle on Settings hub ([US-030](./US-030-settings-restructure.md))                  |
| Boot     | `healthStore.load()` in `routes/+layout.svelte` after `initDB()`                            |
| Backup   | `src/lib/db/backup.ts` — include `healthReadings` (coordinate with US-028)                  |

**Suggested build order:** [US-030](./US-030-settings-restructure.md) hub first (or in parallel) → data layer + store → health toggle on hub → `/health` → home card → Insights → calendar → export.

---

## Out of Scope (v1)

| Item                               | Notes                                      |
| ---------------------------------- | ------------------------------------------ |
| User-defined custom metrics        | Catalog is app-defined only                |
| Per-metric enable toggles          | Master switch controls all catalog metrics |
| Clinical ranges / "high BP" alerts | Not a medical device                       |
| Habit integration                  | Separate domain by design                  |
| Separate body-weight unit          | Reuses lifting `weightUnit`                |
| Apple Health / Google Fit sync     | Client-only; no external APIs              |
| CSV export                         | Covered by US-028 JSON backup if needed    |

---

## Related Docs

- [v1.7.0 README](./README.md)
- [US-028 — Data Export, Backup & Device Sync](./US-028-data-export-backup.md)
- [Data Model — HealthReading](../../architecture/data-model.md#healthreading)
- [Glossary — Health metrics](../../glossary.md#health-metrics)
- [Offline Strategy](../../architecture/offline-strategy.md)
- [Implementation Status](../../implementation/status.md)
- [US-030 — Settings Hub Restructure](./US-030-settings-restructure.md)
