# US-017 — Practice Hub & Navigation

> **Status: ❌ Planned — v1.4.0**
>
> Implements Option C: Today as the hub, bottom nav evolves to Practice, belly dance gets a home card and session entry point.

As an **active user**, I want Today to show my dance practice alongside my workout and a single Practice destination in navigation
so that I can open the app on a dance day and start the right session without extra tabs or hunting through menus.

---

## Requirements

1. Today — dance card
   a. The home screen shall display a Dance practice summary card alongside the existing Workout card.
   b. The card shall show the suggested routine name, routine letter, and item count or estimated duration when available.
   c. When a dance session is logged for the selected date, the card shall show a completed state with session summary (duration, items completed).
   d. When a dance session is in progress, the card shall show a live/active state.
   e. When no belly dance program is active, the card shall show an empty state with a prompt to select a program.
   f. Tapping the card shall navigate to the practice session page for belly dance.

2. Today — parallel display
   a. The Workout card and Dance card shall both be visible on Today regardless of which is scheduled.
   b. On dates where both a strength session and a dance session are logged, both cards shall show completed states independently.

3. Navigation — Practice destination
   a. The bottom nav item currently labeled "Workout" shall be renamed to "Practice".
   b. Tapping Practice shall navigate to a practice page that surfaces the relevant session for the active date context.
   c. When the user has an active strength program and an active dance program, the practice page shall present both options or default to whichever session is not yet logged for the selected date (dance if workout is done, workout if dance is done, suggested routine if neither is done).
   d. The user shall be able to manually choose strength workout or belly dance from the practice page when both are available.

4. Practice program access
   a. The practice page shall link to belly dance program management (routine editor, program selection) as a sub-route — not added to main nav.
   b. Program selection for belly dance shall follow the same copy-before-edit rules as strength programs (US-016).

5. Global date context
   a. Dance practice shall respect the global date context from the home screen (same as workouts and habits).
   b. Starting or editing a dance session for a past date shall require confirmation (same pattern as workout backdating).

6. Same-day rules
   a. The app shall allow one strength session and one dance session to be logged on the same date.
   b. The app shall prevent logging two dance sessions for the same program on the same date.
   c. The app shall prevent logging two strength sessions for the same program on the same date (existing behavior preserved).

---

## Acceptance Criteria

1. Today — dance card
   a. Given an active belly dance program and no session logged today, when the home screen loads, then the Dance card shows the suggested routine name and letter.
   b. Given a dance session was completed today, when the home screen loads, then the Dance card shows a completed state with duration summary.
   c. Given no belly dance program is active, when the home screen loads, then the Dance card prompts program selection.
   d. Given the user taps the Dance card, when navigation completes, then the practice session page opens for belly dance.

2. Today — parallel display
   a. Given both a workout and a dance session were logged on June 10, when the user selects June 10 on Today, then both cards show completed states.

3. Navigation — Practice destination
   a. Given the bottom nav is visible, when the user views the labels, then "Practice" replaces "Workout".
   b. Given neither session is logged today, when the user opens Practice, then both strength and dance options are available with suggested next routines shown.
   c. Given the workout is already logged today but dance is not, when the user opens Practice, then dance is prominently surfaced as the remaining session.

4. Practice program access
   a. Given the user is on the practice page, when they tap the program link, then the belly dance program page opens with routine list and editor access.

5. Global date context
   a. Given the user sets the date to a past day on Today, when they open the Dance card, then that date's dance session (or empty state) is shown.
   b. Given the user attempts to start a dance session for a past date, when they confirm, then the session begins logged against that date.

6. Same-day rules
   a. Given the user completed a strength workout today, when they start a dance session, then the session starts successfully.
   b. Given the user completed a dance session today, when they attempt to start a second dance session for the same program, then the app shows the completed state or edit flow instead of a new session.

---

## Related Docs

- [v1.4.0 README](./README.md)
- [App Structure](../../implementation/app-structure.md)
- [v1.2.0 US-007 — Home Screen Redesign](../v1.2.0/US-007-home-screen-redesign.md)
- [US-016 — Belly Dance Program & Routines](./US-016-belly-dance-program-routines.md)
- [US-018 — Dance Session Flow](./US-018-dance-session-flow.md)
