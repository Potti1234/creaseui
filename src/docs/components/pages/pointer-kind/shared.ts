import { Effect, Schema } from 'effect'
import { Command, Mount, Subscription } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import {
  definePreviewProgram,
  foldkitApplication,
} from '@/docs/components/pages/authored-page'
import type { DocsExample } from '@/docs/components/page-definition'
import * as PointerKind from '@/lib/behaviors/pointer-kind'

export const pointerKindFixtures = [
  {
    title: 'Live capabilities',
    description:
      'Media features follow the primary pointer and every attached pointer.',
  },
  {
    title: 'Server hints',
    description:
      'A mobile client hint can seed the first render. Live capabilities take over after mounting.',
  },
] as const

export const pointerKindExamples = (
  _renderer: 'tailwind' | 'stylex' | 'pleat',
): ReadonlyArray<DocsExample> =>
  pointerKindFixtures.map((fixture, index) => ({
    ...fixture,
    code: foldkitApplication({
      title: `Pointer Kind — ${fixture.title}`,
      imports: `import { Schema } from 'effect'
import { Command, Runtime, Subscription, type Update } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as PointerKind from '@/lib/behaviors/pointer-kind'`,
      model: `export const Model = Schema.Struct({ pointerKind: PointerKind.Model })
export type Model = typeof Model.Type`,
      messages: `export const Message = defineMessageUnion({ GotPointerKind: { message: PointerKind.Message } })
export type Message = typeof Message.Type`,
      init: `export const init = (): Update.Return<Model, Message> => ({
  model: { pointerKind: PointerKind.init(${index === 1 ? "PointerKind.pointerKindOf('?1')" : ''}) },
  commands: [Command.mapMessage(PointerKind.ReadPointerKind({}), message => Message.GotPointerKind({ message }))],
})`,
      update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  const next = PointerKind.update(model.pointerKind, message.message)
  return { model: { pointerKind: next.model } }
}`,
      subscriptions: `export const subscriptions = Subscription.lift(PointerKind.subscriptions)({
  toChildModel: (model: Model) => model.pointerKind,
  toParentMessage: message => Message.GotPointerKind({ message }),
})`,
      view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Pointer Kind',
  body: h.main([], [
    h.p([], ['pointer: ' + model.pointerKind.pointer]),
    h.p([], ['hover: ' + model.pointerKind.hover]),
    h.p([], ['anyPointer: ' + model.pointerKind.anyPointer]),
    h.p([], ['anyHover: ' + model.pointerKind.anyHover]),
    h.p([], [PointerKind.canHover(model.pointerKind) ? 'Hover to open' : 'Tap to open']),
  ]),
})`,
    }),
  }))

export const Model = Schema.Struct({
  _docsPage: Schema.Literal('pointer-kind'),
  pointerKind: PointerKind.Model,
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  InitializedPointerKind: {},
  GotPointerKind: { message: PointerKind.Message },
})
export type Message = typeof Message.Type

const InitializePointerKind = Mount.define('InitializePointerKindPreview', {
  args: {},
  messages: [Message.InitializedPointerKind],
  execute: () => Effect.succeed(Message.InitializedPointerKind()),
})

export type Classes = Readonly<{
  panel: string
  heading: string
  grid: string
  row: string
  label: string
  value: string
  policy: string
  note: string
}>

export const renderPointerKind = <Msg>(
  index: number,
  model: Model,
  send: (message: Message) => Msg,
  classes: Classes,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.Class(classes.panel),
      h.DataAttribute('pointer-kind-demo', ''),
      h.OnMount(Mount.mapMessage(InitializePointerKind({}), send)),
    ],
    [
      h.p([h.Class(classes.heading)], ['Your pointer capabilities']),
      h.div(
        [h.Class(classes.grid)],
        (['pointer', 'hover', 'anyPointer', 'anyHover'] as const).map(key =>
          h.div(
            [h.Class(classes.row)],
            [
              h.span([h.Class(classes.label)], [key]),
              h.code(
                [
                  h.Class(classes.value),
                  h.DataAttribute('pointer-feature', key),
                ],
                [model.pointerKind[key]],
              ),
            ],
          ),
        ),
      ),
      h.p(
        [h.Class(classes.policy), h.DataAttribute('pointer-policy', '')],
        [
          PointerKind.canHover(model.pointerKind)
            ? 'Hover to open'
            : 'Tap to open',
        ],
      ),
      h.p(
        [h.Class(classes.note)],
        [
          index === 0
            ? 'Connect a mouse or switch devices. The values update automatically.'
            : 'Seeded with Sec-CH-UA-Mobile: ?1, then reconciled with this device.',
        ],
      ),
    ],
  )

export const pointerKindProgram = (
  view: (index: number, model: Model, h: HtmlBuilder<Message>) => Html,
) =>
  definePreviewProgram<Model, Message>({
    Model,
    Message,
    init: index => ({
      _docsPage: 'pointer-kind',
      pointerKind: PointerKind.init(
        index === 1 ? PointerKind.pointerKindOf('?1') : {},
      ),
    }),
    update: (model, message) => {
      if (message._tag === 'InitializedPointerKind')
        return {
          model,
          commands: [
            Command.mapMessage(PointerKind.ReadPointerKind({}), message =>
              Message.GotPointerKind({ message }),
            ),
          ],
        }
      const next = PointerKind.update(model.pointerKind, message.message)
      return { model: { ...model, pointerKind: next.model } }
    },
    subscriptions: Subscription.lift(PointerKind.subscriptions)({
      toChildModel: (model: Model) => model.pointerKind,
      toParentMessage: message => Message.GotPointerKind({ message }),
    }),
    view,
  })
