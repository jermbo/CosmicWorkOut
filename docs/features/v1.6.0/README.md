# v1.6.0 — Belly Dance Catalog & Course Programs

> **Backfilled doc.** This version shipped before its feature folder existed. Reconstructed from the codebase and git history (commit `0224454`, DB version 6) during the June 2026 docs reconciliation — it was **not** written from per-story specs. Treat as an accurate summary, not an original design record.

This version fills out the Belly Dance Discipline introduced in v1.4.0 from a small starter set into a full, structured catalog with a progression of course programs.

## Design North Star

> "A real syllabus, not a demo."

v1.4.0 proved the Discipline model with a handful of dance items. v1.6.0 makes Belly Dance a Discipline a learner could actually follow week to week.

---

## What Shipped

| Area | Detail | Source |
| --- | --- | --- |
| Full move catalog | **39 belly dance moves** with cues, focus tags, movement type (sharp/smooth/variable), and difficulty | `src/lib/db/seeds/bellydance-moves.ts` |
| Bookend library | **10 warm-up / cool-down items** (metric `check`) shared across routines | `src/lib/db/seeds/bellydance-bookends.ts` |
| Course programs | **6 programs** — Beginner 101–103, Intermediate 101–103 | `src/lib/db/seeds/bellydance-programs.ts` |
| Catalog → Item derivation | Moves and bookends are mapped to `Item`s with section-appropriate metrics (`moves` → `measure`, bookends → `check`) | `src/lib/db/seeds/bellydance-items.ts` |
| DB bump | `DB_VERSION` → 6; wipe-and-reseed forces the new content | `src/lib/db/database.ts` |

---

## Key Decisions

- **Catalog-derived Items.** Moves are authored once as catalog seeds and mapped into the generic `Item` model, rather than hand-writing each `Item`. Keeps dance content data, not code.
- **Bookends are inheritable.** Warm-up and cool-down are bookend sections — routines inherit Routine A's bookends unless they set `overridesBookends` (US-017 rule, now exercised at scale).
- **Course progression, not free-form.** Programs ship as a numbered syllabus (101 → 103, Beginner → Intermediate) to give learners a path.

## Related

- [Data Model — Catalog → Item derivation](../../architecture/data-model.md#catalog--item-derivation)
- [v1.4.0 — Discipline model & Belly Dance foundation](../v1.4.0/README.md)
- [Implementation Status](../../implementation/status.md)
