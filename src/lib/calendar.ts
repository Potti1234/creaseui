import { Calendar as CalendarPrimitive } from '@foldkit/ui'
import * as Calendar from 'foldkit/calendar'

/** In a right-to-left calendar the day and picker grids are mirrored, so
 *  ArrowLeft and ArrowRight must swap to move the cursor in the visual
 *  direction the user expects. Home/End stay logical (first/last day of
 *  week). */
export const mirrorNavigationKeyForRtl = (
  message: CalendarPrimitive.Message,
): CalendarPrimitive.Message =>
  message._tag === 'PressedKeyOnGrid' &&
  (message.key === 'ArrowLeft' || message.key === 'ArrowRight')
    ? CalendarPrimitive.PressedKeyOnGrid({
        key: message.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft',
        isShift: message.isShift,
      })
    : message

export type CalendarRange = Readonly<{
  start: Calendar.CalendarDate
  end: Calendar.CalendarDate
}>

export type RangePosition = 'outside' | 'single' | 'start' | 'middle' | 'end'

const ordinal = (date: Calendar.CalendarDate): number => date.year * 10_000 + date.month * 100 + date.day

export const normalizeRange = (range: CalendarRange): CalendarRange => ordinal(range.start) <= ordinal(range.end)
  ? range
  : { start: range.end, end: range.start }

export const rangePosition = (date: Calendar.CalendarDate, range: CalendarRange | undefined): RangePosition => {
  if (range === undefined) return 'outside'
  const normalized = normalizeRange(range)
  const value = ordinal(date)
  const start = ordinal(normalized.start)
  const end = ordinal(normalized.end)
  if (value < start || value > end) return 'outside'
  if (start === end) return 'single'
  if (value === start) return 'start'
  if (value === end) return 'end'
  return 'middle'
}

/** Convert an instant at the application boundary; Calendar itself stays zone-free. */
export const dateInTimeZone = (instant: Date, timeZone: string): Calendar.CalendarDate =>
  Calendar.fromDateInZone(instant, timeZone)
