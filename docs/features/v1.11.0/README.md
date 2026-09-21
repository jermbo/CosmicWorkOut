[Wiki](../../README.md) › [Features](../README.md) › v1.11.0

# v1.11.0 — Finish the Threads, Then Sharpen Insights

> **Status:** In progress. Part 1 (US-048 – US-050) is **Built** — checked with type check, lint, unit tests (109), a production build, and a light-mode pass in the browser at phone width. Part 2 (Insights) is **Open** and being worked through topic by topic.

Two parts, in order:

1. **Finish what was already decided.** Work the roadmap and the July 2026 audit had queued up.
2. **Make Insights answer questions, not only show charts.** Since [US-047](../v1.10.0/US-047-retire-history.md) retired History, Insights carries the whole "look back" job.

---

## What's Shipping

| Story                                  | Title                       | Part | Status |
| -------------------------------------- | --------------------------- | ---- | ------ |
| [US-048](./US-048-light-mode.md)       | Light Mode                  | 1    | Built  |
| [US-049](./US-049-lift-plan-rename.md) | Lift Plan Wording in the UI | 1    | Built  |
| [US-050](./US-050-cheap-hardening.md)  | Cheap Hardening             | 1    | Built  |

Also in Part 1 (docs only): the [Roadmap](../../roadmap/README.md) drops the items these stories finish, and "Per-date workout log clearing" — done by US-047's session **Delete**.

**Not in this release:** removing `chart.js` from `package.json`. The user does that once the TanStack charts are working the way they want ([Roadmap — UX polish](../../roadmap/README.md#ux-polish)).

---

## Topics

| #   | Topic                                   | Status  |
| --- | --------------------------------------- | ------- |
| 1   | Light mode                              | Decided |
| 2   | Lift plan wording                       | Decided |
| 3   | Audit Phase A — cheap hardening         | Decided |
| 4   | Insights — personal records             | Open    |
| 5   | Insights — tap a chart to open that day | Open    |
| 6   | Insights — filter by discipline         | Open    |
| 7   | Insights — "This month" summary card    | Open    |

---

## Topic 1 — Light mode

Deferred from [v1.10.0 Topic 6](../v1.10.0/README.md#topic-6--settings-page) to "next version".

| Topic           | Decision                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Choices**     | **Dark**, **Light**, **Match device** — on Personalization, above Accent color.                                                                                     |
| **Default**     | **Dark.** Nothing changes for anyone until they pick otherwise.                                                                                                     |
| **Accent**      | The chosen accent stays the same in both themes. It's a fill with dark or light ink on top. Accent used as **text** is darkened in light mode so it stays readable. |
| **Principle 4** | "Dark, Tactile, Satisfying" becomes "Tactile and Satisfying — dark first". Dark stays the default and the reference look.                                           |

## Topic 2 — Lift plan wording

The UI still said "Goal plans" outside Settings. Every user-facing string now says **Lift plan(s)**. Code names (`goalPlanStore`, `/goals`) stay as they are.

## Topic 3 — Audit Phase A

Phase A of the [July 2026 Hardening Audit](../../maintenance/audit-2026-07-hardening.md#proposed-order-ifwhen-we-act): backup file-size cap, save-error handling in sheets, streak boundary test.

---

## Topics 4 – 7 — Insights (open)

Picked from the post-US-047 improvement list. **Not decided yet** — each will be grilled before a story is written.

| #   | Idea                         | The question it answers                            | Starting notes                                                                                                    |
| --- | ---------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 4   | Personal records             | "Did I get stronger?"                              | Detect a new best when a session finishes; show it on the completion screen and as an Insights card. Data exists. |
| 5   | Tap a chart to open that day | "What happened on that day — and can I fix it?"    | Tapping a heat cell or bar sets the logging date and opens the tracker. Roadmap: "Chart drill-down".              |
| 6   | Filter by discipline         | "How is my strength work going, apart from dance?" | Roadmap: "Per-discipline chart filtering".                                                                        |
| 7   | "This month" summary card    | "How am I doing, at a glance?"                     | Sessions, streak, top habit, new PRs — a first card before the detailed charts.                                   |

---

## Related Docs

- [v1.10.0](../v1.10.0/README.md) — Baselines & Insights refresh, Settings, Retire History
- [Map — History & Insights](../../map-history-and-insights.md)
- [Roadmap](../../roadmap/README.md)
- [July 2026 Hardening Audit](../../maintenance/audit-2026-07-hardening.md)
