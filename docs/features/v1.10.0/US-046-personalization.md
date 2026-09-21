[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-046

# US-046 — Personalization

> **As built:** `/settings/personalization` — accent swatches (8 presets via `ColorSwatches`), weight unit / density / roundness via a new `SegmentedControl`, and the Overview card-order editor (extracted to `OverviewLayoutEditor.svelte`, also rendered at `/settings/overview`). Everything writes through the existing `prefsStore` setters, so it applies immediately and persists. **Density and roundness now reach the whole app:** they override the base `--space-*` (compact ×0.75, spacious ×1.25) and `--radius-*` tokens (plus a new `--radius-sheet` for bottom sheets) in `app.css`, instead of the few `--r-*` / `--tile-h` tokens they touched before — which is why the old Appearance page seemed to do nothing but color. Charts read `prefsStore.accentColor`, so they recolor live. **Weight unit is a label only** — past readings are not converted; the page says so. The Health page links here for the unit.
>
> Restores the look-and-feel page removed after [US-030](../v1.7.0/US-030-settings-restructure.md) (removed as "single-user app" — no longer true). Light mode is **deferred** to the next version ([Roadmap](../../roadmap/README.md)). Decisions: [v1.10.0 — Topic 6](./README.md#topic-6--settings-page).

As a **health-conscious user**, I want one place to make the app look and feel like mine
so that I can pick my accent color, units, spacing, and home layout without hunting through Settings.

---

## Design North Star

> "Make it yours, in one place."

---

## Key Decisions

| Topic               | Decision                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contents**        | Accent color · Weight unit (lb / kg) · Density (compact / comfortable / spacious) · Roundness (sharp / default / soft) · Overview layout.                                 |
| **Already wired**   | The four appearance preferences are still stored and applied on app start; only the screen is missing.                                                                    |
| **Overview layout** | Moved here from its own Settings row.                                                                                                                                     |
| **Light mode**      | **Not in v1.10.0** — shipped in v1.11.0 ([US-048](../v1.11.0/US-048-light-mode.md)). App stays dark-only; light / dark / match-device is on the Roadmap for next version. |

---

## Requirements

1. Page
   a. Settings shall have a **Personalization** row that opens the Personalization page.
2. Accent color
   a. The user shall be able to choose an accent color from a preset palette.
   b. The new accent shall apply across the app, including charts, immediately.
   c. Text on accent surfaces shall stay readable (dark text on light accents, light text on dark accents).
3. Weight unit
   a. The user shall be able to choose lb or kg.
   b. Weight displays and new weight entries shall use the chosen unit.
4. Density and roundness
   a. The user shall be able to choose density: compact, comfortable, or spacious.
   b. The user shall be able to choose roundness: sharp, default, or soft.
   c. Each choice shall apply across the app immediately.
5. Overview layout
   a. The Overview card order options shall live on the Personalization page.
6. Persistence
   a. All Personalization choices shall persist across reloads.

---

## Acceptance Criteria

1. Page
   a. Given the user opens Settings, when they tap Personalization, then accent, weight unit, density, roundness, and Overview layout are on one page.
2. Accent color
   a. Given lime accent, when the user picks lavender, then buttons and chart accents turn lavender without a reload.
   b. Given a very light accent, when a button uses it, then its label is dark.
3. Weight unit
   a. Given lb, when the user switches to kg, then the health weight display shows kg.
4. Density and roundness
   a. Given comfortable, when the user picks compact, then spacing tightens across the app.
   b. Given default roundness, when the user picks sharp, then card corners become square.
5. Overview layout
   a. Given the user reorders Overview cards on Personalization, when they open Overview, then cards appear in the new order.
6. Persistence
   a. Given custom choices, when the user reloads, then all choices are kept.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-045 — Settings Feature Hub](./US-045-settings-feature-hub.md)
- [US-030 — Settings Hub Restructure](../v1.7.0/US-030-settings-restructure.md) — original Appearance page
- [Settings & Preferences](../../requirements/settings-preferences.md) — accent color rules
- [Roadmap](../../roadmap/README.md) — light mode
