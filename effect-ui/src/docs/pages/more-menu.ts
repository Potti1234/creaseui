import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Icon, MoreMenu } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type ItemSpec = Readonly<{
  label: string
  icon?: 'copy' | 'pencil' | 'share' | 'trash-2'
  variant?: 'destructive'
}>
type OptionSpec =
  | ItemSpec
  | Readonly<{ type: 'divider' }>
  | Readonly<{ type: 'section'; title: string; items: readonly ItemSpec[] }>
type Fixture = Readonly<{
  variant?: 'secondary'
  label?: string
  options: readonly OptionSpec[]
}>

const fixtures: readonly Fixture[] = [
  {
    options: [{ label: 'Edit' }, { label: 'Duplicate' }, { label: 'Delete' }],
  },
  {
    options: [{ label: 'Edit' }, { label: 'Duplicate' }, { label: 'Delete' }],
  },
  {
    variant: 'secondary',
    options: [
      { label: 'Edit', icon: 'pencil' },
      { label: 'Duplicate', icon: 'copy' },
      { type: 'divider' },
      { label: 'Delete', icon: 'trash-2' },
    ],
  },
  {
    variant: 'secondary',
    label: 'Document actions',
    options: [
      {
        type: 'section',
        title: 'Actions',
        items: [
          { label: 'Edit', icon: 'pencil' },
          { label: 'Duplicate', icon: 'copy' },
        ],
      },
      {
        type: 'section',
        title: 'Danger zone',
        items: [{ label: 'Delete', icon: 'trash-2' }],
      },
    ],
  },
]

const itemSpec = <Msg>(
  h: Html.H<Msg>,
  spec: ItemSpec,
): {
  value: string
  label: string
  icon?: View.Input<Msg>
  variant?: 'destructive'
} => ({
  value: spec.label,
  label: spec.label,
  ...(spec.icon === undefined
    ? {}
    : { icon: Icon(h, { name: spec.icon, size: 'sm' }) }),
  ...(spec.variant === undefined ? {} : { variant: spec.variant }),
})

const Message = UiSchema.TaggedEnum({
  RequestedOpenMenu: {},
  RequestedCloseMenu: {},
  PickedMenuItem: { value: Schema.String },
})

const MoreMenuDemo = Html.component({
  name: 'DocsMoreMenuDemo',
  props: Schema.Struct({
    idPrefix: Schema.String,
    fixtureIndex: Schema.Number,
  }),
  model: Schema.Struct({
    open: Schema.Boolean,
    lastAction: Schema.NullOr(Schema.String),
  }),
  message: Message,
}).make({
  init: () => ({ open: false, lastAction: null }),
  update: {
    RequestedOpenMenu: $ => $.evolve({ open: true }),
    RequestedCloseMenu: $ => $.evolve({ open: false }),
    PickedMenuItem: ($, { value }) =>
      $.evolve({ open: false, lastAction: value }),
  },
  view: (h, model) => {
    const fixture = (fixtures[h.props.fixtureIndex] ?? fixtures[0]) as Fixture
    const items = fixture.options.map(option => {
      if ('type' in option && option.type === 'divider')
        return { type: 'divider' as const }
      if ('type' in option && option.type === 'section')
        return {
          type: 'section' as const,
          title: option.title,
          items: option.items.map(item => itemSpec(h, item)),
        }
      return itemSpec(h, option)
    })
    return h.div.class('grid justify-items-center gap-3').children(
      MoreMenu(h, {
        key: `${h.props.idPrefix}-more-menu`,
        items,
        ...(fixture.variant === undefined ? {} : { variant: fixture.variant }),
        ...(fixture.label === undefined ? {} : { label: fixture.label }),
        props: { open: model.open },
        onEmit: {
          RequestedOpen: () => Message.RequestedOpenMenu(),
          RequestedClose: () => Message.RequestedCloseMenu(),
          Picked: ({ value }) => Message.PickedMenuItem({ value }),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
      }),
      h.p
        .class('text-sm text-muted-foreground')
        .attr('role', 'status')
        .children(
          model.lastAction === null
            ? 'No action selected.'
            : `Last action: ${model.lastAction}`,
        ),
    )
  },
})

const fixtureIndexes = [0, 1, 2, 3] as const
const example =
  (
    fixtureIndex: (typeof fixtureIndexes)[number],
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    MoreMenuDemo(h, {
      key: `${context.idPrefix}-more-menu-demo`,
      props: { idPrefix: context.idPrefix, fixtureIndex },
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { MoreMenu } from '@/ui/effect/ui'`,
  body: `MoreMenu(h, {
  key: 'document-actions',
  items,
  props: { open: model.open },
  onEmit,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { MoreMenu } from '@/ui/effect/ui'\n\nMoreMenu(h, { key, items, props, onEmit })`,
  examples: [
    { title: 'MoreMenu', view: example(0), source },
    { title: 'MoreMenu — Default', view: example(1), source },
    { title: 'MoreMenu — With Dividers', view: example(2), source },
    { title: 'MoreMenu — With Sections', view: example(3), source },
  ],
})
