import {
  COMPONENT_GROUPS,
  canonicalComponentSlug,
  toSlug,
} from '../../../src/docs/component-metadata'

export const catalogPath = '/docs/components'
export const componentPath = (slug: string) => `${catalogPath}/${slug}`

export type DocsRoute =
  | { readonly tag: 'catalog' }
  | { readonly tag: 'component'; readonly slug: string; readonly title: string }
  | { readonly tag: 'not-found' }

export const docsRoute = (pathname: string): DocsRoute => {
  const path = pathname.replace(/\/+$/, '')
  if (path === '/docs' || path === '/docs/index.html' || path === catalogPath)
    return { tag: 'catalog' }
  const match = /^\/docs\/components\/([^/]+)$/.exec(path)
  if (match?.[1] === undefined) return { tag: 'not-found' }
  const slug = canonicalComponentSlug(match[1])
  const entry = catalogOrder.find(entry => entry.slug === slug)
  return entry === undefined
    ? { tag: 'not-found' }
    : { tag: 'component', slug, title: entry.title }
}

const fieldset = { title: 'Fieldset', slug: 'fieldset' }
export const catalogGroups = COMPONENT_GROUPS.map(({ label, components }) => ({
  label,
  entries: components.flatMap(title => {
    const entry = { title, slug: toSlug(title) }
    return title === 'Field Status' ? [entry, fieldset] : [entry]
  }),
}))
export const catalogOrder = catalogGroups.flatMap(group => group.entries)
export const legacyDocsOnly = new Set([
  'avoid-keyboard',
  'connect',
  'pointer-kind',
])

export const rendererChoices = [
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'stylex', label: 'StyleX' },
  { value: 'pleat', label: 'Pleat' },
] as const
export type DocsRenderer = (typeof rendererChoices)[number]['value']

export const docsRenderer = (mode: string): DocsRenderer =>
  mode === 'stylex' || mode === 'pleat' ? mode : 'tailwind'

export const rendererPath = (
  location: URL,
  current: DocsRenderer,
  target: DocsRenderer,
): string | undefined => {
  const path = location.pathname + location.search + location.hash
  if (current === target) return path
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
  if (!local) return undefined
  const port = Number(location.port)
  const base = port >= 4173 && port <= 4175 ? 4173 : 5181
  const index = rendererChoices.findIndex(choice => choice.value === target)
  const to = new URL(path, location)
  to.port = String(base + index)
  return to.href
}
