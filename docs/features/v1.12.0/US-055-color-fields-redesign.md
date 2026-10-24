[Wiki](../../README.md) › [Features](../README.md) › [v1.12.0](./README.md) › US-055

# US-055 — Color Fields Redesign

> **As built:** New tokens in `src/app.css` (dark only, 24px grid, `--field-*` domain hues, `--rule` 3px, `--shadow-hard`, all radii 0) — tokens only; patterns are scoped per component, plus a new `ProgressBlocks` component. `ProgressRing` was removed (no longer used). Unbounded + JetBrains Mono via `@fontsource`. Removed from `prefsStore`, `UserPrefs` and Personalization: `theme`, `accentColor`, `roundness`; the pre-paint theme script in `app.html` is gone. Overview cards are color fields with index codes and progress blocks (`HomeCard` now takes `code` and `field`). Bottom nav is numbered blocks. The session screen draws the current exercise as the Training field (`ExerciseCard` `current`, `SetTile` `next` — the next set reads NOW) and a one-segment-per-set progress bar. The log-set sheet, weight and BP sheets use huge figures with ruled +/- columns and a big paper save block. Habit tiles are fields in each habit's own color. Charts use `FIELD` / `CHART_ACCENT` hex values from `src/lib/charts/theme.ts`. No store, route or data changes beyond the three removed prefs.

---

As a **Fitness User**, I want the app to look and feel solid and premium, so that I can trust it and enjoy logging every set.

---

## Decisions

| Area         | Decision                                                                                |
| ------------ | --------------------------------------------------------------------------------------- |
| **Source**   | [`_inspiration/design-02/`](../../_inspiration/design-02/) — "color fields / brutal".   |
| **Scope**    | Visual only. No new features, no changed flows.                                         |
| **Theme**    | Dark only.                                                                              |
| **Settings** | Remove Appearance, Accent color, Roundness. Keep Density, Weight unit, Overview layout. |
| **Fonts**    | Unbounded + JetBrains Mono from Fontsource.                                             |

---

## Requirements

1. Look
   a. The app shall use one dark palette on a visible grid, with square corners and 3px rules.
   b. Each domain shall have one solid color field: Training, Habits, Baselines, Health, Activity.
   c. Titles and key figures shall use a heavy uppercase display face; labels and data a monospace face.
2. Pressable things
   a. Tappable cards and primary buttons shall carry a hard offset shadow.
   b. When pressed, they shall sink into the shadow.
3. Empty states
   a. Something not logged yet shall show hazard stripes, so it reads as empty at a glance.
4. Settings
   a. Personalization shall no longer offer Appearance, Accent color, or Roundness.
   b. A stored value for any of those shall be ignored, and shall not break startup.
5. Behavior
   a. Every existing flow shall work exactly as before.
   b. Fonts shall load with no network request.

---

## Acceptance Criteria

1. Look
   a. Given any screen, when it loads, then the background is near-black with a faint grid and no rounded corners.
   b. Given Overview, when it loads, then each card is a solid field in its domain color with an index code (`[H]`, `[T]`, `[A]`, `[B]`, `[P]`).
2. Pressable things
   a. Given a card or primary button with a shadow, when the user presses it, then it shifts into its shadow.
3. Empty states
   a. Given a habit with nothing logged today, when Habits loads, then its tile shows stripes.
4. Settings
   a. Given Settings → Personalization, when it loads, then only Weight unit, Density, and Overview layout are shown.
   b. Given prefs saved by v1.10.0 with `theme: 'light'`, when the app starts, then it shows the dark design and does not error.
5. Behavior
   a. Given a workout session, when the user logs, edits, and finishes sets, then the result is the same as before the redesign.
   b. Given the device is offline, when the app loads, then both fonts render.

---

## Related Docs

- [Design System](../../architecture/design-system.md)
- [US-046 — Personalization](../v1.10.0/US-046-personalization.md)
- [US-048 — Light Mode](../v1.10.0/US-048-light-mode.md) (Removed)
- [Settings & Preferences](../../requirements/settings-preferences.md)
