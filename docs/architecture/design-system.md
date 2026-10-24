[Wiki](../README.md) › [15k — Architecture](../README.md#15k--architecture) › Design System

# Design System — Color Fields / Brutal

The visual language since v1.12.0 ([US-055](../features/v1.12.0/US-055-color-fields-redesign.md)). Source mockup: [`_inspiration/design-02/`](../_inspiration/design-02/). The earlier look is kept for reference in [`_inspiration/design-01/`](../_inspiration/design-01/).

**The idea:** the app is a piece of gym equipment. You can see its structure — a grid behind everything, index codes on every field, hard offset shadows instead of soft depth. **Anything with a shadow can be pressed**, and it sinks into its shadow when tapped, so you know the tap registered.

---

## Rules

| Rule                   | What it means in code                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Dark only**          | One palette. No light theme, no `data-theme`. `color-scheme: dark` on `:root`.                                              |
| **Grid behind it all** | `body` (and bottom sheets) draw a 24px grid in `--color-grid` on `--color-ink`.                                             |
| **One hue per domain** | Each area owns a solid color field (table below). Ink (`#0a0a0a`) always sits on top of a field.                            |
| **Square corners**     | Every `--radius-*` token is `0`, including `--radius-full`.                                                                 |
| **3px rules**          | Structure is drawn with `--rule` (3px) and `--rule-thin` (2px). Paper (`#f2f0ea`) for emphasis, `--color-border` for quiet. |
| **Shadow = pressable** | Hard offset shadow (`--shadow-hard`, 6px, no blur). On press: `translate(6px, 6px)` and the shadow goes to 0, in 60ms.      |
| **Empty = stripes**    | Not logged / not done yet: diagonal hazard stripes (`--field-empty`) with a dashed paper border.                            |
| **Index codes**        | Small mono labels like `[T] WORKOUT`, `[H] HABITS`, `T1`, `01 OVERVIEW`.                                                    |
| **Big figures**        | Weights, reps, counts, BP are set huge in Unbounded 900 with tight tracking.                                                |
| **Selected = paper**   | The current nav tab, selected day, selected segment or chip is filled paper with ink text.                                  |

## Domain fields

| Domain    | Token            | Hue                           | Code  | Used on                                                            |
| --------- | ---------------- | ----------------------------- | ----- | ------------------------------------------------------------------ |
| Training  | `--field-train`  | `oklch(0.76 0.13 235)` blue   | `[T]` | Workout card, current exercise, log-set sheet; also the app accent |
| Habits    | `--field-habit`  | `oklch(0.76 0.13 30)` coral   | `[H]` | Overview Habits card (each habit tile uses its own habit color)    |
| Baselines | `--field-base`   | `oklch(0.76 0.13 300)` purple | `[B]` | Overview Baselines card, Baselines card heads                      |
| Health    | `--field-health` | `oklch(0.86 0.14 95)` yellow  | `[P]` | Overview Health card, weight / BP readings and sheets              |
| Activity  | `--field-active` | `oklch(0.76 0.13 160)` green  | `[A]` | Overview Activity card, activity list, log-activity sheet          |

`--color-accent` is the Training field. Charts can't read CSS variables in SVG attributes, so `src/lib/charts/theme.ts` keeps the same hues as hex in `FIELD`.

## Type

Self-hosted with `@fontsource` (no network requests — the app stays offline-first).

| Font               | Weights               | Role                                                        |
| ------------------ | --------------------- | ----------------------------------------------------------- |
| **Unbounded**      | 700 · 800 · 900       | `--font-display` — titles and big figures, always uppercase |
| **JetBrains Mono** | 400 · 500 · 700 · 800 | `--font-body` and `--font-mono` — labels, codes, data, body |

## Where the patterns live

`src/app.css` holds **tokens only** — `--field-*`, `--field-empty`, `--rule`, `--shadow-hard`, `--press-offset`, `--duration-press`, the fonts. Per [Decision 4](../maintenance/audit-2026-06.md#decisions-locked-2026-06-22), patterns are components with scoped CSS, not global classes (a global class loses to any scoped rule).

| Pattern          | Built as                                                                                                                                                                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color field      | Scoped CSS in each component that draws one: `background: var(--field)`, ink text, ink `--rule` border. `HomeCard` takes a `field` prop; `HabitCard` sets `--field` to the habit's color. When a field holds other components (`ExerciseCard` with its `SetTile`s), it re-points `--color-text-*` at ink. |
| Empty / not done | `background: var(--field-empty)` + dashed paper border, scoped (`HabitCard`, Baselines card head, Overview empty state).                                                                                                                                                                                  |
| Press            | `box-shadow: var(--shadow-hard)`; `:active` translates by `--press-offset` and drops the shadow (`HomeCard`, `Button` primary, the big save blocks).                                                                                                                                                      |
| Progress blocks  | `ProgressBlocks` component (`total`, `on`).                                                                                                                                                                                                                                                               |
| Index code label | Scoped mono label style (`HomeCard` title, `HabitCard` name, `ExerciseCard` `T1`).                                                                                                                                                                                                                        |

## Settings that went away

Dark-only and fixed domain hues mean three Personalization settings no longer made sense and were removed in v1.12.0: **Appearance** (light / dark / match device), **Accent color**, and **Roundness**. **Density** and **Weight unit** stay. Old stored values for the removed keys are ignored on load and dropped on the next save — see [Settings & Preferences](../requirements/settings-preferences.md).

---

## Related

- [Tech Stack](tech-stack.md) — fonts, tokens, styling approach
- [Design Principles](../vision/principles.md#4-tactile-and-satisfying--dark-only) — why it feels like equipment
- [Components](../implementation/components.md) — where each pattern is built
