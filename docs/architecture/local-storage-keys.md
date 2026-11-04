---
name: localStorage keys
description: 'The exact list of localStorage keys in CosmicWorkOut, what each one holds, and whether a backup carries it.'
altitude: exact
tags:
  - storage
  - local-storage
parent: storage.md
---

[Wiki](../README.md) / [System](system.md) / [Storage](storage.md) / localStorage keys

# localStorage keys

The app keeps a few small values in localStorage, because it must read them before the first screen. Each key starts with `cwout:`. This page is the contract for those keys.

## The keys

| Key                      | What it holds                                                   | In a backup |
| ------------------------ | --------------------------------------------------------------- | ----------- |
| `cwout:prefs`            | Your settings and the five feature toggles, as one JSON object  | Yes         |
| `cwout:activeProgramIds` | The id of the active plan, in a list of at most one             | Yes         |
| `cwout:lastActivityType` | The last activity type that you logged, to fill the next entry  | Yes         |
| `cwout:activeSession`    | The session in progress, for crash recovery                     | No          |
| `cwout:lastQrBackupAt`   | The date on which this device last sent a QR backup             | No          |
| `cwout:qrSendOptions`    | The QR size and speed that this device uses to send             | No          |
| `cwout:activeProgramId`  | An old form of the active plan. A restore or a clear removes it | No          |
| `cwout:habitDay`         | Today's date, written when habits load. Nothing reads it        | No          |

One more key, `cwout:qrReceived`, is in sessionStorage. It shows one message after the reload that follows a QR restore.

## Why some keys stay on the device

A session in progress belongs to the phone in your hand. If a backup carried it, a restore on a second phone would offer a session that you never started there. The QR settings fit the camera and the screen of one device. So these keys never leave the device.

## The rule that keeps the list complete

The backup code has two lists: keys that a backup carries, and keys that it never carries. A unit test fails when the app uses a `cwout:` key that is in neither list. So you cannot add a key and forget to decide about it. When you add a key, add it to one list and to this page.

The fields inside `cwout:prefs` are in the [settings object](settings-object.md).

## Further reading

- [File backup](file-backup.md): how a backup reads and writes these keys.
- [IndexedDB stores](indexeddb-stores.md): the records that are not in localStorage.
