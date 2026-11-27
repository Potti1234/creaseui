import type { Html as HtmlTypes } from '@effect/ui/html'
import { BrowserHost, Html, HtmlSubscription } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'

import { CodeBlock } from '#components'
import {
  behaviors,
  componentBehaviors,
  type BehaviorEntry,
} from '../../../src/docs/generated-behavior-docs'
import { componentDocsPages } from './component-pages'
import { guides } from './guides'
import { pageMetadata } from './page-metadata'
import {
  DocsMessage,
  type DocsExampleImplementation,
  type DocsGuide,
} from './types'
import {
  catalogGroups,
  catalogOrder,
  catalogPath,
  componentPath,
  docsRenderer,
  docsRoute,
  rendererChoices,
  rendererPath,
} from './routes'
import '#theme'
import './styles.css'

const location = new URL(window.location.href)
const route = docsRoute(location.pathname)
const guidePath = location.pathname.replace(/\/+$/, '')
const guide = guides[guidePath]
const renderer = docsRenderer(import.meta.env.MODE)
if (
  route.tag === 'component' &&
  location.pathname !== componentPath(route.slug)
) {
  location.pathname = componentPath(route.slug)
  history.replaceState(history.state, '', location)
}

const pageTitle =
  guide?.title ?? (route.tag === 'component' ? route.title : 'Components')
document.title = `${pageTitle} · CreaseUI for Effect UI`

type DocHtml = HtmlTypes.H<DocsMessage>

type ExampleMetadata = Readonly<{
  title: string
  description?: string
  sectionId?: string
  heroOnly?: boolean
  keepIdsCanonical?: boolean
  previewClass?: string
  previewLayout?: 'full-bleed'
}>

type PageMetadata = Readonly<{
  slug: string
  title: string
  kind: 'helper' | 'submodel' | 'recipe'
  description: string
  architecture?: string
  usage?: string
  styling?: string
  accessibility?: string
  keyboard?: ReadonlyArray<readonly [string, string]>
  composition?: string
  sections?: ReadonlyArray<
    Readonly<{ id: string; title: string; description: string; code?: string }>
  >
  apiHref?: string
  apiDescription?: string
  examples: ReadonlyArray<ExampleMetadata>
}>

const metadataBySlug = pageMetadata as unknown as Record<string, PageMetadata>
const behaviorBySlug = new Map(behaviors.map(entry => [entry.slug, entry]))
const effectText = (value: string): string =>
  value.replaceAll('Foldkit', 'Effect UI').replaceAll('foldkit', 'effect-ui')

const slugify = (value: string) => value.toLowerCase().replaceAll(' ', '-')

const docsMain = (h: DocHtml) =>
  h.main.class('docs-main').attrs({ id: 'docs-main', tabindex: '-1' })

const guideLinks = [
  { href: '/docs/getting-started', label: 'Get Started' },
  { href: '/docs/theming', label: 'Theming' },
  { href: '/docs/lint', label: 'Lint rules' },
  { href: '/docs/tutorial', label: 'Tutorial' },
]

const componentLink = (
  h: DocHtml,
  { title, slug }: (typeof catalogOrder)[number],
) =>
  h.a
    .class('docs-nav-link')
    .attrs({
      href: componentPath(slug),
      'aria-current':
        route.tag === 'component' && route.slug === slug ? 'page' : undefined,
    })
    .children(title)

const groupedEntries = (query: string) => {
  const terms = query.trim().toLowerCase().split(/\s+/)
  return catalogGroups.flatMap(group => {
    const entries = group.entries.filter(({ title, slug }) =>
      terms.every(
        term => title.toLowerCase().includes(term) || slug.includes(term),
      ),
    )
    return entries.length === 0 ? [] : [{ ...group, entries }]
  })
}

const behaviorLinks = (h: DocHtml) => {
  const primitives = behaviors
    .filter(entry => entry.kind === 'primitive')
    .slice()
    .sort((left, right) => left.title.localeCompare(right.title, 'en'))
  return h.div.class('docs-nav-group').children(
    h.h2.class('docs-nav-group-title').children('Behaviors'),
    h.ul.children(
      h.li.key('all-behaviors').children(
        h.a
          .class('docs-nav-link')
          .attrs({
            href: '/docs/behaviors',
            'aria-current':
              guidePath === '/docs/behaviors' ? 'page' : undefined,
          })
          .children('All Behaviors'),
      ),
      primitives.map(entry =>
        h.li.key(entry.slug).children(
          h.a
            .class('docs-nav-link')
            .attrs({
              href: entry.docs,
              'aria-current': guidePath === entry.docs ? 'page' : undefined,
            })
            .children(entry.title),
        ),
      ),
    ),
  )
}

const sidebar = (
  h: DocHtml,
  query: string,
  groups: ReturnType<typeof groupedEntries>,
) =>
  h.nav
    .class('docs-component-nav')
    .attr('aria-label', 'Documentation')
    .children(
      h.div.class('docs-nav-group').children(
        h.ul.children(
          guideLinks.map(({ href, label }) =>
            h.li.key(href).children(
              h.a
                .class('docs-nav-link')
                .attrs({
                  href,
                  'aria-current': guidePath === href ? 'page' : undefined,
                })
                .children(label),
            ),
          ),
        ),
      ),
      groups.map(({ label, entries }) =>
        h.div
          .key(label)
          .class('docs-nav-group')
          .children(
            h.h2.class('docs-nav-group-title').children(label),
            h.ul.children(
              entries.map(entry =>
                h.li.key(entry.slug).children(componentLink(h, entry)),
              ),
            ),
          ),
      ),
      behaviorLinks(h),
      groups.length === 0
        ? h.p
            .attr('role', 'status')
            .children('No components match your search.')
        : undefined,
    )

const docsHeader = (h: DocHtml, dark: boolean) =>
  h.header.class('docs-header').children(
    h.div.class('docs-frame', 'docs-header-content').children(
      h.a
        .class('docs-brand')
        .attr('href', '/docs/getting-started')
        .children('crease/ui'),
      h.nav
        .class('docs-global-nav')
        .attr('aria-label', 'Documentation')
        .children(
          h.a.attr('href', '/docs/getting-started').children('Docs'),
          h.a.attr('href', '/create').children('Create'),
          h.a.attr('href', '/charts/area').children('Charts'),
          h.a.attr('href', '/blocks').children('Blocks'),
        ),
      h.div.class('docs-header-actions').children(
        h.button
          .class('docs-search-trigger')
          .attrs({
            type: 'button',
            'aria-label': 'Search documentation',
          })
          .on('click', () => DocsMessage.OpenedSearch())
          .children(
            h.span.children('⌕'),
            h.span.class('docs-search-label').children('Search docs…'),
            h.kbd.children('Ctrl/⌘ K'),
          ),
        h.a
          .class('docs-github-link')
          .attrs({
            href: 'https://github.com/Potti1234/creaseui',
            target: '_blank',
            rel: 'noreferrer',
            'aria-label': 'GitHub repository',
          })
          .children('GitHub'),
        h.nav
          .class('docs-renderers')
          .attr('aria-label', 'Renderer')
          .children(
            rendererChoices.map(({ value, label }) => {
              const href = rendererPath(location, renderer, value)
              return href === undefined
                ? h.span.children(label)
                : h.a
                    .attrs({
                      href,
                      'aria-current': value === renderer ? 'true' : undefined,
                    })
                    .children(label)
            }),
          ),
        h.button
          .class('docs-theme-toggle')
          .attrs({
            type: 'button',
            'aria-label': dark
              ? 'Switch to light theme'
              : 'Switch to dark theme',
            title: dark ? 'Switch to light theme' : 'Switch to dark theme',
          })
          .on('click', () => {
            window.localStorage.setItem(
              'creaseui-effect-docs-theme',
              dark ? 'light' : 'dark',
            )
            return DocsMessage.ToggledTheme()
          })
          .children(dark ? '☀' : '☾'),
      ),
    ),
  )

const catalog = (h: DocHtml, groups: ReturnType<typeof groupedEntries>) =>
  docsMain(h).children(
    h.h1.children('Components'),
    h.p
      .class('docs-description')
      .children('Browse CreaseUI components for Effect UI.'),
    groups.map(({ label, entries }) =>
      h.section
        .key(label)
        .class('docs-category')
        .children(
          h.h2.children(label),
          h.ul
            .class('docs-directory')
            .children(
              entries.map(entry =>
                h.li.key(entry.slug).children(componentLink(h, entry)),
              ),
            ),
        ),
    ),
    groups.length === 0
      ? h.p.children('No components match your search.')
      : undefined,
  )

const sectionHeading = (h: DocHtml, id: string, title: string) =>
  h.h2.class('docs-section-heading').children(
    title,
    h.a
      .class('docs-heading-link')
      .attrs({ href: `#${id}`, 'aria-label': `Link to ${title}` })
      .children('#'),
  )

const codePanel = (
  h: DocHtml,
  id: string,
  code: string,
  language = 'typescript',
) => {
  const inputId = `${id}-toggle`
  return h.div.class('docs-code-panel').children(
    h.input.class('docs-code-checkbox').attrs({
      id: inputId,
      type: 'checkbox',
    }),
    h.div.class('docs-code-clip').children(
      CodeBlock(h, {
        id: `${id}-code`,
        language,
        languageLabel: false,
        props: { code },
        width: '100%',
        container: 'section',
      }),
    ),
    h.label
      .class('docs-code-expander')
      .attrs({ for: inputId })
      .children(
        h.span.class('docs-view-code').children('View Code'),
        h.span.class('docs-hide-code').children('Hide Code'),
      ),
  )
}

const exampleCardWithSource = (
  h: DocHtml,
  slug: string,
  meta: ExampleMetadata,
  index: number,
  instance: 'hero' | 'section',
  implementation: DocsExampleImplementation,
) => {
  const idPrefix = `docs-${slug}-${String(index)}-${instance}`
  return h.div
    .class('docs-example-card')
    .attr('data-layout', meta.previewLayout)
    .children(
      h.div
        .class('docs-example-stage', meta.previewClass)
        .attr('data-example-preview', '')
        .children(
          implementation.view(h, { exampleIndex: index, instance, idPrefix }),
        ),
      codePanel(
        h,
        idPrefix,
        `// ${metadataBySlug[slug]?.title ?? slug} — ${implementation.title}\n${implementation.source}`,
      ),
    )
}

const behaviorListFor = (h: DocHtml, slug: string) => {
  const keys = componentBehaviors[slug]?.[renderer] ?? []
  const related = keys.flatMap(key => {
    const entry = behaviorBySlug.get(key)
    return entry?.kind === 'primitive' ? [entry] : []
  })
  return related.length === 0
    ? h.p.class('docs-muted').children('No shared behaviors.')
    : h.ul
        .class('docs-compact-list')
        .children(
          related.map(entry =>
            h.li
              .key(entry.slug)
              .children(
                h.a
                  .class('docs-inline-link')
                  .attr('href', entry.docs)
                  .children(entry.title),
                h.span.class('docs-muted').children(` ${entry.description}`),
              ),
          ),
        )
}

const implementationSections = (h: DocHtml, slug: string) => {
  const entries = behaviors.filter(entry => entry.owner === slug)
  if (entries.length === 0) return undefined
  return h.section
    .attr('id', 'implementation')
    .class('docs-section')
    .children(
      sectionHeading(h, 'implementation', 'Implementation'),
      entries.map((entry: BehaviorEntry) =>
        h.article
          .key(entry.slug)
          .class('docs-implementation-entry')
          .children(
            h.h3.children(entry.title),
            h.p.class('docs-muted').children(entry.description),
            h.a
              .class('docs-inline-link')
              .attr(
                'href',
                `https://github.com/Potti1234/creaseui/blob/codex/effect-ui-port/effect-ui/src/behaviors/${entry.slug}.ts`,
              )
              .children('View implementation source'),
          ),
      ),
    )
}

const migrationNotice = (h: DocHtml, missing: number, expected: number) =>
  missing === 0
    ? undefined
    : h.div
        .class('docs-pending')
        .children(
          h.p.children(
            `${String(missing)} of ${String(expected)} live examples for this page are still awaiting their Effect UI port.`,
          ),
        )

const component = (h: DocHtml, slug: string, title: string) => {
  const metadata = metadataBySlug[slug]
  const docs = componentDocsPages[slug]
  const entries = (metadata?.examples ?? []).map((meta, index) => {
    const implementation = docs?.examples[index]
    return {
      meta,
      index,
      implementation:
        implementation?.title === meta.title ? implementation : undefined,
    }
  })
  const missing = entries.filter(
    entry => entry.implementation === undefined,
  ).length
  const visibleEntries = entries.filter(entry => entry.meta.heroOnly !== true)
  const heroEntry =
    entries.find(entry => entry.meta.heroOnly === true) ?? entries[0]
  const index = catalogOrder.findIndex(entry => entry.slug === slug)
  const previous = catalogOrder[index - 1]
  const next = catalogOrder[index + 1]
  const pageLink = (entry: typeof previous, relation: string) =>
    entry === undefined
      ? undefined
      : h.a
          .attrs({ href: componentPath(entry.slug), rel: relation })
          .children(
            h.span.children(relation === 'prev' ? 'Previous' : 'Next'),
            entry.title,
          )

  if (metadata === undefined) {
    return docsMain(h).children(
      h.h1.children(title),
      h.div
        .class('docs-pending')
        .children(h.p.children('Metadata for this component is missing.')),
    )
  }

  const toc = [
    ['architecture', 'Architecture'],
    ['behaviors', 'Behaviors'],
    ['implementation', 'Implementation'],
    ['installation', 'Installation'],
    ['usage', 'Usage'],
    ...(metadata.sections ?? []).map(
      section => [section.id, section.title] as const,
    ),
    ['composition', 'Composition'],
    ...visibleEntries.map(({ meta, index: exampleIndex }) => {
      const baseId = meta.sectionId ?? slugify(meta.title)
      const id = visibleEntries.some(
        (entry, index) =>
          index !== exampleIndex &&
          (entry.meta.sectionId ?? slugify(entry.meta.title)) === baseId,
      )
        ? `${baseId}-${String(exampleIndex)}`
        : baseId
      return [id, meta.title] as const
    }),
    ...(metadata.styling === undefined
      ? []
      : [['styling', 'Styling'] as const]),
    ...(metadata.keyboard === undefined
      ? []
      : [['keyboard-interaction', 'Keyboard'] as const]),
    ...(metadata.accessibility === undefined
      ? []
      : [['accessibility', 'Accessibility'] as const]),
    ['api-reference', 'API Reference'],
  ]

  const usage =
    docs?.usage ??
    `// Effect UI usage documentation for ${title} is being migrated.\n// The live examples below are the authoritative reference.`

  return h.div.class('docs-component-grid').children(
    docsMain(h).children(
      h.nav
        .class('docs-breadcrumb')
        .attr('aria-label', 'Breadcrumb')
        .children(
          h.a.attr('href', '/docs/getting-started').children('Docs'),
          h.span.attr('aria-hidden', 'true').children('/'),
          h.a.attr('href', catalogPath).children('Components'),
          h.span.attr('aria-hidden', 'true').children('/'),
          h.span.attr('aria-current', 'page').children(title),
        ),
      h.header.class('docs-page-header').children(
        h.h1.children(title),
        h.p
          .class('docs-description')
          .children(effectText(metadata.description)),
        h.div.class('docs-page-meta').children(
          h.span
            .class('docs-kind-badge')
            .children(
              metadata.kind === 'helper'
                ? 'Stateless helper'
                : metadata.kind === 'submodel'
                  ? 'Stateful submodel'
                  : 'Composed recipe',
            ),
          h.span.class('docs-muted').children('Installed as source'),
          h.a
            .class('docs-inline-link')
            .attr(
              'href',
              metadata.apiHref?.includes('foldkit.dev') === true
                ? 'https://github.com/Effect-TS/ui'
                : (metadata.apiHref ?? 'https://github.com/Effect-TS/ui'),
            )
            .children(effectText(metadata.apiDescription ?? 'API reference')),
          h.a
            .class('docs-inline-link')
            .attr(
              'href',
              `https://github.com/Potti1234/creaseui/blob/codex/effect-ui-port/effect-ui/src/ui/${slug}.ts`,
            )
            .children('Source'),
        ),
      ),
      migrationNotice(h, missing, entries.length),
      heroEntry?.implementation === undefined
        ? undefined
        : h.div
            .class('docs-hero')
            .children(
              exampleCardWithSource(
                h,
                slug,
                heroEntry.meta,
                heroEntry.index,
                'hero',
                heroEntry.implementation,
              ),
            ),
      h.section
        .attr('id', 'architecture')
        .class('docs-architecture')
        .children(
          h.div.children(
            h.h2.children('How it fits Effect UI'),
            h.p
              .class('docs-muted')
              .children(
                effectText(
                  metadata.architecture ??
                    'Architecture documentation is pending.',
                ),
              ),
          ),
          h.code.children(metadata.kind),
        ),
      h.section
        .attr('id', 'behaviors')
        .class('docs-section')
        .children(
          sectionHeading(h, 'behaviors', 'Behaviors'),
          behaviorListFor(h, slug),
        ),
      implementationSections(h, slug),
      h.section
        .attr('id', 'installation')
        .class('docs-section')
        .children(
          sectionHeading(h, 'installation', 'Installation'),
          h.p
            .class('docs-muted')
            .children(
              'CLI (npm / pnpm / yarn / bun) · Manual: copy the registry-owned source into your app',
            ),
          codePanel(
            h,
            `docs-${slug}-installation`,
            `npx shadcn@latest add @crease-effect/effect-${slug}`,
            'bash',
          ),
        ),
      h.section
        .attr('id', 'usage')
        .class('docs-section')
        .children(
          sectionHeading(h, 'usage', 'Usage'),
          codePanel(h, `docs-${slug}-usage`, usage),
        ),
      (metadata.sections ?? []).map(section =>
        h.section
          .key(section.id)
          .attr('id', section.id)
          .class('docs-section')
          .children(
            sectionHeading(h, section.id, section.title),
            h.p.class('docs-muted').children(effectText(section.description)),
            section.code === undefined
              ? undefined
              : codePanel(h, `docs-${slug}-${section.id}`, section.code),
          ),
      ),
      (docs?.composition ?? metadata.composition)
        ? h.section
            .attr('id', 'composition')
            .class('docs-section')
            .children(
              sectionHeading(h, 'composition', 'Composition'),
              codePanel(
                h,
                `docs-${slug}-composition`,
                docs?.composition ?? metadata.composition ?? '',
              ),
            )
        : undefined,
      visibleEntries.map(({ meta, index: exampleIndex, implementation }) => {
        const baseId = meta.sectionId ?? slugify(meta.title)
        const id = visibleEntries.some(
          (entry, index) =>
            index !== exampleIndex &&
            (entry.meta.sectionId ?? slugify(entry.meta.title)) === baseId,
        )
          ? `${baseId}-${String(exampleIndex)}`
          : baseId
        return h.section
          .key(id)
          .attr('id', id)
          .class('docs-section', 'docs-example-section')
          .children(
            sectionHeading(h, id, meta.title),
            meta.description === undefined
              ? undefined
              : h.p
                  .class('docs-example-description')
                  .children(effectText(meta.description)),
            implementation === undefined
              ? h.div
                  .class('docs-pending')
                  .children(
                    h.p.children('This live Effect UI example is pending.'),
                  )
              : exampleCardWithSource(
                  h,
                  slug,
                  meta,
                  exampleIndex,
                  'section',
                  implementation,
                ),
          )
      }),
      metadata.styling === undefined
        ? undefined
        : h.section
            .attr('id', 'styling')
            .class('docs-section')
            .children(
              sectionHeading(h, 'styling', 'Styling'),
              h.p.class('docs-muted').children(effectText(metadata.styling)),
            ),
      metadata.keyboard === undefined
        ? undefined
        : h.section
            .attr('id', 'keyboard-interaction')
            .class('docs-section')
            .children(
              sectionHeading(h, 'keyboard-interaction', 'Keyboard interaction'),
              h.dl
                .class('docs-keyboard-list')
                .children(
                  metadata.keyboard.map(([key, behavior]) =>
                    h.div
                      .key(key)
                      .children(h.dt.children(key), h.dd.children(behavior)),
                  ),
                ),
            ),
      metadata.accessibility === undefined
        ? undefined
        : h.section
            .attr('id', 'accessibility')
            .class('docs-section')
            .children(
              sectionHeading(h, 'accessibility', 'Accessibility'),
              h.p
                .class('docs-muted')
                .children(effectText(metadata.accessibility)),
            ),
      h.section
        .attr('id', 'api-reference')
        .class('docs-section')
        .children(
          sectionHeading(h, 'api-reference', 'API Reference'),
          docs?.apiEntries === undefined || docs.apiEntries.length === 0
            ? h.p
                .class('docs-muted')
                .children(
                  'Accurate Effect UI API entries are being generated for this component.',
                )
            : h.div.class('docs-api-table').children(
                docs.apiEntries.map(entry =>
                  h.div
                    .key(entry.name)
                    .class('docs-api-entry')
                    .children(
                      h.h3.children(entry.name),
                      h.p.class('docs-muted').children(entry.kind),
                      h.pre.children(h.code.children(entry.signature)),
                    ),
                ),
              ),
        ),
      h.nav
        .class('docs-pager')
        .attr('aria-label', 'Adjacent components')
        .children(pageLink(previous, 'prev'), pageLink(next, 'next')),
    ),
    h.aside
      .class('docs-toc')
      .children(
        h.nav
          .attr('aria-label', 'On this page')
          .children(
            h.p.class('docs-toc-title').children('On this page'),
            h.ul.children(
              toc.map(([id, label]) =>
                h.li
                  .key(id)
                  .children(h.a.attr('href', `#${id}`).children(label)),
              ),
            ),
          ),
      ),
  )
}

const guidePage = (h: DocHtml, { title, description, view }: DocsGuide) =>
  docsMain(h).children(
    h.nav
      .class('docs-breadcrumb')
      .attr('aria-label', 'Breadcrumb')
      .children(
        h.a.attr('href', '/docs/getting-started').children('Docs'),
        h.span.attr('aria-hidden', 'true').children('/'),
        h.span.attr('aria-current', 'page').children(title),
      ),
    h.h1.children(title),
    description === undefined
      ? undefined
      : h.p.class('docs-description').children(description),
    h.div.class('docs-article').children(view(h)),
  )

const notFound = (h: DocHtml) =>
  docsMain(h).children(
    h.h1.children('Page not found'),
    h.p.children(h.a.attr('href', catalogPath).children('Browse components')),
  )

const searchDialog = (
  h: DocHtml,
  query: string,
  groups: ReturnType<typeof groupedEntries>,
) => {
  const term = query.trim().toLowerCase()
  const behaviorResults = behaviors.filter(
    entry =>
      entry.kind === 'primitive' &&
      (term === '' ||
        entry.title.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term)),
  )
  const guideResults = guideLinks.filter(
    entry => term === '' || entry.label.toLowerCase().includes(term),
  )
  return h.div.class('docs-search-backdrop').children(
    h.div
      .class('docs-search-dialog')
      .attrs({
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Search documentation',
      })
      .children(
        h.div.class('docs-search-bar').children(
          h.input
            .class('docs-search-input')
            .attrs({
              type: 'search',
              placeholder: 'Search documentation…',
              'aria-label': 'Search documentation',
            })
            .value(query)
            .on('input', ({ value }) =>
              DocsMessage.SearchFiltered({ query: value }),
            ),
          h.button
            .class('docs-search-close')
            .attrs({ type: 'button', 'aria-label': 'Close search' })
            .on('click', DocsMessage.ClosedSearch())
            .children('×'),
        ),
        h.div.class('docs-search-results').children(
          guideResults.length === 0
            ? undefined
            : h.div.class('docs-search-group').children(
                h.h2.children('Guides'),
                guideResults.map(entry =>
                  h.a
                    .key(entry.href)
                    .attr('href', entry.href)
                    .children(entry.label),
                ),
              ),
          groups.map(group =>
            h.div
              .key(group.label)
              .class('docs-search-group')
              .children(
                h.h2.children(group.label),
                group.entries.map(entry =>
                  h.a
                    .key(entry.slug)
                    .attr('href', componentPath(entry.slug))
                    .children(entry.title),
                ),
              ),
          ),
          behaviorResults.length === 0
            ? undefined
            : h.div.class('docs-search-group').children(
                h.h2.children('Behaviors'),
                behaviorResults.map(entry =>
                  h.a
                    .key(entry.slug)
                    .attr('href', entry.docs)
                    .children(entry.title),
                ),
              ),
          groups.length === 0 &&
            behaviorResults.length === 0 &&
            guideResults.length === 0
            ? h.p
                .class('docs-muted')
                .children('No documentation matches your search.')
            : undefined,
        ),
      ),
  )
}

const initialDark = (() => {
  try {
    const stored = window.localStorage.getItem('creaseui-effect-docs-theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
  } catch {
    // Ignore unavailable storage and use the system preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})()

const Docs = Html.component({
  name: 'CreaseEffectDocs',
  model: Schema.Struct({
    query: Schema.String,
    dark: Schema.Boolean,
    searchOpen: Schema.Boolean,
    search: Schema.String,
  }),
  message: DocsMessage,
}).make({
  init: () => ({
    query: '',
    dark: initialDark,
    searchOpen: false,
    search: '',
  }),
  update: {
    Filtered: ($, { query }) => $.evolve({ query }),
    SearchFiltered: ($, { query }) => $.evolve({ search: query }),
    ToggledTheme: $ => $.evolve({ dark: value => !value }),
    OpenedSearch: $ => $.evolve({ searchOpen: true }),
    ClosedSearch: $ => $.evolve({ searchOpen: false }),
  },
  subscriptions: () => [
    HtmlSubscription.shortcuts([
      {
        key: 'k',
        mod: true,
        whileTyping: true,
        message: DocsMessage.OpenedSearch(),
      },
      {
        key: 'Escape',
        whileTyping: true,
        message: DocsMessage.ClosedSearch(),
      },
    ]),
  ],
  view: (h, { query, dark, searchOpen, search }) => {
    const groups = groupedEntries(query)
    const searchGroups = groupedEntries(search)
    return h.div
      .class('effect-docs', dark ? 'dark' : 'light')
      .children(
        h.a
          .class('docs-skip')
          .attr('href', '#docs-main')
          .children('Skip to content'),
        docsHeader(h, dark),
        searchOpen ? searchDialog(h, search, searchGroups) : undefined,
        h.div
          .class('docs-frame', 'docs-layout')
          .children(
            h.aside.class('docs-sidebar').children(sidebar(h, query, groups)),
            h.details
              .class('docs-mobile-nav')
              .children(
                h.summary.children('Browse docs'),
                sidebar(h, query, groups),
              ),
            guide !== undefined
              ? guidePage(h, guide)
              : route.tag === 'catalog'
                ? catalog(h, groups)
                : route.tag === 'component'
                  ? component(h, route.slug, route.title)
                  : notFound(h),
          ),
      )
  },
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing docs root')
Layer.launch(BrowserHost.mount(Docs, {}, root)).pipe(Effect.runFork)
