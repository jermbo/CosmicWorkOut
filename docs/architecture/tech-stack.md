# Tech Stack

Technology choices for CosmicWorkOut, with rationale. All choices prioritize web-native approaches — this is the developer's area of expertise and the right leverage point.

---

## UI Framework — React

React for component rendering. The design is component-heavy (set tiles, exercise cards, bottom sheets, overlays) and React's model fits naturally.

No specific meta-framework (Next.js, Remix) is needed — there is no server, no routing that requires SSR, and no API layer. A simple Vite + React setup is sufficient.

**Alternatives considered:** Svelte, SolidJS — valid, but React expertise is already in place.

---

## Build Tool — Vite

Fast dev server, simple config, first-class React + TypeScript support. No configuration overhead for a project of this size.

---

## Language — TypeScript

All application code in TypeScript. The data model has enough interconnected entities that type safety pays off quickly. See [Data Model](data-model.md) for the type definitions.

---

## Styling — CSS Custom Properties + Scoped CSS

Design tokens (colors, spacing, radius, timing) as CSS custom properties. See the `tokens.css` in the [inspiration package](../_inspiration/packet/tokens.css) for reference values.

Component styles can be scoped via CSS Modules or a utility-class approach — TBD based on developer preference. The key constraint: all theming (accent color, density, roundness) must be achievable by swapping CSS custom property values at runtime.

**No CSS-in-JS** — keeps the bundle lean and avoids runtime style computation for something that should be trivially fast.

---

## Data Persistence — IndexedDB

All session and program data lives in IndexedDB. It's the only viable option for structured offline data storage in a web app at this scale.

### Wrapper: Dexie.js (recommended)

Raw IndexedDB API is verbose and callback-based. Dexie.js provides a clean Promise-based API, schema versioning, and good TypeScript support — without adding meaningful bundle weight.

```typescript
// Example with Dexie
const db = new Dexie('CosmicWorkOut');
db.version(1).stores({
  exercises: 'id',
  programs: 'id',
  sessions: 'id, date',
  exerciseLastUsed: 'exerciseId'
});
```

### Future consideration: SQLite/WASM

PGlite (PostgreSQL compiled to WASM) or wa-sqlite are worth exploring post-v1. Benefits: richer query language, familiar SQL mental model, easier complex aggregations (volume trends, PR tracking). Cost: larger bundle, more setup. Not a v1 concern — revisit once the data model is stable.

---

## Offline / PWA — Service Worker + Workbox

Service worker handles caching the app shell (HTML, JS, CSS, fonts) for offline launch. Workbox simplifies service worker authoring and cache strategy management.

PWA installability (manifest, icons, splash) is a secondary goal — implement after core functionality is solid.

See [Offline Strategy](offline-strategy.md) for the full caching approach.

---

## Animations

CSS keyframes + transitions for all motion. No animation library needed for v1. Key properties:

- `transform` and `opacity` only — no layout-triggering properties
- `cubic-bezier(0.34, 1.56, 0.64, 1)` as the spring easing (referenced in design tokens as `--ease-spring`)
- All animations respect `prefers-reduced-motion` — skip to end state when set

---

## Haptics

`navigator.vibrate()` for tactile feedback on set completion and exercise completion. Always wrapped in `try/catch` — not available on all browsers/devices, and failure should be silent.

---

## Fonts

- **Space Grotesk 700** — display headings
- **Inter** — body text
- **JetBrains Mono** — numbers (weight, reps)

Loaded from a CDN on first visit, cached by service worker thereafter.

---

## No Backend (By Design)

There is no server, no database backend, no API, no auth service. See [System Overview](overview.md) for the rationale. v1 is intentionally local-only.

---

## Related

- [System Overview](overview.md) — How these pieces fit together
- [Data Model](data-model.md) — What IndexedDB stores
- [Offline Strategy](offline-strategy.md) — Service worker and caching details
- [Design Principles](../vision/principles.md) — Why web-native was the right call
