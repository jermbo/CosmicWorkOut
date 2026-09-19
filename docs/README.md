# CosmicWorkOut — Project Wiki

> A simple, offline-first tracker for following a structured movement practice — and logging the rest of your day — without the noise.

---

## How to read this wiki

Docs are organized by **altitude**. Start high to understand _why_, work down to understand _what_, _how_, and _where in the code_.

| Level  | Folder                             | Purpose                                  |
| ------ | ---------------------------------- | ---------------------------------------- |
| 30k    | [vision/](vision/)                 | North star — what we're building and why |
| 15k    | [architecture/](architecture/)     | System structure, data, tech, offline    |
| 5k     | [requirements/](requirements/)     | User stories per feature area            |
| Ground | [implementation/](implementation/) | Code map, stores, components, status     |
| —      | [features/](features/)             | Shipped version stories (v1.1–v1.8)      |
| —      | [roadmap/](roadmap/)               | Deferred ideas — post–user-testing work  |

Each doc is one complete thought — readable in ~60 seconds. Follow links to go deeper. Diagrams use **mermaid** for architecture, flows, entity relationships, and component trees.

```mermaid
flowchart TB
    subgraph vision ["30k — Vision"]
        NS[North Star]
        DP[Design Principles]
    end

    subgraph arch ["15k — Architecture"]
        SO[System Overview]
        DM[Data Model]
        TS[Tech Stack]
        OS[Offline Strategy]
    end

    subgraph req ["5k — Requirements"]
        PM[Program Management]
        SL[Session Logging]
        HC[History & Calendar]
        SP[Settings & Preferences]
    end

    subgraph impl ["Ground — Implementation"]
        HW[How It Works]
        ST[Implementation Status]
        AS[App Structure]
        SM[State Management]
        PP[Program Progression]
        CO[Components]
        DG[Dev Guide]
    end

    NS --> SO
    DP --> SO
    SO --> DM & TS & OS
    DM --> PM & SL & HC & SP
    SO --> HW
    HW --> ST
    ST --> AS & SM & PP & CO & DG
    PM --> PP
    SL --> SM & CO

    classDef vision fill:#3b3f8c,stroke:#23264f,color:#ffffff;
    classDef arch fill:#1f6f6f,stroke:#0f3a3a,color:#ffffff;
    classDef req fill:#7a4f9e,stroke:#46295c,color:#ffffff;
    classDef impl fill:#465569,stroke:#28313e,color:#ffffff;
    class NS,DP vision;
    class SO,DM,TS,OS arch;
    class PM,SL,HC,SP req;
    class HW,ST,AS,SM,PP,CO,DG impl;
```

**New here?** Follow one short trail, then click **Related** links at the bottom of each page:

1. [North Star](vision/north-star.md) — why this product exists
2. [How It Works](implementation/behavior.md) — what the app does (no code)
3. [System Overview](architecture/overview.md) — how the pieces fit
4. [Implementation Status](implementation/status.md) — what's built today

**Unsure what a word means?** The [Glossary](glossary.md) defines the shared vocabulary — Discipline, Routine, Item, Activity, Habit, Lift plan, Baseline — and the rule for where new movement types belong. Most concept pages link back to it.

**Keeping the wiki honest:** relative links are checked by `npm run docs:links` (`scripts/check-doc-links.mjs`). When behavior or schema changes, update the docs in the same change — see [Documenting decisions](#documenting-decisions).

---

## Documenting decisions

**These docs are the project's memory.** There is no separate notebook, ticket system, or AI "memory" that outlives a session — if it isn't written here, it doesn't persist. So:

- When a decision is locked, record it in the relevant doc (a feature `README`, an architecture doc, or the [Glossary](glossary.md)) and mark shipped work **Built** in [Implementation Status](implementation/status.md).
- When something is **not** being built yet but might later, add it to the [Roadmap](roadmap/README.md) — not as **Planned** on a shipped version.
- When behavior changes, update the doc that described the old behavior in the same change — don't let docs and code drift.
- Contributors (human or AI) should treat this wiki as the source of truth and **not** stash project knowledge in tool-specific memory stores. See the [Working Agreement](implementation/dev-guide.md#conventions-working-agreement).

### Documentation conventions

- **No emojis** in the docs — they read as unprofessional and don't survive every renderer. Use words.
- **Status labels** are plain text: **Built** / **Shipped** / **Done** (in code today), **Planned** (agreed, not yet built — keep these on the [Roadmap](roadmap/README.md)), **Removed** (was built, then taken out), **Not built** (a gap).
- **Diagrams use [mermaid](https://mermaid.js.org/)**. When a diagram uses color, every node sets a **dark fill with `color:#ffffff`** so text always has strong contrast (never light-on-light or dark-on-dark). The shared palette: vision `#3b3f8c`, architecture/stores `#1f6f6f`, requirements/data `#7a4f9e`, implementation/neutral `#465569`, shipped/done `#2f7d4f`, planned/triggers `#9a6a1f`.

---

## 30k — Vision

- [North Star](vision/north-star.md) — Core identity and purpose
- [Design Principles](vision/principles.md) — Rules that guide every decision

---

## 15k — Architecture

- [System Overview](architecture/overview.md) — How the pieces fit together
- [Data Model](architecture/data-model.md) — Entities, relationships, storage
- [Tech Stack](architecture/tech-stack.md) — SvelteKit, IndexedDB, CSS tokens
- [Offline Strategy](architecture/offline-strategy.md) — Local-first persistence

---

## 5k — Requirements

- [Program Management](requirements/program-management.md) — Programs, workouts, exercise library
- [Session Logging](requirements/session-logging.md) — Core workout logging flow
- [History & Calendar](requirements/history-calendar.md) — Past sessions and progress
- [Settings & Preferences](requirements/settings-preferences.md) — User customization

---

## Ground — Implementation

- [How It Works](implementation/behavior.md) — Mental model: what the app actually does
- [Implementation Status](implementation/status.md) — What's built vs planned
- [App Structure](implementation/app-structure.md) — Routes, layout, boot sequence
- [State Management](implementation/state.md) — Stores and data flow
- [Program Progression](implementation/program-progression.md) — How "today's workout" is chosen
- [Components](implementation/components.md) — UI component inventory
- [Dev Guide](implementation/dev-guide.md) — Run locally, key files

---

## Shipped Features

The [Features index](features/README.md) is the historical record of what shipped and when — one folder per release, each with a README and its user stories.

- [v1.1.0 — Core Workout Flows](features/v1.1.0/README.md)
- [v1.2.0 — Daily Dashboard & Habits](features/v1.2.0/README.md)
- [v1.3.0 — Habit Management & Calendar History](features/v1.3.0/README.md)
- [v1.4.0 — Belly Dance & the Discipline Model](features/v1.4.0/README.md)
- [v1.5.0 — Insights Hub](features/v1.5.0/README.md)
- [v1.6.0 — Belly Dance Catalog & Course Programs](features/v1.6.0/README.md)
- [v1.7.0 — Full Strength Catalog, PWA, Health & Backup](features/v1.7.0/README.md)
- [v1.8.0 — Granular Data Clearing](features/v1.8.0/README.md)
- [v1.9.0 — Lift Plans & Baselines](features/v1.9.0/README.md)

See [Implementation Status](implementation/status.md) for the current built-vs-deferred checklist.

---

## Standards

- [User Story Standards](standards/user-story-standards.md) — Personas, story format, and the acceptance-criteria template used in feature docs.

---

## Roadmap

**Current phase:** use the app, gather feedback. New ideas and deferred work live in [roadmap/](roadmap/README.md).

---

## Maintenance

- [June 2026 Audit](maintenance/audit-2026-06.md) — Holistic review before the user-testing pause: doc-drift inventory, clean-code findings (CSS reuse, ternaries, comments, oversized files), and the phased execution plan.
- [July 2026 Hardening Audit](maintenance/audit-2026-07-hardening.md) — Performance, memory-leak, security, and correctness review. Three data-loss bugs fixed; the rest recorded as deferred concerns with triggers for when to act.

---

## Inspiration

The original design reference lives in [\_inspiration/](_inspiration/). It's a high-fidelity pickleball-specific prototype — useful for UI and UX patterns, not taken literally as the product spec.
