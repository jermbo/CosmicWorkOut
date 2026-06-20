# v1.4.0 — Belly Dance Practice

This version introduces **practice sessions** as a parallel track to strength workouts. Belly dance is the first practice type; the data model and navigation are shaped so additional practice types (e.g. bike rides) can follow later without a rewrite.

## Design North Star

> "Same rhythm, different movement."

Practice should feel as familiar as a workout session — rotating routines, linear progression, Today as the hub — but the things you track match how you actually dance: warm-up, conditioning, moves, cool-down.

---

## Key Decisions

- **Option C navigation** — Today surfaces practice cards; bottom nav evolves from Workout to **Practice** as the session destination. No separate Dance tab.
- **Generic practice model** — Belly dance ships first; types, items, programs, and session logs are practice-scoped, not workout-scoped.
- **Rotating routines A / B / C** — Same progression model as strength programs (`completedSessionCount % routines.length`).
- **Hybrid item library** — Built-in belly dance catalog plus user-created custom items.
- **Item tags** — Each library item has a **type** (warm-up, conditioning, move, cool-down) and a **focus** (hips, core, arms, etc.).
- **Shared bookends** — Routine A defines warm-up and cool-down; Routines B and C inherit until overridden (same pattern as workout template inheritance).
- **Session logging mix** — Checkboxes for warm-up and cool-down; duration or reps logged live for conditioning and moves. No upfront targets on routine items.
- **Streaks** — Combined practice streak on Today plus per-type breakdown in History.
- **Same-day rules** — One session per practice program per day; a strength workout and a dance session may both be logged on the same date.

---

## User Stories

Implement in order — each story builds on the previous.

| ID | Title | Status | Depends on |
| --- | --- | --- | --- |
| [US-015](./US-015-practice-item-library.md) | Practice Item Library | ❌ Planned | — |
| [US-016](./US-016-belly-dance-program-routines.md) | Belly Dance Program & Routines | ❌ Planned | US-015 |
| [US-017](./US-017-practice-hub-navigation.md) | Practice Hub & Navigation | ❌ Planned | US-016 |
| [US-018](./US-018-dance-session-flow.md) | Dance Session Flow | ❌ Planned | US-017 |
| [US-019](./US-019-practice-streaks-calendar.md) | Practice Streaks & Calendar History | ❌ Planned | US-018 |

---

## What's Already Built (from prior versions)

Practice reuses patterns and infrastructure from strength workouts.

| Area | Shipped in | What exists today |
| --- | --- | --- |
| Program model | v1.1.0 | Multi-week programs, workouts A/B/C, linear session progression |
| Session flow | v1.1.0 | Start, finish, abandon, edit, crash recovery, session overlay |
| Exercise library | v1.1.0 | Built-in seed + custom CRUD, category filter, in-use delete guard |
| Today hub | v1.2.0 | Summary cards, global date context, week streak badge |
| Calendar history | v1.1.0–v1.3.0 | Workout sessions, activities, habits in day detail |

---

## Built-In Content (v1.4.0 target)

- **1 practice program:** Belly Dance Foundations (12 weeks, 3 days/week, routines A/B/C)
- **Practice item catalog:** Starter warm-ups, conditioning exercises, dance moves, and cool-downs with type + focus tags
- Items seeded from practice seed data; custom items stored alongside built-ins

Exact catalog contents are defined during US-015 implementation.

---

## Out of Scope for v1.4.0

| Item | Notes |
| --- | --- |
| Per-item session notes | Deferred — log during session without notes field in MVP |
| Additional practice types | Bike rides, yoga flows, etc. — architecture only; belly dance ships first |
| Prescribed targets on routine items | Routines are ordered lists; values entered during the session |
| Separate Dance nav tab | Today + Practice destination covers alternating-day usage |
| Strength workout refactor | Workouts remain as-is; practice runs in parallel until a later unification pass |
| Service worker / PWA | Infrastructure — tracked in [Offline Strategy](../../architecture/offline-strategy.md) |

---

## Story Writing Standards

All stories follow the format defined in [user-story-standards.md](../../standards/user-story-standards.md).
