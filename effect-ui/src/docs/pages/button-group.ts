import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, ButtonGroup, Icon, Input } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedValue: { field: Schema.String, value: Schema.String },
})
type Node =
  | {
      t: 'button'
      label?: string
      icon?: string
      size?: 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
      aria?: string
    }
  | { t: 'group'; children: readonly Node[] }
  | { t: 'separator' }
  | { t: 'input'; field: string; placeholder: string }
  | { t: 'inputGroup' }
  | { t: 'select' }
  | { t: 'dropdown' }
  | { t: 'popover' }
const ButtonGroupDemo = Html.component({
  name: 'DocsButtonGroupDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ values: Schema.Record(Schema.String, Schema.String) }),
  message: Message,
}).make({
  init: () => ({ values: {} }),
  update: {
    ChangedValue: ($, { field, value }) =>
      $.evolve({ values: values => ({ ...values, [field]: value }) }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const prefix = h.props.idPrefix
    const rtl = kind === 'rtl'
    const button = ({
      label,
      icon,
      size,
      aria,
    }: Extract<Node, { t: 'button' }>) =>
      Button(h, {
        variant: 'outline',
        size,
        'aria-label': aria,
      } as any).children(
        icon === undefined
          ? undefined
          : (Icon(h, {
              name: icon as never,
              size: 'sm',
              ...(rtl && icon.includes('arrow') ? { rotation: 180 } : {}),
            }) as never),
        label,
      )
    const textInput = (field: string, placeholder: string) =>
      Input(h, {
        id: `${prefix}-${field}`,
        element: h.input.attrs({ placeholder }).class('h-9'),
        props: { value: model.values[field] ?? '' },
        onUpdate: ({ value }) => Message.ChangedValue({ field, value }),
      })
    const dropdown = Button(h, {
      variant: 'outline',
      size: 'icon',
      'aria-label': 'More actions',
    } as any).children(Icon(h, { name: 'chevron-down', size: 'sm' }) as never)
    const render = (node: Node, index: number): unknown => {
      if (node.t === 'button') return button(node)
      if (node.t === 'separator') return null
      if (node.t === 'input') return textInput(node.field, node.placeholder)
      if (node.t === 'select')
        return h.select
          .class('h-9 rounded-md border bg-transparent px-2 text-sm')
          .children(
            h.option.children('$'),
            h.option.children('€'),
            h.option.children('£'),
          )
      if (node.t === 'dropdown') return dropdown
      if (node.t === 'popover')
        return Button(h, {
          variant: 'outline',
          size: 'icon',
          'aria-label': 'Open popover',
        } as any).children(
          Icon(h, { name: 'chevron-down', size: 'sm' }) as never,
        )
      if (node.t === 'inputGroup')
        return h.div
          .class('flex h-9 min-w-56 items-center rounded-md border shadow-xs')
          .children(
            h.input
              .class('min-w-0 flex-1 bg-transparent px-3 text-sm outline-none')
              .attrs({ placeholder: 'Message...' }),
            h.button
              .class('px-2 text-muted-foreground')
              .attr('aria-label', 'Voice Mode')
              .children(Icon(h, { name: 'plus', size: 'sm' }) as never),
          )
      return ButtonGroup(h, {
        children: node.children.map(
          (child, childIndex) => render(child, childIndex) as never,
        ),
      })
    }
    const group = (nodes: readonly Node[], orientation?: 'vertical') =>
      ButtonGroup(h, {
        ...(orientation === undefined ? {} : { orientation }),
        ariaLabel: kind,
        children: groupParts =>
          nodes.map((node, index) =>
            node.t === 'separator'
              ? (groupParts.separator() as never)
              : (render(node, index) as never),
          ),
      })
    if (kind === 'demo' || kind === 'rtl') {
      const archive = rtl ? 'أرشفة' : 'Archive'
      const report = rtl ? 'تقرير' : 'Report'
      const snooze = rtl ? 'تأجيل' : 'Snooze'
      return h.div
        .attrs({ dir: rtl ? 'rtl' : undefined })
        .class('flex gap-2')
        .children(
          group([
            {
              t: 'group',
              children: [
                {
                  t: 'button',
                  icon: 'arrow-left',
                  size: 'icon',
                  aria: rtl ? 'العودة' : 'Go Back',
                },
              ],
            },
          ]) as never,
          group([
            { t: 'button', label: archive },
            { t: 'button', label: report },
          ]) as never,
          group([{ t: 'button', label: snooze }, { t: 'dropdown' }]) as never,
        )
    }
    if (kind === 'orientation')
      return group(
        [
          { t: 'button', icon: 'plus', size: 'icon', aria: 'Add' },
          { t: 'button', icon: 'minus', size: 'icon', aria: 'Remove' },
        ],
        'vertical',
      )
    if (kind === 'size')
      return h.div.class('flex flex-col gap-4').children(
        (['sm', undefined, 'lg'] as const).map(
          (size, row) =>
            group([
              {
                t: 'button',
                label:
                  size === 'sm' ? 'Small' : size === 'lg' ? 'Large' : 'Default',
                ...(size === undefined ? {} : { size }),
              },
              {
                t: 'button',
                label: 'Button',
                ...(size === undefined ? {} : { size }),
              },
              {
                t: 'button',
                label: 'Group',
                ...(size === undefined ? {} : { size }),
              },
              {
                t: 'button',
                icon: 'plus',
                aria: 'Add',
                size:
                  size === 'sm'
                    ? 'icon-sm'
                    : size === 'lg'
                      ? 'icon-lg'
                      : 'icon',
              },
            ]) as never,
        ),
      )
    if (kind === 'nested' || kind === 'inputGroup')
      return h.div
        .class('flex gap-2')
        .children(
          group([
            { t: 'button', icon: 'plus', size: 'icon', aria: 'Add' },
          ]) as never,
          group([{ t: 'inputGroup' }]) as never,
        )
    if (kind === 'separator')
      return group([
        { t: 'button', label: 'Copy', size: 'sm' },
        { t: 'separator' },
        { t: 'button', label: 'Paste', size: 'sm' },
      ])
    if (kind === 'split')
      return group([
        { t: 'button', label: 'Button' },
        { t: 'separator' },
        { t: 'button', icon: 'plus', size: 'icon', aria: 'Add' },
      ])
    if (kind === 'input')
      return group([
        { t: 'input', field: 'query', placeholder: 'Search...' },
        { t: 'button', icon: 'search', aria: 'Search' },
      ])
    if (kind === 'dropdown')
      return group([{ t: 'button', label: 'Follow' }, { t: 'dropdown' }])
    if (kind === 'select')
      return h.div
        .class('flex gap-2')
        .children(
          group([
            { t: 'select' },
            { t: 'input', field: 'amount', placeholder: '10.00' },
          ]) as never,
          group([
            { t: 'button', icon: 'arrow-right', size: 'icon', aria: 'Send' },
          ]) as never,
        )
    return group([
      { t: 'button', label: 'Copilot', icon: 'bot' },
      { t: 'popover' },
    ])
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    ButtonGroupDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Button, ButtonGroup, Icon, Input } from '@/ui/effect/ui'`,
  body: `ButtonGroup(h, {
  ariaLabel: 'Actions',
  children: [
    Button(h, { variant: 'outline' }).children('Archive'),
    Button(h, { variant: 'outline' }).children('Report'),
  ],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { ButtonGroup } from '@/ui/effect/ui'\n\nButtonGroup(h, { ariaLabel, children })`,
  examples: [
    { title: 'Demo', view: view('demo'), source },
    { title: 'Orientation', view: view('orientation'), source },
    { title: 'Size', view: view('size'), source },
    { title: 'Nested', view: view('nested'), source },
    { title: 'Separator', view: view('separator'), source },
    { title: 'Split', view: view('split'), source },
    { title: 'Input', view: view('input'), source },
    { title: 'Input Group', view: view('inputGroup'), source },
    { title: 'Dropdown Menu', view: view('dropdown'), source },
    { title: 'Select', view: view('select'), source },
    { title: 'Popover', view: view('popover'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
