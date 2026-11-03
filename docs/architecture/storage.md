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

There is no "save" button and no queue. When you log a set, the app writes the session in progress to localStorage, and it writes the last weight of that item to IndexedDB. When you finish, it writes the session to IndexedDB and removes the copy in progress. A habit tap, an activity, a reading, or a baseline entry each writes one record when you make it.

So a crash loses nothing that you saw on the screen. If the browser closes during a session, the session in progress is still in localStorage, and the app offers it back on the next start.

## Built-in content and your content

The built-in items and templates are in the app code. Each time the app starts, it writes them into IndexedDB again. So a fix to a built-in exercise reaches every device with the next update. The app never changes a record that you made. Built-in habits are different: the app adds them only on the first start, because you can edit and reorder them.

The exact list of stores is in [IndexedDB stores](indexeddb-stores.md), and the list of small values is in [localStorage keys](local-storage-keys.md). The shapes of the records are in [workout records](workout-records.md) and [tracker records](tracker-records.md). When the app adds a store, the database version goes up, as told in [schema upgrades](schema-upgrades.md).

## The browser can still delete data

A browser can clear the storage of a site when the disk is low, when you clear your browsing data, or, in Safari, after about seven days without a visit. The [offline](offline.md) page tells how the app asks the browser to keep the data, and a [backup](data-and-backup.md) is the copy that is off the device.

## Further reading

- [Boot](boot.md): the order in which the stores load.
