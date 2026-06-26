# US-021 — Practice Groups & Plans

> **Status: ✅ Shipped — v1.4.0**

As a **user**, I want to choose which practice groups and plans are active for me
so that Practice stays focused on what I actually use, without noise from paused or unused areas.

---

## Model

| Term               | Meaning                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Practice group** | A broad bucket like Workout or Dance. UI-only organization, not stored in IndexedDB. |
| **Plan**           | A multi-week Program the user activates. Many plans can be active at once.           |
| **Active plan**    | A plan the user has turned on; it appears in Practice.                               |
| **Inactive plan**  | A plan that exists but is hidden from the main Practice flow. History is preserved.  |

Disciplines (strength, bellydance) remain the data-model layer for logging engines. Practice groups sit above them for navigation.

---

## Requirements

1. Activation
   a. Nothing shall be preselected on a fresh install.
   b. The user shall activate plans individually; many plans may be active at once.
   c. Pausing a plan removes it from the main Practice flow but preserves all historical sessions.

2. Practice page
   a. When no plans are active, Practice shall show an empty state with a single **Add practice** action.
   b. When plans are active, Practice shall show one card per **active group** (Workout, Dance).
   c. Tapping a group card opens a group detail view with active plans and management actions.
   d. **Add practice** shall always be available on the Practice page.

3. Add practice flow
   a. The user picks a broad group first (Workout or Dance).
   b. The user then picks from available plans with a clear **Built-in** vs **Mine** filter.
   c. Activating a plan adds it without deactivating other plans.

4. Group detail
   a. Shows active plans with status, start/log actions, and pause controls.
   b. Management actions (pause, add another plan) are equally prominent.

5. Overview card
   a. Shows a hybrid summary: **next up** headline plus group/plan counts.
   b. Next-up priority: live session → incomplete for selected day → suggested routine.

---

## Related Docs

- [Glossary — Practice](../../glossary.md)
- [US-018 — Practice Hub & Navigation](./US-018-practice-hub-navigation.md)
- [v1.2.0 US-007 — Overview Screen](../v1.2.0/US-007-home-screen-redesign.md)
