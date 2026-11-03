---
name: Tech stack
description: 'The framework, the tools, and the few dependencies of CosmicWorkOut, and the reason for each choice.'
altitude: part
tags:
  - architecture
  - tools
parent: system.md
---

[Wiki](../README.md) / [System](system.md) / Tech stack

# Tech stack

The app uses web technology only, and it keeps its dependencies few. This page tells what each tool does and why it was selected.

## The framework

**Svelte 5** builds the screens. Its runes make state reactive: when a value in a store changes, each screen that reads it updates, with no virtual DOM. The screens have many small parts — set tiles, sheets, overlays — and Svelte keeps each one short.

**SvelteKit** gives the routes, the layout, and the build. Server rendering is off, because there is no server: the static adapter builds plain files, with one HTML file as the fallback for every route. **Vite** runs the dev server and the build. **TypeScript** types all the code, and the types of the stored records are the contract for the data.

## Styling

Design tokens — colours, spacing, fonts, timing — are CSS custom properties in one global file. Each component has its own scoped styles. A pattern that recurs becomes a small component, not a global class, because a global class loses to any scoped rule. There is no CSS-in-JS. The [design system](design-system.md) tells what the tokens look like.

## Storage

The app talks to IndexedDB through a thin wrapper of its own that returns promises. It does not use a library such as Dexie. The database has a small number of stores, and the wrapper is easy to read and to test.

## Charts

TanStack Charts draws each chart as SVG. The library is young, so its version is pinned exactly, and an upgrade is a deliberate step. The app imports only its public modules, never the D3 modules inside it. The [chart scrolling](chart-scrolling.md) page tells how a long range fits on a phone.

## The dependency rule

Each package must earn its place. The app has a handful of runtime packages: the chart library, two small QR libraries for the QR backup, and self-hosted fonts. The fonts are in the bundle, so the app makes no network request for them. Everything else is a tool for development. The exact versions are in `package.json`, and this page does not copy them, because a copy drifts.

## Motion

Animation uses web standards only: the Web Animations API for presses, the View Transitions API between pages, and CSS keyframes. Haptics use the Vibration API, and sounds are tones that the app makes at run time.

## Further reading

- [Working agreement](../standards/working-agreement.md): the rules for code, such as "no new dependencies".
- [Offline](offline.md): the service worker, which has no library either.
