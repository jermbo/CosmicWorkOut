[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-042

# US-042 — Habit Colors

> **As built:** `Habit.color` and, for Mood, `Habit.negativeColor`. Pure helpers in `src/lib/habitColors.ts` (tested): a 12-swatch palette with spoken names, `nextDefaultColor` hands out unused colors first, `withDefaultColors` fills missing colors on `habitStore.load()` and saves them once. `ColorSwatches.svelte` is the picker, used in `HabitForm`. Mood (protected) now has an edit button that opens a colors-only form. Habit rows show a color dot. Backups carry colors automatically (they live on the habit record).
>
> Used by [US-041](./US-041-all-habits-heat-chart.md). Decisions: [v1.10.0 — Topic 4](./README.md#topic-4--heat-charts-for-habits).

As a **health-conscious user**, I want to choose the color for each of my habits
so that my charts feel like mine and I can recognize a habit at a glance.

---

## Design North Star

> "Good defaults. Your colors if you want them."

---

## Key Decisions

| Topic         | Decision                                                                            |
| ------------- | ----------------------------------------------------------------------------------- |
| **Per habit** | Each habit has one base color, set where the habit is edited.                       |
| **Defaults**  | Every habit gets a sensible default color; existing habits get defaults on upgrade. |
| **Mood**      | Mood has **two** colors — good days and bad days — both user-choosable.             |
| **Used by**   | Heat chart shading (US-041). Other habit charts may adopt it later.                 |

---

## Requirements

1. Choosing a color
   a. The habit create / edit screen shall let the user choose a base color for the habit.
   b. Mood's settings shall let the user choose a good-day color and a bad-day color.
   c. The color choice shall offer a preset palette.
2. Defaults
   a. A new habit shall get a default color without the user choosing one.
   b. Existing habits shall receive default colors on upgrade, with no user action needed.
   c. Defaults shall be distinct from each other for the first several habits.
3. Persistence
   a. Habit colors shall persist across reloads and be included in backup export / import.
4. Use
   a. The All habits heat chart shall shade each habit from its chosen color.

---

## Acceptance Criteria

1. Choosing a color
   a. Given the Water habit, when the user picks blue and saves, then Water's heat chart cells use blue.
   b. Given Mood, when the user picks green for good and orange for bad, then +3 days shade green and −3 days shade orange.
2. Defaults
   a. Given an upgraded install with five habits, when the user opens the heat chart, then each habit has a color and the five are distinguishable.
   b. Given the user creates a habit without touching color, when they save, then it has a default color.
3. Persistence
   a. Given custom habit colors, when the user exports and restores a backup, then the colors are kept.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-041 — All-Habits Heat Chart](./US-041-all-habits-heat-chart.md)
- [US-009 — Habit Creation](../v1.3.0/US-009-habit-creation.md)
- [US-028 — Data Export & Backup](../v1.7.0/US-028-data-export-backup.md)
