import type { DocsExample } from '@/docs/components/page-definition'
import { pleatExamples } from '@/docs/components/pleat-source'
import { staticComponentApplication } from '@/docs/components/pages/authored-page'

export type IconItem = Readonly<{
  name:
    | 'arrow-right'
    | 'badge-check'
    | 'bell'
    | 'bookmark'
    | 'mail'
    | 'search'
    | 'settings'
    | 'star'
  size?: 'sm' | 'md' | 'lg'
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
      'sm (16px, the default), md (20px) and lg (24px). Icons inherit the surrounding text color.',
    items: [
      { name: 'star', size: 'sm' },
      { name: 'star', size: 'md' },
      { name: 'star', size: 'lg' },
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
]

const itemSource = (item: IconItem): string => {
  const props = [`name: '${item.name}'`]
  if (item.size !== undefined) props.push(`size: '${item.size}'`)
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
