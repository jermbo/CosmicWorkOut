# US-003 — Program Completion State

> **Status: Draft**

As a **fitness user**, I want a clear completion moment when I finish all sessions in my active program
so that I feel rewarded and am guided toward what to do next.

---

## Background

Carried over from v1.1.0 US-005 requirement 2f. Currently, when all sessions in a program are done, the home screen falls through to the generic "No program active" empty state. This should instead be a distinct, celebratory state with a clear next step.

---

## Requirements

1. Program-complete state
   a. When the user has completed all sessions in their active program, the Workout section on the home screen shall display a program-complete state rather than the empty "no program" fallback.
   b. The program-complete state shall show the program name, a completion message, and a prompt to select or create a new program.
   c. The program-complete state shall be visually distinct from and more celebratory than the per-session done state.

---

## Acceptance Criteria

1. Given the user has completed all sessions across all weeks in their active program, when the home screen loads, then the Workout section shows a program-complete state with the program name and a "Choose a new program" or "Create a program" CTA.
2. Given the program-complete state is shown, when the user taps the CTA, then the program selection sheet opens.
3. Given the program-complete state is shown, when the user navigates away and returns, then the state persists until a new program is activated.

---

## Related Docs

- [v1.1.0 US-005 — Daily Dashboard](../v1.1.0/US-005-daily-dashboard.md)
- [Implementation: Program Progression](../../implementation/program-progression.md)
