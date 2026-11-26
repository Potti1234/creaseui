import type { Html as HtmlTypes } from '@effect/ui/html'
import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'

import { examples } from './examples'
import { contentExamples } from './content-examples'
import { guides } from './guides'
import { DocsMessage, type DocsGuide } from './types'
import {
  catalogGroups,
  catalogOrder,
  catalogPath,
  componentPath,
  docsRenderer,
  docsRoute,
  legacyDocsOnly,
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
const docsMain = (h: DocHtml) =>
  h.main.class('docs-main').attrs({ id: 'docs-main', tabindex: '-1' })
const guideLinks = [
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/theming', label: 'Theming' },
  { href: '/docs/behaviors', label: 'Behaviors' },
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

const sidebar = (
  h: DocHtml,
  query: string,
  groups: ReturnType<typeof groupedEntries>,
) =>
  h.nav
    .class('docs-component-nav')
    .attr('aria-label', 'Components')
    .children(
      h.div.class('docs-nav-group').children(
        h.h2.class('docs-nav-group-title').children('Guides'),
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
      h.input
        .class('docs-filter')
        .attrs({
          type: 'search',
          'aria-label': 'Search components',
          placeholder: 'Search components',
        })
        .value(query)
        .on('input', ({ value }) => DocsMessage.Filtered({ query: value })),
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
      groups.length === 0
        ? h.p
            .attr('role', 'status')
            .children('No components match your search.')
        : undefined,
    )

const docsHeader = (h: DocHtml) =>
  h.header.class('docs-header').children(
    h.div.class('docs-frame', 'docs-header-content').children(
      h.a.class('docs-brand').attr('href', catalogPath).children('CreaseUI'),
      h.nav
        .class('docs-global-nav')
        .attr('aria-label', 'Documentation')
        .children(
          h.a.attr('href', catalogPath).children('Components'),
          h.a.attr('href', '/').children('Preview'),
        ),
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

const component = (h: DocHtml, slug: string, title: string) => {
  const example = examples[slug] ?? contentExamples[slug]
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

  return docsMain(h).children(
    h.nav
      .class('docs-breadcrumb')
      .attr('aria-label', 'Breadcrumb')
      .children(
        h.a.attr('href', catalogPath).children('Components'),
        h.span.attr('aria-hidden', 'true').children('/'),
        h.span.attr('aria-current', 'page').children(title),
      ),
    h.h1.children(title),
    example === undefined
      ? h.div
          .class('docs-pending')
          .children(
            legacyDocsOnly.has(slug)
              ? h.p.children(
                  'This is a legacy Foldkit entry. Its Effect UI registry item and live example are pending.',
                )
              : [
                  h.p.children('A live docs example is pending.'),
                  h.p.children(
                    'Registry item ',
                    h.code.children(`effect-${slug}`),
                  ),
                ],
          )
      : h.div.children(
          h.p.class('docs-description').children(example.description),
          h.section
            .class('docs-example')
            .attr('aria-label', `${title} live example`)
            .children(
              h.h2.children('Preview'),
              h.div.class('docs-example-stage').children(example.view(h)),
              example.source === undefined
                ? undefined
                : h.details
                    .class('docs-source')
                    .children(
                      h.summary.children('Effect UI code'),
                      h.pre.children(h.code.children(example.source)),
                    ),
            ),
        ),
    h.nav
      .class('docs-pager')
      .attr('aria-label', 'Adjacent components')
      .children(pageLink(previous, 'prev'), pageLink(next, 'next')),
  )
}

const guidePage = (h: DocHtml, { title, description, view }: DocsGuide) =>
  docsMain(h).children(
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

const Docs = Html.component({
  name: 'CreaseEffectDocs',
  model: Schema.Struct({ query: Schema.String }),
  message: DocsMessage,
}).make({
  init: () => ({ query: '' }),
  update: {
    Filtered: ($, { query }) => $.evolve({ query }),
  },
  view: (h, { query }) => {
    const groups = groupedEntries(query)
    return h.div
      .class('effect-docs')
      .children(
        h.a
          .class('docs-skip')
          .attr('href', '#docs-main')
          .children('Skip to content'),
        docsHeader(h),
        h.div
          .class('docs-frame', 'docs-layout')
          .children(
            h.aside.class('docs-sidebar').children(sidebar(h, query, groups)),
            h.details
              .class('docs-mobile-nav')
              .children(
                h.summary.children('Browse components'),
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
if (root !== null)
  Layer.launch(BrowserHost.mount(Docs, {}, root)).pipe(Effect.runFork)
