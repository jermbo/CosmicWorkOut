[Wiki](README.md) › Map — Interface & Navigation

# Map — Interface & Navigation

> How the app is laid out and how you move through it: routes, the Overview dashboard, bottom
> navigation, bottom sheets, the Settings hub, and the shared component primitives underneath.

This is a **map of content**, not a spec. It cuts across altitudes so you can enter anywhere.

**Adjacent maps:** [Movement & Training](map-movement-and-training.md) · [Daily Tracking](map-daily-tracking.md) · [Data & Persistence](map-data-and-persistence.md)

---

## Start here

| If you want to…                    | Read                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| See every route and the boot order | [App Structure](implementation/app-structure.md)                                           |
| Find or add a UI component         | [Components](implementation/components.md)                                                 |
| Style something correctly          | [Dev Guide — Styling](implementation/dev-guide.md#styling-tokens-and-primitive-components) |
| Change a Settings screen           | [Settings & Preferences](requirements/settings-preferences.md)                             |

---

## 30k — Why

- [Design Principles](vision/principles.md) — small surface area, web tech and web idioms
- [North Star](vision/north-star.md) — the noise the interface is meant to avoid

## 15k — Shape and connections

- [System Overview](architecture/overview.md) — SvelteKit, client-only, no router data loading
- [Tech Stack](architecture/tech-stack.md) — Svelte 5 runes, CSS custom properties, no CSS-in-JS
- [How It Works](implementation/behavior.md) — the mental model a user forms

## 5k — Detail

- [Settings & Preferences](requirements/settings-preferences.md) — every preference and its default

## Ground — Stories by release

| Release                             | What it added                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| [v1.1.0](features/v1.1.0/README.md) | [Daily dashboard](features/v1.1.0/US-005-daily-dashboard.md)                   |
| [v1.2.0](features/v1.2.0/README.md) | [Overview screen redesign](features/v1.2.0/US-007-home-screen-redesign.md)     |
| [v1.4.0](features/v1.4.0/README.md) | [Practice hub & navigation](features/v1.4.0/US-018-practice-hub-navigation.md) |
| [v1.5.0](features/v1.5.0/README.md) | [Insights hub & navigation](features/v1.5.0/US-022-insights-hub.md)            |
| [v1.7.0](features/v1.7.0/README.md) | [Settings hub restructure](features/v1.7.0/US-030-settings-restructure.md)     |

## Where in the code

| Layer              | Where                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| Routes and layout  | `src/routes/` — see [App Structure](implementation/app-structure.md)      |
| UI primitives      | `Button`, `Chip`, `FieldLabel`, `DialogTitle`, `SheetBody`, `SheetHeader` |
| Feature components | [Components](implementation/components.md)                                |
| Design tokens      | `src/app.css` — global-only; no UI utility classes                        |

> Shared UI patterns are **wrapper components, not global CSS classes**
> ([Decision 4](maintenance/audit-2026-06.md#decisions-locked-2026-06-22)). A parent cannot
> restyle a child component's markup, so a primitive needs a real prop for anything a caller varies.

## Deferred

- [Roadmap](roadmap/README.md) — deferred UI work
- [June 2026 Audit](maintenance/audit-2026-06.md) — inline SVGs still bypassing `Icon`, oversized files

---

## Related

- [Map — Movement & Training](map-movement-and-training.md) — the screens that log practice
- [Map — Daily Tracking](map-daily-tracking.md) — the screens that log everything else
- [Map — History & Insights](map-history-and-insights.md) — the review surfaces
- [Glossary](glossary.md) — full vocabulary
