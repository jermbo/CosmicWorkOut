[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-041

# US-041 — All-Habits Heat Chart

> **As built:** `ChartAllHabits.svelte` on Insights, card id `all-habits`. Shading is pure and tested in `src/lib/insights/heat.ts` (`habitHeatRow`, `heatLevel`, `moodLevel`, `calendarSlots`). Strips are TanStack `cell` marks (band x = days, band y = habits) inside `ScrollChart`, with habit names in a pinned rail. The focused grid is weeks × Mon–Sun at 32 px columns; days outside the range are outlined, not filled. Each cell's fill is passed as its own color key (identity ordinal scale), so 10% steps are exact. Empty = `#232323`, mood 0 = `#3a3a3a`. Legend under the grid; a one-line note under the strips.
>
> **Experimental.** Kept or dropped based on real use ([US-043](./US-043-insights-chart-visibility.md) lets it be hidden). Depends on [US-039](./US-039-tanstack-charts-migration.md), [US-040](./US-040-scrolling-charts.md), and [US-042](./US-042-habit-colors.md). Decisions: [v1.10.0 — Topic 4](./README.md#topic-4--heat-charts-for-habits).

As a **health-conscious user**, I want to see all my habits together as a heat chart, and focus on one habit at a time
so that I can spot links between habits (low water, low mood) and weekday patterns (coffee Mondays) that a line chart hides.

---

## Design North Star

> "The more you did, the darker the square."

---

## Key Decisions

| Topic                    | Decision                                                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Habits only**          | Workouts, baselines, and health are out of scope for now.                                                                                                                                                                        |
| **Additive**             | The Mood & Habits combined chart **stays**. This is a new, separate chart.                                                                                                                                                       |
| **One chart, two views** | **All** (default): **stacked strips** — one row per habit, days left→right, scrolls like other day charts. **Tap a habit:** **calendar grid** for that habit — columns = weeks, rows = weekdays. Tap again or **All** to return. |
| **Shading**              | GitHub-contributions style: each habit shaded against **its own busiest day in the range**, in **10% opacity steps** (10%…100%). Nothing logged = empty.                                                                         |
| **Yes / no habits**      | Done = full color; not done = empty.                                                                                                                                                                                             |
| **Mood**                 | **Two colors**: good days (+1…+5) darken in one, bad days (−1…−5) in the other; 0 is light.                                                                                                                                      |
| **Color**                | Each habit uses its own color ([US-042](./US-042-habit-colors.md)).                                                                                                                                                              |

```
All view (strips)            Focused view (grid, one habit)
Mood   ▒ ▓ ▓ ░ ▒ ▓ ▓               W1 W2 W3 W4
Water  ▒ ▓ ▓ ░ ░ ▓ ▓         Mon   ▓  ▓  ▓  ▓
Coffee ▓ ░ ▒ ▓ ▓ ░ ▒         Tue   ░  ▒  ░  ▒
                             …
[All] [Mood] [Water] [Coffee] [Read] …
```

---

## Requirements

1. Placement
   a. Insights shall include an "All habits" heat chart when Habits are enabled and at least one active habit exists.
   b. The Mood & Habits combined chart shall remain unchanged in purpose.
2. Focus buttons
   a. The chart shall show an **All** button and one button per active habit, in habit sort order.
   b. **All** shall be selected by default.
   c. Selecting a habit shall switch the chart to that habit's calendar grid; selecting it again or **All** shall return to strips.
3. Strips view
   a. Each active habit shall have one row; each day in the range shall have one cell.
   b. The strips view shall scroll horizontally like other day charts (US-040).
4. Calendar grid view
   a. The grid shall have one column per week and one row per weekday, covering the selected range.
   b. Days outside the range shall be visually distinct from days with nothing logged.
   c. The grid shall scroll horizontally when it has more weeks than fit on screen.
5. Shading
   a. Number habits (times, minutes, count) shall be shaded in 10% opacity steps relative to that habit's highest day in the selected range.
   b. Yes / no habits shall be full color when done and empty when not.
   c. Mood shall use two colors — one for positive values, one for negative — each darkening in 10% steps toward ±5; 0 shall be a light neutral.
   d. A day with nothing logged shall be empty and distinguishable from the lightest shaded step.
6. Details
   a. Tapping or focusing a cell shall show the habit, date, and exact value.

---

## Acceptance Criteria

1. Placement
   a. Given Habits enabled with Mood, Water, Coffee, and Read, when the user opens Insights, then the All habits chart shows four rows and the Mood & Habits chart is still present.
   b. Given Habits disabled, when the user opens Insights, then the All habits chart is not shown.
2. Focus buttons
   a. Given the chart in strips view, when the user taps **Coffee**, then a weeks × weekdays grid for Coffee appears.
   b. Given the Coffee grid, when the user taps **Coffee** again, then the strips view returns.
3. Strips view
   a. Given Month to date on a phone, when the user swipes the strips, then earlier days scroll into view for all rows together.
4. Calendar grid view
   a. Given This week on a Wednesday, when the user focuses Water, then Thursday–Sunday cells look different from logged-nothing cells.
5. Shading
   a. Given Water's highest day in range is 10 glasses, when a day has 5, then that cell is at the 50% step.
   b. Given Water's highest day is 10 and Coffee's is 3, when both have their max on the same day, then both cells are full color.
   c. Given a yes / no habit done on Monday only, when the user views the week, then Monday is full color and other days are empty.
   d. Given mood +4 on Monday and −4 on Tuesday, when the user views mood, then the two days use different colors at the same darkness.
   e. Given a number habit logged at its lowest possible nonzero value, when the user views the cell, then it is visibly different from an empty day.
6. Details
   a. Given the user taps a Water cell for Sept 3, when the detail shows, then it reads the habit, the date, and the exact value.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-042 — Habit Colors](./US-042-habit-colors.md)
- [US-040 — Scrolling Charts on Mobile](./US-040-scrolling-charts.md)
- [US-023 — Mood vs Habits Chart](../v1.5.0/US-023-mood-habits-chart.md) — stays
- [Glossary — Habit](../../glossary.md#habit)
