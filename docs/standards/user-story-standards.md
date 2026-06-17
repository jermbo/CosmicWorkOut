# User Story Guide

This document defines the standard format for all user stories in this project. Every story must follow this structure to ensure consistency, traceability, and a shared understanding of intent before any implementation begins.

---

## What Is a User Story?

A user story captures a feature from the perspective of the person who will use it. It is not a technical specification — it describes the _who_, the _what_, and the _why_. The technical _how_ lives in architecture and implementation docs.

---

## Personas

Stories are written from the perspective of a named persona. Use the personas defined below. If a new persona is needed, add it here first.

| Persona                   | Description                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Fitness User**          | Someone actively following a structured workout program. Goal-oriented, wants to track progress and stay on plan.                        |
| **Active User**           | Someone who exercises regularly but not always at the gym — runs, plays sports, does yoga. Values tracking all movement, not just lifts. |
| **Health-Conscious User** | Someone tracking daily wellness habits alongside fitness — water, sleep, nutrition, mindfulness.                                         |

A single story may span multiple personas if the core need is shared. Lead with the most relevant one.

---

## Story Format

### Title

`US-NNN — Short descriptive title`

Use a three-digit zero-padded number. Titles should be scannable at a glance.

---

### Persona Statement

```
As a [persona], I want [capability] so that I can [outcome].
```

- **Persona** — use one of the defined personas above
- **Capability** — what the user wants to do (action-oriented)
- **Outcome** — the benefit they get; the _why_ behind the request

---

### Requirements

A numbered alpha list of what must be true for this story to be implemented correctly. Requirements describe _what_ the system must do, not _how_ it does it.

```
1. Group label
  a. The system shall...
  b. The system shall...
2. Group label
  a. The user shall be able to...
  b. The user shall be able to...
```

Group related requirements under a shared numbered label. Use indented letters for the individual requirements within each group.

---

### Acceptance Criteria

Gherkin-style scenarios that define when this story is "done." Each criterion must be verifiable.

```
Given [initial context]
When [action is taken]
Then [observable outcome]
```

Mirror the numbered group structure from Requirements. Each group number maps to the same group in Requirements, with lettered sub-items for each scenario.

```
1. Group label
  a. Given... When... Then...
  b. Given... When... Then...
2. Group label
  a. Given... When... Then...
```

---

### Related Docs

Link to any architecture, data model, implementation, or other user stories that are relevant. Use relative paths.

---

## Quality Checklist

Before a story is considered ready for implementation, confirm:

- [ ] The persona statement answers who, what, and why
- [ ] Every requirement is testable (avoid vague words like "should feel fast" or "looks good")
- [ ] Every acceptance criterion has a clear Given / When / Then
- [ ] Acceptance criteria cover at least one happy path and one edge case per major requirement
- [ ] Related docs are linked
- [ ] The story does not describe implementation details (no component names, no function names)

---

## Example Story

```markdown
## US-000 — Example: Log a glass of water

As a **health-conscious user**, I want to increment my water intake count with a single tap
so that I can track hydration throughout the day without breaking my flow.

### Requirements

1. Counter widget
   a. The home screen shall display a water counter widget showing today's current count.
   b. Tapping the widget shall increment the count by one.
   c. The count shall reset to zero at midnight each day.
2. Daily goal
   a. The user shall be able to set a daily water goal in Settings.
   b. When the goal is reached, the widget shall display a completion state.

### Acceptance Criteria

1. Counter widget
   a. Given the home screen is loaded, when today has no water logged, then the widget shows 0.
   b. Given the water widget shows 3, when the user taps it, then it immediately shows 4.
   c. Given the user logged 6 glasses yesterday, when the app is opened the next day, then the widget shows 0.
2. Daily goal
   a. Given the user sets a goal of 8 in Settings, when they view the home screen, then the goal is reflected on the widget.
   b. Given the user's goal is 8, when they log their 8th glass, then the widget displays a completion indicator.

### Related Docs

- [Data Model](../../docs/architecture/data-model.md)
- [US-004 — Habit Tracking](./US-004-habit-tracking.md)
```
