# CosmicWorkOut

A client-only, offline-first SvelteKit fitness tracker. No backend, no accounts, no sync — all data lives on the device (IndexedDB + localStorage).

## The docs are the project's memory

Everything durable lives in [`docs/`](docs/README.md) — vision, architecture, per-feature stories, and the glossary. Treat that wiki as the **single source of truth**.

- **Start at** [`docs/README.md`](docs/README.md) (the wiki home: one page per part of the app).
- **Project facts and doc rules:** [`docs/standards/project.md`](docs/standards/project.md). Wiki pages follow the docs-wiki rules; `npm run docs:links` enforces them.
- **Vocabulary:** [`docs/glossary.md`](docs/glossary.md) — Discipline, Routine, Item, Activity, Habit, and where new movement types belong.
- **How we work:** [Working agreement](docs/standards/working-agreement.md).

**Do not keep project knowledge in tool-specific or session memory.** When a decision is locked or behavior changes, write it into the relevant `docs/` page in the same change — see [Project facts](docs/standards/project.md). If it isn't in the docs, it doesn't persist.

## Run it

```sh
npm install
npm run dev   # http://localhost:5678  (also on LAN via --host, for mobile testing)
```

See [Project facts](docs/standards/project.md) for every script.
