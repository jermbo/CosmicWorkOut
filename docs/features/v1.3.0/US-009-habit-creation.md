# US-009 — Habit Creation & Management

> **Status: Shipped — v1.3.0**

As a **health-conscious user**, I want to create, configure, and manage my personal habits
so that the habits I track reflect exactly what matters to me and feed into my long-term data.

---

## Requirements

1. Habit types
   a. The app shall support the following named habit types, each with its own logging interaction:
   - **Times** — generic counter, tap to increment (e.g. coffee, supplements)
   - **Minutes** — numeric duration entry (e.g. meditation)
   - **Count** — numeric counter with a custom unit label (e.g. glasses of water, pages read, words written)
   - **Yes/No** — boolean toggle (e.g. alcohol, cold shower)
   - **Mood** — integer on a fixed -5 to +5 scale with named labels (see mood scale in [v1.2.0 README](../v1.2.0/README.md))
     b. The type determines how the habit is logged on the habit log page and how its data is stored for graphing.
     c. Habit types shall not be changeable after creation — changing type would corrupt historical data.

2. Creating a habit
   a. The user shall be able to create a new habit from **Settings → Habits** (`/settings/habits` after [US-030](../v1.7.0/US-030-settings-restructure.md)).
   b. The creation form shall require: a name (max 40 characters) and a type selection.
   c. For Count type, the user shall also enter a unit label (e.g. "glasses", "pages", "words") — max 20 characters.
   d. For Times, Minutes, and Count types, the user shall optionally set a daily goal (positive integer).
   e. Yes/No and Mood habits shall not have a daily goal — completion is binary or a single selection.
   f. A newly created habit shall be active by default and appear on the habit log page immediately.

3. Managing habits
   a. The user shall be able to edit a habit's name, unit label (Count only), and daily goal. The type shall not be editable.
   b. The user shall be able to toggle a habit between active and inactive. Inactive habits do not appear on the habit log page. **Mood cannot be deactivated** — users may turn off every other habit ([US-031](../v1.7.0/US-031-default-habits-tweak.md)).
   c. The user shall be able to reorder habits by dragging them in the Settings habits list (`/settings/habits`). The new order shall be reflected on the habit log page immediately.
   d. The user shall be able to delete a habit. Deletion shall preserve all historical log data for that habit — it will remain visible in calendar and graph views for past dates.

4. Built-in habit presets
   a. The app shall offer the following presets as starting points when creating a new habit. Selecting a preset pre-fills the name and type; the user may edit before saving:
   - Water (Count — cups)
   - Coffee (Count — cups)
   - Meditation (Minutes)
   - Writing (Count — words)
   - Reading (Minutes)
     b. Presets are suggestions only — the user is not required to use them and may create habits from scratch. **Mood is not a preset** — it ships built-in and always on.

---

## Acceptance Criteria

1. Habit types
   a. Given the user selects "Minutes" as the type, when the habit is created, then logging it shows a minutes input.
   b. Given the user selects "Mood" as the type, when the habit is created, then logging it opens the 11-state mood selector.
   c. Given a habit has historical data, when the user views the edit form, then the habit type cannot be changed.

2. Creating a habit
   a. Given the user taps "Add Habit" in Settings, when they enter a name and select a type, then the habit is saved and immediately appears on the habit log page.
   b. Given the user selects "Count" as the type, when the form shows, then a unit label field is required before saving.
   c. Given the user sets a daily goal of 8 for a Count habit, when they view the habit log, then the row shows progress toward 8.
   d. Given the user creates a Mood habit, when they view the creation form, then no daily goal field is shown.

3. Managing habits
   a. Given a habit has a goal of 6, when the user edits it to 8 and saves, then the habit log page reflects the new goal immediately.
   b. Given the user marks a habit as inactive, when they return to the habit log page, then that habit no longer appears.
   c. Given the user drags a habit to a new position in Settings, when they return to the habit log page, then the habits appear in the new order.
   d. Given the user deletes a habit, when confirmed, then the habit is removed from Settings and the habit log page, and its data remains visible in the calendar for past dates.

4. Built-in presets
   a. Given the user taps "Add Habit", when the creation form opens, then a list of presets is shown.
   b. Given the user selects the "Water" preset, when the form pre-fills, then the name is "Water", the type is Count, and the unit is "glasses".
   c. Given the user selects a preset, when they edit the pre-filled name before saving, then the saved habit reflects the edited name.

---

## Related Docs

- [v1.2.0 US-008 — Habit Log Page](../v1.2.0/US-008-habit-log-page.md)
- [US-010 — Habit History in Calendar](./US-010-habit-calendar-history.md)
- [v1.1.0 US-004 — Habit Tracking](../v1.1.0/US-004-habit-tracking.md)
- [Data Model](../../architecture/data-model.md)
- [Settings & Preferences Requirements](../../requirements/settings-preferences.md)
- [US-030 — Settings Hub Restructure](../v1.7.0/US-030-settings-restructure.md)
