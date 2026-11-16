[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-062

# US-062 — Activity Types in Backups and Clearing

> **Status:** Built — waiting on hands-on testing · **As built:** `activityTypes` is a backed-up store and a QR upsert store. `fillActivityTypes` in `backupPayload.ts` builds the list for a backup with none, before staging, with no restore warning. Clearing the Activity log empties `activities` and `activityTypes` and removes `cwout:lastActivityType`; the reload writes the starters. Tested in `backupPayload.test.ts`.
>
> **Persona:** Active user · **Depends on:** [US-061](./US-061-own-activity-types.md) (the list must exist)
>
> **Scope:** [Custom Activity Types spec](../../initiatives/custom-activity-types/spec.md), in scope 1, 3 a, 12.

As an **active user**, I want my list of activity types to travel with my backups and to reset when I clear the Activity log, so that a restore or a clean start gives me the list that I expect.

---

## Requirements

1. Backups
   a. A file backup and a QR backup shall carry the list of activity types.
   b. Restoring a backup that has the list shall restore the list as it was.
   c. Restoring a backup from before this version, with no list, shall build the list from its activities, by the rules of the upgrade in US-061.
2. Clearing
   a. Clearing the Activity log in Settings › Data shall also reset the list to Stretching and Cardio.

---

## Acceptance Criteria

1. Backups
   a. Given a list with Mowing, when the user saves a file backup and restores it on a new device, then the picker shows Mowing.
   b. Given a backup file from v1.12.0 with an Other "Mowing" activity, when the user restores it, then the list has Mowing and the entry shows as Mowing.
   c. Given a list with Mowing, when the user sends a QR backup to a second device, then the second device's picker shows Mowing.
2. Clearing
   a. Given a list with Run, Mowing and Cardio, when the user clears the Activity log, then the picker shows Stretching, Cardio, and Other only.

---

## Tests

- **Backup payload:** a list of types round-trips through the payload; a payload with no list gives a list built from its activities.

---

## Related Docs

- [Data and backup](../../architecture/data-and-backup.md)
- [File backup](../../architecture/file-backup.md)
- [QR backup](../../architecture/qr-backup.md)
- [Data clearing](../../architecture/data-clearing.md)
