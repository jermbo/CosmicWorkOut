# Roadmap

> **Current phase:** Use the app, gather feedback. Versions v1.1–v1.7 are shipped; new work waits on what we learn from real usage.

Ideas that were deferred, cut, or only partially built live here — not scattered as "Out of Scope" tables in shipped feature folders. When something ships, move it back to a feature story and mark it ✅ in [Implementation Status](../implementation/status.md).

---

## Backlog

### Data & portability

| Item | Notes | Spec |
| ---- | ----- | ---- |
| Device-to-device sync | QR pairing + LAN/WebRTC transfer + merge engine | [device-sync.md](device-sync.md) |
| Include preferences in backup | Optional toggle on export — prefs in `localStorage` today | [US-028 Phase 1](../features/v1.7.0/US-028-data-export-backup.md) |
| Web Share on export | `navigator.share({ files })` after building backup blob | [device-sync.md](device-sync.md#optional-web-share-api) |
| Merge-on-import | File restore stays replace-only; merge belongs with device sync | [device-sync.md](device-sync.md) |
| CSV export | Analytics-only; cannot round-trip | — |
| Automatic background backup | File System Access API or scheduled export | — |

**Shipped:** JSON file export/import (replace-only restore) on Settings → Data — [US-028 Phase 1](../features/v1.7.0/US-028-data-export-backup.md).

---

### UX polish

| Item | Origin |
| ---- | ------ |
| Program week-by-week schedule preview in picker | [US-001](../features/v1.1.0/US-001-program-library.md) req 1c — picker shows name, duration, frequency only |
| Habit icons | v1.2/v1.3 — text-first habits ship today |
| Per-item session notes | v1.4.0 deferred |
| Health metrics extended history view | [US-029](../features/v1.7.0/US-029-health-metrics.md) — context-date view ships; dedicated history link deferred |

---

### Activity & insights

| Item | Notes |
| ---- | ----- |
| Activity distance / pace fields | Cardio stays on Activity path, not Discipline |
| Chart drill-down / interactivity | Tap bar, zoom, filter series |
| Per-discipline chart filtering | Insights shows all sessions today |
| Nutrition tracking | Out of product identity |

**Shipped:** Insights hub with date-range chips (45d, week, MTD, YTD, custom) — beyond original v1.5.0 read-only scope.

---

### Training intelligence

| Item | Notes |
| ---- | ----- |
| Load periodization engine | No auto light → heavy → deload; weight uses last-used prefill + manual bump |
| Additional Disciplines | Engine supports more; only strength + belly dance ship |
| Day-of-week scheduling | Progression stays count-driven (`completedSessionCount % routineCount`) |

---

### Infrastructure (if needed later)

| Item | Notes |
| ---- | ----- |
| Cloud sync / user accounts | Violates client-only constraint — not planned |
| Journal | Shipped in v1.3, **removed** in `0af33ff`; not on roadmap unless feedback demands it |

---

## How to add ideas

1. Add a row to the right section above (or a new section if it's a new theme).
2. If it needs a full spec, add a `docs/roadmap/<name>.md` and link it.
3. When work starts, create or revive a `docs/features/vX.Y.Z/` story and link back here.

---

## Related

- [Implementation Status](../implementation/status.md) — What's built today
- [North Star](../vision/north-star.md) — What we're not building
- [June 2026 Audit](../maintenance/audit-2026-06.md) — Pre–user-testing doc/code review
