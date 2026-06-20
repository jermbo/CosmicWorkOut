# CosmicWorkOut

A client-only, offline-first SvelteKit fitness tracker. No backend, no accounts, no sync — all data lives on the device (IndexedDB + localStorage).

## The docs are the project's memory

Everything durable lives in [`docs/`](docs/README.md) — vision, architecture, requirements, per-feature decisions, and the glossary. Treat that wiki as the **single source of truth**.

- **Start at** [`docs/README.md`](docs/README.md) (the wiki index, organized 30k → ground).
- **Vocabulary:** [`docs/glossary.md`](docs/glossary.md) — Discipline, Routine, Item, Activity, Habit, and where new movement types belong.
- **How we work:** [Working Agreement](docs/implementation/dev-guide.md#conventions-working-agreement).

**Do not keep project knowledge in tool-specific or session memory.** When a decision is locked or behavior changes, write it into the relevant `docs/` file — see [Documenting decisions](docs/README.md#documenting-decisions). If it isn't in the docs, it doesn't persist.

## Run it

```sh
npm install
npm run dev   # http://localhost:5678  (also on LAN via --host, for mobile testing)
```

See the [Dev Guide](docs/implementation/dev-guide.md) for scripts, project layout, and key files.
