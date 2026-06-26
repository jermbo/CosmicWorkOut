# US-019 — Dance Session Flow

> **Status: ✅ Shipped — v1.4.0**
>
> The in-session experience: guided section flow, mixed logging modes, finish/edit/abandon. Mirrors strength session patterns.

As an **active user**, I want to move through my dance routine step by step and log what I actually did
so that I stay on track during practice without pre-planning every duration or rep count.

---

## Requirements

1. Session start
   a. The user shall be able to start a dance session from the practice page or Dance card on Today.
   b. Starting a session shall load the selected routine's effective sections (including inherited bookends from US-017).
   c. The session shall display the routine name, letter, and four section headers in order: Warm-up, Conditioning, Moves, Cool-down.
   d. A session timer shall track total elapsed time from start to finish.

2. Warm-up and cool-down logging
   a. Items in the warm-up and cool-down sections shall be logged via checkbox (done / not done).
   b. The user shall be able to check and uncheck items during the session.
   c. Section progress shall reflect how many items are checked vs total items in the section.

3. Conditioning and move logging
   a. Items in the conditioning and moves sections shall support logging a duration (minutes/seconds) or a rep count per item.
   b. The user shall choose duration or reps per item at log time (no upfront target from the routine).
   c. The user shall be able to update a logged value before finishing the session.
   d. An item may be marked skipped without a value.

4. Section navigation
   a. The session UI shall present sections sequentially: warm-up → conditioning → moves → cool-down.
   b. The user shall be able to move forward and backward between sections during an active session.
   c. Completed sections shall remain editable until the session is finished.

5. Session finish and abandon
   a. The user shall be able to finish the session when done; finish saves all logged values to a Session (a session log of the Belly Dance Discipline).
   b. The user shall be able to abandon an in-progress session with confirmation; abandon discards unsaved progress.
   c. Finish shall record: date, program ID, routine ID, start time, finish time, total duration, and per-item log entries.
   d. Abandoned sessions shall not increment program progression or affect streaks.

6. Session edit
   a. The user shall be able to edit a completed dance session for a given date (same pattern as workout edit).
   b. Edit shall reopen the session with previously logged values pre-filled.
   c. Saving edits shall update the existing session log, not create a duplicate.

7. Crash recovery
   a. An in-progress dance session shall be persisted locally for crash recovery (same pattern as strength sessions).
   b. On app boot, if an unfinished dance session exists, the app shall offer resume or discard.
   c. Only one active session (strength or dance) may be in progress at a time; starting one while the other is active shall prompt the user to finish or abandon the current session first.

8. Session complete state
   a. When a dance session is finished, the app shall show a completion summary with duration and items completed.
   b. The completion overlay shall return the user to Today or the practice page.

---

## Acceptance Criteria

1. Session start
   a. Given Routine B inherits bookends from Routine A, when the user starts a Routine B session, then warm-up and cool-down items match Routine A's effective lists.
   b. Given the user starts a session, when the session UI loads, then all four sections are visible in order with the session timer running.

2. Warm-up and cool-down logging
   a. Given the warm-up section has 5 items, when the user checks 3 items, then section progress shows 3 of 5 complete.
   b. Given the user checked a cool-down item, when they uncheck it, then the item returns to not-done state.

3. Conditioning and move logging
   a. Given the user is on a move item, when they log 2 minutes, then the value is displayed on that item in the session.
   b. Given the user logged 15 reps on a conditioning item, when they tap to edit, then they can change the value before finishing.
   c. Given the user skips a move item, when they finish the session, then the item is recorded as skipped with no value.

4. Section navigation
   a. Given the user is in the conditioning section, when they navigate back to warm-up, then previously checked warm-up items remain checked.
   b. Given the user completes all four sections, when they tap Finish, then the session saves successfully.

5. Session finish and abandon
   a. Given the user finishes a session, when they return to Today, then the Dance card shows a completed state.
   b. Given the user abandons a session, when they return to Today, then no session log exists for that date and progression count is unchanged.

6. Session edit
   a. Given a dance session was logged today, when the user chooses Edit, then all previously logged checkboxes and values are pre-filled.
   b. Given the user edits a logged duration and saves, when they view the session again, then the updated value is shown.

7. Crash recovery
   a. Given an in-progress dance session exists, when the app is force-closed and reopened, then a resume/discard prompt appears.
   b. Given a strength session is in progress, when the user attempts to start a dance session, then they are prompted to finish or abandon the strength session first.

8. Session complete state
   a. Given the user finishes a session, when the completion overlay appears, then total duration and a count of completed items are shown.

---

## Related Docs

- [v1.4.0 README](./README.md)
- [How It Works — Session Flow](../../implementation/behavior.md)
- [Program Progression](../../implementation/program-progression.md)
- [US-017 — Belly Dance Discipline, Program & Routines](./US-017-belly-dance-program-routines.md)
- [US-018 — Practice Hub & Navigation](./US-018-practice-hub-navigation.md)
- [US-020 — Cross-Discipline Streaks & Calendar History](./US-020-practice-streaks-calendar.md)
