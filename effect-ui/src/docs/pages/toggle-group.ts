import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Icon, ToggleGroup } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './toggle-group.css'

type Item = Readonly<{
  value: string
  label?: string
  ariaLabel: string
  icon?: Parameters<typeof Icon>[1]['name']
  disabled?: boolean
  weight?: 'light' | 'normal' | 'medium' | 'bold'
}>
type Group = Readonly<{
  id: string
  ariaLabel: string
  items: ReadonlyArray<Item>
  multiple: boolean
  selected: ReadonlyArray<string>
  variant?: 'outline'
  size?: 'sm' | 'lg'
  arrangement?: 'wrapped'
  orientation?: 'vertical'
  rtl?: boolean
}>
type Fixture = Readonly<{
  title: string
  kind: 'default' | 'stack' | 'custom'
  groups: ReadonlyArray<Group>
}>

const formatItems: ReadonlyArray<Item> = [
  { value: 'bold', icon: 'bold', ariaLabel: 'Toggle bold' },
  { value: 'italic', icon: 'italic', ariaLabel: 'Toggle italic' },
  { value: 'underline', icon: 'underline', ariaLabel: 'Toggle strikethrough' },
]
const directionItems = (disabled = false): ReadonlyArray<Item> =>
  (['top', 'bottom', 'left', 'right'] as const).map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
    ariaLabel: `Toggle ${value}`,
    ...(disabled ? { disabled: true } : {}),
  }))
const weightItems: ReadonlyArray<Item> = [
  { value: 'light', label: 'Light', ariaLabel: 'Light', weight: 'light' },
  { value: 'normal', label: 'Normal', ariaLabel: 'Normal', weight: 'normal' },
  { value: 'medium', label: 'Medium', ariaLabel: 'Medium', weight: 'medium' },
  { value: 'bold', label: 'Bold', ariaLabel: 'Bold', weight: 'bold' },
]

const fixtures: ReadonlyArray<Fixture> = [
  {
    title: 'Basic',
    kind: 'default',
    groups: [
      {
        id: 'demo',
        ariaLabel: 'Text formatting',
        items: formatItems,
        multiple: true,
        selected: [],
        variant: 'outline',
      },
    ],
  },
  {
    title: 'Outline',
    kind: 'default',
    groups: [
      {
        id: 'outline',
        ariaLabel: 'Filter calls',
        items: [
          { value: 'all', label: 'All', ariaLabel: 'Toggle all' },
          { value: 'missed', label: 'Missed', ariaLabel: 'Toggle missed' },
        ],
        multiple: false,
        selected: ['all'],
        variant: 'outline',
      },
    ],
  },
  {
    title: 'Size',
    kind: 'stack',
    groups: [
      {
        id: 'size-sm',
        ariaLabel: 'Direction',
        items: directionItems(),
        multiple: false,
        selected: ['top'],
        variant: 'outline',
        size: 'sm',
      },
      {
        id: 'size-default',
        ariaLabel: 'Direction',
        items: directionItems(),
        multiple: false,
        selected: ['top'],
        variant: 'outline',
      },
    ],
  },
  {
    title: 'Spacing',
    kind: 'default',
    groups: [
      {
        id: 'spacing',
        ariaLabel: 'Direction',
        items: directionItems(),
        multiple: false,
        selected: ['top'],
        variant: 'outline',
        size: 'sm',
        arrangement: 'wrapped',
      },
    ],
  },
  {
    title: 'Vertical',
    kind: 'default',
    groups: [
      {
        id: 'vertical',
        ariaLabel: 'Text formatting',
        items: formatItems,
        multiple: true,
        selected: ['bold', 'italic'],
        orientation: 'vertical',
        arrangement: 'wrapped',
      },
    ],
  },
  {
    title: 'Disabled',
    kind: 'default',
    groups: [
      {
        id: 'disabled',
        ariaLabel: 'Text formatting',
        items: formatItems.map(item => ({ ...item, disabled: true })),
        multiple: true,
        selected: [],
      },
    ],
  },
  {
    title: 'Custom',
    kind: 'custom',
    groups: [
      {
        id: 'font-weight',
        ariaLabel: 'Font weight',
        items: weightItems,
        multiple: false,
        selected: ['normal'],
        variant: 'outline',
        arrangement: 'wrapped',
        size: 'lg',
      },
    ],
  },
  {
    title: 'RTL',
    kind: 'default',
    groups: [
      {
        id: 'rtl',
        ariaLabel: 'View mode',
        items: [
          { value: 'list', label: 'قائمة', ariaLabel: 'قائمة' },
          { value: 'grid', label: 'شبكة', ariaLabel: 'شبكة' },
          { value: 'cards', label: 'بطاقات', ariaLabel: 'بطاقات' },
        ],
        multiple: false,
        selected: ['list'],
        variant: 'outline',
        rtl: true,
      },
    ],
  },
]

const Message = UiSchema.TaggedEnum({
  ToggledGroup: { id: Schema.String, value: Schema.Array(Schema.String) },
})
const demo = (name: string, fixture: Fixture) =>
  Html.component({
    name,
    model: Schema.Struct({
      selections: Schema.Record(Schema.String, Schema.Array(Schema.String)),
    }),
    message: Message,
  }).make({
    init: () => ({
      selections: Object.fromEntries(
        fixture.groups.map(group => [group.id, [...group.selected]]),
      ),
    }),
    update: {
      ToggledGroup: ($, { id, value }) =>
        $.evolve({ selections: { ...$.model.selections, [id]: value } }),
    },
    view: (h, model) => {
      const renderGroup = (group: Group) =>
        ToggleGroup(h, {
          key: group.id,
          ariaLabel: group.ariaLabel,
          ...(group.variant === undefined ? {} : { variant: group.variant }),
          ...(group.size === undefined ? {} : { size: group.size }),
          ...(group.arrangement === undefined
            ? {}
            : { arrangement: group.arrangement }),
          direction: group.rtl === true ? 'rtl' : 'ltr',
          props: {
            value: model.selections[group.id] ?? [],
            multiple: group.multiple,
            orientation: group.orientation,
            items: group.items.map(item => ({
              value: item.value,
              ...(item.disabled === undefined
                ? {}
                : { disabled: item.disabled }),
            })),
          },
          renderItem: value => {
            const item = group.items.find(entry => entry.value === value)
            return {
              ...(item?.ariaLabel === undefined
                ? {}
                : { ariaLabel: item.ariaLabel }),
              ...(item?.weight === undefined
                ? {}
                : { className: 'toggle-group-docs-weight' }),
              children:
                item?.icon !== undefined
                  ? [Icon(h, { name: item.icon, size: 'sm' })]
                  : item?.weight !== undefined
                    ? [
                        h.span
                          .class(
                            `toggle-group-docs-weight-sample toggle-group-docs-weight-${item.weight}`,
                          )
                          .children('Aa'),
                        h.span
                          .class('toggle-group-docs-weight-label')
                          .children(item.label ?? ''),
                      ]
                    : [item?.label ?? value],
            }
          },
          onEmit: {
            Toggled: ({ value }) =>
              Message.ToggledGroup({ id: group.id, value }),
          },
        })
      if (fixture.kind === 'stack')
        return h.div
          .class('toggle-group-docs-stack')
          .children(fixture.groups.map(renderGroup))
      const group = fixture.groups[0]
      if (fixture.kind === 'custom' && group !== undefined) {
        const selected = model.selections[group.id]?.[0] ?? 'normal'
        return h.div
          .class('toggle-group-docs-custom')
          .children(
            h.div.class('toggle-group-docs-label').children('Font Weight'),
            renderGroup(group),
            h.p
              .class('toggle-group-docs-description')
              .children(
                'Use ',
                h.code
                  .class('toggle-group-docs-code')
                  .children(`font-${selected}`),
                ' to set the font weight.',
              ),
          )
      }
      return group === undefined ? h.div : renderGroup(group)
    },
  })

const source = exampleApplicationSource({
  imports: `import { ToggleGroup } from '@/ui/effect/ui'
import './toggle-group.css'`,
  body: `ToggleGroup(h, {
  key: 'formatting',
  ariaLabel: 'Text formatting',
  props: {
    value: model.formatting,
    multiple: true,
    items: [{ value: 'bold' }, { value: 'italic' }],
  },
  renderItem: value => ({ children: [value] }),
  onEmit: { Toggled: ({ value }) => Message.ToggledFormatting({ value }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { ToggleGroup } from '@/ui/effect/ui'

ToggleGroup(h, {
  key: 'formatting',
  ariaLabel: 'Text formatting',
  props: { value: model.formatting, items: [{ value: 'bold' }] },
  renderItem: value => ({ children: [value] }),
  onEmit: { Toggled: ({ value }) => Message.ToggledFormatting({ value }) },
})`,
  examples: fixtures.map((fixture, index) => {
    const Demo = demo(`DocsToggleGroup${index}`, fixture)
    return {
      title: fixture.title,
      view: ((h, context) =>
        Demo(h, {
          key: `${context.idPrefix}-toggle-group`,
          props: {},
        })) as DocsExampleImplementation['view'],
      source,
    }
  }),
})
