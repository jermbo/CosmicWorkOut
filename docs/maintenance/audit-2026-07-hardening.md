# Hardening Audit — July 2026

> A whole-codebase review for **performance, memory leaks, security, and correctness** —
> the failure-mode counterpart to the [June 2026 maintenance audit](audit-2026-06.md), which
> focused on docs and clean code.
>
> **Status:** the three data-loss risks were **fixed** (see below). Everything else is
> **deferred on purpose** — recorded here so we know we thought about it, with a trigger for
> when each becomes worth doing. Deferred does **not** mean forgotten.
>
> Date: 2026-07-16 · Reviewed against `main` working tree at v1.9.0

---

## TL;DR

1. **Three data-loss bugs were real and are now fixed** — an IndexedDB version bump wiped all
   user data, backup restore wiped-before-validating and then lied about it, and corrupt prefs
   could brick startup. → [Fixed](#fixed-2026-07-16)
2. **Security is otherwise healthy.** No XSS (`{@html}`, `innerHTML`, `eval` all absent), no
   hardcoded secrets, navigation params are whitelisted, and the service worker is correctly
   scoped and versioned. The only remaining gaps are backup-trust hardening and a missing CSP.
   → [Security](#security-deferred)
3. **Performance is fine at today's data volumes but scales poorly.** Everything reads whole
   tables (`getAll`) and filters in JS; the defined IndexedDB indexes are unused; charts fully
   destroy/recreate on any store change. These bite only after months/years of logs.
   → [Performance](#performance-deferred)
4. **A few correctness sharp edges exist** — routines are edited/deleted by name not id,
   check-then-act races in plan activation and habit increment, and missing save-error handling
   in several sheets. Low probability today; worth fixing before/if they surface.
   → [Correctness](#correctness-deferred)

---

## How this was reviewed

Whole-codebase sweep across four lenses (memory leaks, security, performance, correctness),
each a focused pass over `src/`, then the highest-severity findings were verified by reading
the actual code. No behavior was changed except the three fixes below.

Source-of-truth reminder: per `CLAUDE.md`, durable knowledge lives in `docs/`. This report is
written here so the reasoning survives the session.

---

## <span id="fixed-2026-07-16"></span>Fixed (2026-07-16)

These were genuine data-loss paths, cheap to fix, and fixed immediately. `svelte-check` clean,
all 21 tests pass.

| #   | Problem                                                                                                                                   | Fix                                                                                                                                                                                                              | Files                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | **Any `DB_VERSION` bump wiped all data.** `onupgradeneeded` deleted every object store and recreated it from scratch — no migration path. | Idempotent, non-destructive upgrade: `ensureStore` / `ensureIndex` create only what's missing. Safe today (produces the identical schema); future changes append calls + transforms keyed on `event.oldVersion`. | `src/lib/db/database.ts`                                                     |
| 2   | **Backup restore wiped data before validating, then reported "your data is unchanged" on failure.** Non-atomic, misleading.               | Validate every store value is an array (and normalize `localStorage`) **before** `clearWorkoutData()`. Restore error message now distinguishes pre-wipe validation failures from mid-write failures.             | `src/lib/db/backup.ts`, `src/routes/settings/data/+page.svelte`              |
| 3   | **Corrupt `cwout:prefs` crashed startup** (unguarded `JSON.parse` in `onMount`), leaving a permanent spinner.                             | `prefsStore.load()` wraps parsing in try/catch → defaults; `+layout.svelte` boot path wrapped in try/catch/finally with a "Couldn't load your data / Reload" error state.                                        | `src/lib/stores/prefs.svelte.ts`, `src/routes/+layout.svelte`, `src/app.css` |

Two low-risk memory-leak fixes rode along:

- `SetTile.svelte` — animation `setTimeout` now tracked and cleared on destroy (was firing on
  unmounted components).
- `toast.svelte.ts` — dismiss timers tracked in a map and cancelled on manual `dismiss()`.

---

## <span id="security-deferred"></span>Security — deferred

**Verdict: healthy.** No XSS sinks (`{@html}`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
`document.write`, `eval`, `new Function` — none present). User text renders through Svelte's
default-escaped interpolation. No hardcoded secrets. Navigation/URL params (`?program=`,
`?discipline=`, `?date=`, `[groupId]`) are all resolved through whitelist lookups. Service
worker excludes cross-origin, versions its cache, and cleans old caches on activate.

Remaining, all low severity given the app is client-only with no backend:

| Concern                                                                                                                                                                         | Where                                                            | Trigger to fix                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backup records written to IndexedDB with no per-record shape validation; a crafted backup can corrupt data or replace built-ins by importing seeded IDs with `isBuiltIn:false`. | `backup.ts` `importBackup`, `database.ts` `upsertBuiltInRecords` | If backup import ever accepts files from untrusted sources, or we see corruption reports. Add per-store schema validation and/or a staging-DB-then-swap restore. |
| Unbounded backup file read (`file.text()` before parse) — a multi-GB file can freeze the tab.                                                                                   | `settings/data/+page.svelte`                                     | Cheap to pre-empt: reject `file.size` over ~50 MB before parsing. Do it next time this file is touched.                                                          |
| No Content-Security-Policy.                                                                                                                                                     | `src/app.html`                                                   | Defense-in-depth only (no XSS sinks today). Add if we ever introduce `{@html}` or third-party embeds.                                                            |
| `session.svelte.ts` recovery and other stored JSON trusted by shape after parse.                                                                                                | `session.svelte.ts`                                              | If tampered `localStorage` causes runtime crashes in the field.                                                                                                  |

---

## <span id="performance-deferred"></span>Performance — deferred

**Verdict: fine now, scales linearly with logged history.** All findings are "works at 100s of
records, degrades at 10,000s." Safe to defer until a user (or seed test) has a year-plus of data
and something feels slow.

Ranked by impact-at-scale:

1. **IndexedDB indexes are dead code.** `by_date`, `by_habit`, `by_metric`, `by_status` are
   defined but never queried — every read is `getAll()` then a JS filter. `database.ts` + all
   stores. _Fix direction:_ add `getByIndex` / `IDBKeyRange` helpers for date-range reads
   (insights, calendar month, week strip).
2. **Charts fully destroy/recreate on any store change.** All six insight charts rebuild the
   canvas whenever _any_ session/habit/health record changes, not just the date range.
   `src/lib/components/insights/Chart*.svelte`. _Fix direction:_ keep the instance, use
   `chart.update()`; scope `$effect` deps to the dataset.
3. **Calendar per-cell scans** — `O(habits × logs)` per cell (~30 cells) on every render;
   same pattern for the home page `weekIndicators` full-store scan. _Fix direction:_ precompute
   a `Map<date, dayMeta>` once per visible month.
4. **`JSON.stringify(activeSession)` on every set logged** — `session.svelte.ts` persist path.
   _Fix direction:_ debounce the localStorage write.
5. **Missing in-memory date indexes** for habit logs and health readings (linear `.find` on hot
   paths), N+1 `itemLastUsed.get` at session/plan start, `refreshSessions()` re-reads the whole
   table after a single delete. _Fix direction:_ mirror the existing `activitiesByDate` map
   pattern; patch local arrays instead of full reloads.

No infinite `$effect` loops were found. The real reactivity smell is over-broad effect
dependencies (charts, week indicators), not loops.

---

## <span id="correctness-deferred"></span>Correctness — deferred

Sharp edges that are low-probability today but fragile:

| Concern                                                                                                                                                           | Where                                                                        | Note                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Routines edited/deleted by name, not id** — duplicate names in a week all change together.                                                                      | `program.svelte.ts` `saveRoutine` / `removeRoutine`                          | Needs care: callers pass names. Fix if duplicate routine names become possible.               |
| **Check-then-act races** — `activatePlan` and `habits.increment` read-modify-write with no guard; two rapid taps or two tabs can lose updates or double-activate. | `goalPlans.svelte.ts`, `habits.svelte.ts`                                    | Single-tab usage makes this rare. Add in-flight guards if reported.                           |
| **Missing save-error handling** — `handleCreate` / `handleSave` / `handleFinish` can strand `saving = true` with no feedback on DB failure.                       | `CreateProgramSheet`, `WorkoutEditor`, `ExerciseFormSheet`, session overlays | The DB layer already toasts on write error; the UI-state reset is what's missing. Low effort. |
| **Streak/week uses UTC bucketing on local dates** — sessions near ISO week/year boundaries can land in the wrong week.                                            | `streak.ts`, `date.ts`                                                       | Verify with a boundary test before trusting long-streak displays.                             |
| **Non-atomic two-store writes** — `createPlan` can orphan a program if the goal-plan write fails.                                                                 | `goalPlans.svelte.ts`                                                        | Rare; add a rollback or reorder writes if it surfaces.                                        |

Full per-lens breakdowns (with line numbers) were produced during the review; this table is the
durable summary.

---

## Proposed order, if/when we act

Sequenced low-risk first, each independently reviewable:

| Phase                   | Work                                                                                  | Trigger                                                        |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **A. Cheap hardening**  | Backup file-size cap; save-error handling in sheets; streak boundary test.            | Next time those files are touched.                             |
| **B. Perf indexing**    | Use IndexedDB indexes + `IDBKeyRange`; in-memory date maps; debounce session persist. | A user/seed hits a year-plus of data and something feels slow. |
| **C. Chart updates**    | `chart.update()` instead of destroy/recreate; scope effect deps.                      | Insights page feels janky with real data.                      |
| **D. Correctness**      | Routine-by-id; check-then-act guards; atomic multi-store writes.                      | If duplicate names, multi-tab, or corruption reports appear.   |
| **E. Defense-in-depth** | Per-record backup validation / staging restore; CSP.                                  | If backups are ever shared/imported from untrusted sources.    |

---

_Recorded as a deliberate "we saw this" register. The three data-loss fixes are done; the rest
is deferred with explicit triggers, not dropped._
