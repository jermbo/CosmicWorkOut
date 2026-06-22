# Tech Stack

Technology choices for CosmicWorkOut. All choices prioritize web-native approaches.

```mermaid
flowchart TB
    subgraph ui ["UI Layer"]
        SK[SvelteKit routes + layout]
        SV[Svelte 5 components + runes]
        CSS[CSS custom properties]
    end

    subgraph state ["State Layer"]
        PS[programStore]
        SS[sessionStore]
        PR[prefsStore]
    end

    subgraph data ["Data Layer"]
        IDB[("IndexedDB")]
        LS[("localStorage")]
    end

    subgraph build ["Build"]
        Vite[Vite dev + build]
        TS[TypeScript]
    end

    subgraph planned ["Planned"]
        SW[Service Worker + PWA]
    end

    SK --> SV --> PS & SS & PR
    PS & SS --> IDB
    PR --> LS
    SS --> LS
    Vite --> SK
    SV -.-> SW
```

---

## UI Framework — Svelte 5 + SvelteKit

**Svelte 5** with runes (`$state`, `$derived`, `$effect`) for reactive state. **SvelteKit** for routing, layout, and build tooling.

Three file-based routes plus a root layout that owns global overlays (session, completion, recovery banner). SSR is disabled (`ssr = false`) — the app is fully client-rendered.

```typescript
// src/routes/+layout.ts
export const ssr = false;
```

**Why Svelte:** Component-heavy UI (set tiles, bottom sheets, overlays) with minimal boilerplate. Svelte 5 runes give fine-grained reactivity without a virtual DOM.

---

## Build Tool — Vite

Fast dev server on port **5678** (`npm run dev`). Vite + `@sveltejs/vite-plugin-svelte` with runes mode enabled project-wide.

---

## Language — TypeScript

All application code in TypeScript. Types live in `src/lib/db/types.ts` and mirror IndexedDB records. See [Data Model](data-model.md).

---

## Styling — CSS Custom Properties + Scoped Svelte CSS

Design tokens in `src/app.css` as CSS custom properties (colors, spacing, radius, timing, fonts). Component styles are scoped `<style>` blocks in each `.svelte` file.

Runtime theming via `data-density` and `data-roundness` attributes on `<html>`, plus `--color-accent` set by the prefs store.

Reference tokens also exist in the [inspiration package](../_inspiration/packet/tokens.css).

**No CSS-in-JS** — keeps the bundle lean.

---

## Data Persistence — IndexedDB (raw API)

All session and program data in IndexedDB. A thin Promise wrapper in `src/lib/db/database.ts` — **not Dexie.js**.

```typescript
// DB name: 'cosmic-workout', version 7
// Stores: items, programs, sessions (indexed by date), itemLastUsed, activities, habits, habitLogs
```

Built-in items and programs are upserted on every boot (so new fields land on old records). Habits seed only on first run.

---

## State Management — Svelte Stores

Three class-based stores using Svelte 5 runes:

| Store          | File                | Responsibility                                 |
| -------------- | ------------------- | ---------------------------------------------- |
| `programStore` | `program.svelte.ts` | Programs, exercises, sessions, today's workout |
| `sessionStore` | `session.svelte.ts` | Active session, set logging, finish/abandon    |
| `prefsStore`   | `prefs.svelte.ts`   | User preferences, accent color, density        |

See [State Management](../implementation/state.md).

---

## Offline / PWA — Implemented

Installable PWA via SvelteKit's **built-in service worker** (`src/service-worker.ts` using the `$service-worker` module) plus a web app manifest — **no Workbox**, to keep the dependency surface minimal. The SW precaches the app shell (cache-first) and serves a cached fallback for offline navigations. The build uses `@sveltejs/adapter-static` with an `index.html` SPA fallback.

See [Offline Strategy](offline-strategy.md) for the caching and install details.

---

## Animations

CSS keyframes + transitions. Key properties:

- `transform` and `opacity` only
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` for spring feel
- `prefers-reduced-motion` respected in component styles

---

## Haptics

`navigator.vibrate()` on set completion and exercise completion. Wrapped in `try/catch` — silent failure on unsupported devices.

---

## Fonts

Loaded from Google Fonts CDN in `app.html`:

- **Space Grotesk 700** — display headings
- **Inter** — body text
- **JetBrains Mono** — numbers (weight, reps)

---

## No Backend (By Design)

No server, database backend, API, or auth. See [System Overview](overview.md).

---

## Related

- [System Overview](overview.md) — How pieces fit together
- [Data Model](data-model.md) — IndexedDB stores
- [Offline Strategy](offline-strategy.md) — Caching plan
- [Dev Guide](../implementation/dev-guide.md) — Running locally
