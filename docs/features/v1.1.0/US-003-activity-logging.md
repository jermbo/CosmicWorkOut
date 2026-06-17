# US-003 — Activity Logging

> **Status: ✅ Shipped**
> Full logging flow (type, duration, intensity, date, custom name), last-used type pre-selection, and calendar integration with activity dots all built. Edit is available from the home page activity chips. Minor gap: the calendar day detail shows delete but no edit button (edit is only accessible from the home page).

As an **active user**, I want to log physical activities that are outside my structured workout program
so that I can track all my movement — not just gym sessions — in one place.

---

## Requirements

1. Activity entry fields
   a. The user shall be able to log an activity from the home screen dashboard.
   b. An activity log entry shall capture: date, activity type, duration in minutes, and intensity level.
   c. Intensity levels shall be: Easy, Moderate, Hard.
   d. Activity types shall include a predefined list: Run, Walk, Bike, Swim, Hike, Pickleball, Tennis, Basketball, Yoga, Stretching, Cardio, Other.
   e. The user shall be able to enter a custom activity name (up to 50 characters) when selecting "Other".
   f. The date shall default to today but shall be adjustable to any past date.

2. Logging experience
   a. The activity logging flow shall be completable in 4 taps or fewer from the home screen.
   b. The last-used activity type shall be pre-selected as the default on subsequent opens.

3. Calendar integration
   a. Logged activities shall appear on the Calendar view on their respective dates.
   b. Activity entries shall be visually distinct from workout session entries on the calendar.
   c. The user shall be able to tap an activity on the calendar to view its details.

4. Data, editing & deletion
   a. Activity data shall store the fields necessary to support future charting: count by type over time, total duration over time, frequency by intensity.
   b. The user shall be able to edit an existing activity log entry (type, duration, intensity, and date) from the detail view.
   c. The user shall be able to delete an activity log entry from the detail view.

---

## Acceptance Criteria

1. Activity entry fields
   a. Given the user is on the home dashboard, when they tap "+ Log Activity", then an activity logging sheet opens.
   b. Given the activity sheet is open, when the user selects a type, duration, and intensity, then all three values are saved as part of the entry.
   c. Given the user selects "Other" as the activity type, when a text field appears, then they can enter a custom name up to 50 characters.
   d. Given the activity sheet is open, when the user changes the date, then only past dates and today are selectable.
   e. Given the user taps Done, when the entry is saved, then the sheet closes and a confirmation is shown on the dashboard.

2. Logging experience
   a. Given the user taps "+ Log Activity", when the sheet opens, then the entire logging flow — type, duration, intensity, confirm — takes no more than 4 taps.
   b. Given the user previously logged a Run, when they open the activity sheet again, then "Run" is pre-selected.

3. Calendar integration
   a. Given the user has logged an activity on June 10, when they view the Calendar for June, then June 10 shows an activity indicator.
   b. Given a day has both a workout session and an activity, when the user views that day on the calendar, then both are shown with distinct visual treatment.
   c. Given the user taps an activity indicator on the calendar, when the detail view opens, then type, duration, intensity, and date are displayed.

4. Data, editing & deletion
   a. Given the user has logged activities over 30 days, when activity data is queried for charting, then count-by-type, total-duration, and intensity-breakdown are computable from the stored records.
   b. Given the user views an activity detail, when they tap Edit, then all fields (type, duration, intensity, date) are editable and the updated entry replaces the original on save.
   c. Given the user views an activity detail, when they tap Delete, then the entry is removed from the calendar and data store.

---

## Related Docs

- [Data Model](../../architecture/data-model.md)
- [US-005 — Daily Dashboard](./US-005-daily-dashboard.md)
- [History & Calendar Requirements](../../requirements/history-calendar.md)
