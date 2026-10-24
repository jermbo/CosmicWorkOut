[Wiki](../../README.md) › [Features](../README.md) › [v1.12.0](./README.md) › US-058

# US-058 — Receive a Backup by QR

> **Status:** Built — waiting on a real phone-to-webcam test. Design: [QR Backup](../../roadmap/qr-backup.md). Sending side: [US-057](./US-057-send-backup-by-qr.md).
>
> **As built:** `/settings/data/receive` (`src/routes/settings/data/receive/+page.svelte`). `src/lib/qrBackup/camera.ts` opens the camera (rear-facing preferred, 1280×720 ideal), lists cameras for the picker, mirrors any camera that isn't rear-facing, and reads frames with `BarcodeDetector` or, failing that, a lazily imported `jsqr`. `FrameCollector` (`frames.ts`) gathers frames and checks the CRC-32. A window is applied by `importWindowBackup()` (`db/backup.ts`) → `replaceDateRange()` (`db/database.ts`): one `readwrite` transaction that deletes each dated store's `by_date` keys in range, writes the received records, and puts definitions and weight memory. The confirm counts this device's records with `countByDateRange()`. Everything goes through the existing staged `importBackup()`, which now refuses a window backup. After the reload, Data & backup shows "Backup received." (flag in `sessionStorage`). Checked in the browser by feeding the screen a fake camera that played the animated codes, with the bundled reader forced: all codes read, confirm shown, apply and reload worked. A deliberately broken write left the database unchanged.

---

As a **Fitness User** backing up to my computer, I want to point its camera at my phone and have my recent data land in the app, so that my backup stays current without files or accounts.

---

## Decisions

| Area                   | Decision                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Replace the window** | For a Recent backup, this device's records dated inside the window are replaced by the sender's. No merge rules, no tombstones.              |
| **Definitions**        | Exercises, programs, habits, plan goals and baselines are added or updated, never deleted — older records on this device may still use them. |
| **Everything**         | Behaves exactly like restoring a backup file: everything is replaced, staged first.                                                          |
| **Verify, then write** | Nothing is written until every code is in, the checksum matches, and the data passes the file-restore checks.                                |
| **Camera**             | Needs HTTPS or `localhost`. The browser's built-in QR reader is used where it exists; a bundled reader covers Safari and Firefox.            |

---

## Requirements

1. Camera
   a. The camera shall start only after the user taps **Start camera**.
   b. When the device has more than one camera, the user shall be able to choose which one.
   c. When the camera can't be used — permission denied, no camera, or the page is not on HTTPS or `localhost` — the screen shall say why, and no data shall change.
   d. The camera shall stop when the user leaves the screen or when every code has been read.
2. Progress
   a. The screen shall show how many codes have been read out of the total, and which are still missing.
   b. Codes may be read in any order; a code read twice shall count once.
   c. When a code from a different backup appears, receiving shall start over on that backup.
3. Verify
   a. Nothing shall be written until every code has been read, the checksum matches, and the data passes the same checks as a file restore.
   b. When verification fails, the screen shall show an error, nothing shall be written, and the user shall be able to scan again.
4. Confirm
   a. Before writing, the screen shall show what was received: the date range (or "everything") and how many sessions, habit logs, activities, health readings and baseline entries it holds.
   b. For a Recent backup, it shall also show how many of this device's records in that range will be replaced.
   c. Writing shall need an explicit confirm.
5. Apply — Recent
   a. For sessions, habit logs, activities, health readings and baseline entries, this device's records dated inside the window shall be replaced by the received ones.
   b. Records dated outside the window shall not change.
   c. Exercises, programs, habits, plan goals and baselines shall be added or updated, never deleted. Weight memory shall be updated.
   d. This device's personalization settings and any in-progress session shall be kept; the active plan shall follow the sender.
   e. Writing shall be all-or-nothing: if it fails, no data on this device changes.
6. Apply — Everything
   a. An Everything backup shall replace all data on this device, exactly as a file restore does, including personalization settings.
7. After
   a. On success the app shall reload and show the received data.

---

## Acceptance Criteria

1. Camera
   a. Given the Receive screen, when it opens, then no camera permission prompt appears until the user taps Start camera.
   b. Given a Mac with a built-in camera and an iPhone offered as a camera, when the user starts the camera, then they can pick either.
   c. Given the user denies camera permission, when the prompt closes, then the screen explains that camera access was refused.
2. Progress
   a. Given a 12-code backup, when 9 have been read, then the screen shows 9 / 12 and marks the 3 missing codes.
   b. Given code 4 has been read, when it is read again, then the count does not change.
   c. Given 5 of 12 codes were read, when the sender switches to a different scope, then the count restarts against the new total.
3. Verify
   a. Given every code was read but the data is corrupt, when verification runs, then an error shows and no data changes.
4. Confirm
   a. Given a Recent backup for Aug 12 – Oct 24 with 30 sessions, when all codes are read, then the confirm shows that range and 30 sessions, and how many sessions on this device it replaces.
5. Apply — Recent
   a. Given this device has a session on Sep 3 that the sender deleted, when a Recent backup covering Sep 3 is applied, then the Sep 3 session is gone.
   b. Given this device has a session on Jan 5 and the window starts Aug 12, when the backup is applied, then the Jan 5 session is still there.
   c. Given a habit exists on this device but not in the backup, when the backup is applied, then the habit is still there.
   d. Given this device uses compact density and the sender uses spacious, when a Recent backup is applied, then this device is still compact.
   e. Given writing fails partway, when the error shows, then this device's data is unchanged.
6. Apply — Everything
   a. Given an Everything backup, when it is applied, then this device's data matches the sender's, as after a file restore.
7. After
   a. Given a successful apply, when the app reloads, then the received sessions show in Insights.

---

## Related Docs

- [QR Backup — design](../../roadmap/qr-backup.md)
- [US-057 — Send a Backup by QR](./US-057-send-backup-by-qr.md)
- [US-028 — Data Export, Backup & Device Sync](../v1.7.0/US-028-data-export-backup.md) — file restore, reused for Everything
- [Program Progression](../../implementation/program-progression.md) — one session per program per day
