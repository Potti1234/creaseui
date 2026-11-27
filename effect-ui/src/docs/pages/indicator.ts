import { Indicator } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './indicator.css'

type Item = Readonly<{
  kind: 'check' | 'checkbox' | 'radio'
  state: 'unchecked' | 'checked' | 'indeterminate'
  caption: string
  size?: 'sm' | 'md'
  disabled?: boolean
}>

const allStates = (kind: 'checkbox' | 'radio'): ReadonlyArray<Item> => [
  { kind, state: 'unchecked', caption: 'Unchecked' },
  { kind, state: 'checked', caption: 'Checked' },
  { kind, state: 'indeterminate', caption: 'Indeterminate' },
]
const sets: ReadonlyArray<readonly [string, ReadonlyArray<Item>]> = [
  ['Indicator', allStates('checkbox')],
  ['Indicator — Radio', allStates('radio')],
  [
    'Indicator — Check',
    [
      { kind: 'check', state: 'checked', caption: 'Checked' },
      { kind: 'check', state: 'checked', disabled: true, caption: 'Disabled' },
    ],
  ],
  [
    'Indicator — Sizes',
    [
      { kind: 'checkbox', state: 'checked', size: 'sm', caption: 'Small' },
      { kind: 'checkbox', state: 'checked', size: 'md', caption: 'Medium' },
      { kind: 'radio', state: 'checked', size: 'sm', caption: 'Small' },
      { kind: 'radio', state: 'checked', size: 'md', caption: 'Medium' },
    ],
  ],
  [
    'Indicator — Disabled',
    [
      {
        kind: 'checkbox',
        state: 'unchecked',
        disabled: true,
        caption: 'Unchecked',
      },
      {
        kind: 'checkbox',
        state: 'checked',
        disabled: true,
        caption: 'Checked',
      },
      {
        kind: 'checkbox',
        state: 'indeterminate',
        disabled: true,
        caption: 'Indeterminate',
      },
    ],
  ],
]

const render =
  (items: ReadonlyArray<Item>): DocsExampleImplementation['view'] =>
  h =>
    h.div.class('indicator-docs-row').children(
      items.map(item =>
        h.div.class('indicator-docs-item').children(
          Indicator(h, {
            kind: item.kind,
            state: item.state,
            ...(item.size === undefined ? {} : { size: item.size }),
            ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
          }),
          h.span.class('indicator-docs-caption').children(item.caption),
        ),
      ),
    )

const source = exampleApplicationSource({
  imports: `import { Indicator } from '@/ui/effect/ui'
import './indicator.css'`,
  body: `h.div.class('indicator-docs-row').children(
  h.div.class('indicator-docs-item').children(
    Indicator(h, { kind: 'checkbox', state: 'checked' }),
    h.span.children('Checked'),
  ),
)`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Indicator } from '@/ui/effect/ui'

Indicator(h, { kind: 'checkbox', state: 'checked' })`,
  examples: sets.map(([title, items]) => ({
    title,
    view: render(items),
    source,
  })),
})
