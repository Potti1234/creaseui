import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Icon, Toggle } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './toggle.css'

type Item = Readonly<{
  key: string
  label: string
  ariaLabel: string
  icon?: Parameters<typeof Icon>[1]['name']
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
  rtl?: boolean
}>

const Message = UiSchema.TaggedEnum({ Toggled: { id: Schema.String } })
const demo = (name: string, items: ReadonlyArray<Item>, row: boolean) =>
  Html.component({
    name,
    model: Schema.Struct({
      states: Schema.Record(Schema.String, Schema.Boolean),
    }),
    message: Message,
  }).make({
    init: () => ({ states: {} }),
    update: {
      Toggled: ($, { id }) =>
        $.evolve({
          states: { ...$.model.states, [id]: !($.model.states[id] ?? false) },
        }),
    },
    view: (h, model) => {
      const toggles = items.map(item =>
        Toggle(h, {
          element: h.button.attrs({
            'aria-label': item.ariaLabel,
            dir: item.rtl ? 'rtl' : undefined,
          }),
          props: {
            pressed: model.states[item.key] ?? false,
            disabled: item.disabled,
          },
          onToggle: () => Message.Toggled({ id: item.key }),
          ...(item.variant === undefined ? {} : { variant: item.variant }),
          ...(item.size === undefined ? {} : { size: item.size }),
        }).children(
          item.icon === undefined ? undefined : Icon(h, { name: item.icon }),
          item.label,
        ),
      )
      return row
        ? h.div.class('toggle-docs-row').children(toggles)
        : items[0]?.rtl === true
          ? h.div.class('toggle-docs-rtl').children(toggles[0])
          : (toggles[0] ?? h.div)
    },
  })

const fixtures: ReadonlyArray<readonly [string, ReadonlyArray<Item>, boolean]> =
  [
    [
      'Basic',
      [
        {
          key: 'bookmark',
          label: 'Bookmark',
          ariaLabel: 'Toggle bookmark',
          icon: 'bookmark',
          variant: 'outline',
          size: 'sm',
        },
      ],
      false,
    ],
    [
      'Outline',
      [
        {
          key: 'italic',
          label: 'Italic',
          ariaLabel: 'Toggle italic',
          icon: 'italic',
          variant: 'outline',
        },
        {
          key: 'bold',
          label: 'Bold',
          ariaLabel: 'Toggle bold',
          icon: 'bold',
          variant: 'outline',
        },
      ],
      true,
    ],
    [
      'With Text',
      [
        {
          key: 'italic',
          label: 'Italic',
          ariaLabel: 'Toggle italic',
          icon: 'italic',
        },
      ],
      false,
    ],
    [
      'Size',
      [
        {
          key: 'small',
          label: 'Small',
          ariaLabel: 'Toggle small',
          variant: 'outline',
          size: 'sm',
        },
        {
          key: 'default',
          label: 'Default',
          ariaLabel: 'Toggle default',
          variant: 'outline',
        },
        {
          key: 'large',
          label: 'Large',
          ariaLabel: 'Toggle large',
          variant: 'outline',
          size: 'lg',
        },
      ],
      true,
    ],
    [
      'Disabled',
      [
        {
          key: 'disabled',
          label: 'Disabled',
          ariaLabel: 'Toggle disabled',
          disabled: true,
        },
        {
          key: 'disabled-outline',
          label: 'Disabled',
          ariaLabel: 'Toggle disabled outline',
          variant: 'outline',
          disabled: true,
        },
      ],
      true,
    ],
    [
      'RTL',
      [
        {
          key: 'bookmark',
          label: 'إشارة مرجعية',
          ariaLabel: 'Toggle bookmark',
          icon: 'bookmark',
          variant: 'outline',
          size: 'sm',
          rtl: true,
        },
      ],
      false,
    ],
  ]

const source = exampleApplicationSource({
  imports: `import { Icon, Toggle } from '@/ui/effect/ui'
import './toggle.css'`,
  body: `Toggle(h, {
  props: { pressed: model.bookmarked },
  onToggle: ({ pressed }) => Message.ToggledBookmark({ pressed }),
}).children(Icon(h, { name: 'bookmark' }), 'Bookmark')`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Toggle } from '@/ui/effect/ui'

Toggle(h, {
  props: { pressed: model.bookmarked },
  onToggle: ({ pressed }) => Message.ToggledBookmark({ pressed }),
}).children('Bookmark')`,
  examples: fixtures.map(([title, items, row], index) => {
    const Demo = demo(`DocsToggle${index}`, items, row)
    return {
      title,
      view: ((h, context) =>
        Demo(h, {
          key: `${context.idPrefix}-toggle`,
          props: {},
        })) as DocsExampleImplementation['view'],
      source,
    }
  }),
})
