# System Overview

CosmicWorkOut is a client-only web application. There is no backend, no server, no API. All data lives on the user's device.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                             │
│  ┌──────────────┐    ┌────────────────────┐ │
│  │  React App   │◄──►│  IndexedDB / Local  │ │
│  │  (UI Layer)  │    │  Storage (Data)     │ │
│  └──────┬───────┘    └────────────────────┘ │
│         │                                   │
│  ┌──────▼───────┐                           │
│  │ Service      │  ← caches app shell       │
│  │ Worker       │  ← enables PWA install    │
│  └──────────────┘                           │
└─────────────────────────────────────────────┘
```

No network requests after initial page load. The service worker caches the app shell so the app launches even with no connection.

---

## Layers

### UI Layer — React

The interface is built in React. It renders program views, session logging, calendar history, and settings. It reads from and writes to the data layer directly — no state server, no REST calls.

See [Tech Stack](tech-stack.md) for framework specifics.

### Data Layer — IndexedDB + localStorage

All persistent data lives in IndexedDB. Lightweight user preferences and crash-recovery state live in localStorage for simpler synchronous access.

See [Data Model](data-model.md) for entity definitions and [Offline Strategy](offline-strategy.md) for persistence rules.

### Service Worker

Caches the app shell (HTML, CSS, JS, fonts) on first load. Subsequent launches work without a network connection. Required for PWA installability.

---

## Data Flow

### Logging a set
```
User taps set tile
  → UI triggers set-complete action
  → SessionLog updated in IndexedDB immediately
  → exerciseLastUsed updated in IndexedDB
  → activeSession written to localStorage (crash recovery)
  → UI re-renders to reflect completed state
```

### Starting the app
```
App boot
  → Load UserPrefs from localStorage
  → Check localStorage for activeSession (crash recovery)
  → Load today's workout from IndexedDB
  → Render Today view
```

### Editing a program
```
User edits workout
  → Changes written to IndexedDB program store on save
  → UI reflects updated program
```

---

## What Does Not Exist (By Design)

- **No backend API** — v1 is local-only. This may never change.
- **No authentication** — single-user per device installation
- **No cloud sync** — data stays on the device
- **No analytics or telemetry**
- **No push notifications** (beyond what the browser provides natively)

---

## Future Considerations

These are noted here for awareness, not as planned work:

- **SQLite/WASM** (e.g., PGlite) as an alternative to IndexedDB — better query expressiveness, worth exploring after v1 ships. See [Tech Stack](tech-stack.md).
- **Optional cloud backup** — export/import as a bridge before any sync story is needed

---

## Related

- [Data Model](data-model.md) — What gets stored and how
- [Tech Stack](tech-stack.md) — Technology choices
- [Offline Strategy](offline-strategy.md) — How offline-first is implemented
- [North Star](../vision/north-star.md) — Why this architecture was chosen
