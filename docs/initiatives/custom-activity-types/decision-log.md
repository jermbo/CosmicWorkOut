[Wiki](../../README.md) › [Backlog](../../features/backlog.md) › Custom Activity Types › Decision log

# Decision log: Custom Activity Types

Today a custom activity, such as mowing the grass, is saved as "Other", and the Activity Mix chart puts it in one "Other" slice. This page records the decisions to let each user build their own list of activity types.

## The state of today

| Part                 | Fact                                                                                                                                | Where                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| The list of types    | 12 fixed values in a TypeScript union: Run, Walk, Bike, Swim, Hike, Pickleball, Tennis, Basketball, Yoga, Stretching, Cardio, Other | `src/lib/db/types.ts` (`ActivityType`)                |
| The sheet            | The same 12 as a fixed array. With Other, a text field asks for a name                                                              | `src/lib/components/ActivityLogSheet.svelte`          |
| The stored entry     | `type` is one of the 12. With Other, the typed name is in `customType`. A blank name is saved as no name                            | `ActivityLog` in `src/lib/db/types.ts`                |
| The shown name       | Other with a name shows the name ("Mowing"). Other with no name shows "Other"                                                       | `activityDisplayName` in `src/lib/activities.ts`      |
| The chart            | Activity Mix counts by `type`, not by the shown name. So every custom activity falls in one "Other" slice                           | `src/lib/components/insights/ChartActivityMix.svelte` |
| The last type        | localStorage `cwout:lastActivityType` holds the last `type`. It holds "Other", not the custom name                                  | `src/lib/stores/activities.svelte.ts`                 |
| A list that you edit | None. The name typed with Other is not kept for the next entry                                                                      | —                                                     |
| Settings             | Settings › Activity has only the on/off toggle                                                                                      | `src/routes/settings/activity/+page.svelte`           |

## Decisions

### The list

1. **Each user has a stored list of activity types.** It is saved on the device and goes into backups. The reason: a stored list can be changed, so a typo can be fixed. An option that was rejected: a list built from past entries. It cannot fix or hide a type.
2. **The user builds the list. It starts with Stretching, Cardio, and Other.** The reason: each person does different things, and a long fixed list is mostly noise. Options that were rejected: the 12 fixed types that come back on each start; a short list of five (Run, Walk, Bike, Yoga, Stretching).
3. **Each type in a past entry joins the list.** This covers the old fixed types, such as Run or Pickleball, and each name that was typed with Other, such as Mowing. The reason: the owner wants to see that old entries are still captured. An option that was rejected: start everyone on the short list and drop the old types.

### Adding and hiding

4. **You add a type on the log sheet.** You tap Other, type a name, and save. The name joins the list, and the next sheet shows it as a type. The reason: you add a type at the moment that you need it, with no trip to Settings.
   - a. If the name is in the list already, in any mix of capital letters, the entry uses the type that is there. So "mowing" and "Mowing" are one type.
5. **You hide a type in Settings › Activity.** A hidden type leaves the picker and the Activity Mix chart. Its entries stay in the database. The reason: removing a type must never delete data. An option that was rejected: hiding from the log sheet. It puts more on the main screen.

6. **You rename a type in Settings › Activity, and every past entry follows.** The reason: this is how you fix a typo. An option that was rejected: editing each entry.
   - a. A rename to a name that exists joins the two types into one. "Mowng" renamed to "Mowing" puts all its entries under Mowing.
7. **A hidden type still shows in the day list and on the week strip.** Only the picker and the chart hide it. The reason: your history stays true.
8. **A hidden type comes back two ways.** You type its name with Other again, or you tap "Show" next to it in Settings.
9. **Other needs a name.** Save stays off until you type one. So "Other" means "add a new type". An option that was rejected: an Other with no name, as today. It makes a slice that says nothing.

### The chart

10. **Activity Mix counts by type, so each type has its own slice.** Mowing is a slice, not part of Other. The reason: this is the problem that the initiative solves.

### Order and storage

11. **The picker shows the types that you use most first, and Other is always last.** The reason: the type that you want is near the thumb.
12. **An entry points to its type by an id, not by the name.** The reason: when a type is renamed, its entries follow it with no change to each entry.

13. **The old `type` and `customType` fields stay on each entry after the upgrade, and nothing reads them.** The reason: the change of the stored form is a one-way door; with the old fields kept, an older backup and an older app still read the data. An option that was rejected: remove the old fields in the upgrade.
14. **To clear the Activity log in Settings › Data also clears the list of types, back to Stretching, Cardio, and Other.** The reason: a clean start for activities is a clean start for their types. An option that was rejected: keep the list after a clear.

## Choices that are not confirmed

None. The owner agreed the scope on 16 November 2026, and the spec is `agreed`. From here this log is append-only.
