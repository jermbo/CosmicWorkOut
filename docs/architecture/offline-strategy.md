# Offline Strategy

Offline-first is a hard constraint — see [Design Principles](../vision/principles.md). This document defines how it's implemented.

---

## Rule

**All writes happen immediately to local storage. There is no "pending" state waiting on a network round-trip.**

The app must be fully functional from the moment it launches, regardless of network state.

---

## Storage Map

| Store | Technology | Written When |
|-------|-----------|-------------|
| `exercises` | IndexedDB | On first launch (seed) + when user adds/edits |
| `programs` | IndexedDB | On program save in editor |
| `sessions` | IndexedDB | Incrementally: each set confirm, finalized on session end |
| `exerciseLastUsed` | IndexedDB | On each set confirm |
| `cwout:prefs` | localStorage | On every preference change |
| `cwout:activeSession` | localStorage | On every set confirm (crash recovery) |
| `cwout:activeProgramId` | localStorage | When user selects/changes active program |

---

## App Shell Caching

The service worker caches all static assets on first load:

- `index.html`
- Compiled JS bundles
- CSS
- Fonts (Space Grotesk, Inter, JetBrains Mono)
- Icons and images

On subsequent launches, the app loads from cache — zero network dependency. Background cache refresh can happen when online, but is never blocking.

**Strategy:** Cache-first for all app shell assets. Network-first is not appropriate here — the whole point is offline reliability.

---

## Crash Recovery

An in-progress session is written to `localStorage:cwout:activeSession` on every set confirmation. If the app crashes or the browser closes mid-session, the data is not lost.

**On app boot:**
1. Check `cwout:activeSession`
2. If it exists and `date === today`: prompt the user to resume or discard
3. If it exists and `date !== today`: it's stale — discard silently (or offer a "missed session" recovery)
4. On session finish or abandon: clear the key

This means a user can close their phone mid-workout, reopen the app, and pick up exactly where they left off.

---

## Data Integrity

- Writes are atomic within a single IndexedDB transaction where possible
- `SessionLog` is built up incrementally (one `LoggedSet` at a time), not written as a single blob at the end — avoids data loss if the session is never "finished"
- `exerciseLastUsed` is written per-set, not per-session — always reflects the most recent actual rep

---

## What Happens When Back Online

Nothing special. There is no sync to trigger. The app doesn't know or care about network state for its core functionality.

Network awareness is only relevant for:
- Service worker refreshing its cache in the background
- Potential future: exporting/importing data

---

## PWA Install

Service worker + web app manifest enables "Add to Home Screen" on iOS and Android. Once installed, the app launches in standalone mode (no browser chrome) and loads from cache.

This is a secondary goal for v1 — implement after core functionality is complete.

---

## Future: SQLite/WASM

If IndexedDB's query limitations become a problem (e.g., complex aggregations for volume trends or PR tracking), PGlite or wa-sqlite could replace the IndexedDB layer. The offline strategy wouldn't change — data would still be local-only, written immediately. Only the storage engine swaps.

See [Tech Stack](tech-stack.md) for more context.

---

## Related

- [Data Model](data-model.md) — What's being stored
- [Tech Stack](tech-stack.md) — Dexie.js and Workbox specifics
- [System Overview](overview.md) — Where offline fits in the broader architecture
- [Design Principles](../vision/principles.md) — Why this is non-negotiable
