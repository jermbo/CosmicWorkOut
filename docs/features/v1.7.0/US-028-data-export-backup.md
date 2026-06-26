# US-028 — Data Export, Backup & Device Sync

> **Status: Shipped (Phase 1) — v1.7.0**
>
> Offline-first data portability via JSON file export/import. Device-to-device sync (Phase 2) is on the [roadmap](../../roadmap/device-sync.md).
>
> **As built:** `src/lib/db/backup.ts` provides `exportBackup()` / `downloadBackup()` / `parseBackup()` / `importBackup()` over a versioned `cosmic-workout-backup` v1 envelope; `putAllRecords` and `itemLastUsed.getAll` were exposed from `database.ts`. Export/Restore live on `settings/data` — restore is **Replace-only**, validates `format`/`version`, confirms via dialog, then wipes + writes + re-seeds built-ins + reloads. Parse/validation errors surface as toasts and leave data untouched.

As a **fitness user**, I want to back up my workout history and move it between devices
so that I do not lose data when switching phones, clearing browser storage, or using the app on both phone and computer.

---

## Design North Star

> "Your data is yours — take it with you."

The app is client-only ([Design Principles](../../vision/principles.md)). Backup and sync must work **entirely on-device**: file download, file picker, and optional local peer transfer. No online services.

---

## What Gets Backed Up

| Store                    | Technology   | Include in backup? | Notes                                                         |
| ------------------------ | ------------ | ------------------ | ------------------------------------------------------------- |
| `items`                  | IndexedDB    | Yes                | User-created / user-edited; built-ins re-seed on boot         |
| `programs`               | IndexedDB    | Yes                | Same                                                          |
| `sessions`               | IndexedDB    | Yes                | Core history                                                  |
| `itemLastUsed`           | IndexedDB    | Yes                | Weight/rep memory                                             |
| `activities`             | IndexedDB    | Yes                | Activity log                                                  |
| `habits`                 | IndexedDB    | Yes                | Custom habits + edits to built-ins                            |
| `habitLogs`              | IndexedDB    | Yes                | Habit history                                                 |
| `healthReadings`         | IndexedDB    | Yes                | Health metric readings ([US-029](./US-029-health-metrics.md)) |
| `cwout:prefs`            | localStorage | Optional           | User may choose to include preferences                        |
| `cwout:activeProgramIds` | localStorage | Yes                | Per-Discipline active program                                 |
| `cwout:lastActivityType` | localStorage | Yes                | Last-used activity type                                       |
| `cwout:activeSession`    | localStorage | **No**             | Transient crash-recovery state                                |
| `cwout:habitDay`         | localStorage | **No**             | Ephemeral UI cache                                            |

Built-in items, programs, and habits ship in code (`src/lib/db/seed.ts`) and are upserted on every boot via `initDB()`. A backup may include built-in records for a complete snapshot, but restore does not depend on them.

---

## Backup File Format

Versioned JSON envelope — one file, human-readable, diffable in git if the user wants.

```json
{
	"format": "cosmic-workout-backup",
	"version": 1,
	"exportedAt": "2026-06-23T12:00:00.000Z",
	"db": {
		"items": [],
		"programs": [],
		"sessions": [],
		"itemLastUsed": [],
		"activities": [],
		"habits": [],
		"habitLogs": [],
		"healthReadings": []
	},
	"localStorage": {
		"cwout:prefs": {},
		"cwout:activeProgramIds": {},
		"cwout:lastActivityType": "walk"
	}
}
```

- **`version`** — schema version for forward-compatible import migrations.
- **`exportedAt`** — ISO timestamp; used in merge (Phase 2) when record-level timestamps are absent.
- Reject imports where `format` is missing or `version` is newer than the app supports.

---

## Phase 1 — JSON File Export & Restore

Simplest path. Lives on **Settings → Data & backup** (`/settings/data` — [US-030](./US-030-settings-restructure.md)).

### Export

1. Read all IndexedDB stores listed above.
2. Read selected localStorage keys.
3. Build envelope → `Blob` → trigger browser download.
4. Filename pattern: `cosmic-workout-backup-YYYY-MM-DD.json`.

### Restore

1. Hidden `<input type="file" accept=".json,application/json">`.
2. Parse and validate envelope.
3. Show confirm dialog — restore **replaces** all workout data on this device.
4. Clear IndexedDB (`clearWorkoutData()`), write imported records, write localStorage keys, call `initDB()` to re-upsert built-ins, reload.

**Restore modes for v1:**

| Mode                  | Behavior                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| **Replace** (default) | Wipe local workout data, import file wholesale. Simplest and safest for v1. |

Merge-on-import is on the [roadmap](../../roadmap/device-sync.md). A one-time file restore is intentionally all-or-nothing.

### Requirements (Phase 1)

1. Export
   a. `/settings/data` shall expose an **Export backup** action that downloads a JSON file.
   b. Export shall include all IndexedDB stores in the table above except transient keys.
   c. Export shall succeed offline with no network calls.

2. Restore
   a. `/settings/data` shall expose a **Restore from backup** action that opens a file picker.
   b. Restore shall validate `format` and `version` before writing anything.
   c. Restore shall require explicit confirmation; the dialog shall state that existing workout data will be replaced.
   d. On success, the app shall reload so stores reflect imported data.
   e. On parse or validation failure, the app shall show an error and leave existing data untouched.

3. Preferences
   a. Export shall include `cwout:prefs` by default.
   b. Restore shall overwrite prefs when the backup includes them.

### Acceptance Criteria (Phase 1)

1. Given the user has session history, when they tap Export backup, then a `.json` file downloads containing their sessions.
2. Given a valid backup file, when the user restores on a fresh install, then sessions, programs, habits, and activities match the export.
3. Given a corrupt or unknown-format file, when the user attempts restore, then an error is shown and no data is lost.
4. Given the app is offline, when the user exports or restores, then both operations complete without network access.

### Implementation Notes

- New module: `src/lib/db/backup.ts` with `exportBackup()` and `importBackup(file)`.
- Reuse `db.*.getAll()`, `putAllRecords()`, and `clearWorkoutData()` from `database.ts`.
- UI: export / restore on `/settings/data` ([US-030](./US-030-settings-restructure.md)); not on the hub.

---

## Phase 2 — Device sync

Moved to the [roadmap](../../roadmap/device-sync.md): QR pairing, LAN/WebRTC transfer, merge engine, and optional conflict UI.

---

## Related Docs

- [Roadmap — device sync](../../roadmap/device-sync.md)
- [v1.7.0 README](./README.md)
- [Offline Strategy](../../architecture/offline-strategy.md) — Storage map
- [Data Model](../../architecture/data-model.md) — Entities and stores
- [Program Progression](../../implementation/program-progression.md) — Why session merge must not duplicate `programId` + `date`
- [Settings & Preferences](../../requirements/settings-preferences.md)
- [US-029 — Health Metrics](./US-029-health-metrics.md)
- [US-030 — Settings Hub Restructure](./US-030-settings-restructure.md)
