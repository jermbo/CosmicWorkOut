# CosmicWorkOut — Project Wiki

> A simple, offline-first fitness tracking app built for people who want to follow a structured program without the noise.

---

## How to read this wiki

Docs are organized by **altitude**. Start high to understand _why_, work down to understand _what_, _how_, and _where in the code_.

| Level  | Folder                             | Purpose                                  |
| ------ | ---------------------------------- | ---------------------------------------- |
| 30k    | [vision/](vision/)                 | North star — what we're building and why |
| 15k    | [architecture/](architecture/)     | System structure, data, tech, offline    |
| 5k     | [requirements/](requirements/)     | User stories per feature area            |
| Ground | [implementation/](implementation/) | Code map, stores, components, status     |

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
```

**New here?** Start with [North Star](vision/north-star.md) → [How It Works](implementation/behavior.md) → [System Overview](architecture/overview.md).

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

## Inspiration

The original design reference lives in [\_inspiration/](_inspiration/). It's a high-fidelity pickleball-specific prototype — useful for UI and UX patterns, not taken literally as the product spec.
