[Wiki](README.md) › Map — Data & Persistence

# Map — Data & Persistence

> Where data lives and how it survives: IndexedDB and localStorage, the store layer above them,
> schema migrations, backup and restore, granular clearing, and offline behavior.

This is a **map of content**, not a spec. It cuts across altitudes so you can enter anywhere.

**Adjacent maps:** [Movement & Training](map-movement-and-training.md) · [Daily Tracking](map-daily-tracking.md) · [Interface & Navigation](map-interface-and-navigation.md)

---

## Start here

| If you want to…                     | Read                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| Know what is stored and where       | [Data Model](architecture/data-model.md)                                                |
| Add or change a stored entity       | [Data Model](architecture/data-model.md) then [Dev Guide](implementation/dev-guide.md)  |
| Understand write timing and offline | [Offline Strategy](architecture/offline-strategy.md)                                    |
| Touch backup or restore             | [US-028](features/v1.7.0/US-028-data-export-backup.md) — read the hardening notes first |

> **Hard constraint:** there is no server. A bug that destroys local data destroys the only copy.
> Both maintenance audits exist because of this — see [Deferred and known risks](#deferred-and-known-risks).

---

## 30k — Why

- [Design Principles](vision/principles.md) — offline-first and local-only are product decisions, not defaults
- [North Star](vision/north-star.md) — no backend, no accounts, no sync

## 15k — Shape and connections

- [System Overview](architecture/overview.md) — client-only architecture
- [Data Model](architecture/data-model.md) — every entity, relationship and object store
- [Offline Strategy](architecture/offline-strategy.md) — persistence, write timing, service worker
- [Tech Stack](architecture/tech-stack.md) — why IndexedDB, why no ORM

## 5k — Detail

- [Settings & Preferences](requirements/settings-preferences.md) — the Data section and what each control clears

## Ground — Stories by release

| Release                             | What it added                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [v1.7.0](features/v1.7.0/README.md) | [Data export, backup & device sync](features/v1.7.0/US-028-data-export-backup.md) · PWA and service worker |
| [v1.8.0](features/v1.8.0/README.md) | [Granular data clearing](features/v1.8.0/US-032-granular-data-clearing.md)                                 |
| [v1.9.0](features/v1.9.0/README.md) | DB version 10 — `baselines` and `baselineLogs` ([US-034](features/v1.9.0/US-034-baselines-setup.md))       |

## Where in the code

| Concern                      | File                                              |
| ---------------------------- | ------------------------------------------------- |
| Open, read, write, migrate   | `src/lib/db/database.ts`                          |
| Entity shapes                | `src/lib/db/types.ts`                             |
| Backup envelope & validation | `src/lib/db/backupPayload.ts` (pure, unit-tested) |
| Backup transactions          | `src/lib/db/backup.ts`                            |
| Built-in content             | `src/lib/db/seed.ts`, `src/lib/db/seeds/`         |
| Reactive layer               | [State Management](implementation/state.md)       |

- [Dev Guide](implementation/dev-guide.md) — running, testing, and which modules are testable
- [App Structure](implementation/app-structure.md) — the boot sequence that opens the database

## <span id="deferred-and-known-risks"></span>Deferred and known risks

- [July 2026 Hardening Audit](maintenance/audit-2026-07-hardening.md) — three data-loss bugs fixed; per-record backup validation and a CSP still deferred, each with a trigger
- [June 2026 Audit](maintenance/audit-2026-06.md) — codebase review; see its Resolution section for what has since been done
- [Roadmap — Device-to-Device Sync](roadmap/device-sync.md) — ongoing sync beyond one-shot backup files

---

## Related

- [Map — Movement & Training](map-movement-and-training.md) — the entities this layer stores
- [Map — Daily Tracking](map-daily-tracking.md) — the other entities this layer stores
- [Map — Interface & Navigation](map-interface-and-navigation.md) — the Settings surface that clears data
- [Glossary](glossary.md) — full vocabulary
