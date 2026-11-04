---
name: Storage
description: 'Where CosmicWorkOut keeps each kind of data on the device, why it uses two kinds of storage, and when each write occurs.'
altitude: part
tags:
  - storage
  - data
parent: system.md
---

[Wiki](../README.md) / [System](system.md) / Storage

# Storage

Every record lives on the device, in one of two places in the browser. This page tells which data goes where, and why the app needs both.

## Two kinds of storage, for two jobs

**IndexedDB** holds the records that grow over time: plans, items, sessions, habit logs, activities, health readings, goals, and baselines. It can hold years of data, and it can find the records of one date fast. But each read waits for the database, so the app cannot use it before the first screen.

**localStorage** holds a few small values that the app must read at once: your settings, the session in progress, and the active plan. A read is immediate, so the app can apply your settings before it draws a screen.

## Each write occurs at once

There is no "save" button and no queue. A habit tap, an activity, a reading, or a baseline entry each writes one record when you make it. A set in a session writes to two places at once, as [set logging](set-logging.md) tells.

A store writes to the device first, and it changes the screen only after the write succeeds. So a crash loses nothing that you saw on the screen. If a write fails, the screen keeps the old value, and a message says "Couldn't save your changes. Please try again."

### Example

You tap plus on Water, and the tile goes from 2 to 3. The habit log with 3 is already in IndexedDB when you see it. The phone dies a second later. You open the app again, and the tile shows 3.

## Built-in content and your content

The built-in items and templates are in the app code, and the app writes them into IndexedDB again on each start. It never changes a record that you made.

The exact list of stores is in [IndexedDB stores](indexeddb-stores.md), and the list of small values is in [localStorage keys](local-storage-keys.md). The shapes of the records are in [workout records](workout-records.md) and [tracker records](tracker-records.md). [Schema upgrades](schema-upgrades.md) tells how the database version goes up when the app adds a store, and how built-in content stays current.

## The browser can still delete data

A browser can clear the storage of a site when the disk is low, when you clear your browsing data, or, in Safari, after about seven days without a visit. The [data and backup](data-and-backup.md) page tells how the app asks the browser to keep the data, and why a copy off the device is the real safety.

## Further reading

- [Boot](boot.md): the order in which the stores load.
- [Offline](offline.md): how the app itself opens with no network.
