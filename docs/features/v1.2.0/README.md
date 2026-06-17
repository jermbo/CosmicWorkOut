# v1.2.0 — Home Screen Redesign & Habit Log

This version reshapes the home screen into a unified daily dashboard of overview cards, each acting as a gateway to its own route. It introduces a dedicated Habit Log page with a redesigned habit creation flow, a mood tracking type, and a date context that flows from the home screen across all pages.

## Design North Star

> "Whip it out, put it away."

Every interaction must be completable with minimal taps. The home screen tells you where you are at a glance. One tap takes you where you need to go. The date you're logging for is always clear and consistent across every page.

---

## Key Decisions

- **One global date** — set on the home screen, flows to all pages (`/habits`, `/log`, etc.). No per-page date pickers. Calendar and graphs are for historical browsing.
- **Each section is its own route** — home cards are summaries; detail and interaction happen on dedicated pages.
- **No icons on habits (yet)** — clean, text-first. Icons are a future expansion.
- **Fixed habit order** — habits display in the order set in Settings regardless of completion state. Consistency over smart sorting.
- **Mood is a first-class habit type** — stored as an integer (-5 to +5) with named labels. Logged via large radio-button tap targets.
- **No custom unit types** — habits use named presets only: Times, Minutes, Count, Yes/No, Mood.

---

## Mood Scale

| Value | Label    |
|-------|----------|
| +5    | Happy    |
| +4    | Excited  |
| +3    | Focus    |
| +2    | Energized|
| +1    | Content  |
|  0    | Normal   |
| -1    | Tired    |
| -2    | Lonely   |
| -3    | Sad      |
| -4    | Angry    |
| -5    | Stressed |

---

## User Stories

| ID                                             | Title                           | Status |
| ---------------------------------------------- | ------------------------------- | ------ |
| [US-007](./US-007-home-screen-redesign.md)     | Home Screen Redesign            | Draft  |
| [US-008](./US-008-habit-log-page.md)           | Habit Log Page                  | Draft  |
| [US-009](./US-009-habit-creation.md)           | Habit Creation & Management     | Draft  |
| [US-010](./US-010-habit-calendar-history.md)   | Habit History in Calendar       | Draft  |
| [US-011](./US-011-program-complete-state.md)   | Program Completion State        | Draft  |

---

## Carried Over from v1.1.0

| Origin        | Requirement                             | Target Story |
| ------------- | --------------------------------------- | ------------ |
| US-004 req 4b | Habit history in Calendar view          | US-010       |
| US-004 req 4b | GitHub-style heat map                   | US-010       |
| US-004 req 1e | Habit reorder drag UI in Settings       | US-009       |
| US-004 req 2f | Count habit correction UI on dashboard  | US-008       |
| US-005 req 2f | Program-complete state on home screen   | US-011       |

---

## Story Writing Standards

All stories follow the format defined in [user-story-standards.md](../../standards/user-story-standards.md).
