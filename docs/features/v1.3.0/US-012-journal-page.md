# US-012 — Journal Page

> **Status: ❌ Planned — v1.3.0**
>
> The home screen Journal card exists as a "Coming soon" placeholder (v1.2.0 US-007). This story delivers the actual page and logging flow.

As a **health-conscious user**, I want to write a quick daily journal entry
so that I can capture thoughts, reflections, or notes alongside my workouts and habits in one place.

---

## Requirements

1. Journal page
   a. The app shall provide a dedicated Journal page at `/journal`.
   b. Tapping the Journal card on the home screen shall navigate to `/journal` for the currently selected date.
   c. The page shall display the active date from the global date context — no separate date picker on this page.

2. Daily entry
   a. The user shall be able to write one free-form text entry per day.
   b. The entry shall support up to 2,000 characters.
   c. Changes shall save automatically or via a single explicit save action — no multi-step flow.
   d. The user shall be able to edit or clear an existing entry for the selected date.

3. Home card summary
   a. When an entry exists for the selected date, the Journal card shall indicate that (e.g., "Entry logged" or a short preview).
   b. When no entry exists, the card shall show an empty state (e.g., "No entry yet").
   c. The card shall no longer display "Coming soon" once this story is shipped.

4. Data
   a. Journal entries shall be stored locally in IndexedDB, keyed by date.
   b. Entries shall be queryable for future calendar or history integration (out of scope for this story).

---

## Acceptance Criteria

1. Journal page
   a. Given the user taps the Journal card on the home screen, when navigation completes, then `/journal` opens for the selected date.
   b. Given the user changes the date on the home screen to June 10, when they open `/journal`, then June 10's entry (or empty state) is shown.

2. Daily entry
   a. Given no entry exists for today, when the user types text and saves, then the entry is persisted and shown on return.
   b. Given an entry exists for today, when the user edits the text and saves, then the updated text replaces the previous entry.
   c. Given the user clears the entry and saves, when they return to the page, then the empty state is shown.

3. Home card summary
   a. Given the user wrote an entry for today, when the home screen loads, then the Journal card reflects that an entry exists.
   b. Given no entry exists for the selected date, when the home screen loads, then the Journal card shows an empty state.

---

## Related Docs

- [v1.2.0 US-007 — Home Screen Redesign](../v1.2.0/US-007-home-screen-redesign.md)
- [Data Model](../../architecture/data-model.md)
- [App Structure](../../implementation/app-structure.md)
