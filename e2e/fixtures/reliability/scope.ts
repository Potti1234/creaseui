import { Popover as PopoverPrimitive } from '@foldkit/ui'
import { Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
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
}>

const Model = S.Struct({ popover: PopoverPrimitive.Model })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  GotPopoverMessage: { message: PopoverPrimitive.Message },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) => {
  const next = PopoverPrimitive.update(model.popover, message.message)
  return {
    model: { popover: next.model },
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
        },
      }),
      update,
      view: view(kit),
      container: document.getElementById('scope-root'),
      devTools: false,
    }),
  )
