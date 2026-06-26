# US-013 — Activity Edit from Calendar

> **Status: Shipped — v1.3.0**
>
> Activity logging is shipped (v1.1.0 US-003). Calendar day detail supports viewing and deleting activities, but not editing. Edit is only available from the `/log` page.

As an **active user**, I want to edit an activity from the calendar day detail
so that I can fix mistakes without leaving the history view I'm already in.

---

## Requirements

1. Calendar day detail
   a. When the user views an activity in the calendar day summary, an Edit action shall be available alongside Delete.
   b. Tapping Edit shall open the same activity edit flow used on the `/log` page (type, duration, intensity, date).
   c. Saving shall update the entry in IndexedDB and refresh the calendar day summary immediately.

2. Consistency
   a. All fields editable from `/log` shall also be editable from the calendar detail view.
   b. Deleting from either location shall remove the activity from both the calendar and `/log`.

---

## Acceptance Criteria

1. Calendar day detail
   a. Given the user taps a day with a logged Run activity, when the day summary opens, then Edit and Delete actions are both visible.
   b. Given the user taps Edit on an activity, when they change the duration and save, then the day summary shows the updated duration.
   c. Given the user changes the activity date via Edit, when they save, then the activity moves to the correct day on the calendar.

2. Consistency
   a. Given the user edits an activity from the calendar, when they navigate to `/log` for that date, then the updated values are shown.
   b. Given the user deletes an activity from the calendar day summary, when they view `/log` for that date, then the activity is no longer listed.

---

## Related Docs

- [v1.1.0 US-003 — Activity Logging](../v1.1.0/US-003-activity-logging.md)
- [History & Calendar Requirements](../../requirements/history-calendar.md)
- [Data Model](../../architecture/data-model.md)
