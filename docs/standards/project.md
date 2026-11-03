---
name: Project facts
description: 'The facts of this project that the doc rules and the tools need: the stack, the commands, the docs folders, and which rules apply.'
altitude: exact
tags:
  - standards
parent: ../README.md
---

[Wiki](../README.md) / Project facts

# Project facts

This page holds the facts about the project that a contributor or a tool must know before the first change. Each fact has one row, so a tool can read it.

## The facts

| Fact                | Value                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Product             | CosmicWorkOut — an offline-first tracker for training and daily habits, one user per device                               |
| Stack               | Svelte 5, SvelteKit with the static adapter, TypeScript, Vite                                                             |
| Server              | None. The app runs only in the browser                                                                                    |
| Data                | IndexedDB and localStorage, on the device                                                                                 |
| Install             | `npm install`                                                                                                             |
| Run                 | `npm run dev` — port 5678, also on the local network for a phone                                                          |
| Build               | `npm run build`, then `npm run preview`                                                                                   |
| Test                | `npm test` — Node's own test runner, pure modules only                                                                    |
| Type check          | `npm run check`                                                                                                           |
| Lint and format     | `npm run lint` (writes fixes), `npm run format`                                                                           |
| Docs check          | `npm run docs:links` — links, anchors, page parts, and settings coverage. It fails on an error                            |
| Inspect data        | Browser tools → Application → IndexedDB → `cosmic-workout`; localStorage keys start with `cwout:`                         |
| Docs root           | `docs/`                                                                                                                   |
| Wiki pages          | `docs/README.md`, `docs/vision.md`, `docs/principles.md`, `docs/glossary.md`, `docs/architecture/`, `docs/standards/`     |
| Not wiki pages      | `docs/features/` (stories, release lists, backlog), `docs/initiatives/` (work notes), `docs/_inspiration/` (design files) |
| Page rules          | None. The baseline docs-wiki rules apply with no change                                                                   |
| Story rules         | [User story standards](user-story-standards.md)                                                                           |
| How code is written | [Working agreement](working-agreement.md)                                                                                 |

## Why the docs are the memory

A contributor can be a person or an agent, and an agent forgets each session. So a decision that is not in `docs/` does not persist. When a rule or a behavior changes, the page that tells it changes in the same commit. A new feature or rule gets its page first, and the code comes after the page.

Run the docs check before each commit. It finds broken links and missing page parts. It also finds a setting in the code that the page [what each toggle hides](../architecture/toggle-surfaces.md) does not name.

## Where a new page goes

A page that tells what the app does goes in `architecture/`, at the altitude that fits its question. A story goes in `features/<version>/`. A plan for work that is not in a version goes in the [backlog](../features/backlog.md). Notes from one piece of work, such as an audit, go in `initiatives/<slug>/`.

## Further reading

- [Glossary](../glossary.md): the words that every page must use.
