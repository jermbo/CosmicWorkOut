[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-040

# US-040 — Scrolling Charts on Mobile

> Depends on [US-039](./US-039-tanstack-charts-migration.md). Decisions: [v1.10.0 — Topic 2](./README.md#topic-2--scrolling-charts-on-mobile).

As a **health-conscious user**, I want longer chart ranges to scroll sideways instead of squeezing onto my phone screen
so that month-to-date or year-to-date charts stay as readable as a 7-day chart, and I can swipe back to see how far I've come.

---

## Design North Star

> "Same spacing, more history. Swipe to go back in time."

---

## Key Decisions

| Topic                    | Decision                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fixed spacing**        | Days keep a fixed width. Longer ranges extend off-screen; the chart never squeezes to fit.                                                                  |
| **7 on screen**          | About **7 days** visible at once on a phone — today's 7-day spacing.                                                                                        |
| **Opens on newest**      | Starts scrolled to the most recent day (right edge).                                                                                                        |
| **Range = how far back** | Range picker unchanged: **This week · 7 days · Month to date · Year to date · Custom**. It sets how far back you can scroll.                                |
| **Fixed value scale**    | The up-down scale covers the **whole range**, not only visible days, so growth is visible. Scale labels stay pinned while days scroll.                      |
| **Which charts**         | **Day charts:** Mood & Habits, Weight, Blood pressure, Baselines. **Weekly volume:** by week, ~7 weeks on screen. **No scroll:** Activity mix, Habit radar. |
| **Wide screens**         | If the whole range fits, show it all without scrolling.                                                                                                     |

---

## Requirements

1. Scrolling
   a. On a phone-width screen, day charts shall show about 7 days at a time and let the user pan left / right through the rest of the selected range.
   b. Weekly volume shall show about 7 weeks at a time and pan the same way.
   c. Panning shall work by touch swipe, mouse drag, and keyboard.
   d. Panning shall stop at the start and end of the range.
   e. Horizontal panning shall not block normal vertical page scrolling.
2. Starting position
   a. A scrolling chart shall open showing the most recent days of the range.
   b. Changing the range shall reset the chart to the most recent days.
3. Value scale
   a. The value scale shall be computed from the entire selected range.
   b. Scale labels shall stay visible while the days scroll.
4. Range picker
   a. The range options shall remain This week, 7 days, Month to date, Year to date, and Custom.
5. Wide screens and summaries
   a. When the full range fits at the fixed spacing, the chart shall show all of it with no panning.
   b. Activity mix and Habit radar shall not scroll; they summarize the whole range.
6. Hint
   a. A scrollable chart shall show a visible cue that more history exists off-screen.

---

## Acceptance Criteria

1. Scrolling
   a. Given a phone and Month to date on day 21, when the user opens the Weight chart, then about 7 days are visible and swiping right reveals earlier days.
   b. Given Year to date, when the user views Weekly volume, then about 7 weeks are visible and the rest are reachable by panning.
   c. Given the user swipes up on a chart, when the gesture is mostly vertical, then the page scrolls instead of the chart.
2. Starting position
   a. Given the user switches from 7 days to Year to date, when the chart redraws, then today's day is visible at the right edge.
3. Value scale
   a. Given pushups around 10 in January and around 40 this week, when the user pans back to January on Year to date, then the January points sit visibly lower than this week's on the same scale.
4. Range picker
   a. Given the user opens Insights, when they view the range picker, then Year to date is still an option.
5. Wide screens and summaries
   a. Given a desktop-width window and 7 days, when the user views a day chart, then all 7 days show with no pan cue.
   b. Given Month to date, when the user views Activity mix, then it shows one summary and does not scroll.
6. Hint
   a. Given a scrollable chart, when it first renders, then a cue shows that earlier days are off-screen.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-039 — Move All Charts to TanStack Charts](./US-039-tanstack-charts-migration.md)
- [US-022 — Insights Hub](../v1.5.0/US-022-insights-hub.md) — range picker
- [Map — History & Insights](../../map-history-and-insights.md)
