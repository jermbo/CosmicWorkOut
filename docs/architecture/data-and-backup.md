---
name: Data and backup
description: 'How your data leaves one device and arrives on the next — a JSON file or an animated QR code — and how you clear data or load test data.'
altitude: part
tags:
  - data
  - backup
parent: ../README.md
---

[Wiki](../README.md) / Data and backup

# Data and backup

Your data lives only on your device. That is good for speed and privacy, but a lost phone loses everything, and a new phone starts empty. This page tells how you protect and move your data.

## Two ways to move data

| Way         | Carries                                          | Needs                    | Good for                               |
| ----------- | ------------------------------------------------ | ------------------------ | -------------------------------------- |
| File backup | Everything, with your settings                   | A place to save a file   | An archive off the device; a new phone |
| QR backup   | Everything, or only recent days without settings | Two screens and a camera | A quick sync from phone to laptop      |

A **file backup** is a JSON file. On a phone, Export opens the share sheet, so you can save it to Files, mail it, or AirDrop it; on a computer, it downloads. Restore reads a file and replaces every record on the device. The app proves that the file can be written before it touches your data, as [file backup](file-backup.md) tells.

A **QR backup** needs no network and no file. One device shows an animated QR code; the other reads it with its camera. You can send all data or only the days since the last send. The [QR backup](qr-backup.md) page tells how the frames work.

## The file is the real safety

A browser can delete the data of a site, as the [storage](storage.md) page tells. The app asks the browser to keep it, but only a copy off the device is safe. So keep a recent file somewhere other than the phone.

## Clear data

Data & backup has one clear row for each kind of data — custom exercises, custom programs, workout sessions, activities, habits, health, plan goals, and baselines — and **Clear everything** in a danger zone. Each one asks for confirmation, and the app reloads after it. A clear row shows only while its tracker is on, except Health data, which always shows. The exact effect of each row is in [data clearing](data-clearing.md).

## Debug data

An advanced row loads about six months of realistic test data: sessions, activities, habit logs, health readings, two plan goals, and two baselines. It keeps your existing data. It does not turn on any tracker, so on a new device it seems to do nothing until you turn trackers on; its confirmation lists the trackers that are off. It does take over the active plan, because the test data has one: the plan that was running is paused first.

### Example

You get a new phone. On the old phone you tap Export and AirDrop the file to the new phone. On the new phone you open the app, tap Restore, and pick the file. Your plans, sessions, habits, and settings are all there.

## Further reading

- [Offline](offline.md): the request to keep your data.
- [localStorage keys](local-storage-keys.md): which small values a backup carries.
