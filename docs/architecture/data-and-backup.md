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

A browser can delete the data of a site, as the [storage](storage.md) page tells. So when you start a backup — export, restore, send by QR, or the camera to receive — the app asks the browser to keep its data. It asks then, not at the first start, because Firefox can show a question, and the question makes sense next to a backup. The answer is only logged; nothing waits for it. This lowers the risk but does not remove it, so keep a recent file somewhere other than the phone.

## Clear data

Data & backup has one clear row for each kind of data, and **Clear everything** in a danger zone. Each one asks for confirmation. The [data clearing](data-clearing.md) page tells what each row deletes and what it keeps.

## Test data

An advanced row loads about six months of realistic test data, so that you can see the charts full. The [debug data](debug-data.md) page tells what it loads and what it changes.

### Example

You get a new phone. On the old phone you tap Export and AirDrop the file to the new phone. On the new phone you open the app, tap Restore, and pick the file. Your plans, sessions, habits, and settings are all there.

## Further reading

- [Settings](settings.md): where Data & backup sits among the other settings pages.
- [localStorage keys](local-storage-keys.md): which small values a backup carries.
