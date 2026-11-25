import { Function, Option, Schema } from 'effect'
import {
  CalendarDate,
  CalendarDateFromIsoString,
  type DayOfWeek,
} from 'foldkit/calendar'
import * as Command from 'foldkit/command'
import type { ChildAttribute, Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type Reflect } from 'foldkit/submodel'
import type { Update } from 'foldkit'

import * as Calendar from './calendar'
import * as Popover from './popover'

export const Model = Schema.Struct({
  id: Schema.String,
  calendar: Calendar.Model,
  popover: Popover.Model,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotCalendarMessage: { message: Calendar.Message },
  GotPopoverMessage: { message: Popover.Message },
  RequestedSelectDate: { date: CalendarDate },
  Cleared: {},
  Opened: {},
  Closed: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ChangedViewMonth: { year: Schema.Int, month: Schema.Int },
  SelectedDate: { date: CalendarDate },
  ClearedDate: {},
})
export type OutMessage = typeof OutMessage.Type
export type ChangedViewMonth = Extract<OutMessage, { _tag: 'ChangedViewMonth' }>
export type SelectedDate = Extract<OutMessage, { _tag: 'SelectedDate' }>
export type ClearedDate = Extract<OutMessage, { _tag: 'ClearedDate' }>

export type InitConfig = Calendar.InitConfig &
  Readonly<{ isAnimated?: boolean }>

export const init = ({ id, isAnimated, ...calendar }: InitConfig): Model => ({
  id,
  calendar: Calendar.init({ ...calendar, id: id + '-calendar' }),
  popover: Popover.init({
    id: id + '-popover',
    contentFocus: true,
    ...(isAnimated === undefined ? {} : { isAnimated }),
  }),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const applyPopover = (
  model: Model,
  result: ReturnType<typeof Popover.update>,
  resetView = false,
): UpdateReturn => ({
  model: {
    ...model,
    popover: result.model,
    calendar:
      resetView || result.outMessage !== undefined
        ? Calendar.dropToDays(model.calendar)
        : model.calendar,
  },
  commands: Command.mapMessages(result.commands ?? [], message =>
    Message.GotPopoverMessage({ message }),
  ),
})

const applyCalendar = (
  model: Model,
  result: ReturnType<typeof Calendar.update>,
): UpdateReturn => {
  const next = { ...model, calendar: result.model }
  const commands = Command.mapMessages(result.commands ?? [], message =>
    Message.GotCalendarMessage({ message }),
  )
  const event = result.outMessage
  if (event?._tag === 'SelectedDate') {
    const closed = applyPopover(next, Popover.close(next.popover))
    return {
      model: closed.model,
      commands: [...commands, ...(closed.commands ?? [])],
      outMessage: OutMessage.SelectedDate({ date: event.date }),
    }
  }
  return {
    model: next,
    commands,
    ...(event?._tag === 'ChangedViewMonth'
      ? {
          outMessage: OutMessage.ChangedViewMonth({
            year: event.year,
            month: event.month,
          }),
        }
      : {}),
  }
}

export const update = (
  model: Model,
  message: Message,
  options: Readonly<{ direction?: 'ltr' | 'rtl' }> = {},
): UpdateReturn => {
  switch (message._tag) {
    case 'GotCalendarMessage':
      return applyCalendar(
        model,
        Calendar.update(model.calendar, message.message, options),
      )
    case 'GotPopoverMessage':
      return applyPopover(model, Popover.update(model.popover, message.message))
    case 'RequestedSelectDate':
      return applyCalendar(
        model,
        Calendar.selectDate(model.calendar, message.date),
      )
    case 'Cleared':
      return { model, outMessage: OutMessage.ClearedDate() }
    case 'Opened':
      return applyPopover(model, Popover.open(model.popover), true)
    case 'Closed':
      return applyPopover(model, Popover.close(model.popover), true)
  }
}

export const open = (model: Model) => update(model, Message.Opened())
export const close = (model: Model) => update(model, Message.Closed())
export const selectDate = (model: Model, date: CalendarDate) =>
  update(model, Message.RequestedSelectDate({ date }))
export const clear = (model: Model) => update(model, Message.Cleared())

const calendarReflect = <Value>(
  reflect: (model: Calendar.Model, value: Value) => Calendar.Model,
): Reflect<Model, Value> =>
  Function.dual(2, (model: Model, value: Value) => ({
    ...model,
    calendar: reflect(model.calendar, value),
  }))

export const focusDate = calendarReflect<CalendarDate>(Calendar.focusDate)
export const reflectMinDate = calendarReflect<Option.Option<CalendarDate>>(
  Calendar.reflectMinDate,
)
export const reflectMaxDate = calendarReflect<Option.Option<CalendarDate>>(
  Calendar.reflectMaxDate,
)
export const reflectDisabledDates = calendarReflect<
  ReadonlyArray<CalendarDate>
>(Calendar.reflectDisabledDates)
export const reflectDisabledDaysOfWeek = calendarReflect<
  ReadonlyArray<DayOfWeek>
>(Calendar.reflectDisabledDaysOfWeek)

export const triggerId = (id: string) => Popover.buttonId(id + '-popover')

export type ViewInputs = Calendar.ViewLabels &
  Readonly<{
    anchor: Popover.AnchorConfig
    themedPortal?: boolean
    maybeSelectedDate: Option.Option<CalendarDate>
    triggerContent: (maybeDate: Option.Option<CalendarDate>) => Html
    toCalendarView: (attributes: Calendar.CalendarAttributes) => Html
    isDisabled?: boolean
    name?: string
    className?: string
    attributes?: ReadonlyArray<ChildAttribute>
    triggerClassName?: string
    triggerAttributes?: ReadonlyArray<ChildAttribute>
    ariaLabel?: string
    ariaLabelledBy?: string
    panelClassName?: string
    panelAttributes?: ReadonlyArray<ChildAttribute>
    backdropClassName?: string
    backdropAttributes?: ReadonlyArray<ChildAttribute>
  }>

const encodeIsoDate = Schema.encodeSync(CalendarDateFromIsoString)

export const view = defineView<Model, Message, ViewInputs>(
  (model, inputs, h) => {
    const classAttribute = (name: string | undefined) =>
      name === undefined ? [] : [h.Class(name)]
    const calendar = h.submodel({
      slotId: model.calendar.id,
      model: model.calendar,
      view: Calendar.view,
      viewInputs: {
        ...inputs,
        toView: inputs.toCalendarView,
      },
      toParentMessage: message => Message.GotCalendarMessage({ message }),
    })
    const popup = h.submodel({
      slotId: model.popover.id,
      model: model.popover,
      view: Popover.view,
      viewInputs: {
        anchor: inputs.anchor,
        themedPortal: inputs.themedPortal ?? false,
        isDisabled: inputs.isDisabled ?? false,
        focusSelector:
          '[id=' + JSON.stringify(model.calendar.id + '-grid') + ']',
        ...(inputs.ariaLabel === undefined
          ? {}
          : { ariaLabel: inputs.ariaLabel }),
        ...(inputs.ariaLabelledBy === undefined
          ? {}
          : { ariaLabelledBy: inputs.ariaLabelledBy }),
        toView: ({ button, panel, backdrop, isVisible }) =>
          h.div(
            [],
            [
              h.button(
                [
                  ...button,
                  ...classAttribute(inputs.triggerClassName),
                  ...(inputs.triggerAttributes ?? []),
                ],
                [inputs.triggerContent(inputs.maybeSelectedDate)],
              ),
              ...(isVisible
                ? [
                    h.div([
                      ...backdrop,
                      ...classAttribute(inputs.backdropClassName),
                      ...(inputs.backdropAttributes ?? []),
                    ]),
                    h.div(
                      [
                        ...panel,
                        ...classAttribute(inputs.panelClassName),
                        ...(inputs.panelAttributes ?? []),
                      ],
                      [calendar],
                    ),
                  ]
                : []),
            ],
          ),
      },
      toParentMessage: message => Message.GotPopoverMessage({ message }),
    })
    return h.div(
      [...classAttribute(inputs.className), ...(inputs.attributes ?? [])],
      [
        popup,
        ...(inputs.name === undefined
          ? []
          : [
              h.input([
                h.Type('hidden'),
                h.Name(inputs.name),
                h.Value(
                  Option.match(inputs.maybeSelectedDate, {
                    onNone: () => '',
                    onSome: encodeIsoDate,
                  }),
                ),
              ]),
            ]),
      ],
    )
  },
)
