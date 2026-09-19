[Wiki](README.md) › Map — Movement & Training

# Map — Movement & Training

> Everything about structured practice: the Discipline engine, programs and routines, the item
> catalog, how a session gets logged, and how the app picks what you train next.

This is a **map of content**, not a spec. It cuts across altitudes so you can enter anywhere.

**Adjacent maps:** [Daily Tracking](map-daily-tracking.md) · [History & Insights](map-history-and-insights.md) · [Interface & Navigation](map-interface-and-navigation.md)

---

## Start here

| If you want to…                    | Read                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Understand the vocabulary          | [Glossary — three archetypes](glossary.md#the-big-idea-three-archetypes-not-a-list-of-types) |
| See what the app actually does     | [How It Works](implementation/behavior.md)                                                   |
| Know why one engine, not two       | [v1.4.0 — Discipline Model](features/v1.4.0/README.md)                                       |
| Find why "today's workout" is that | [Program Progression](implementation/program-progression.md)                                 |

---

## Vocabulary

[Discipline](glossary.md#discipline) · [Practice](glossary.md#practice) · [Program](glossary.md#program) ·
[Routine](glossary.md#routine) · [Item](glossary.md#item) · [Section](glossary.md#section) ·
[Metric](glossary.md#metric) · [Focus](glossary.md#focus) · [Session](glossary.md#session) ·
[Bookends](glossary.md#bookends) · [Lift plan](glossary.md#lift-plan) ·
[Progression block](glossary.md#progression-block) · [Focus exercise](glossary.md#focus-exercise)

---

## 30k — Why

- [North Star](vision/north-star.md) — follow a structured practice without the noise
- [Design Principles](vision/principles.md) — the rules that keep the engine generic

## 15k — Shape and connections

- [System Overview](architecture/overview.md) — where the training engine sits
- [Data Model](architecture/data-model.md) — Program → Week → Routine → Section → Item → Session
- [State Management](implementation/state.md) — `programStore`, `sessionStore`, `goalPlanStore`

## 5k — Detail

- [Program Management](requirements/program-management.md) — defining, selecting, editing programs
- [Session Logging](requirements/session-logging.md) — the core logging flow, start to finish

## Ground — Stories by release

| Release                             | What it added                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [v1.1.0](features/v1.1.0/README.md) | [Program library](features/v1.1.0/US-001-program-library.md) · [Custom programs](features/v1.1.0/US-002-custom-program.md) · [Exercise library](features/v1.1.0/US-006-exercise-library.md)                                                                                                                                                                       |
| [v1.2.0](features/v1.2.0/README.md) | [Program completion state](features/v1.2.0/US-011-program-complete-state.md)                                                                                                                                                                                                                                                                                      |
| [v1.4.0](features/v1.4.0/README.md) | [Discipline engine](features/v1.4.0/US-015-discipline-engine-foundation.md) · [Item library](features/v1.4.0/US-016-practice-item-library.md) · [Dance program](features/v1.4.0/US-017-belly-dance-program-routines.md) · [Dance session flow](features/v1.4.0/US-019-dance-session-flow.md) · [Practice groups](features/v1.4.0/US-021-practice-groups-plans.md) |
| [v1.6.0](features/v1.6.0/README.md) | Belly dance catalog and course programs                                                                                                                                                                                                                                                                                                                           |
| [v1.7.0](features/v1.7.0/README.md) | Full strength catalog                                                                                                                                                                                                                                                                                                                                             |
| [v1.9.0](features/v1.9.0/README.md) | [Lift plans](features/v1.9.0/US-033-goal-progression-plans.md) — wave-loading toward a target                                                                                                                                                                                                                                                                     |

## Where in the code

- [App Structure](implementation/app-structure.md) — `/workout`, `/practice`, `/program`, `/goals`
- [Components](implementation/components.md) — session overlays, editors, `LibrarySheet`
- [Program Progression](implementation/program-progression.md) — the count-driven rotation
- [Implementation Status](implementation/status.md) — built vs not

## Deferred

- [Roadmap](roadmap/README.md) — periodization beyond lift plans, and other cut ideas

---

## Related

- [Map — Daily Tracking](map-daily-tracking.md) — the non-movement trackers alongside this one
- [Map — History & Insights](map-history-and-insights.md) — what happens to a Session after it is written
- [Map — Data & Persistence](map-data-and-persistence.md) — how programs and sessions are stored
- [Glossary](glossary.md) — full vocabulary
