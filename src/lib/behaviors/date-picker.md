# Date Picker

Date Picker combines [Calendar](calendar.md) with [Popover](popover.md).
Its Model stores the two child models. The parent stores the committed date
and passes it into view as maybeSelectedDate.

## Compose a picker

Initialize with a stable ID and a reference date. Route the picker Messages
to update. Lift Commands for focus and transitions, and handle SelectedDate
or ClearedDate in the parent. Use the reflection helpers to update disabled
dates or date limits when your application changes them.

```ts
import * as DatePicker from '@/lib/behaviors/date-picker'

const picker = DatePicker.init({
  id: 'start-date',
  today: { year: 2026, month: 11, day: 23 },
})

const next = DatePicker.open(picker)
```
