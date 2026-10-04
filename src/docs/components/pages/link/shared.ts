import type { DocsExample } from '@/docs/components/page-definition'
import { staticComponentApplication } from '@/docs/components/pages/authored-page'

export type LinkExampleKind = 'showcase' | 'inline' | 'external' | 'tooltips'

export type LinkFixture = Readonly<{
  title: string
  description?: string
  kind: LinkExampleKind
}>

/* Example set ported from Meta Astryx
   packages/cli/assets/templates/blocks/components/Link/*.tsx — same demos,
   same labels and copy. */
export const linkFixtures: Readonly<[LinkFixture, ...Array<LinkFixture>]> = [
  {
    title: 'Link',
    description: 'Standalone link with accent styling',
    kind: 'showcase',
  },
  {
    title: 'Link — Inline Text',
    description: 'Inline link embedded in body text',
    kind: 'inline',
  },
  {
    title: 'Link — External Links',
    description: 'External links with automatic icon and accessibility label',
    kind: 'external',
  },
  {
    title: 'Link — With Tooltips',
    description: 'Links with descriptive tooltips for enhanced context',
    kind: 'tooltips',
  },
]

const externalLinks = [
  ['GitHub', 'https://github.com', false],
  ['MDN', 'https://developer.mozilla.org', false],
  ['Foldkit', 'https://foldkit.dev', true],
] as const

const tooltipLinks = [
  ['Settings', '/settings', 'Manage your application preferences'],
  ['Profile', '/profile', 'View and edit your profile'],
  ['Help', '/help', 'Browse help articles and support'],
] as const

const viewBody = (fixture: LinkFixture, isStyleX: boolean): string => {
  const stack = (items: string) =>
    `h.div(
      [h.Class(${isStyleX ? 'className(styles.column)' : "'flex flex-col gap-2 items-start'"})],
      [
        ${items},
      ],
    )`

  switch (fixture.kind) {
    case 'showcase':
      return `Link.link({ href: '#', isStandalone: true, children: ['Documentation'] }, h)`
    case 'inline':
      return `Text.text(
      { type: 'body', display: 'block', children: [
        'Browse the ',
        Link.link({ href: '#', children: ['documentation'] }, h),
        ' for installation steps.',
      ] },
      h,
    )`
    case 'external':
      return stack(
        externalLinks
          .map(
            ([label, url, underlined]) =>
              `Link.link({ href: '${url}', isExternalLink: true, isStandalone: true${underlined ? ', hasUnderline: true' : ''}, children: ['${label}'] }, h)`,
          )
          .join(',\n        '),
      )
    case 'tooltips':
      return stack(
        tooltipLinks
          .map(
            ([label, url, tip], index) =>
              `Link.link({ href: '${url}', isStandalone: true, tooltip: '${tip}'${index === 2 ? ", color: 'secondary'" : ''}, children: ['${label}'] }, h)`,
          )
          .join(',\n        '),
      )
  }
}

const stylexStyles =
  "column: { alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: '0.5rem' }"

const source = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const fixture = linkFixtures[index] ?? linkFixtures[0]
  const isStyleX = renderer === 'stylex'
  const base = isStyleX ? 'stylex' : 'ui'
  const imports: string[] = []
  if (isStyleX) {
    imports.push(
      `import * as stylex from '@stylexjs/stylex'`,
      `import { className } from '@/stylex/style'`,
    )
  }
  if (fixture.kind === 'inline') {
    imports.push(`import * as Text from '@/${base}/text'`)
  }
  const needsStack = fixture.kind === 'external' || fixture.kind === 'tooltips'
  const componentImports = [
    ...imports,
    ...(isStyleX && needsStack
      ? [``, `const styles = stylex.create({\n  ${stylexStyles}\n})`]
      : []),
  ].join('\n')
  return staticComponentApplication({
    componentName: 'Link',
    componentSlug: 'link',
    renderer,
    exampleName: fixture.title,
    ...(componentImports === '' ? {} : { componentImports }),
    viewBody: viewBody(fixture, isStyleX),
  })
}

export const linkExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  linkFixtures.map((fixture, index) => ({
    title: fixture.title,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    code: source(index, renderer),
  }))
