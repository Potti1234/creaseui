import { Effect, Queue, Schema, Stream } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import {
  definePreviewProgram,
  foldkitApplication,
} from '@/docs/components/pages/authored-page'
import type { DocsExample } from '@/docs/components/page-definition'
import * as AvoidKeyboard from '@/lib/behaviors/avoid-keyboard'
import type { InputBehaviorProps } from '@/lib/input'

export const avoidKeyboardFixtures = [
  {
    title: 'Keyboard-aware footer',
    description:
      'On a phone, focus the field and scroll until the keyboard overlaps the status bar.',
  },
  {
    title: 'A little breathing room',
    description:
      'Mount a padded wrapper to leave a gap between the bar and the keyboard.',
  },
] as const

export const avoidKeyboardExamples = (
  renderer: 'tailwind' | 'stylex' | 'pleat',
): ReadonlyArray<DocsExample> =>
  avoidKeyboardFixtures.map((fixture, index) => ({
    ...fixture,
    code: foldkitApplication({
      title: `Avoid Keyboard — ${fixture.title}`,
      imports: `import { Schema } from 'effect'
import { Mount, Runtime, Subscription, type Update } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Input from '@/${renderer === 'tailwind' ? 'ui' : renderer}/input'
import * as AvoidKeyboard from '@/lib/behaviors/avoid-keyboard'
${index === 1 ? (renderer === 'tailwind' ? '' : renderer === 'stylex' ? "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ footer: { paddingBottom: '1rem' } })" : "import { Style } from '@pleat/core'\nimport { className } from '@/pleat/style'\nconst styles = { footer: Style.make({ paddingBottom: '1rem' }) }") : ''}`,
      model: `export const Model = Schema.Struct({ text: Schema.String })
export type Model = typeof Model.Type`,
      messages: `export const Message = defineMessageUnion({
  ChangedText: { value: Schema.String },
  GotAvoidKeyboard: { message: AvoidKeyboard.Message },
})
export type Message = typeof Message.Type`,
      init: `export const init = (): Update.Return<Model, Message> => ({ model: { text: '' } })`,
      update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => ({
  model: message._tag === 'ChangedText' ? { text: message.value } : model,
})`,
      view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Avoid Keyboard',
  body: h.main([], [
    Input.input({ id: 'message', label: 'Message', value: model.text,
      onInput: value => Message.ChangedText({ value }),
    }, h),
    h.div([
      h.OnMount(Mount.mapMessage(AvoidKeyboard.AvoidKeyboard({}), message => Message.GotAvoidKeyboard({ message }))),
      ${index === 1 ? `h.Class(${renderer === 'tailwind' ? "'pb-4'" : renderer === 'stylex' ? "stylex.props(styles.footer).className ?? ''" : 'className(styles.footer)'}),` : ''}
    ], [h.p([], ['Ready to send'])]),
  ]),
})`,
    }),
  }))

export const Model = Schema.Struct({
  _docsPage: Schema.Literal('avoid-keyboard'),
  text: Schema.String,
  keyboard: Schema.Boolean,
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  ChangedText: { value: Schema.String },
  ChangedKeyboard: { isOpen: Schema.Boolean },
  GotAvoidKeyboard: { message: AvoidKeyboard.Message },
})
export type Message = typeof Message.Type

const ObserveKeyboard = Mount.defineStream('ObserveKeyboardPreview', {
  args: {},
  messages: [Message.ChangedKeyboard],
  execute: ({ element }) =>
    Stream.callback<typeof Message.ChangedKeyboard.Type>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const footer =
              element.querySelector('[data-keyboard-footer]') ?? element
            const notify = () =>
              Queue.offerUnsafe(
                queue,
                Message.ChangedKeyboard({
                  isOpen: footer.hasAttribute('data-keyboard'),
                }),
              )
            const observer = new MutationObserver(notify)
            observer.observe(footer, {
              attributes: true,
              attributeFilter: ['data-keyboard'],
            })
            notify()
            return observer
          }),
          observer => Effect.sync(() => observer.disconnect()),
        )
        return yield* Effect.never
      }),
    ),
})

export type Classes = Readonly<{
  panel: string
  heading: string
  note: string
  footer: string
  padded: string
  bar: string
  status: string
}>
type InputView = <Msg>(
  props: InputBehaviorProps<Msg>,
  h: HtmlBuilder<Msg>,
) => Html

export const renderAvoidKeyboard = <Msg>(
  index: number,
  model: Model,
  send: (message: Message) => Msg,
  classes: Classes,
  input: InputView,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.Class(classes.panel),
      h.DataAttribute('avoid-keyboard-demo', ''),
      h.OnMount(Mount.mapMessage(ObserveKeyboard({}), send)),
    ],
    [
      h.p([h.Class(classes.heading)], ['Keep the conversation in view']),
      input(
        {
          id: `keyboard-message-${index}`,
          label: 'Message',
          value: model.text,
          placeholder: 'Write a message…',
          onInput: value => send(Message.ChangedText({ value })),
        },
        h,
      ),
      h.p(
        [h.Class(classes.note)],
        [
          'Try this on your phone. The bar rises only when the keyboard covers it.',
        ],
      ),
      h.div(
        [
          h.Class(index === 1 ? classes.padded : classes.footer),
          h.DataAttribute('keyboard-footer', ''),
          h.OnMount(
            Mount.mapMessage(AvoidKeyboard.AvoidKeyboard({}), message =>
              send(Message.GotAvoidKeyboard({ message })),
            ),
          ),
        ],
        [
          h.div(
            [h.Class(classes.bar)],
            [
              h.span(
                [],
                [
                  model.text.length > 0
                    ? `${model.text.length} characters`
                    : 'Ready to send',
                ],
              ),
              h.code(
                [
                  h.Class(classes.status),
                  h.DataAttribute('keyboard-state', ''),
                  h.AriaLive('polite'),
                ],
                [
                  model.keyboard
                    ? 'data-keyboard: true'
                    : 'data-keyboard: false',
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )

export const avoidKeyboardProgram = (
  view: (index: number, model: Model, h: HtmlBuilder<Message>) => Html,
) =>
  definePreviewProgram<Model, Message>({
    Model,
    Message,
    init: () => ({ _docsPage: 'avoid-keyboard', text: '', keyboard: false }),
    update: (model, message) => ({
      model:
        message._tag === 'ChangedText'
          ? { ...model, text: message.value }
          : message._tag === 'ChangedKeyboard'
            ? { ...model, keyboard: message.isOpen }
            : model,
    }),
    view,
  })
