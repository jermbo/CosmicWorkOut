---
name: Schema upgrades
description: 'How the database changes shape without loss of your data, and how built-in content reaches each device on every start.'
altitude: mechanism
tags:
  - storage
  - migration
parent: storage.md
---

[Wiki](../README.md) / [System](system.md) / [Storage](storage.md) / Schema upgrades

# Schema upgrades

The app adds stores and changes records over time, but your data must survive each update. This page tells how an upgrade runs, and how built-in content stays current.

## How the browser runs an upgrade

IndexedDB has a version number. When the app opens the database with a higher number than the device has, the browser runs one upgrade step before anything else can read. The step runs only when the number goes up. So a store that is added without a new number never appears on a device that already has the database.

## The upgrade only adds

The upgrade step makes each store and each index that does not exist yet, and it leaves the others as they are. It never deletes a store. So the same step works on a new device, on a device one version behind, and on a device many versions behind.

When a record must change shape, the step can transform it, keyed on the old version number. That happened once: when baselines got a new shape, the upgrade from version 10 to 11 cleared the two baseline stores. The old baseline data was from testing only, so to drop it was safer than to convert it. No other store changed.

### Example

A phone has version 9. You open the new app at version 11. The upgrade makes `baselines` and `baselineLogs`, because they do not exist, and adds their indexes. Your sessions, habits, and activities are not touched.

## Built-in content on each start

After the database opens, the app writes the built-in items and templates again. For each built-in record, it writes the record when the device does not have it, or when the device has it as a built-in. It never writes over a record that you made. So when an update fixes the cue of an exercise, every device gets the fix on the next start, with no version change.

Built-in habits are added only when the habit store is empty, which is the first start. After that they are yours to rename, reorder, and colour, and the app does not add them back.

## How to add a store

Raise the version by one. Add the store and its indexes to the upgrade step. Add the store to the list of all stores, which the backup and the clear use. Then add it to [IndexedDB stores](indexeddb-stores.md) and decide how a backup carries it.

## Further reading

- [Boot](boot.md): where the upgrade runs in the start of the app.
- [File backup](file-backup.md): how a backup from an older version restores.
