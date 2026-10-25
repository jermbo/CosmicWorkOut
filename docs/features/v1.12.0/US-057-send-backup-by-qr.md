[Wiki](../../README.md) › [Features](../README.md) › [v1.12.0](./README.md) › US-057

# US-057 — Send a Backup by QR

> **Status:** Built — waiting on a real phone-to-webcam test. Design: [QR Backup](../../roadmap/qr-backup.md). Receiving side: [US-058](./US-058-receive-backup-by-qr.md).
>
> **As built:** `/settings/data/send` (`src/routes/settings/data/send/+page.svelte`). `exportQrBackup(scope)` in `db/backup.ts` cuts a full export down with `scopeEnvelope()` (`db/backupPayload.ts`, pure): built-ins dropped, dated stores filtered to the window, prefs left out of a window. `src/lib/qrBackup/frames.ts` (pure) deflates, splits by density (250 / 450 / 800 bytes) and encodes frames as `CW1:<crc32>:<index>:<total>:<base45>` — all QR-alphanumeric characters. `qrMatrix.ts` draws each frame with `uqr` (error correction L, 4-module quiet zone); `AnimatedQr.svelte` paints it to a pixelated canvas and steps on a timer. `sendPrefs.ts` keeps `cwout:lastQrBackupAt` and `cwout:qrSendOptions` — per device, never backed up. Screen Wake Lock while codes show. The "since" choice is labelled **Since last**, with the date on the range line under it, so four choices fit a phone. Tested in `frames.test.ts` and `backupPayload.test.ts`, including a round trip through real QR codes and the bundled reader.

---

As a **Fitness User** who logs on my phone, I want to show my recent data as a QR code that my computer can scan, so that I can back it up in seconds without moving a file around.

---

## Decisions

| Area                 | Decision                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Transport**        | An animated QR code: the data is split across several codes shown in a loop. No network, no pairing, no file.                  |
| **Source of truth**  | The sending device. Whatever it sends replaces the matching data on the receiver ([US-058](./US-058-receive-backup-by-qr.md)). |
| **Either direction** | Any device can send. Phone → desktop is the usual case.                                                                        |
| **Scopes**           | **Recent** — a date window ending today. **Everything** — the same data as a file backup.                                      |
| **Not sent**         | Built-in exercises and programs (every device rebuilds them on start) and an in-progress session.                              |
| **Tunable**          | Code density and speed are settings on the send screen, so a webcam that struggles can be given bigger, slower codes.          |
| **Last backup**      | Saved per device when the user taps **Done**. Never included in a backup.                                                      |

---

## Requirements

1. Entry
   a. Settings → Data & backup shall offer **Send by QR** and **Receive by QR** next to file export and restore.
2. Scope
   a. The user shall be able to choose: since last backup, last 30 days, last 90 days, or everything.
   b. When this device has sent a QR backup before, "since last backup" shall be the default and show that date; otherwise "everything" shall be the default.
   c. Every date window shall end today.
   d. A date window shall include every workout session, habit log, activity, health reading and baseline entry dated inside it, plus all of the user's own exercises, programs, habits, plan goals and baselines, and the weight memory for each exercise.
   e. Built-in exercises and programs, and any in-progress session, shall never be sent.
3. Display
   a. The data shall show as a looping sequence of QR codes, with the current code's number and the total.
   b. Before starting, the screen shall show how many codes the backup needs and roughly how long one loop takes.
   c. The user shall be able to choose code density (low, medium, high) and speed (slow, normal, fast); the choices are remembered on the device.
   d. Where the browser allows, the screen shall stay awake while codes are showing.
   e. Sending shall work with no network connection.
4. Finish
   a. Tapping **Done** shall save today as this device's last backup date.
   b. Stopping or leaving without **Done** shall leave the last backup date unchanged.
   c. The last backup date shall not be included in any backup.

---

## Acceptance Criteria

1. Entry
   a. Given Settings → Data & backup, when the user looks at the Backup section, then **Send by QR** and **Receive by QR** are there alongside Export and Restore.
2. Scope
   a. Given a device that has never sent a QR backup, when the user opens Send by QR, then Everything is selected.
   b. Given a device whose last QR backup was Aug 12, when the user opens Send by QR, then "Since Aug 12" is selected and covers Aug 12 to today.
   c. Given a session logged 40 days ago, when the user sends the last 30 days, then that session is not in the backup.
   d. Given a custom exercise created a year ago, when the user sends the last 30 days, then that exercise is in the backup.
   e. Given a workout in progress, when the user sends any scope, then the in-progress session is not in the backup.
3. Display
   a. Given the user taps Start, when codes are showing, then the code changes on its own and the counter steps through 1 to the total and loops.
   b. Given the user changes density from medium to low, when they look at the estimate, then the number of codes goes up.
   c. Given the user picked low density and slow speed, when they come back later, then those choices are still selected.
   d. Given the phone is offline, when the user taps Start, then codes still show.
4. Finish
   a. Given codes are showing, when the user taps Done, then the next visit defaults to "Since" today's date.
   b. Given codes are showing, when the user taps Stop, then the last backup date is unchanged.

---

## Related Docs

- [QR Backup — design](../../roadmap/qr-backup.md)
- [US-058 — Receive a Backup by QR](./US-058-receive-backup-by-qr.md)
- [US-028 — Data Export, Backup & Device Sync](../v1.7.0/US-028-data-export-backup.md) — the backup format this reuses
- [Data Model](../../architecture/data-model.md)
