import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Button,
  ButtonGroup,
  ButtonLink,
  DropdownMenu,
  Icon,
  Spinner,
} from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './button.css'

type ButtonItem = Readonly<{
  label?: string
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'link'
  size?:
    | 'default'
    | 'xs'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg'
  icon?: Parameters<typeof Icon>[1]['name']
  iconPosition?: 'start' | 'end'
  ariaLabel?: string
  disabled?: boolean
  spinner?: 'start' | 'end'
  rounded?: boolean
  rtlFlip?: boolean
}>

const itemButton = <Msg>(h: Html.H<Msg>, item: ButtonItem) => {
  const content = [
    item.spinner === 'start'
      ? Spinner(h, { isDecorative: true, dataIcon: 'inline-start' })
      : undefined,
    item.icon !== undefined && (item.iconPosition ?? 'start') === 'start'
      ? Icon(h, {
          name: item.icon,
          dataIcon: 'inline-start',
          ...(item.rtlFlip ? { className: 'button-docs-rtl-flip' } : {}),
        })
      : undefined,
    item.label,
    item.icon !== undefined && item.iconPosition === 'end'
      ? Icon(h, {
          name: item.icon,
          dataIcon: 'inline-end',
          ...(item.rtlFlip ? { className: 'button-docs-rtl-flip' } : {}),
        })
      : undefined,
    item.spinner === 'end'
      ? Spinner(h, { isDecorative: true, dataIcon: 'inline-end' })
      : undefined,
  ]
  const button = Button(h, {
    ...(item.ariaLabel === undefined
      ? {}
      : { element: h.button.attrs({ 'aria-label': item.ariaLabel }) }),
    ...(item.variant === undefined ? {} : { variant: item.variant }),
    ...(item.size === undefined ? {} : { size: item.size }),
    ...(item.disabled === true ? { disabled: true } : {}),
  })
  return (
    item.rounded === true ? button.class('button-docs-rounded') : button
  ).children(content)
}

const itemsExample =
  (
    items: ReadonlyArray<ButtonItem>,
    rtl = false,
  ): DocsExampleImplementation['view'] =>
  h => {
    const rendered = items.map(item => itemButton(h, item))
    return rendered.length === 1 && !rtl
      ? rendered[0]
      : h.div
          .class(`button-docs-row${rtl ? ' button-docs-rtl' : ''}`)
          .children(rendered)
  }

const sizeTiers = [
  { name: 'Extra Small', size: 'xs', iconSize: 'icon-xs' },
  { name: 'Small', size: 'sm', iconSize: 'icon-sm' },
  { name: 'Default', size: 'default', iconSize: 'icon' },
  { name: 'Large', size: 'lg', iconSize: 'icon-lg' },
] as const

const sizesExample: DocsExampleImplementation['view'] = h =>
  h.div.class('button-docs-sizes').children(
    sizeTiers.map(tier =>
      h.div.class('button-docs-size-tier').children(
        itemButton(h, {
          label: tier.name,
          variant: 'outline',
          size: tier.size,
        }),
        itemButton(h, {
          variant: 'outline',
          size: tier.iconSize,
          icon: 'arrow-up-right',
          ariaLabel: tier.name,
        }),
      ),
    ),
  )

const GroupMessage = UiSchema.TaggedEnum({
  RequestedOpenMenu: {},
  RequestedCloseMenu: {},
  RequestedOpenLabels: {},
  RequestedCloseLabels: {},
  PickedMenuItem: {
    value: Schema.String,
    checked: Schema.optional(Schema.Boolean),
  },
})
const menuItems = [
  ['mark-read', 'Mark as Read', 'mail-check'],
  ['archive', 'Archive', 'archive'],
  ['snooze', 'Snooze', 'clock'],
  ['add-calendar', 'Add to Calendar', 'calendar-plus'],
  ['add-list', 'Add to List', 'list-filter'],
  ['label-as', 'Label As…', 'tag'],
  ['trash', 'Trash', 'trash-2'],
] as const
const labelItems = ['personal', 'work', 'other'] as const

const ButtonGroupDemo = Html.component({
  name: 'DocsButtonGroupDemo',
  model: Schema.Struct({
    open: Schema.Boolean,
    labelsOpen: Schema.Boolean,
    labelAs: Schema.String,
  }),
  message: GroupMessage,
}).make({
  init: () => ({ open: false, labelsOpen: false, labelAs: 'personal' }),
  update: {
    RequestedOpenMenu: $ => $.evolve({ open: true }),
    RequestedCloseMenu: $ => $.evolve({ open: false }),
    RequestedOpenLabels: $ => $.evolve({ labelsOpen: true }),
    RequestedCloseLabels: $ => $.evolve({ labelsOpen: false }),
    PickedMenuItem: ($, { value }) =>
      (labelItems as ReadonlyArray<string>).includes(value)
        ? $.evolve({ labelAs: value, open: false, labelsOpen: false })
        : $.evolve({ open: false }),
  },
  view: (h, model) =>
    ButtonGroup(h, {
      children: [
        ButtonGroup(h, {
          className: 'button-docs-back-group',
          children: [
            itemButton(h, {
              variant: 'outline',
              size: 'icon',
              icon: 'arrow-left',
              ariaLabel: 'Go Back',
            }),
          ],
        }),
        ButtonGroup(h, {
          children: [
            Button(h, { variant: 'outline' }).children('Archive'),
            Button(h, { variant: 'outline' }).children('Report'),
          ],
        }),
        ButtonGroup(h, {
          children: [
            Button(h, { variant: 'outline' }).children('Snooze'),
            DropdownMenu(h, {
              key: 'more-actions',
              label: 'More options',
              trigger: Button(h, {
                element: h.button.attrs({ 'aria-label': 'More options' }),
                variant: 'outline',
                size: 'icon',
              }).children(Icon(h, { name: 'ellipsis' })),
              props: {
                open: model.open,
                sideOffset: 4,
                items: [
                  ...menuItems.map(([value, label]) => ({ value, label })),
                  ...labelItems.map(value => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                  })),
                ],
              },
              decorateItem: ({ value }) => {
                const main = menuItems.find(entry => entry[0] === value)
                if ((labelItems as ReadonlyArray<string>).includes(value))
                  return {
                    kind: 'radio' as const,
                    selectedValue: model.labelAs,
                  }
                if (value === 'label-as')
                  return {
                    icon: Icon(h, { name: 'tag' }),
                    kind: 'submenu' as const,
                    render: (item, parentMenu) =>
                      DropdownMenu(h, {
                        key: 'label-as-options',
                        label: 'Label as',
                        submenuTrigger: h.div.children('Label As…'),
                        parentMenu,
                        props: {
                          open: model.labelsOpen,
                          parentItem: item.value,
                          items: labelItems.map(value => ({
                            value,
                            label:
                              value.charAt(0).toUpperCase() + value.slice(1),
                          })),
                        },
                        decorateItem: () => ({
                          kind: 'radio' as const,
                          selectedValue: model.labelAs,
                        }),
                        onEmit: {
                          RequestedOpen: () =>
                            GroupMessage.RequestedOpenLabels(),
                          RequestedClose: () =>
                            GroupMessage.RequestedCloseLabels(),
                          Picked: ({ value, checked }) =>
                            GroupMessage.PickedMenuItem({
                              value,
                              ...(checked === undefined ? {} : { checked }),
                            }),
                          Highlighted: () => undefined,
                          RequestedQuery: () => undefined,
                          Settled: () => undefined,
                        },
                      }),
                  }
                if (main !== undefined)
                  return {
                    icon: Icon(h, { name: main[2] }),
                    ...(value === 'snooze' || value === 'trash'
                      ? { separatorBefore: true }
                      : {}),
                    ...(value === 'trash'
                      ? { tone: 'destructive' as const }
                      : {}),
                  }
                return {}
              },
              onEmit: {
                RequestedOpen: () => GroupMessage.RequestedOpenMenu(),
                RequestedClose: () => GroupMessage.RequestedCloseMenu(),
                Picked: ({ value, checked }) =>
                  GroupMessage.PickedMenuItem({
                    value,
                    ...(checked === undefined ? {} : { checked }),
                  }),
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
            }),
          ],
        }),
      ],
    }),
})

const source = exampleApplicationSource({
  imports: `import { Button, Icon } from '@/ui/effect/ui'
import './button.css'`,
  body: `Button(h, { variant: 'outline' }).children(
  Icon(h, { name: 'git-branch', dataIcon: 'inline-start' }),
  'New Branch',
)`,
})

const simpleExamples: ReadonlyArray<
  readonly [string, ReadonlyArray<ButtonItem>]
> = [
  [
    'Basic',
    [
      { label: 'Button', variant: 'outline' },
      {
        variant: 'outline',
        size: 'icon',
        icon: 'arrow-up',
        ariaLabel: 'Submit',
      },
    ],
  ],
  ['Default', [{ label: 'Button' }]],
  ['Outline', [{ label: 'Outline', variant: 'outline' }]],
  ['Secondary', [{ label: 'Secondary', variant: 'secondary' }]],
  ['Ghost', [{ label: 'Ghost', variant: 'ghost' }]],
  ['Destructive', [{ label: 'Destructive', variant: 'destructive' }]],
  ['Link', [{ label: 'Link', variant: 'link' }]],
  [
    'Icon',
    [
      {
        variant: 'outline',
        size: 'icon',
        icon: 'circle-fading-arrow-up',
        ariaLabel: 'Submit',
      },
    ],
  ],
  [
    'With Icon',
    [
      { label: 'New Branch', variant: 'outline', icon: 'git-branch' },
      {
        label: 'Fork',
        variant: 'outline',
        icon: 'git-fork',
        iconPosition: 'end',
      },
    ],
  ],
  [
    'Rounded',
    [
      { label: 'Get Started', rounded: true },
      {
        variant: 'outline',
        size: 'icon',
        icon: 'arrow-up',
        rounded: true,
        ariaLabel: 'Go up',
      },
    ],
  ],
  [
    'Spinner',
    [
      {
        label: 'Generating',
        variant: 'outline',
        disabled: true,
        spinner: 'start',
      },
      {
        label: 'Downloading',
        variant: 'secondary',
        disabled: true,
        spinner: 'start',
      },
    ],
  ],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Button } from '@/ui/effect/ui'

Button(h, { variant: 'outline', onPress: Message.ClickedSave() }).children('Save')`,
  examples: [
    ...simpleExamples.slice(0, 1).map(([title, items]) => ({
      title,
      view: itemsExample(items),
      source,
    })),
    { title: 'Size', view: sizesExample, source },
    ...simpleExamples.slice(1).map(([title, items]) => ({
      title,
      view: itemsExample(items),
      source,
    })),
    {
      title: 'Button Group',
      view: (h, context) =>
        ButtonGroupDemo(h, { key: `${context.idPrefix}-group`, props: {} }),
      source,
    },
    {
      title: 'As Child',
      view: h => ButtonLink(h, { href: '/login' }).children('Login'),
      source,
    },
    {
      title: 'RTL',
      view: itemsExample(
        [
          { label: 'زر', variant: 'outline' },
          { label: 'حذف', variant: 'destructive' },
          {
            label: 'إرسال',
            variant: 'outline',
            icon: 'arrow-right',
            iconPosition: 'end',
            rtlFlip: true,
          },
          { variant: 'outline', size: 'icon', icon: 'plus', ariaLabel: 'Add' },
          {
            label: 'جاري التحميل',
            variant: 'secondary',
            disabled: true,
            spinner: 'start',
          },
        ],
        true,
      ),
      source,
    },
  ],
})
