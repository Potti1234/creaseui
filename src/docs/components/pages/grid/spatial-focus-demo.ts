import type { Html, HtmlBuilder } from 'foldkit/html'

import { foldkitApplication } from '@/docs/components/pages/authored-page'
import * as SpatialFocus from '@/lib/behaviors/spatial-focus'

export const Model = SpatialFocus.Model
export type Model = SpatialFocus.Model
export const Message = SpatialFocus.Message
export type Message = SpatialFocus.Message
export const init = (): Model => SpatialFocus.init({ id: 'docs-grid-spatial' })
export const update = SpatialFocus.update

export const keys = ['A', 'B', 'D', 'C', 'E'] as const
export type Key = (typeof keys)[number]
const boardFocus = SpatialFocus.create<Key>()

export const positions: Readonly<
  Record<Key, Readonly<Record<string, string>>>
> = {
  A: { left: '2%', top: '16px', width: '30%', height: '112px' },
  B: { left: '67%', top: '208px', width: '31%', height: '112px' },
  D: { left: '37%', top: '48px', width: '25%', height: '96px' },
  C: { left: '65%', top: '32px', width: '33%', height: '96px' },
  E: { left: '5%', top: '224px', width: '40%', height: '96px' },
}

type Skin = Readonly<{
  buttonClass: string
  noteClass: string
  renderCard: (key: Key, index: number) => Html
  frame: (children: ReadonlyArray<Html>) => Html
}>

export const preview = <Msg>(
  model: Model,
  toParentMessage: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
  skin: Skin,
): Html =>
  h.div(
    [h.DataAttribute('spatial-focus-demo', ''), h.Style({ width: '100%' })],
    [
      skin.frame([
        h.p(
          [
            h.Id('docs-grid-spatial-instructions'),
            h.Tabindex(-1),
            h.Class(skin.noteClass),
          ],
          [
            'Tab into the board. Arrows follow the layout; Home and End follow document order. Ctrl + arrows are left alone.',
          ],
        ),
        h.submodel({
          slotId: 'spatial-focus',
          model,
          view: boardFocus.view,
          toParentMessage,
          viewInputs: {
            keys,
            isDisabled: key => key === 'D',
            toView: items =>
              h.div(
                [
                  h.Style({
                    position: 'relative',
                    height: '336px',
                    width: '100%',
                  }),
                ],
                items.map(item =>
                  h.button(
                    [
                      h.Type('button'),
                      h.Class(skin.buttonClass),
                      h.Style({ position: 'absolute', ...positions[item.key] }),
                      h.Disabled(item.isDisabled),
                      h.AriaLabel(`Card ${item.key}`),
                      h.AriaDescribedBy('docs-grid-spatial-instructions'),
                      ...item.attributes,
                    ],
                    [skin.renderCard(item.key, item.index)],
                  ),
                ),
              ),
          },
        }),
        h.p(
          [h.Class(skin.noteClass)],
          [
            'Document order: A → B → D → C → E. Right from A goes to C, skipping unavailable D.',
          ],
        ),
      ]),
    ],
  )

export const source = (renderer: 'tailwind' | 'stylex' | 'pleat'): string => {
  const styled = renderer !== 'tailwind'
  const mod = styled ? 'stylex' : 'ui'
  return foldkitApplication({
    title: 'Grid — Spatial Focus',
    imports: `import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import * as Grid from '@/${mod}/grid'
import * as Card from '@/${mod}/card'
import * as SpatialFocus from '@/lib/behaviors/spatial-focus'
${
  styled
    ? `import * as stylex from '@stylexjs/stylex'
import type { ComponentLayoutStyle } from '@/stylex/contracts'
import { reset } from '@/stylex/reset'
import { className } from '@/stylex/style'
import { tokens } from '@/stylex/tokens.stylex'
const styles = stylex.create({
  card: { height: '100%' },
  button: {
    borderRadius: tokens.cardRadius, textAlign: 'left', cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: '3px', outlineOffset: '4px', outlineColor: 'var(--ring)',
    opacity: { default: 1, ':disabled': 0.5 },
  },
  label: { display: 'block', fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 600 },
  detail: { display: 'block', marginTop: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.75rem', lineHeight: '1rem' },
})`
    : ''
}
const keys = ['A', 'B', 'D', 'C', 'E'] as const
type Key = (typeof keys)[number]
const BoardFocus = SpatialFocus.create<Key>()
const positions: Readonly<Record<Key, Readonly<Record<string, string>>>> = ${JSON.stringify(positions, null, 2)}`,
    model: `export const Model = SpatialFocus.Model
export type Model = SpatialFocus.Model`,
    messages: `export const Message = SpatialFocus.Message
export type Message = SpatialFocus.Message`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: SpatialFocus.init({ id: 'spatial-board' }) })`,
    update: `export const update = SpatialFocus.update`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Spatial focus',
  body: Grid.grid({ columns: 1, gap: 4, width: '100%', maxWidth: 560, children: [
    h.p([], ['Tab into the board. Arrows follow geometry; Home and End follow document order.']),
    h.submodel({
      slotId: 'board', model, view: BoardFocus.view, toParentMessage: message => message,
      viewInputs: {
        keys, isDisabled: key => key === 'D',
        toView: items => h.div([h.Style({ position: 'relative', height: '336px', width: '100%' })], items.map(item =>
          h.button([
            h.Type('button'), h.Disabled(item.isDisabled), h.AriaLabel('Card ' + item.key),
            h.Class(${styled ? 'className(reset.button, styles.button)' : "'rounded-xl text-left outline-none focus-visible:outline-solid focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:opacity-50'"}),
            h.Style({ position: 'absolute', ...positions[item.key] }), ...item.attributes,
          ], [Card.card({ size: 'sm', ${styled ? 'layoutStyle: styles.card as ComponentLayoutStyle' : "class: 'h-full'"}, children: [
            Card.cardContent({ children: [
              h.span([h.Class(${styled ? 'className(styles.label)' : "'block text-sm font-semibold'"})], ['Card ' + item.key]),
              h.span([h.Class(${styled ? 'className(styles.detail)' : "'mt-2 block text-xs text-muted-foreground'"})], [item.isDisabled ? 'Unavailable' : 'Document position ' + (item.index + 1)]),
            ] }, h),
          ] }, h)]))),
      },
    }),
  ] }, h),
})`,
  })
}
