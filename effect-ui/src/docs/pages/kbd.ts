import type { View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  Button,
  ButtonGroup,
  Icon,
  InputGroup,
  Kbd,
  Tooltip,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './kbd.css'

const kbd = (h: Html.H<DocsMessage>, text: string) =>
  Kbd<DocsMessage>(h, { children: [text] })
const group = (
  h: Html.H<DocsMessage>,
  children: View.Children<DocsMessage, never>,
) => Kbd<DocsMessage>(h, { group: true, children })

const modifierGroup = (h: Html.H<DocsMessage>) =>
  group(h, [kbd(h, '⌘'), kbd(h, '⇧'), kbd(h, '⌥'), kbd(h, '⌃')])
const ctrlGroup = (h: Html.H<DocsMessage>) =>
  group(h, [kbd(h, 'Ctrl'), h.span.children('+'), kbd(h, 'B')])

const basic =
  (rtl = false): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(`kbd-docs-stack${rtl ? ' kbd-docs-rtl' : ''}`)
      .children(modifierGroup(h), ctrlGroup(h))

const groupView: DocsExampleImplementation['view'] = h =>
  h.div
    .class('kbd-docs-stack')
    .children(
      h.p
        .class('kbd-docs-muted')
        .children(
          'Use ',
          group(h, [kbd(h, 'Ctrl + B'), kbd(h, 'Ctrl + K')]),
          ' to open the command palette',
        ),
    )

const buttonView: DocsExampleImplementation['view'] = h =>
  h.div.class('kbd-docs-stack').children(
    Button(h, { variant: 'outline' }).children(
      'Accept ',
      Kbd(h, {
        icon: 'inline-end',
        className: 'kbd-docs-translate',
        children: ['⏎'],
      }),
    ),
  )

const tooltipView: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('kbd-docs-row').children(
    ButtonGroup(h, {
      ariaLabel: 'Document actions',
      children: [
        Tooltip(h, {
          key: `${context.idPrefix}-save-tooltip`,
          props: {},
          trigger: Button(h, { variant: 'outline' }).children('Save'),
          content: h.span
            .class('kbd-docs-tooltip-content')
            .children('Save Changes ', kbd(h, 'S')),
        }),
        Tooltip(h, {
          key: `${context.idPrefix}-print-tooltip`,
          props: {},
          trigger: Button(h, { variant: 'outline' }).children('Print'),
          content: h.span
            .class('kbd-docs-tooltip-content')
            .children(
              'Print Document ',
              group(h, [kbd(h, 'Ctrl'), kbd(h, 'P')]),
            ),
        }),
      ],
    }),
  )

const inputGroupView: DocsExampleImplementation['view'] = h =>
  h.div.class('kbd-docs-input-column').children(
    InputGroup(h, {
      focusControlId: 'kbd-search',
      addOns: {
        'inline-start': Icon(h, { name: 'search' }),
        'inline-end': [kbd(h, '⌘'), kbd(h, 'K')],
      },
      control: groupParts =>
        groupParts.input(
          h.input.attrs({
            id: 'kbd-search',
            placeholder: 'Search...',
            'aria-label': 'Search',
          }),
        ),
    }),
  )

const kbdSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Button, InputGroup, Kbd, Tooltip } from '@/ui/effect/ui'
import './kbd.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Kbd } from '@/ui/effect/ui'

Kbd(h, { children: ['⌘'] })`,
  examples: [
    {
      title: 'Basic',
      view: basic(),
      source: kbdSource(`h.div.class('kbd-docs-stack').children(
  Kbd(h, { group: true, children: [Kbd(h, { children: ['⌘'] })] }),
)`),
    },
    {
      title: 'Group',
      view: groupView,
      source: kbdSource(`h.p.class('kbd-docs-muted').children(
  'Use ',
  Kbd(h, { group: true, children: [Kbd(h, { children: ['Ctrl + B'] })] }),
  ' to open the command palette',
)`),
    },
    {
      title: 'Button',
      view: buttonView,
      source: kbdSource(`Button(h, { variant: 'outline' }).children(
  'Accept ',
  Kbd(h, { icon: 'inline-end', children: ['⏎'] }),
)`),
    },
    {
      title: 'Tooltip',
      view: tooltipView,
      source: kbdSource(`Tooltip(h, {
  trigger: Button(h, { variant: 'outline' }).children('Save'),
  content: h.span.children('Save Changes ', Kbd(h, { children: ['S'] })),
})`),
    },
    {
      title: 'Input Group',
      view: inputGroupView,
      source: kbdSource(`InputGroup(h, {
  addOns: { 'inline-end': [Kbd(h, { children: ['⌘'] }), Kbd(h, { children: ['K'] })] },
  control: group => group.input(h.input.attrs({ placeholder: 'Search...' })),
})`),
    },
    {
      title: 'RTL',
      view: basic(true),
      source: kbdSource(`h.div.class('kbd-docs-stack kbd-docs-rtl').children(
  Kbd(h, { group: true, children: [Kbd(h, { children: ['⌘'] })] }),
)`),
    },
  ],
})
