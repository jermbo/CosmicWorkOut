---
name: User story standards
description: 'The form of every user story in this project: the personas, the persona statement, numbered requirements, Given / When / Then criteria, and the checklist before a build.'
altitude: exact
tags:
  - standards
  - stories
parent: project.md
---

[Wiki](../README.md) / [Project facts](project.md) / User story standards

# User story standards

A user story tells who wants a change, what they want, and why — before anyone builds it. Every story in `features/<version>/` follows this form, so a reader finds the same parts in the same place.

## Personas

A story speaks for one persona. Use one from this list. If you need a new one, add it here first.

| Persona               | Who they are                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Fitness user          | Follows a structured plan. Wants to track progress and stay on plan                              |
| Active user           | Moves often, not only at the gym: runs, sports, yoga. Wants every kind of movement on the record |
| Health-conscious user | Tracks daily wellness next to training: water, sleep, mindfulness                                |
| Growth-minded user    | Builds small daily practices in any area, and wants to show up on low days and see growth        |

A story can serve more than one persona. Lead with the one that it serves most.

## The parts of a story

**Title.** `US-NNN — Short title`, with a number of three digits.

**Persona statement.**

```text
As a [persona], I want [capability] so that I can [outcome].
```

**Requirements.** A numbered list of groups, each with lettered items. A requirement tells what the system must do, not how.

```text
1. Group label
  a. The system shall …
  b. The user shall be able to …
```

**Acceptance criteria.** The same groups and letters as the requirements, each one a Given / When / Then that you can check.

```text
1. Group label
  a. Given [the start], when [the action], then [the result you can see].
```

**Status.** A story may carry a status line near its top. A story is a record of work, so status belongs here, not in an architecture page.

**Related docs.** Link the architecture pages that the story changes, and other stories.

## The page comes first

A story changes the system, so it changes a page in `architecture/`. Write or change that page before the code, in the same branch, and link it from the story. When the story ships, the page already tells the truth.

## Checklist before a build

- The persona statement answers who, what, and why.
- Each requirement can be tested. Avoid words such as "feels fast" or "looks good".
- Each criterion has a clear Given, When, and Then.
- Each main requirement has a happy path and at least one edge case.
- The story links its architecture page.
- The story does not name a component or a function.

### Example

US-000 — Log a glass of water. As a health-conscious user, I want to add a glass of water with one tap, so that I can track it all day without breaking my flow. Requirement 1a: the Habits screen shall show today's water count. Criterion 1a: given today has no water logged, when the screen opens, then the count shows 0. Criterion 1b: given the count shows 3, when the user taps plus, then it shows 4 at once.

## Further reading

- [Features list](../features/README.md): every release and its stories.
- [Glossary](../glossary.md): the words that a story must use.
