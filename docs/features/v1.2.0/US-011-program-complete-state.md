[Wiki](../../README.md) › [Features](../README.md) › [v1.2.0](README.md) › US-011

# US-011 — Program Completion State

As a **fitness user**, I want a clear completion moment when I finish all sessions in my active program
so that I feel rewarded and am guided toward what to do next.

---

## Requirements

1. Program-complete state
   a. When the user has completed all sessions in their active program, the Workout card on the home screen shall display a program-complete state.
   b. The program-complete state shall show the program name, a completion message, and a call-to-action to select or create a new program.
   c. The program-complete state shall be visually distinct and more celebratory than the per-session done state.
   d. The state shall persist until the user selects a new active program.

---

## Acceptance Criteria

1. Program-complete state
   a. Given the user has completed all sessions across all weeks of their active program, when the home screen loads, then the Workout card shows a program-complete state with the program name and a "Choose a new program" CTA.
   b. Given the program-complete state is shown, when the user taps the CTA, then the program selection sheet opens.
   c. Given the program-complete state is shown and the user navigates away and back, when the home screen loads again, then the complete state is still shown.
   d. Given the user selects a new program, when the home screen loads, then the program-complete state is replaced by the new program's workout card.

---

## Related Docs

- [US-007 — Home Screen Redesign](./US-007-home-screen-redesign.md)
- [v1.1.0 US-005 — Daily Dashboard](../v1.1.0/US-005-daily-dashboard.md)
- [Implementation: Program Progression](../../implementation/program-progression.md)
