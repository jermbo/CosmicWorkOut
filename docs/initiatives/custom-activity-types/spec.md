---
name: Custom Activity Types — spec
description: 'The agreed scope of custom activity types: each user builds their own list, and each type gets its own slice in Activity Mix.'
status: agreed
---

[Wiki](../../README.md) › [Backlog](../../features/backlog.md) › Custom Activity Types › Spec

# Spec: Custom Activity Types

Reasons are in the [decision log](decision-log.md). Words are in the [glossary](glossary.md).

## The problem

You mow the grass on Saturday and log it as an activity. The sheet has twelve fixed types, so you pick Other and type "Mowing". The Activity Mix chart counts by the fixed type, so Mowing, gardening and every other custom activity fall into one "Other" slice. The next time, you type the name again.

## The solution

The list of types is yours. It starts short, and it grows each time you log something new.

On Saturday you tap Other, type "Mowing", and save. Next Saturday, Mowing is a type in the picker. Insights shows Mowing as its own slice. A month later you see "Mowng" in the list, from a quick thumb; you rename it to "Mowing" in Settings, and its entries join the right type.

## In scope

1. Each user has a stored list of activity types, saved on the device and in backups (decision 1)
2. A new list starts with Stretching, Cardio, and Other (decision 2)
3. Each type in a past entry joins the list at the upgrade: the old fixed types, such as Run or Pickleball, and each name typed with Other, such as Mowing (decision 3)
   - a. The same is true when an older backup is restored
4. On the log sheet, Other with a new name adds that name to the list when you save (decision 4)
   - a. A name that is in the list already, in any mix of capital letters, uses that type (decision 4 a)
   - b. Save stays off until Other has a name (decision 9)
5. The picker shows the types that you use most first, and Other is always last (decision 11)
6. Settings › Activity lists your types (decisions 5, 6)
   - a. Hide a type: it leaves the picker and the Activity Mix chart. Its entries stay (decision 5)
   - b. Rename a type: every past entry follows (decision 6)
   - c. Rename to a name that exists: the two types become one (decision 6 a)
   - d. Show a hidden type again (decision 8)
7. A hidden type comes back when you type its name with Other again (decision 8)
8. Entries of a hidden type still show in the day list and on the week strip (decision 7)
9. Activity Mix gives each visible type its own slice (decision 10)
10. An entry points to its type by an id (decision 12)
11. The old `type` and `customType` fields stay on each entry, unread (decision 13)
12. To clear the Activity log also resets the list to Stretching, Cardio, and Other (decision 14)

## Out of scope

1. A list built from past entries with no stored list (decision 1)
2. Fixed types that come back on each start (decision 2)
3. Adding or hiding a type from the log sheet, other than through Other (decision 5)
4. Editing the name on each entry one at a time (decision 6)
5. An entry of Other with no name (decision 9)
6. Distance, pace or other new fields on an activity (not part of this initiative; it stays in the backlog)

## What changes in the system

| Page                                                                                                                                                     | The change                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Activity log](../../architecture/activity-log.md)                                                                                                       | The list of types is yours; Other adds a type; the picker order                            |
| [Tracker records](../../architecture/tracker-records.md)                                                                                                 | A new record, the activity type (id, name, hidden); an activity gets a type id             |
| [IndexedDB stores](../../architecture/indexeddb-stores.md)                                                                                               | A new store for activity types                                                             |
| [Schema upgrades](../../architecture/schema-upgrades.md)                                                                                                 | A new version: it builds the list from the past entries and sets the type id on each entry |
| [Data and backup](../../architecture/data-and-backup.md), [File backup](../../architecture/file-backup.md), [QR backup](../../architecture/qr-backup.md) | Backups carry the list; a restore of an older backup builds it                             |
| [Data clearing](../../architecture/data-clearing.md)                                                                                                     | Clearing the Activity log also resets the list                                             |
| [Settings](../../architecture/settings.md)                                                                                                               | Settings › Activity lists the types, with hide, show and rename                            |
| [Insights](../../architecture/insights.md)                                                                                                               | Activity Mix counts by type and leaves out hidden types                                    |
| [Local storage keys](../../architecture/local-storage-keys.md)                                                                                           | `cwout:lastActivityType` holds a type id                                                   |
| [Glossary](../../glossary.md)                                                                                                                            | "Activity type" changes its meaning; "Hidden activity type" is new                         |

**Stored data.** Each activity gains a type id, and a new store holds the types. This is a schema upgrade on every phone with real data, so it is a one-way door: the upgrade must keep every entry, and each entry must land on the right type.

## How you test it

| Scope     | How you know that it works                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| 1, 2      | On a new device, the picker shows Stretching, Cardio, Other. A backup file has the list                               |
| 3         | On a phone with old entries, after the upgrade, the list has each old type and each old custom name; no entry is lost |
| 3 a       | Restore a backup from v1.12; the list is built the same way                                                           |
| 4, 4 a    | Log Other "Mowing" twice, once as "mowing"; the list has one Mowing                                                   |
| 4 b       | With Other and an empty name, Save is off                                                                             |
| 5         | Log Cardio three times and Walk once; Cardio comes before Walk; Other is last                                         |
| 6 a, 8, 9 | Hide Mowing; it leaves the picker and the chart, but Saturday's entry still shows in the day list                     |
| 6 b, 6 c  | Rename "Mowng" to "Mowing"; one type is left, with all the entries                                                    |
| 6 d, 7    | Show Mowing in Settings, or type it with Other; it is back in the picker and the chart                                |
| 12        | Clear the Activity log; the list is the starting three again                                                          |

**Worth an automatic test** (pure modules, as the project tests today):

- **The upgrade:** old entries go in, a list of types and entries with type ids come out. It covers two spellings of one name, an Other with no name, and no entries at all.
- **Find or add a type by name:** a name and a list go in; the matching type, or a new one, comes out. It ignores capital letters and spaces at the ends, and brings back a hidden type.
- **Merge on rename:** two types and their entries go in; one type comes out, with all the entries.
- **The picker order:** a list and the entries go in; the order comes out, with Other last and hidden types left out.
