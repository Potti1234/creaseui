import { DatePicker as DatePickerPrimitive } from '@foldkit/ui'

import * as Calendar from './calendar'

export * from '@foldkit/ui/datePicker'

export const update = (
  model: DatePickerPrimitive.Model,
  message: DatePickerPrimitive.Message,
  options: Readonly<{ direction?: 'ltr' | 'rtl' }> = {},
): ReturnType<typeof DatePickerPrimitive.update> => {
  if (message._tag === 'GotCalendarMessage') {
    const calendarMessage = message.message
    if (
      model.calendar.viewMode === 'Days' &&
      calendarMessage._tag === 'PressedKeyOnGrid' &&
      (calendarMessage.key === 'Home' || calendarMessage.key === 'End')
    ) {
      const result = Calendar.update(model.calendar, calendarMessage, options)
      return {
        model: { ...model, calendar: result.model },
        ...(result.outMessage?._tag === 'ChangedViewMonth'
          ? {
              outMessage: DatePickerPrimitive.OutMessage.ChangedViewMonth({
                year: result.outMessage.year,
                month: result.outMessage.month,
              }),
            }
          : {}),
      }
    }
    if (options.direction === 'rtl') {
      message = DatePickerPrimitive.Message.GotCalendarMessage({
        message: Calendar.mirrorNavigationKeyForRtl(calendarMessage),
      })
    }
  }
  return DatePickerPrimitive.update(model, message)
}
