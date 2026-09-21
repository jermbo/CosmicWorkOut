[Wiki](../../README.md) › [Features](../README.md) › [v1.10.0](README.md) › US-045

# US-045 — Settings Feature Hub

> **As built:** `/settings` has two groups — **Features** (Habits, Baselines, Practice, Activity, Health — each shows On / Off, plus active counts) and **App** (Insights, Personalization, Data & backup). New pages `/settings/practice`, `/settings/activity`, `/settings/health`; `/settings/habits` and `/settings/baselines` gained their switch at the top and no longer redirect when the feature is off. Settings copy says **Lift plans** (incl. Data & backup). "Enable in Settings" links on `/goals`, `/habits`, `/baselines` now go to the feature's own page. `/settings/overview` still works. **Not changed:** the `/goals` screens themselves still say "Goal plans" — outside this story's Settings-only scope.
>
> Reshapes the Settings home from [US-030](../v1.7.0/US-030-settings-restructure.md). Personalization: [US-046](./US-046-personalization.md). Decisions: [v1.10.0 — Topic 6](./README.md#topic-6--settings-page).

As a **health-conscious user**, I want Settings to list each feature once, with everything about that feature on its own page
so that I can find a setting without scanning a long list of switches and links that appear and disappear.

---

## Design North Star

> "One row per feature. Everything about it, one tap away."

---

## Key Decisions

| Topic               | Decision                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Shape**           | iPhone-Settings style: short list, one row per feature, each showing On / Off and opening that feature's page. |
| **Feature page**    | Holds the feature's on / off switch, its manage list (if any), and its own options.                            |
| **Rows**            | Habits · Baselines · Practice · Activity · Health · Insights · Personalization · Data & backup.                |
| **Overview layout** | Moves inside Personalization (US-046); no longer its own row.                                                  |
| **Wording fixes**   | "Goal progression plans" → **Lift plans**. Baselines copy drops "floors and ceilings".                         |

```
Habits            On  ›
Baselines         On  ›
Practice          On  ›
Activity          Off ›
Health            On  ›
Insights              ›
Personalization       ›
Data & backup         ›
```

---

## Requirements

1. Hub
   a. The Settings home shall show one row per feature: Habits, Baselines, Practice, Activity, Health, Insights, Personalization, Data & backup.
   b. Each feature row with an on / off switch shall show its current state (On / Off) and open that feature's page.
   c. The hub shall not show manage links that appear or disappear based on toggles.
2. Feature pages
   a. **Habits:** on / off switch; manage habits (create, edit incl. color, reorder, deactivate); Mood colors.
   b. **Baselines:** on / off switch; manage baselines.
   c. **Practice:** on / off switch; Lift plans on / off switch; link to manage Lift plans.
   d. **Activity:** on / off switch.
   e. **Health:** on / off switch.
   f. **Insights:** chart show / hide list (US-043).
   g. Each feature page's copy shall explain that data is kept when the feature is off.
3. Wording
   a. All Settings copy shall say **Lift plans**, not "Goal progression plans" or "Goal plans".
   b. Baselines copy shall not mention ceilings or "stay under".
4. Navigation
   a. Every feature page shall have a way back to the Settings home.
   b. Existing Settings URLs for habits, baselines, data, and overview layout shall keep working or redirect.

---

## Acceptance Criteria

1. Hub
   a. Given Habits on and Activity off, when the user opens Settings, then the Habits row reads On and the Activity row reads Off.
   b. Given the user turns Habits off on its page, when they return to Settings, then the Habits row reads Off and the hub layout does not shift.
2. Feature pages
   a. Given the user taps Habits, when the page opens, then it shows the on / off switch and the list of habits.
   b. Given the user taps Practice, when the page opens, then it shows Practice on / off and Lift plans on / off.
   c. Given the user taps Insights, when the page opens, then it lists every Insights chart with a switch.
3. Wording
   a. Given the user reads any Settings page, when they search for "Goal progression", then it does not appear.
4. Navigation
   a. Given a bookmark to the old overview-layout Settings URL, when opened, then the user lands on the overview layout options.

---

## Related Docs

- [v1.10.0 README](./README.md)
- [US-046 — Personalization](./US-046-personalization.md)
- [US-043 — Show / Hide Insights Charts](./US-043-insights-chart-visibility.md)
- [US-030 — Settings Hub Restructure](../v1.7.0/US-030-settings-restructure.md)
- [Settings & Preferences](../../requirements/settings-preferences.md)
