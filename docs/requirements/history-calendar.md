# History & Calendar

Viewing past sessions and tracking progress over time.

**Tied to:** [Data Model — SessionLog, TrainingDay](../architecture/data-model.md) | [North Star](../vision/north-star.md)

---

## Goal

Users can look back at their workout history to see what they've done, confirm they're on track, and review individual session details.

---

## User Stories

### Viewing the Calendar

> As a user, I want to see a monthly calendar that shows which days I trained, so I can see my consistency at a glance.

- Calendar shows current month by default
- Each day is colored by status:
  - **Completed** — filled with accent color
  - **Today** — outlined/highlighted
  - **Scheduled** — subtle indicator (upcoming training day per program)
  - **Rest** — no indicator
  - **Skipped** — muted/crossed indicator
- I can navigate to previous months
- Day statuses are derived from the active program schedule + session logs in IndexedDB

---

### Viewing a Day Summary

> As a user, I want to tap a completed day and see what I did, so I can review the session.

- Tapping a completed day opens a summary sheet
- Summary shows: workout name, date, total volume, exercises logged with sets/reps/weight
- I cannot edit a past session from this view (read-only in v1)

---

### Seeing My Streak / Consistency

> As a user, I want to know how many weeks I've trained consistently, so I stay motivated.

- A simple streak or consistency indicator on the home screen or calendar header
- Counts consecutive weeks where all scheduled workouts were completed
- Resets on a missed week (not a missed day — based on weekly completions)

---

## Constraints

- History is read-only in v1 — no editing past sessions
- Calendar must work fully offline — all data comes from IndexedDB
- Performance: month rendering should not be slow even if IndexedDB has years of sessions

---

## Open Questions

- Should the calendar show the full program schedule (future scheduled days) or only past + today?
- If the user switches programs mid-cycle, how is the old program's schedule shown in the calendar?
- Is a "skipped" day manually marked, or inferred after midnight passes on a scheduled day?

---

## Out of Scope for v1

- Volume trend graphs / sparklines (v2)
- Personal records (v2)
- Program completion percentage progress bar (v2)
- Export or sharing session data

---

## Related

- [Data Model — SessionLog, TrainingDay](../architecture/data-model.md)
- [Session Logging](session-logging.md) — How sessions are created
- [Program Management](program-management.md) — Where the schedule comes from
