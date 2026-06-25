# v1.2.0 — Home Screen Redesign & Habit Log

This version reshapes the home screen into a unified daily dashboard of overview cards, each acting as a gateway to its own route. It introduces a dedicated Habit Log page with a mood tracking type, and a date context that flows from the home screen across all pages.

**Status: ✅ Shipped** — incomplete stories migrated to [v1.3.0](../v1.3.0/README.md).

## Design North Star

> "Whip it out, put it away."

Every interaction must be completable with minimal taps. The home screen tells you where you are at a glance. One tap takes you where you need to go. The date you're logging for is always clear and consistent across every page.

---

## Key Decisions

- **One global date** — set on the home screen, flows to all pages (`/habits`, `/log`, etc.). No per-page date pickers. Calendar and graphs are for historical browsing.
- **Each section is its own route** — home cards are summaries; detail and interaction happen on dedicated pages.
- **No icons on habits (yet)** — clean, text-first. Icons are a future expansion.
- **Fixed habit order** — habits display in the order set in Settings regardless of completion state. Consistency over smart sorting.
- **Mood is a first-class habit type** — stored as an integer (-5 to +5) with named labels. Logged via large radio-button tap targets inline on the habits page (not in the grid).
- **No custom unit types** — habits use named presets only: Times, Minutes, Count, Yes/No, Mood.
- **Workout gets its own route** — `/workout` handles the full session start/edit flow. The home card is a compact summary only.

---

## Mood Scale

| Value | Label     |
| ----- | --------- |
| +5    | Happy     |
| +4    | Excited   |
| +3    | Focus     |
| +2    | Energized |
| +1    | Content   |
| 0     | Normal    |
| -1    | Tired     |
| -2    | Agitated  |
| -3    | Sad       |
| -4    | Angry     |
| -5    | Stressed  |

---

## User Stories

| ID                                           | Title                    | Status  |
| -------------------------------------------- | ------------------------ | ------- |
| [US-007](./US-007-home-screen-redesign.md)   | Home Screen Redesign     | ✅ Done |
| [US-008](./US-008-habit-log-page.md)         | Habit Log Page           | ✅ Done |
| [US-011](./US-011-program-complete-state.md) | Program Completion State | ✅ Done |

---

## Migrated to v1.3.0

These stories were started in v1.2.0 but not finished. Full specs live in the v1.3.0 folder.

| ID     | Title                       | v1.2.0 outcome                                                    |
| ------ | --------------------------- | ----------------------------------------------------------------- |
| US-009 | Habit Creation & Management | Built-in habits + `/habits` logging shipped; Settings UI → v1.3.0 |
| US-010 | Habit History in Calendar   | Not started → v1.3.0                                              |

---

## Carried Over from v1.1.0 (resolved)

| Origin        | Requirement                            | Resolved in |
| ------------- | -------------------------------------- | ----------- |
| US-004 req 2f | Count habit correction UI on dashboard | US-008 ✅   |
| US-005 req 2f | Program-complete state on home screen  | US-011 ✅   |

Items still open from v1.1.0 are tracked in [v1.3.0](../v1.3.0/README.md).

---

## Story Writing Standards

All stories follow the format defined in [user-story-standards.md](../../standards/user-story-standards.md).
