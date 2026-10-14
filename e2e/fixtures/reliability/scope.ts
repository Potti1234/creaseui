import {
  DatePicker as DatePickerPrimitive,
  Popover as PopoverPrimitive,
} from '@foldkit/ui'
import { Option, Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import * as Calendar from 'foldkit/calendar'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* R3 scope-and-overlay fixture: a `themeScope({ colorScheme: 'dark' })` subtree inside a
   light page. Derived roles (hover mixes) and overlays opened inside it
   must resolve against the subtree palette, not :root. */
export type ScopeKit = Readonly<{
  themeScope: <Msg>(
    props: Readonly<{
      colorScheme: 'dark'
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  button: <Msg>(
    props: Readonly<{ children: ReadonlyArray<string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  popover: <Msg>(
    props: Readonly<{
      model: PopoverPrimitive.Model
      toParentMessage: (message: PopoverPrimitive.Message) => Msg
      trigger: string
      content: Html | string
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  datePicker: <Msg>(
    props: Readonly<{
      model: DatePickerPrimitive.Model
      maybeSelectedDate: Option.Option<Calendar.CalendarDate>
      toParentMessage: (message: DatePickerPrimitive.Message) => Msg
      placeholder: string
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const Model = S.Struct({
  popover: PopoverPrimitive.Model,
  datePicker: DatePickerPrimitive.Model,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  GotPopoverMessage: { message: PopoverPrimitive.Message },
  GotDatePickerMessage: { message: DatePickerPrimitive.Message },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) => {
  if (message._tag === 'GotDatePickerMessage') {
    const next = DatePickerPrimitive.update(model.datePicker, message.message)
    return {
      model: { ...model, datePicker: next.model },
      commands: Command.mapMessages(next.commands ?? [], inner =>
        Message.GotDatePickerMessage({ message: inner }),
      ),
    }
  }
  const next = PopoverPrimitive.update(model.popover, message.message)
  return {
    model: { ...model, popover: next.model },
    commands: Command.mapMessages(next.commands ?? [], inner =>
      Message.GotPopoverMessage({ message: inner }),
    ),
  }
}

const view =
  (kit: ScopeKit) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.section(
      [h.Id('scope-overlay')],
      [
        h.div(
          [h.Id('dark-scope')],
          [
            kit.themeScope(
              {
                colorScheme: 'dark',
                children: [
                  kit.button({ children: ['Scoped action'] }, h),
                  kit.popover(
                    {
                      model: model.popover,
                      toParentMessage: message =>
                        Message.GotPopoverMessage({ message }),
                      trigger: 'Scoped details',
                      content: h.p([], ['Panel inside the dark scope.']),
                    },
                    h,
                  ),
                  kit.datePicker(
                    {
                      model: model.datePicker,
                      maybeSelectedDate: Option.none(),
                      toParentMessage: message =>
                        Message.GotDatePickerMessage({ message }),
                      placeholder: 'Scoped date',
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ],
        ),
      ],
    )

export const runScopeOverlay = (kit: ScopeKit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({
        model: {
          popover: PopoverPrimitive.init({
            id: 'scoped-popover',
            contentFocus: true,
          }),
          datePicker: DatePickerPrimitive.init({
            id: 'scoped-date-picker',
            today: Calendar.make(2026, 1, 15),
          }),
        },
      }),
      update,
      view: view(kit),
      container: document.getElementById('scope-root'),
      devTools: false,
    }),
  )
