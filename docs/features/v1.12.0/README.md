[Wiki](../../README.md) › [Features](../README.md) › v1.12.0

# v1.12.0 — Color Fields Redesign

> **Status:** In progress. **Built:** US-055, US-056 — checked with type check, unit tests and a production build, and clicked through in the browser at phone and desktop width. Waiting on hands-on testing.

User feedback on the v1.10.0 look: good, but it doesn't feel premium. We showed users two directions ([`_inspiration/design-01/`](../../_inspiration/design-01/), the current look, and [`_inspiration/design-02/`](../../_inspiration/design-02/)) and chose to build design 2.

---

## Design North Star

The app is a piece of gym equipment. Its structure is visible, its parts are chunky, and every press feels physical. Premium here means **confident and solid**, not soft and glossy.

## What This Is

A re-skin. **No behavior changes:** every flow, store, route and data shape stays the same. The one exception is Personalization: three appearance settings that no longer make sense under a dark-only, fixed-hue design were removed (see Key Decisions).

The full spec lives in [Design System](../../architecture/design-system.md).

---

## What's Shipping

| Story                                       | Title                 | Status |
| ------------------------------------------- | --------------------- | ------ |
| [US-055](./US-055-color-fields-redesign.md) | Color Fields Redesign | Built  |
| [US-056](./US-056-tap-feel.md)              | Tap Feel              | Built  |

---

## Key Decisions

| Decision                           | Detail                                                                                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design 2, not design 1**         | Chosen after showing users both.                                                                                                                                                                                                                          |
| **Dark only**                      | Light mode ([US-048](../v1.10.0/US-048-light-mode.md)) is **Removed**. The design depends on ink-on-color fields over a dark grid.                                                                                                                        |
| **Scrap settings that don't fit**  | Appearance, Accent color and Roundness are **Removed** from Personalization. Density and Weight unit stay. Old stored values are ignored and dropped on next save — no migration needed.                                                                  |
| **Fixed domain hues**              | Training blue, Habits coral, Baselines purple, Health yellow, Activity green. The accent is Training blue. Habit tiles keep each habit's own color ([US-042](../v1.10.0/US-042-habit-colors.md)).                                                         |
| **Fonts from Fontsource**          | Unbounded (display) and JetBrains Mono (everything else), self-hosted via `@fontsource` — never Google Fonts, so the app stays offline. Inter and Space Grotesk were removed.                                                                             |
| **Nav keeps its four tabs**        | Overview · Workout · Insights · Settings already matched the mockup's four; only the look changed (numbered blocks, current tab filled).                                                                                                                  |
| **Design-only extras left out**    | The mockup shows a rest timer, hold-to-edit habit tiles, and drag-to-scrub numbers. Those are new features, not a re-skin — not built.                                                                                                                    |
| **Tap feel, web standards only**   | Feedback after the redesign: good to look at, flat to tap. US-056 adds press motion, haptics (Vibration API), optional sound (Web Audio) and page transitions (View Transitions API). No iOS haptic workarounds — the user asked for web standards.       |
| **Tokens global, patterns scoped** | `app.css` gets only tokens. Color fields, press shadows and labels are scoped per component; progress squares are a new `ProgressBlocks` component — per audit Decision 4 ([Design System](../../architecture/design-system.md#where-the-patterns-live)). |
