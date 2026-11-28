import { Badge, Icon, Spinner } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './badge.css'

type Variant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link'
type Palette = 'blue' | 'green' | 'sky' | 'purple' | 'red'
type Item = Readonly<{
  label: string
  variant?: Variant
  icon?: Readonly<{
    name: 'badge-check' | 'bookmark' | 'arrow-up-right'
    position: 'start' | 'end'
  }>
  spinner?: 'start' | 'end'
  href?: string
  palette?: Palette
}>

const basic: ReadonlyArray<Item> = [
  { label: 'Badge' },
  { label: 'Secondary', variant: 'secondary' },
  { label: 'Destructive', variant: 'destructive' },
  { label: 'Outline', variant: 'outline' },
]
const variants: ReadonlyArray<Item> = [
  ...basic,
  { label: 'Ghost', variant: 'ghost' },
]
const icons: ReadonlyArray<Item> = [
  {
    label: 'Verified',
    variant: 'secondary',
    icon: { name: 'badge-check', position: 'start' },
  },
  {
    label: 'Bookmark',
    variant: 'outline',
    icon: { name: 'bookmark', position: 'end' },
  },
]
const spinners: ReadonlyArray<Item> = [
  { label: 'Deleting', variant: 'destructive', spinner: 'start' },
  { label: 'Generating', variant: 'secondary', spinner: 'end' },
]
const links: ReadonlyArray<Item> = [
  {
    label: 'Open Link',
    href: '#link',
    icon: { name: 'arrow-up-right', position: 'end' },
  },
]
const palettes: ReadonlyArray<Item> = [
  { label: 'Blue', palette: 'blue' },
  { label: 'Green', palette: 'green' },
  { label: 'Sky', palette: 'sky' },
  { label: 'Purple', palette: 'purple' },
  { label: 'Red', palette: 'red' },
]
const rtl: ReadonlyArray<Item> = [
  { label: 'شارة' },
  { label: 'ثانوي', variant: 'secondary' },
  { label: 'مدمر', variant: 'destructive' },
  { label: 'مخطط', variant: 'outline' },
  {
    label: 'متحقق',
    variant: 'secondary',
    icon: { name: 'badge-check', position: 'start' },
  },
  {
    label: 'إشارة مرجعية',
    variant: 'outline',
    icon: { name: 'bookmark', position: 'end' },
  },
]

type H = Parameters<DocsExampleImplementation['view']>[0]
const badge = (h: H, item: Item) => {
  const icon = (position: 'start' | 'end') =>
    item.icon === undefined || item.icon.position !== position
      ? undefined
      : Icon(h, { name: item.icon.name, dataIcon: `inline-${position}` })
  const spinner = (position: 'start' | 'end') =>
    item.spinner !== position
      ? undefined
      : Spinner(h, {
          size: 'sm',
          isDecorative: true,
          dataIcon: `inline-${position}`,
        })
  return Badge(h, {
    ...(item.variant === undefined ? {} : { variant: item.variant }),
    ...(item.href === undefined ? {} : { href: item.href }),
    ...(item.palette === undefined
      ? {}
      : { className: `badge-docs-${item.palette}` }),
    children: [
      icon('start'),
      spinner('start'),
      item.label,
      spinner('end'),
      icon('end'),
    ],
  })
}

const row =
  (
    items: ReadonlyArray<Item>,
    centered = false,
    rtlDirection = false,
  ): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(
        `badge-docs-row${centered ? ' badge-docs-centered' : ''}${rtlDirection ? ' badge-docs-rtl' : ''}`,
      )
      .children(items.map(item => badge(h, item)))

const badgeSource = (items: ReadonlyArray<Item>) =>
  exampleApplicationSource({
    imports: `import { Badge, Icon, Spinner } from '@/ui/effect/ui'
import './badge.css'`,
    body: `h.div.class('badge-docs-row').children(
  ${items
    .map(
      item => `Badge(h, { children: [
    '${item.label}',
  ] })`,
    )
    .join(',\n  ')},
)`,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Badge } from '@/ui/effect/ui'

Badge(h, { variant: 'secondary', children: ['Beta'] })`,
  examples: [
    { title: 'Basic', view: row(basic, true), source: badgeSource(basic) },
    { title: 'Variants', view: row(variants), source: badgeSource(variants) },
    { title: 'With Icon', view: row(icons), source: badgeSource(icons) },
    {
      title: 'With Spinner',
      view: row(spinners),
      source: badgeSource(spinners),
    },
    { title: 'Link', view: row(links), source: badgeSource(links) },
    {
      title: 'Custom Colors',
      view: row(palettes),
      source: badgeSource(palettes),
    },
    { title: 'RTL', view: row(rtl, true, true), source: badgeSource(rtl) },
  ],
})
