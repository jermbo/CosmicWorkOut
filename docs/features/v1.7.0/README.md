# v1.7.0 — Full Strength Catalog & PWA

> **Backfilled doc.** This version shipped before its feature folder existed. Reconstructed from the codebase and git history (commits `79dbd63`, `86ea3b0`, `9befba4`; DB version 7) during the June 2026 docs reconciliation — it was **not** written from per-story specs. Treat as an accurate summary, not an original design record.

This version does for Strength what v1.6.0 did for Belly Dance — expands a starter set into a full catalog with a course progression — and ships the app as an installable PWA.

## Design North Star

> "A full gym, and an app you can install."

---

## What Shipped

| Area                  | Detail                                                                                                                                                                                   | Source                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Full exercise catalog | **72 strength exercises** with cues, muscles, equipment, exercise type, default sets/reps, and weight increments                                                                         | `src/lib/db/seeds/strength-exercises.ts`  |
| Body-part categories  | `STRENGTH_CATS` changed to **body-part groups**: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Full Body (replacing the earlier movement-pattern scheme: Hinge/Squat/Push/Pull/…) | `src/lib/db/types.ts`                     |
| Course programs       | **6 strength programs**                                                                                                                                                                  | `src/lib/db/seeds/strength-programs.ts`   |
| PWA / service worker  | Installable PWA: `src/service-worker.ts` (SvelteKit `$service-worker`, no Workbox) precaches the app shell; static adapter with SPA fallback                                             | `src/service-worker.ts`, `vite.config.ts` |
| Insights refactor     | Chart components streamlined (imports/readability)                                                                                                                                       | commit `9befba4`                          |
| DB bump               | `DB_VERSION` → 7; wipe-and-reseed forces the new catalog                                                                                                                                 | `src/lib/db/database.ts`                  |

---

## Key Decisions

- **Body-part categories over movement patterns.** The catalog is organized by the muscle group a gym-goer thinks in (Chest, Back, Legs…) rather than biomechanical patterns (Hinge, Squat, Carry). Note: this is a **breaking change** to `ItemCat` — any older session/item data referencing the old categories is dropped by the DB v7 wipe-and-reseed.
- **No Workbox.** Use SvelteKit's built-in `$service-worker` module to keep the dependency surface minimal — precache the shell, cached fallback for offline navigations.
- **Secure-context caveat.** Install + service worker require HTTPS or `localhost`; they do **not** work over plain `http://` LAN (`npm run dev --host`). iOS install is always manual (Share → Add to Home Screen).

## Planned

All v1.7.0 stories shipped. Ongoing portability work lives on the [roadmap](../../roadmap/README.md).

| ID                                         | Title                             | Status      | Notes                                                                                          |
| ------------------------------------------ | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| [US-028](./US-028-data-export-backup.md)   | Data Export, Backup & Device Sync | Phase 1     | JSON export/import on `settings/data`. Phase 2 → [roadmap](../../roadmap/device-sync.md).      |
| [US-029](./US-029-health-metrics.md)       | Health Metrics                    | Shipped     | Weight + blood pressure; optional Settings toggle; `/health` + home card + Insights + calendar |
| [US-030](./US-030-settings-restructure.md) | Settings Hub Restructure          | Shipped     | Hub `/settings` + sub-routes for appearance, habits, data                                      |
| [US-031](./US-031-default-habits-tweak.md) | Default Habits & Mood Scale       | Shipped     | Water/Coffee first; remove Alcohol; Reading → minutes; mood always on; −2 Agitated            |

---

## Related

- [Data Model — Item](../../architecture/data-model.md#item)
- [Data Model — HealthReading](../../architecture/data-model.md#healthreading)
- [Offline Strategy](../../architecture/offline-strategy.md)
- [Tech Stack — Offline / PWA](../../architecture/tech-stack.md)
- [Implementation Status](../../implementation/status.md)
- [US-028 — Data Export, Backup & Device Sync](./US-028-data-export-backup.md)
- [US-029 — Health Metrics](./US-029-health-metrics.md)
- [US-030 — Settings Hub Restructure](./US-030-settings-restructure.md)
