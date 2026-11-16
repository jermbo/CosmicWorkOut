[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-063

# US-063 — Hide, Show, and Rename Activity Types

> **Status:** Built — waiting on hands-on testing · **As built:** Settings › Activity lists every type by name with its entry count, a switch for shown or hidden, and a rename sheet (`ActivityTypeRow`, `ActivityTypeRenameSheet`). The sheet says when a rename will join two types. A merged type is shown if either was. Editing an entry of a hidden type keeps that type in the sheet's picker.
>
> **Persona:** Active user · **Depends on:** [US-061](./US-061-own-activity-types.md) (the list must exist)
>
> **Scope:** [Custom Activity Types spec](../../initiatives/custom-activity-types/spec.md), in scope 6, 7, 8, 9.
>
> **Changes:** the Settings › Activity page of [US-003](../v1.1.0/US-003-activity-logging.md), which has only the switch.

As an **active user**, I want to hide, show, and rename my activity types in Settings, so that I can fix a typo and keep the picker and the chart to the types that I use, without losing a single entry.

---

## Requirements

1. The list in Settings
   a. Settings › Activity shall list every activity type, with the hidden ones marked.
2. Hide and show
   a. Hiding a type shall take it out of the picker and out of Activity Mix.
   b. Entries of a hidden type shall stay in the database, in the day list, and on the week strip.
   c. Showing a hidden type shall put it back in the picker and in Activity Mix.
   d. Saving Other with the name of a hidden type, in any mix of capital letters, shall show that type again and log the entry with it.
3. Rename
   a. Renaming a type shall change the name on every past entry of that type.
   b. Renaming a type to a name that exists, in any mix of capital letters, shall join the two types into the existing one, with all their entries.
   c. A rename to an empty name shall not be possible.

---

## Acceptance Criteria

1. The list in Settings
   a. Given a list with Cardio, Mowing and a hidden Pickleball, when the user opens Settings › Activity, then all three show, and Pickleball is marked hidden.
2. Hide and show
   a. Given Mowing has an entry on Saturday, when the user hides Mowing, then the picker has no Mowing and Activity Mix has no Mowing slice.
   b. AND Saturday's day list still shows the Mowing entry.
   c. Given Mowing is hidden, when the user taps Show, then Mowing is in the picker and in Activity Mix again.
   d. Given Mowing is hidden, when the user saves Other "mowing", then Mowing is shown again and the new entry is a Mowing entry.
3. Rename
   a. Given a type "Mowng" with two entries, when the user renames it to "Mowing" and no Mowing exists, then both entries show as Mowing.
   b. Given "Mowng" with two entries and "Mowing" with three, when the user renames "Mowng" to "mowing", then the list has one Mowing with five entries.
   c. Given the rename field is empty, when the user looks at Save, then Save is off.

---

## Tests

- **Merge on rename:** two types and their entries go in; one type comes out, with all the entries.
- **The picker order** (from US-061) leaves out hidden types.

---

## Related Docs

- [Activity log](../../architecture/activity-log.md)
- [Settings](../../architecture/settings.md)
- [Insights](../../architecture/insights.md)
- [Glossary](../../initiatives/custom-activity-types/glossary.md): "Hidden activity type"
