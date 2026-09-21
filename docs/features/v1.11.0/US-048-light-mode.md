[Wiki](../../README.md) › [Features](../README.md) › [v1.11.0](README.md) › US-048

# US-048 — Light Mode

> **As built:** New `theme` pref (`'dark' | 'light' | 'system'`, default `'dark'`) with `prefsStore.resolvedTheme` and `setTheme()`. The resolved theme is written to `<html data-theme>`, and the `theme-color` meta follows it. An inline script in `app.html` sets it before first paint so there's no dark flash. `app.css` has a `[data-theme='light']` token set. New tokens: `--color-accent-text` (accent used as text — darkened in light), `--color-mood-good` / `--color-mood-bad` plus `-text` variants. Every `color: var(--color-accent)` became `--color-accent-text`. Charts read `chartPalette()` / `chartGrid()` from `src/lib/charts/theme.ts` — SVG presentation attributes can't use CSS variables — and rebuild when the theme changes. The All Habits heat chart swaps its empty / neutral cell grays for the theme's. **Known gap:** the iOS home-screen status bar style (`black-translucent`) is fixed at install, so in light mode the status bar text is white on a light page.
>
> Decisions: [v1.11.0 — Topic 1](./README.md#topic-1--light-mode).

As a **health-conscious user**, I want a light theme, or one that follows my phone,
so that I can read the app comfortably in daylight.

---

## Key Decisions

| Topic        | Decision                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Choices**  | Dark · Light · Match device                                                                  |
| **Default**  | Dark — existing users see no change                                                          |
| **Surfaces** | Warm light-gray page, white cards, a recessed gray for inputs and secondary buttons          |
| **Accent**   | Unchanged as a fill; darkened only where it is text                                          |
| **Charts**   | Grid lines, outlines and empty heat cells switch with the theme; series colors stay the same |

---

## Requirements

1. Choice
   a. Personalization shall offer Appearance: Dark, Light, Match device.
   b. The default shall be Dark.
   c. The choice shall be kept across reloads.
2. Match device
   a. Match device shall follow the device's light / dark setting, and update live when it changes.
3. Rendering
   a. The chosen theme shall apply before the first paint — no flash of the other theme.
   b. Text, including accent-colored text, shall stay readable on light surfaces.
   c. Insights and Baselines charts shall redraw in the new theme without a reload.
   d. The browser toolbar color (`theme-color`) shall match the page background.
4. Data
   a. Changing theme shall not touch stored data.

---

## Related Docs

- [US-046 — Personalization](../v1.10.0/US-046-personalization.md)
- [Design Principles — 4](../../vision/principles.md#4-tactile-and-satisfying--dark-first)
- [Settings & Preferences](../../requirements/settings-preferences.md)
