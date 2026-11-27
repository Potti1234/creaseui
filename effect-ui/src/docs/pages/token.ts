import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Badge, Icon, Token } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './token.css'

type Item = Readonly<{
  label: string
  color?:
    | 'default'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'cyan'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'gray'
  icon?: 'user' | 'star' | 'tag' | 'shield-check'
  endContent?: string
  disabled?: boolean
  click?: boolean
  remove?: boolean
}>
type Section = Readonly<{ label: string; items: ReadonlyArray<Item> }>

const colors = [
  'default',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'gray',
] as const
const colorItems = (disabled: boolean): ReadonlyArray<Item> =>
  colors.map(color => ({
    label:
      color === 'default'
        ? 'Default'
        : color.charAt(0).toUpperCase() + color.slice(1),
    color,
    ...(disabled ? { disabled: true } : {}),
  }))

const itemView = <Msg>(h: Html.H<Msg>, item: Item, interaction?: Msg) =>
  Token(h, {
    label: item.label,
    ...(item.color === undefined ? {} : { color: item.color }),
    ...(item.icon === undefined
      ? {}
      : { icon: Icon(h, { name: item.icon, size: 'xs' }) }),
    ...(item.endContent === undefined
      ? {}
      : {
          endContent: [
            Badge(h, { variant: 'secondary', children: [item.endContent] }),
          ],
        }),
    ...(item.disabled === true ? { disabled: true } : {}),
    ...(item.click === true && interaction !== undefined
      ? { onPress: interaction }
      : {}),
    ...(item.remove === true && interaction !== undefined
      ? { onRemove: interaction }
      : {}),
  })

const sectionsView = <Msg>(
  h: Html.H<Msg>,
  sections: ReadonlyArray<Section>,
  interaction?: Msg,
) => {
  const single = sections.length === 1 ? sections[0] : undefined
  if (single !== undefined && single.label === '')
    return h.div
      .class('token-docs-wrap')
      .children(single.items.map(item => itemView(h, item, interaction)))
  return h.div
    .class('token-docs-sections')
    .children(
      sections.map(section =>
        h.div
          .class('token-docs-section')
          .children(
            h.span.class('token-docs-caption').children(section.label),
            h.div
              .class('token-docs-row')
              .children(
                section.items.map(item => itemView(h, item, interaction)),
              ),
          ),
      ),
    )
}

const staticView =
  (sections: ReadonlyArray<Section>): DocsExampleImplementation['view'] =>
  h =>
    sectionsView(h, sections)

const Message = UiSchema.TaggedEnum({ InteractedWithToken: {} })
const InteractiveTokens = Html.component({
  name: 'DocsInteractiveTokens',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Null,
  message: Message,
}).make({
  init: () => null,
  update: { InteractedWithToken: $ => $.model },
  view: h => {
    const sections =
      h.props.kind === 'click'
        ? clickSections
        : h.props.kind === 'basic'
          ? tokenSections
          : removeSections
    return sectionsView(h, sections, Message.InteractedWithToken())
  },
})

const interactive =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    InteractiveTokens(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind },
    })

const tokenSections: ReadonlyArray<Section> = [
  {
    label: '',
    items: [
      { label: 'Default' },
      { label: 'Removable', color: 'blue', remove: true },
      { label: 'Design', color: 'purple', icon: 'tag' },
    ],
  },
]
const clickSections: ReadonlyArray<Section> = [
  {
    label: 'Click a token to view details',
    items: [
      { label: 'Bug', color: 'red', click: true },
      { label: 'Feature', color: 'blue', click: true },
      { label: 'Enhancement', color: 'green', click: true },
      { label: 'Documentation', color: 'gray', click: true },
    ],
  },
]
const endSections: ReadonlyArray<Section> = [
  {
    label: 'Trailing badges for counts or status',
    items: [
      { label: 'Inbox', color: 'blue', endContent: '12' },
      { label: 'Reviews', color: 'purple', endContent: '3' },
      { label: 'Resolved', color: 'green', endContent: 'Done' },
    ],
  },
]
const iconSections: ReadonlyArray<Section> = [
  {
    label: 'Icons identify the token category',
    items: [
      { label: 'Sarah Chen', color: 'blue', icon: 'user' },
      { label: 'Featured', color: 'yellow', icon: 'star' },
      { label: 'Design', color: 'purple', icon: 'tag' },
      { label: 'Verified', color: 'green', icon: 'shield-check' },
    ],
  },
]
const removeSections: ReadonlyArray<Section> = [
  {
    label: 'Active filters',
    items: [
      { label: 'Status: Open', color: 'green', remove: true },
      { label: 'Priority: High', color: 'red', remove: true },
      { label: 'Team: Design', color: 'purple', remove: true },
    ],
  },
  {
    label: 'Selected recipients',
    items: [
      { label: 'Sarah Chen', color: 'blue', remove: true },
      { label: 'Alex Rivera', color: 'blue', remove: true },
      { label: 'Jordan Lee', color: 'blue', remove: true },
    ],
  },
]

const source = exampleApplicationSource({
  imports: `import { Token } from '@/ui/effect/ui'
import './token.css'`,
  body: `Token(h, {
  label: 'Design',
  color: 'purple',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Token } from '@/ui/effect/ui'

Token(h, { label: 'Design', color: 'purple' })`,
  examples: [
    { title: 'Token', view: interactive('basic'), source },
    { title: 'Token — Clickable', view: interactive('click'), source },
    {
      title: 'Token — Colors',
      view: staticView([
        { label: 'Default', items: colorItems(false) },
        { label: 'Disabled', items: colorItems(true) },
      ]),
      source,
    },
    { title: 'Token — End Content', view: staticView(endSections), source },
    { title: 'Token — Icon', view: staticView(iconSections), source },
    { title: 'Token — Removable', view: interactive('remove'), source },
  ],
})
