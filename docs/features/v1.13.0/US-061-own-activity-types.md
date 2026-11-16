[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-061

# US-061 — Your Own Activity Type List

> **Status:** Built — waiting on hands-on testing · **Persona:** Active user · **Depends on:** none
>
> **As built:** the rules are the pure `src/lib/activityTypes.ts` (upgrade, find or add, picker order, rename and merge, Activity Mix counts), tested in `activityTypes.test.ts`. DB version 12 adds the `activityTypes` store; `ensureActivityTypes` in `initDB` seeds the starters and gives each entry with no known type id its type on every start, so the upgrade, an old restore and a QR window share one path. It also joins two types of one name, which a QR window from a second device can bring. The debug data is written in the old shape, so loading it runs the upgrade; Mowing is on the last three Saturdays. `cwout:lastActivityType` holds a type id; an old name still resolves.
>
> **Scope:** [Custom Activity Types spec](../../initiatives/custom-activity-types/spec.md), in scope 1–5, 9–11. Reasons are in its [decision log](../../initiatives/custom-activity-types/decision-log.md).
>
> **Changes:** the fixed list and the unnamed Other of [US-003](../v1.1.0/US-003-activity-logging.md).

As an **active user**, I want a list of activity types that starts short and grows each time I log something new, with each type as its own slice in Activity Mix, so that I can log "Mowing" once and see it on the record as Mowing, not as Other.

---

## Requirements

1. The stored list
   a. The system shall keep a list of activity types on the device. Each type has an id and a name.
   b. The list shall start with Stretching and Cardio. Other is not a type; it is the way to add one.
   c. Each activity shall point to its type by the type's id.
   d. The old `type` and `customType` fields shall stay on each activity after the upgrade, and nothing shall read them.
   e. The last type that you used shall be kept as a type id.
2. The upgrade
   a. On the first start of this version, each fixed type in a past activity (Run, Pickleball, …) shall join the list, once.
   b. Each name typed with Other in a past activity shall join the list, once, with its spelling from the first entry. Names that differ only in capital letters or in spaces at the ends are one type.
   c. An Other with no name shall become a type named "Other".
   d. Each past activity shall get the id of its type. No activity shall be lost.
3. The log sheet
   a. The picker shall show the types of the list, the one used most often first, then the rest by name, and Other last.
   b. With Other, a name field shows; Save shall stay off until it has a name.
   c. Saving Other with a new name shall add that name to the list and log the activity with the new type.
   d. Saving Other with a name that is in the list, in any mix of capital letters, shall log the activity with that type and add nothing.
4. Activity Mix
   a. The chart shall count by type, so each type has its own slice.
   b. A slice shall be labelled with the name of its type.
5. Test data
   a. The debug data shall include activities logged as Other with the name "Mowing".

---

## Acceptance Criteria

1. The stored list
   a. Given a new device with no activities, when the user opens the log sheet, then the picker shows Stretching, Cardio, and Other.
   b. Given the user logged Cardio last, when they open the sheet again, then Cardio is selected.
2. The upgrade
   a. Given past activities of Run, Run, Pickleball, Other "Mowing" and Other "mowing ", when the app starts on this version, then the list has Stretching, Cardio, Run, Pickleball and Mowing, each once.
   b. Given the same activities, when the upgrade is done, then all five activities are still in the day lists of their dates.
   c. Given a past activity of Other with no name, when the upgrade is done, then the list has a type "Other" and the activity shows as Other.
3. The log sheet
   a. Given Cardio logged three times and Mowing once, when the user opens the sheet, then Cardio comes before Mowing, and Other is last.
   b. Given Other is selected and the name is empty, when the user looks at Save, then Save is off.
   c. Given the list has no Mowing, when the user saves Other "Mowing", then the next sheet shows Mowing as a type.
   d. Given the list has Mowing, when the user saves Other "MOWING", then the list still has one Mowing, and the entry shows as Mowing.
4. Activity Mix
   a. Given two Mowing entries and one Cardio entry in the range, when Insights shows Activity Mix, then it has a Mowing slice of 2 and a Cardio slice of 1, and no Other slice.
5. Test data
   a. Given the debug data is loaded, when Activity Mix shows the last 30 days, then it has a Mowing slice.

---

## Tests

Pure modules, as the project tests today:

- **The upgrade:** old activities go in; a list of types and activities with type ids come out. Cases: two spellings of one name, an Other with no name, no activities.
- **Find or add a type by name:** a name and a list go in; the matching type or a new one comes out.
- **The picker order:** a list and the activities go in; the order comes out, with Other last.

---

## Related Docs

- [Activity log](../../architecture/activity-log.md)
- [Tracker records](../../architecture/tracker-records.md)
- [IndexedDB stores](../../architecture/indexeddb-stores.md)
- [Schema upgrades](../../architecture/schema-upgrades.md)
- [Local storage keys](../../architecture/local-storage-keys.md)
- [Insights](../../architecture/insights.md)
- [Debug data](../../architecture/debug-data.md)
- [Glossary](../../glossary.md): "Activity type" changes its meaning
