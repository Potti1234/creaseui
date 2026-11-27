import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Checkbox, Table } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './checkbox.css'

const SingleMessage = UiSchema.TaggedEnum({
  Toggled: { checked: Schema.Boolean },
})
const singleDemo = (
  name: string,
  options: Readonly<{
    label: string
    initial?: boolean
    invalid?: boolean
    disabled?: boolean
    indeterminate?: boolean
    readOnly?: boolean
    description?: string
  }>,
) =>
  Html.component({
    name,
    model: Schema.Struct({
      checked: Schema.Boolean,
      indeterminate: Schema.Boolean,
    }),
    message: SingleMessage,
  }).make({
    init: () => ({
      checked: options.initial ?? false,
      indeterminate: options.indeterminate ?? false,
    }),
    update: {
      Toggled: ($, { checked }) => $.evolve({ checked, indeterminate: false }),
    },
    view: (h, model) =>
      Checkbox(h, {
        id: `${name}-checkbox`,
        label: options.label,
        ...(options.description === undefined
          ? {}
          : { description: options.description }),
        ...(options.invalid === true ? { invalid: true } : {}),
        props: {
          checked: model.checked,
          indeterminate: model.indeterminate,
          disabled: options.disabled,
          readOnly: options.readOnly,
          name: 'terms',
          value: 'accepted',
        },
        onEmit: {
          Toggled: ({ checked }) => SingleMessage.Toggled({ checked }),
        },
      }),
  })

const groupItems = [
  ['disks', 'Hard disks', true],
  ['external', 'External disks', true],
  ['drives', 'CDs/DVDs/iPods', false],
  ['servers', 'Connected servers', false],
] as const
const GroupMessage = UiSchema.TaggedEnum({
  ToggledItem: { item: Schema.String, checked: Schema.Boolean },
})
const GroupDemo = Html.component({
  name: 'DocsCheckboxGroupDemo',
  model: Schema.Struct({
    disks: Schema.Boolean,
    external: Schema.Boolean,
    drives: Schema.Boolean,
    servers: Schema.Boolean,
  }),
  message: GroupMessage,
}).make({
  init: () => ({ disks: true, external: true, drives: false, servers: false }),
  update: {
    ToggledItem: ($, { item, checked }) =>
      $.evolve({ [item]: checked } as never),
  },
  view: (h, model) =>
    h.div.class('checkbox-docs-frame').children(
      h.fieldset.class('checkbox-docs-fieldset').children(
        h.legend
          .class('checkbox-docs-legend')
          .children('Show these items on the desktop:'),
        h.p
          .class('checkbox-docs-description')
          .children('Select the items you want to show on the desktop.'),
        h.div.class('checkbox-docs-group').children(
          groupItems.map(([id, label]) =>
            Checkbox(h, {
              key: id,
              id: `desktop-${id}`,
              label,
              props: {
                checked: model[id],
                name: 'desktop-items',
                value: id,
              },
              onEmit: {
                Toggled: ({ checked }) =>
                  GroupMessage.ToggledItem({ item: id, checked }),
              },
            }),
          ),
        ),
      ),
    ),
})

const rows = [
  ['1', 'Sarah Chen', 'sarah.chen@example.com', 'Admin'],
  ['2', 'Marcus Rodriguez', 'marcus.rodriguez@example.com', 'User'],
  ['3', 'Priya Patel', 'priya.patel@example.com', 'User'],
  ['4', 'David Kim', 'david.kim@example.com', 'Editor'],
] as const
const TableMessage = UiSchema.TaggedEnum({
  ToggledRow: { id: Schema.String, checked: Schema.Boolean },
  ToggledAll: { checked: Schema.Boolean },
})
const TableDemo = Html.component({
  name: 'DocsCheckboxTableDemo',
  model: Schema.Struct({ selected: Schema.Array(Schema.String) }),
  message: TableMessage,
}).make({
  init: () => ({ selected: ['1'] }),
  update: {
    ToggledRow: ($, { id, checked }) =>
      $.evolve({
        selected: checked
          ? [...$.model.selected, id]
          : $.model.selected.filter(row => row !== id),
      }),
    ToggledAll: ($, { checked }) =>
      $.evolve({ selected: checked ? rows.map(([id]) => id) : [] }),
  },
  view: (h, model) =>
    h.div.class('checkbox-docs-table-frame').children(
      Table(h, {
        children: table => [
          table.header({
            children: [
              table.row({
                children: [
                  table.head({
                    children: [
                      Checkbox(h, {
                        key: 'select-all',
                        id: 'select-all',
                        ariaLabel: 'Select all rows',
                        props: {
                          checked: model.selected.length === rows.length,
                          name: 'select-all',
                        },
                        onEmit: {
                          Toggled: ({ checked }) =>
                            TableMessage.ToggledAll({ checked }),
                        },
                      }),
                    ],
                  }),
                  table.head({ children: ['Name'] }),
                  table.head({ children: ['Email'] }),
                  table.head({ children: ['Role'] }),
                ],
              }),
            ],
          }),
          table.body({
            children: rows.map(([id, name, email, role]) =>
              table.row({
                selected: model.selected.includes(id),
                children: [
                  table.cell({
                    children: [
                      Checkbox(h, {
                        key: `row-${id}`,
                        id: `row-${id}`,
                        ariaLabel: `Select ${name}`,
                        props: {
                          checked: model.selected.includes(id),
                          name: 'selected-rows',
                          value: id,
                        },
                        onEmit: {
                          Toggled: ({ checked }) =>
                            TableMessage.ToggledRow({ id, checked }),
                        },
                      }),
                    ],
                  }),
                  table.cell({ children: [name] }),
                  table.cell({ children: [email] }),
                  table.cell({ children: [role] }),
                ],
              }),
            ),
          }),
        ],
      }),
    ),
})

const source = exampleApplicationSource({
  imports: `import { Checkbox } from '@/ui/effect/ui'
import './checkbox.css'`,
  body: `Checkbox(h, {
  id: 'terms',
  label: 'Accept terms and conditions',
  props: { checked: model.accepted, name: 'terms', value: 'accepted' },
  onEmit: { Toggled: ({ checked }) => Message.ToggledTerms({ checked }) },
})`,
})

const singles: ReadonlyArray<
  readonly [string, Parameters<typeof singleDemo>[1], boolean]
> = [
  ['Demo', { label: 'Accept terms and conditions' }, false],
  [
    'Invalid State',
    { label: 'Accept terms and conditions', invalid: true },
    false,
  ],
  ['Basic', { label: 'Accept terms and conditions' }, false],
  [
    'Description',
    {
      label: 'Accept terms and conditions',
      initial: true,
      description:
        'By clicking this checkbox, you agree to the terms and conditions.',
    },
    false,
  ],
  ['Disabled', { label: 'Enable notifications', disabled: true }, false],
  ['RTL', { label: 'Accept terms and conditions' }, true],
  [
    'Indeterminate',
    { label: 'Select all components', indeterminate: true },
    false,
  ],
  [
    'Read only',
    {
      label: 'Account verified',
      initial: true,
      readOnly: true,
      description: 'This status is supplied by your identity provider.',
    },
    false,
  ],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Checkbox } from '@/ui/effect/ui'

Checkbox(h, {
  id: 'terms',
  label: 'Accept terms and conditions',
  props: { checked: model.accepted, name: 'terms' },
  onEmit: { Toggled: ({ checked }) => Message.ToggledTerms({ checked }) },
})`,
  examples: [
    ...singles
      .map(([title, options, rtl], index) => {
        const Demo = singleDemo(`DocsCheckbox${index}`, options)
        return {
          title,
          view: ((h, context) => {
            const checkbox = Demo(h, {
              key: `${context.idPrefix}-single`,
              props: {},
            })
            return rtl
              ? h.div.class('checkbox-docs-rtl').children(checkbox)
              : checkbox
          }) as DocsExampleImplementation['view'],
          source,
        }
      })
      .flatMap((entry, index) => {
        if (index < 5) return [entry]
        if (index === 5)
          return [
            {
              title: 'Group',
              view: ((h, context) =>
                GroupDemo(h, {
                  key: `${context.idPrefix}-group`,
                  props: {},
                })) as DocsExampleImplementation['view'],
              source,
            },
            {
              title: 'Table',
              view: ((h, context) =>
                TableDemo(h, {
                  key: `${context.idPrefix}-table`,
                  props: {},
                })) as DocsExampleImplementation['view'],
              source,
            },
            entry,
          ]
        return [entry]
      }),
  ],
})
