import type { DocsExample } from '@/docs/components/page-definition'
import { pleatExamples } from '@/docs/components/pleat-source'
import { staticComponentApplication } from '@/docs/components/pages/authored-page'

export type IconItem = Readonly<{
  name:
    | 'arrow-right'
    | 'badge-check'
    | 'bell'
    | 'bookmark'
    | 'chevron-down'
    | 'clock'
    | 'mail'
    | 'search'
    | 'settings'
    | 'star'
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'muted' | 'primary'
  filled?: boolean
  rotation?: 0 | 90 | 180
  ariaLabel?: string
}>

export type IconFixture = Readonly<{
  title: string
  description: string
  items: ReadonlyArray<IconItem>
  text?: string
}>

export const iconFixtures: Readonly<[IconFixture, ...Array<IconFixture>]> = [
  {
    title: 'Icon',
    description:
      'Render any Lucide icon by name. Without a label the icon is decorative and hidden from screen readers.',
    items: [
      { name: 'search' },
      { name: 'bell' },
      { name: 'mail' },
      { name: 'settings' },
      { name: 'bookmark' },
      { name: 'star' },
    ],
  },
  {
    title: 'Sizes',
    description:
      '3xs (8px), 2xs (12px), xs (14px), sm (16px), md (20px), lg (24px) and xl (32px). Without a size the icon follows the surrounding text or the slot it sits in.',
    items: [
      { name: 'star', size: '3xs' },
      { name: 'star', size: '2xs' },
      { name: 'star', size: 'xs' },
      { name: 'star', size: 'sm' },
      { name: 'star', size: 'md' },
      { name: 'star', size: 'lg' },
      { name: 'star', size: 'xl' },
    ],
  },
  {
    title: 'Tone',
    description:
      'Icons inherit the surrounding text color. tone: muted uses the muted foreground color for secondary icons.',
    items: [
      { name: 'clock', size: 'sm' },
      { name: 'clock', size: 'sm', tone: 'muted' },
    ],
  },
  {
    title: 'With text',
    description:
      'Place decorative icons next to a visible label; the label names the content.',
    items: [{ name: 'badge-check' }, { name: 'arrow-right' }],
    text: 'Verified',
  },
  {
    title: 'Accessible label',
    description:
      'A standalone icon that carries meaning needs ariaLabel, which renders role="img" with that name.',
    items: [{ name: 'badge-check', size: 'md', ariaLabel: 'Verified account' }],
  },
  {
    title: 'Filled and rotated',
    description:
      'filled fills the glyph with its colour, e.g. an active star with tone: primary. rotation turns a glyph by 90 or 180 degrees, e.g. a disclosure chevron; the change animates unless reduced motion is requested.',
    items: [
      { name: 'star', size: 'md' },
      { name: 'star', size: 'md', tone: 'primary', filled: true },
      { name: 'chevron-down', size: 'md' },
      { name: 'chevron-down', size: 'md', rotation: 90 },
      { name: 'chevron-down', size: 'md', rotation: 180 },
    ],
  },
]

const itemSource = (item: IconItem): string => {
  const props = [`name: '${item.name}'`]
  if (item.size !== undefined) props.push(`size: '${item.size}'`)
  if (item.tone !== undefined) props.push(`tone: '${item.tone}'`)
  if (item.filled === true) props.push(`filled: true`)
  if (item.rotation !== undefined) props.push(`rotation: ${item.rotation}`)
  if (item.ariaLabel !== undefined) props.push(`ariaLabel: '${item.ariaLabel}'`)
  return `Icon.icon({ ${props.join(', ')} }, h)`
}

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex' | 'pleat',
): string => {
  const fixture = iconFixtures[index] ?? iconFixtures[0]
  const isStyleX = renderer !== 'tailwind'
  const componentImports = isStyleX
    ? [
        `import * as stylex from '@stylexjs/stylex'`,
        ``,
        `const styles = stylex.create({ row: { display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.875rem' } })`,
      ].join('\n')
    : ''
  const icons = fixture.items.map(itemSource)
  const children =
    fixture.text === undefined
      ? icons
      : [icons[0], `'${fixture.text}'`, ...icons.slice(1)]
  const viewBody = `h.div(
      [h.Class(${isStyleX ? "stylex.props(styles.row).className ?? ''" : "'flex items-center gap-3 text-sm'"})],
      [
        ${children.join(',\n        ')},
      ],
    )`
  return staticComponentApplication({
    componentName: 'Icon',
    componentSlug: 'icon',
    renderer,
    exampleName: fixture.title,
    componentImports,
    viewBody,
  })
}

const iconExamplesFor = (
  renderer: 'tailwind' | 'stylex' | 'pleat',
): ReadonlyArray<DocsExample> =>
  iconFixtures.map((fixture, index) => ({
    title: fixture.title,
    description: fixture.description,
    code: source(index, renderer),
  }))

export const iconExamples = (
  renderer: 'tailwind' | 'stylex' | 'pleat',
): ReadonlyArray<DocsExample> =>
  pleatExamples(renderer, iconExamplesFor(renderer))
