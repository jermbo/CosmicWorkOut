[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-050

# US-050 — Cheap Hardening

> **As built:** Phase A of the [July 2026 Hardening Audit](../../maintenance/audit-2026-07-hardening.md#proposed-order-ifwhen-we-act).
>
> - **Backup size cap:** `assertBackupSize()` in `db/backupPayload.ts` rejects files over `MAX_BACKUP_BYTES` (50 MB) before `file.text()` reads them. Restore shows "This file is too large to be a CosmicWorkOut backup."
> - **Save-error handling:** `CreateProgramSheet`, `WorkoutEditor`, `ExerciseFormSheet`, `ItemFormSheet` and `DanceRoutineEditor` now reset `saving` in a `finally`, so a failed write no longer leaves the button stuck. The DB layer already shows the error toast. The strength and dance session overlays gained a `finishing` guard: Finish is disabled while saving, and a failed save leaves the session open so Finish can be retried.
> - **Streak boundary test:** `src/lib/streak.test.ts` pins ISO week keys across year ends (2020-W53, 2025-W1, 2026-W53), Monday–Sunday grouping, and a streak running through New Year. **Result: no bug.** `isoWeekKey` builds its UTC date from the _local_ calendar day, so the audit's "UTC bucketing" worry doesn't apply. `streak.ts` now imports `./date.ts` so Node can run the test.
>
> Decisions: [v1.10.0 — Topic 10](./README.md#topic-10--audit-phase-a).

As a **fitness user**, I want the app to fail safely when something goes wrong
so that I never get stuck on a frozen button or a frozen tab.

---

## Requirements

1. Restore
   a. Restore shall refuse a file larger than 50 MB before reading it, with a clear message, and leave existing data unchanged.
2. Saving
   a. When a save fails, the sheet or editor shall become usable again (not stuck "saving").
   b. Tapping Finish twice shall not save a session twice. A failed Finish shall leave the session open.
3. Streaks
   a. Week streaks shall count correctly across year boundaries — covered by unit tests.

---

## Related Docs

- [July 2026 Hardening Audit](../../maintenance/audit-2026-07-hardening.md)
- [US-028 — Data Export & Backup](../v1.7.0/US-028-data-export-backup.md)
