import { Option } from 'effect'
import * as FoldkitCalendar from 'foldkit/calendar'
import { childAttributes, type Html, html } from 'foldkit/html'

import { DatePicker as DatePickerPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import { buttonVariants } from '@/ui/button'
import { calendarView } from '@/ui/calendar'
import { cn } from '@/lib/utils'

/* Ported from shadcn's date-picker demo on top of foldkit DatePicker.

   DatePicker is config-driven, so trigger/panel/backdrop classes are passed
   through their ClassName inputs and every supplemental attribute bundle is
   wrapped with childAttributes. The popover uses foldkit's forced inline
   positioning; no Style attribute is emitted here. */

export const Model = DatePickerPrimitive.Model
export type Model = typeof Model.Type
export const Message = DatePickerPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = DatePickerPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = DatePickerPrimitive.init
export const update = DatePickerPrimitive.update
export const open = DatePickerPrimitive.open
export const close = DatePickerPrimitive.close
export const selectDate = DatePickerPrimitive.selectDate
export const clear = DatePickerPrimitive.clear
export const reflectSelectedDate = DatePickerPrimitive.reflectSelectedDate
export const reflectMinDate = DatePickerPrimitive.reflectMinDate
export const reflectMaxDate = DatePickerPrimitive.reflectMaxDate
export const reflectDisabledDates = DatePickerPrimitive.reflectDisabledDates
export const reflectDisabledDaysOfWeek =
  DatePickerPrimitive.reflectDisabledDaysOfWeek
export const triggerId = DatePickerPrimitive.triggerId

const TRIGGER_CLASS =
  'w-[240px] justify-start text-left font-normal'

const PANEL_CLASS =
  'z-50 w-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-hidden transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95'

const BACKDROP_CLASS = 'fixed inset-0 z-40'

export type DatePickerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  placeholder?: string
  formatDate?: (date: FoldkitCalendar.CalendarDate) => string
  name?: string
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  class?: string
  triggerClass?: string
  panelClass?: string
  calendarClass?: string
}>

export const datePicker = <Msg>(props: DatePickerProps<Msg>): Html => {
  const h = html<Msg>()
  const hd = html<Message>()
  const isEmpty = Option.isNone(props.model.maybeSelectedDate)
  const formatDate =
    props.formatDate ??
    ((date: FoldkitCalendar.CalendarDate): string =>
      FoldkitCalendar.formatLong(date, props.model.calendar.locale))

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: DatePickerPrimitive.view,
    viewInputs: {
      anchor: { placement: 'bottom-start', gap: 4 },
      triggerContent: maybeDate =>
        hd.span(
          [hd.Class('contents')],
          [
            Icon.calendarIcon<Message>(),
            Option.match(maybeDate, {
              onNone: () => props.placeholder ?? 'Pick a date',
              onSome: formatDate,
            }),
          ],
        ),
      toCalendarView: attributes =>
        calendarView(
          attributes,
          props.calendarClass === undefined
            ? {}
            : { class: props.calendarClass },
        ),
      isDisabled: props.isDisabled ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.class === undefined ? {} : { className: props.class }),
      triggerClassName: cn(
        buttonVariants({ variant: 'outline' }),
        TRIGGER_CLASS,
        isEmpty ? 'text-muted-foreground' : undefined,
        props.triggerClass,
      ),
      triggerAttributes: childAttributes([
        hd.DataAttribute('slot', 'popover-trigger'),
      ]),
      panelClassName: cn(PANEL_CLASS, props.panelClass),
      panelAttributes: childAttributes([
        hd.DataAttribute('slot', 'popover-content'),
      ]),
      backdropClassName: BACKDROP_CLASS,
      ...(props.ariaLabel === undefined
        ? {}
        : { ariaLabel: props.ariaLabel }),
      ...(props.ariaLabelledBy === undefined
        ? {}
        : { ariaLabelledBy: props.ariaLabelledBy }),
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
   Minimal wiring:

   // Model: { datePicker: DatePicker.Model }
   // Message: GotDatePickerMessage({ message: DatePicker.Message })
   // Init:
   // datePicker: DatePicker.init({
   //   id: 'due-date',
   //   today,
   //   isAnimated: true,
   // })
   // Update: DatePicker.update(model.datePicker, message)
   // View:
   // datePicker({
   //   model: model.datePicker,
   //   toParentMessage: message => GotDatePickerMessage({ message }),
   // })
*/
