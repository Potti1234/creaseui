import { Schema } from 'effect'
import { Command } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'

import * as Lasso from '@/lib/behaviors/lasso'
import { foldkitApplication } from '@/docs/components/pages/authored-page'

export const Model = Schema.Struct({
  lasso: Lasso.Model,
  selected: Schema.Array(Schema.String),
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  GotLasso: { message: Lasso.Message },
})
export type Message = typeof Message.Type
export const init = (): Model => ({
  lasso: Lasso.init({ id: 'docs-grid-lasso' }),
  selected: [],
})
export const update = (model: Model, message: Message) => {
  const next = Lasso.update(model.lasso, message.message, {
    selected: model.selected,
  })
  return {
    model: {
      lasso: next.model,
      selected:
        next.outMessage?._tag === 'Selected'
          ? next.outMessage.keys
          : model.selected,
    },
    commands: Command.mapMessages(next.commands ?? [], message =>
      Message.GotLasso({ message }),
    ),
  }
}
export const view = defineView<Model, Message>((model, h) =>
  h.div(
    [
      h.Class('docs-lasso-demo'),
      h.Style({ width: 'min(100%, 420px)', 'font-size': '0.875rem' }),
    ],
    [
      h.p(
        [h.Style({ margin: '0.75rem 0' })],
        [
          'Drag from the space between tiles to select. Shift adds; Escape cancels.',
        ],
      ),
      h.submodel({
        slotId: 'lasso',
        model: model.lasso,
        view: Lasso.view,
        toParentMessage: message => Message.GotLasso({ message }),
        viewInputs: {
          keys: Array.from({ length: 12 }, (_, index) => String(index + 1)),
          toView: ({ surfaceAttributes, rectangleAttributes, items }) =>
            h.div(
              [
                ...surfaceAttributes,
                h.Class('docs-lasso-surface'),
                h.Style({
                  position: 'relative',
                  display: 'grid',
                  'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
                  gap: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)',
                  'border-radius': '12px',
                  'touch-action': 'none',
                  'user-select': 'none',
                }),
              ],
              [
                ...items.map(item =>
                  h.div(
                    [
                      ...item.attributes,
                      h.Class('docs-lasso-tile'),
                      h.Style({
                        display: 'grid',
                        'place-items': 'center',
                        height: '56px',
                        border: '1px solid var(--border)',
                        'border-radius': '8px',
                        background:
                          item.isTouched || model.selected.includes(item.key)
                            ? 'var(--primary)'
                            : 'var(--muted)',
                        color:
                          item.isTouched || model.selected.includes(item.key)
                            ? 'var(--primary-foreground)'
                            : 'var(--foreground)',
                      }),
                      h.DataAttribute(
                        'selected',
                        String(model.selected.includes(item.key)),
                      ),
                      h.DataAttribute('touched', String(item.isTouched)),
                    ],
                    [`Tile ${item.key}`],
                  ),
                ),
                h.div(
                  [
                    ...rectangleAttributes,
                    h.Class('docs-lasso-rectangle'),
                    h.Style({
                      ...Lasso.rectangleStyle(model.lasso),
                      border: '1px solid var(--primary)',
                      background:
                        'color-mix(in srgb, var(--primary) 15%, transparent)',
                    }),
                  ],
                  [],
                ),
              ],
            ),
        },
      }),
      h.p(
        [
          h.AriaLive('polite'),
          h.DataAttribute('lasso-status', ''),
          h.Style({ margin: '0.75rem 0' }),
        ],
        [Lasso.selectionMessage(model.selected.length)],
      ),
    ],
  ),
)

export const preview = <Msg>(
  model: Model,
  toParentMessage: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.submodel({ slotId: 'grid-lasso-demo', model, view, toParentMessage })

export const source = (renderer: 'tailwind' | 'stylex' | 'pleat'): string =>
  foldkitApplication({
    title: 'Grid — Lasso Selection',
    imports: `import { Schema } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Grid from '@/${renderer === 'tailwind' ? 'ui' : renderer}/grid'
import * as Lasso from '@/lib/behaviors/lasso'`,
    model: `export const Model = Schema.Struct({ lasso: Lasso.Model, selected: Schema.Array(Schema.String) })
export type Model = typeof Model.Type`,
    messages: `export const Message = defineMessageUnion({ GotLasso: { message: Lasso.Message } })
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: { lasso: Lasso.init({ id: 'tile-lasso' }), selected: [] },
})`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  const next = Lasso.update(model.lasso, message.message, { selected: model.selected })
  return {
    model: {
      lasso: next.model,
      selected: next.outMessage?._tag === 'Selected' ? next.outMessage.keys : model.selected,
    },
    commands: Command.mapMessages(next.commands ?? [], message => Message.GotLasso({ message })),
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Lasso selection',
  body: Grid.grid({ columns: 1, gap: 4, width: 420, children: [
    h.p([], ['Drag from empty space. Shift adds; Escape cancels.']),
    h.submodel({
      slotId: 'lasso', model: model.lasso, view: Lasso.view,
      toParentMessage: message => Message.GotLasso({ message }),
      viewInputs: {
        keys: Array.from({ length: 12 }, (_, index) => String(index + 1)),
        toView: ({ surfaceAttributes, rectangleAttributes, items }) => h.div([
          ...surfaceAttributes,
          h.Style({ position: 'relative', display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '16px', padding: '24px', 'touch-action': 'none', 'user-select': 'none' }),
        ], [
          ...items.map(item => h.div([
            ...item.attributes,
            h.Style({ height: '56px', display: 'grid', 'place-items': 'center', border: '1px solid var(--border)', background: item.isTouched || model.selected.includes(item.key) ? 'var(--primary)' : 'var(--muted)', color: item.isTouched || model.selected.includes(item.key) ? 'var(--primary-foreground)' : 'var(--foreground)' }),
          ], [item.key])),
          h.div([...rectangleAttributes, h.Style({ ...Lasso.rectangleStyle(model.lasso), outline: '1px solid var(--primary)' })], []),
        ]),
      },
    }),
    h.p([h.AriaLive('polite')], [Lasso.selectionMessage(model.selected.length)]),
  ] }, h),
})`,
  })
