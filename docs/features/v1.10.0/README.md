[Wiki](../../README.md) › [Features](../README.md) › v1.10.0

# v1.10.0 — Baselines & Insights Refresh (in discussion)

> **Status:** Discovery. Decisions are recorded here as they are locked. User stories come after.

Feedback from real use of v1.9.0 Baselines and the v1.5.0 Insights hub.

---

## Topics

| #   | Topic                                          | Status  |
| --- | ---------------------------------------------- | ------- |
| 1   | Baselines — 1 to n metrics ("daily 10")        | Decided |
| 2   | Insights — charts unreadable on mobile past 7d | Decided |
| 3   | Move charts to TanStack Charts                 | Decided |
| 4   | Heat charts — habits                           | Decided |
| 5   | Other useful chart insights                    | Decided |
| 6   | Settings page — is it useful and intuitive?    | Decided |

---

## Topic 1 — Baselines: 1 to n metrics

| Topic                               | Decision                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Metric count**                    | A baseline has **1 to n** metrics. No fixed cap. (Replaces the "1 or 2" rule in [US-034](../v1.9.0/US-034-baselines-setup.md).)                                                                                                                                                                                                                                                                                         |
| **Done = logged**                   | **Logging the baseline means it is done for the day.** Going over or under a target is _not_ the definition of done. (Replaces "clears only when every metric hits its target" from v1.9.0.)                                                                                                                                                                                                                            |
| **Targets are a yardstick**         | Targets exist only to compare against — "how did I do versus my base?" They never fail a day.                                                                                                                                                                                                                                                                                                                           |
| **The floor stays put**             | The baseline is set embarrassingly low so you show up when motivation is gone. It does not drift; every day and every chart is measured against it. Never auto-raised.                                                                                                                                                                                                                                                  |
| **Log what you did**                | The user enters the real amount (30 pushups, 400 words, 5.5 miles). The app works out the difference from the baseline itself.                                                                                                                                                                                                                                                                                          |
| **Show the comparison**             | Each metric shows how it compared to its baseline — e.g. pushups **+20** on a floor of 10.                                                                                                                                                                                                                                                                                                                              |
| **Growth insight (per metric)**     | Insights must show **which metric** is growing over time, not just the baseline as a whole (e.g. pushups climbing while the rest stay at 10).                                                                                                                                                                                                                                                                           |
| **Not just physical**               | Baselines must fit any pursuit — writing, reading, meditation, drawing, crafting, gaming, cooking, woodworking, socializing, boxing… Wording and measurements must stay generic.                                                                                                                                                                                                                                        |
| **Measurement types**               | Each metric is one of three generic types: **Duration** (time), **Distance** (miles / km), **Count** (a number of things with the user's own label — reps, laps, words, pages, sketches). "Action" and Count mean the same thing for now.                                                                                                                                                                               |
| **Distance unit per metric**        | Each Distance metric picks its own unit (mi, km, m, yd) — a bike ride in miles and pool laps in meters can live side by side. Not an app-wide setting.                                                                                                                                                                                                                                                                  |
| **No migration**                    | v1.9.0 Baselines data is test data only. Start fresh — no conversion of old `direction` or free-typed units; existing baseline definitions and logs are dropped on upgrade.                                                                                                                                                                                                                                             |
| **Neutral comparison**              | The app shows each metric **against its baseline, as plain numbers** (e.g. pushups 30 vs 10 → **+20**; mile time 16 vs 18 → **−2**). **No good / bad colors, no "stay under" direction, no derived speed.** The user decides what "better" means for them — a runner may want time to drop, a walker may want distance to climb. (Removes the up / under direction from [US-034](../v1.9.0/US-034-baselines-setup.md).) |
| **Phrase it positively (guidance)** | Suggested, not enforced: word baselines so doing more is the win — e.g. "phone locked away: 30 minutes" rather than "phone time under 30". Used in examples and placeholder copy.                                                                                                                                                                                                                                       |

### Measurement types

| Type         | Measures                          | Examples                             |
| ------------ | --------------------------------- | ------------------------------------ |
| **Duration** | time                              | meditation, stretching, reading time |
| **Distance** | miles or km                       | walk, bike, run                      |
| **Count**    | a number of things, user-labelled | pushups (reps), laps, words, pages   |

Mix them freely: reading = Duration + Count (pages); walking = Distance alone, or Distance + Duration; writing = Count (words).

### Example — "Daily 10"

One baseline, four metrics:

| Metric        | Baseline   |
| ------------- | ---------- |
| Pushups       | 10 reps    |
| Jumping jacks | 10 reps    |
| Walk          | 10 minutes |
| Lunges        | 10 reps    |

Logging it marks the day done. A day with 30 pushups and 10 of everything else shows pushups at **+20**.

### Example — distance + time (bike, walk)

Baseline is a distance **and** a time, e.g. bike **5 miles / 30 minutes**, walk **0.5 miles / 10 minutes**. People read improvement differently — both of these can be progress:

| Kind of improvement   | Bike            | Walk            |
| --------------------- | --------------- | --------------- |
| Further, same time    | 5.5 miles in 30 | 0.6 miles in 10 |
| Same distance, faster | 5 miles in 28   | 0.5 miles in 8  |

The app does not pick which is "better". It shows both numbers against the baseline and the user reads them. A runner at an 18-minute mile working toward 8 minutes watches duration fall; a walker watches distance climb.

### Open questions

_None for Topic 1._

---

## Topic 2 — Scrolling charts on mobile

**Problem:** on a phone, any range past 7 days squeezes every day into the screen width and the chart becomes unreadable.

| Topic                    | Decision                                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fixed spacing, pan**   | Day spacing stays fixed. Longer ranges add more days off-screen; the user pans left / right. The chart never squeezes to fit.                                                                                                             |
| **7 days on screen**     | On a phone, about **7 days** are visible at once — the same spacing as today's 7-day view.                                                                                                                                                |
| **Opens on newest**      | The chart opens scrolled to the most recent day (right edge). Swipe to go back in time.                                                                                                                                                   |
| **Range = how far back** | The range picker sets how much history you can scroll through, not how squeezed the chart is.                                                                                                                                             |
| **Fixed up-down scale**  | The value scale covers the **whole range**, not just the days on screen, so older days sit visibly lower/higher and growth is obvious. Scale labels stay pinned while days scroll.                                                        |
| **Wide screens**         | If the whole range fits, show it all with no scrolling.                                                                                                                                                                                   |
| **Which charts scroll**  | **Day charts scroll** (7 days on screen): Mood & Habits, Weight, Blood pressure, Baselines. **Weekly volume scrolls** by week (about 7 weeks on screen). **Activity mix and Habit radar do not scroll** — they summarize the whole range. |
| **Range picker**         | Keep the current picker as-is: **This week · 7 days · Month to date · Year to date · Custom**. Year to date becomes usable on phones thanks to panning.                                                                                   |

---

## Topic 3 — TanStack Charts

`@tanstack/charts` **0.18.0** is installed (exact pin) alongside `chart.js` 4.5.1. Checked against its bundled docs (`node_modules/@tanstack/charts/docs`):

| Need from Topics 1–4   | TanStack Charts                                              |
| ---------------------- | ------------------------------------------------------------ |
| Svelte 5               | Yes — `@tanstack/charts/svelte` adapter                      |
| Line, bar              | Yes                                                          |
| Donut, radar           | Yes — opt-in polar entry                                     |
| Heatmaps               | Yes — matrix cells                                           |
| Pan / scroll (Topic 2) | Yes — zoom & pan with touch, keyboard, and clamping built in |
| Light / dark           | Yes — automatic, CSS palette tokens                          |
| Accessibility          | Yes — names, keyboard focus, exact-value alternatives        |

**Risk:** it is **Alpha**. Minor versions (0.18 → 0.19) may break the API. Mitigation: keep the exact pin and test before any upgrade.

| Topic             | Decision                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Move all**      | Every chart moves to TanStack Charts — Insights charts and the Baselines chart. **Remove `chart.js`** once nothing uses it.  |
| **Alpha is fine** | Personal project; accept Alpha risk. Keep the **exact version pin** and only upgrade deliberately, fixing breaks when we do. |

---

## Topic 4 — Heat charts for habits

**Goal:** experiment. Try other views of the same data and find out whether they help understanding or just add noise.

| Topic                                | Decision                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Habits only**                      | Heat charts are for **habits** (Mood, Water, Coffee, and the rest). Not workouts, baselines, or health — at least for now.                                                                                                                  |
| **Keep what exists**                 | The combined Mood / Water / Coffee chart **stays**. Heat charts are added alongside it, not replacing it.                                                                                                                                   |
| **Experimental**                     | Treat heat charts as a trial. Keep the ones that prove useful; drop the ones that turn out to be noise.                                                                                                                                     |
| **Build both shapes**                | **A — calendar grid** (weeks × weekdays; spots weekday patterns) and **B — stacked strips** (one row per habit, days left→right, scrolls like other charts; spots links between habits). Try both.                                          |
| **All-habits chart**                 | A new chart showing **all habits together**, with buttons to **focus on one habit at a time**. Separate from the Mood / Water / Coffee chart, which stays as-is.                                                                            |
| **One chart, two views**             | The All-habits chart shows **B (stacked strips)** by default. Tapping a habit button switches to **A (calendar grid)** for just that habit. Tapping it again, or **All**, returns to the strips. Buttons: `[All] [Mood] [Water] [Coffee] …` |
| **Shading — "the more, the darker"** | GitHub-contributions style. Each habit is shaded against **its own busiest day in the range** (not its goal). Color steps in **10% opacity increments** (10%, 20% … 100%). A day with nothing logged is empty.                              |
| **Shading — yes/no habits**          | Done = full color; not done = empty.                                                                                                                                                                                                        |
| **Shading — Mood**                   | **Two colors.** Good days (+1…+5) darken in one color, bad days (−1…−5) darken in another, 0 is light. A rough stretch stands out as much as a great one.                                                                                   |
| **Habit colors**                     | Each habit has a **user-chosen base color** (set on the habit), with sensible defaults. Heat charts shade from that color. Mood gets two pickable colors (good / bad).                                                                      |

---

## Topic 5 — More insights (experiments)

**Approach:** the Insights page becomes a **testing ground**. Ship many chart options, use them, and let real use and user feedback decide what stays. No single "right" chart is chosen up front.

Candidate charts — all in as experiments:

| #   | Chart                                                                     | Question it answers                                        |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | **Baseline growth line** — each metric over time, baseline as a flat line | How far above my floor am I, and which metric is climbing? |
| 2   | **Showing-up rate** — % of days logged per week, per baseline / habit     | Am I showing up more or less than last month?              |
| 3   | **Day-of-week pattern** — average per weekday                             | Are Sundays always my weak day?                            |
| 4   | **"On days when…"** — e.g. mood on workout days vs rest days              | Does X actually help Y?                                    |
| 5   | **This week vs last week** — totals with ↑ / ↓                            | Am I trending up right now?                                |
| 6   | **Time of day** — when a baseline usually gets logged                     | When do I actually get it done?                            |
| 7   | **Personal bests** — marked on exercise and baseline charts               | When did I hit my best?                                    |

| Topic                  | Decision                                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Show / hide charts** | Every Insights chart can be hidden from its card (e.g. "⋯ → Hide"). Hidden charts can be brought back from Settings. What stays visible over time is the signal for what is useful. |

---

## Topic 6 — Settings page

**Problems found (v1.9.0 Settings hub):**

1. One long "Tracking" list of toggles with Manage links that appear / disappear — hard to scan.
2. Managing is inconsistent: habits and baselines are managed in Settings; Lift plans jump out to `/goals`; Health and Activity have no manage page.
3. Stale wording: "Goal progression plans" (should be **Lift plans**); Baselines described as "floors and ceilings" (ceilings are gone — Topic 1).
4. Weight unit (lb / kg) exists in `prefsStore` but no screen can change it.
5. No home for new settings (hidden Insights charts, habit colors).

| Topic                          | Decision                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One row per feature**        | The Settings home becomes a short list, one row per feature, iPhone-Settings style. Each row shows on / off and opens that feature's own page: its toggle, its manage list, and its own options.                                                                                                                                              |
| **Bring back Personalization** | Restore a look-and-feel page. It was removed after v1.7.0 ([US-030](../v1.7.0/US-030-settings-restructure.md) post-ship note: "single-user app"); that reason no longer holds now that the app is meant for other people too. The old page had accent color, weight unit, density, and roundness — all still applied on boot by `prefsStore`. |
| **Personalization contents**   | Bring back the four old options: **accent color, weight unit (lb / kg), density, roundness** — plus **Overview layout** (home card order), moved in from its own Settings row.                                                                                                                                                                |
| **Light mode — deferred**      | Wanted (light / dark / match device), but **not in v1.10.0**. The app is dark-only today, so it needs a full light palette. Revisit next version — logged in the [Roadmap](../../roadmap/README.md).                                                                                                                                          |

```
Habits            On  ›
Baselines         On  ›
Practice          On  ›
Activity          Off ›
Health            On  ›
Insights              ›
Personalization       ›   (accent, weight unit, density, roundness, Overview layout)
Data & backup         ›
```

---

## Related Docs

- [US-034 — Baselines Setup](../v1.9.0/US-034-baselines-setup.md)
- [US-036 — Baselines Progress Charts](../v1.9.0/US-036-baselines-charts.md)
- [Map — History & Insights](../../map-history-and-insights.md)
