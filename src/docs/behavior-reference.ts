import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  behaviorFor,
  behaviorGuideLinks,
  coreBehaviors,
  componentsUsing,
  type BehaviorEntry,
  type BehaviorRenderer,
} from '@/docs/behavior-metadata'
import { docsSidebar } from '@/docs/docs-sidebar'
import { examplesFor } from '@/docs/behavior-examples'
import { docsGuideStyles } from '@/docs/getting-started-view'
import { componentTitle } from '@/docs/component-metadata'
import type * as Markdown from '@/lib/markdown'
import { markdown as pleatMarkdown } from '@/pleat/markdown'
import { markdown as stylexMarkdown } from '@/stylex/markdown'
import { behaviorDocsPath, behaviorsPath, componentDocsPath } from '@/route'
import { markdown as tailwindMarkdown } from '@/ui/markdown'

const guides = import.meta.glob<string>('/src/lib/behaviors/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const sourceBase = 'https://github.com/Potti1234/creaseui/blob/main/'
const guideFor = (name: string): string =>
  behaviorGuideLinks(guides['/src/lib/behaviors/' + name + '.md'] ?? '')
    .replace(/^# .+\r?\n+/, '')
    .replace(
      /\]\(\.\.\/\.\.\/([^):]+)\)/g,
      (_, path: string) => '](' + sourceBase + 'src/' + path + ')',
    )

const groupId = (group: string) => group.toLowerCase().replaceAll(' ', '-')
const groups = [...new Set(coreBehaviors.map(entry => entry.group))].map(
  group =>
    [group, coreBehaviors.filter(entry => entry.group === group)] as const,
)

const link = <Msg>(href: string, label: string, h: HtmlBuilder<Msg>): Html =>
  h.a([h.Class('behavior-docs-link'), h.Href(href)], [label])

const index = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.main(
    [h.Class('behavior-docs-reference')],
    [
      h.header(
        [h.Class('behavior-docs-intro')],
        [
          h.h1([], ['Behaviors']),
          h.p(
            [h.Class('behavior-docs-muted')],
            [
              'Compose these headless Foldkit primitives to build existing and custom components.',
            ],
          ),
        ],
      ),
      h.nav(
        [h.AriaLabel('Behavior categories')],
        [
          h.ul(
            [h.Class('behavior-docs-link-list')],
            groups.map(([group]) =>
              h.li([], [link('#' + groupId(group), group, h)]),
            ),
          ),
        ],
      ),
      ...Array.from(groups, ([group, entries]) =>
        h.section(
          [h.Id(groupId(group)), h.Class('behavior-docs-section')],
          [
            h.h2([], [group]),
            h.ul(
              [h.Class('behavior-docs-index-list')],
              entries.map(entry =>
                h.li(
                  [],
                  [
                    link(behaviorDocsPath(entry.slug), entry.title, h),
                    h.p([h.Class('behavior-docs-muted')], [entry.description]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ],
  )

type ViewProps<Msg> = Readonly<{
  renderer: BehaviorRenderer
  sidebarScrolled: Msg
  model: Markdown.Model
  toParentMessage: (message: Markdown.Message) => Msg
}>

const detail = <Msg>(
  entry: BehaviorEntry,
  props: ViewProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const markdown =
    props.renderer === 'pleat'
      ? pleatMarkdown
      : props.renderer === 'stylex'
        ? stylexMarkdown
        : tailwindMarkdown
  const guide = entry.guides.map(guideFor).join('\n\n')
  const components = componentsUsing(entry.slug, props.renderer)
  const examples = examplesFor(entry, props.renderer)
  return h.main(
    [h.Class('behavior-docs-reference')],
    [
      h.nav(
        [h.AriaLabel('Breadcrumb')],
        [link(behaviorsPath(), 'Behaviors', h)],
      ),
      h.header(
        [h.Class('behavior-docs-intro')],
        [
          h.h1([], [entry.title]),
          h.p([h.Class('behavior-docs-muted')], [entry.description]),
          h.p([], [link(sourceBase + entry.source, 'View source', h)]),
        ],
      ),
      ...(examples.length === 0
        ? []
        : [
            h.section(
              [h.Class('behavior-docs-section')],
              [
                h.h2([], ['Examples']),
                ...examples.map(example =>
                  h.article(
                    [h.Class('behavior-docs-example')],
                    [
                      h.h3([], [example.title]),
                      h.p(
                        [h.Class('behavior-docs-muted')],
                        [example.explanation],
                      ),
                      ...(example.preview === undefined
                        ? []
                        : [
                            h.iframe([
                              h.Class('behavior-docs-frame'),
                              h.Src(example.preview),
                              h.Title(example.title),
                              h.Loading('lazy'),
                              h.Style({
                                height: (example.previewHeight ?? 405) + 'px',
                              }),
                            ]),
                          ]),
                      link(example.href, 'Open example', h),
                      ...(example.code === undefined
                        ? []
                        : [
                            h.details(
                              [],
                              [
                                h.summary([], ['Foldkit code']),
                                h.pre([], [h.code([], [example.code])]),
                              ],
                            ),
                          ]),
                    ],
                  ),
                ),
              ],
            ),
          ]),
      ...(guide === ''
        ? []
        : [
            h.section(
              [h.Class('behavior-docs-section'), h.AriaLabel('Usage guide')],
              [
                markdown(
                  { ...props, headingLevelStart: 2, children: guide },
                  h,
                ),
              ],
            ),
          ]),
      h.section(
        [h.Class('behavior-docs-section')],
        [
          h.h2([], ['Source exports']),
          h.p(
            [h.Class('behavior-docs-muted')],
            [h.code([], ['@/' + entry.source.slice(4, -3)])],
          ),
          h.ul(
            [h.Class('behavior-docs-link-list')],
            entry.exports.map(name => h.li([], [h.code([], [name])])),
          ),
        ],
      ),
      ...(components.length === 0
        ? []
        : [
            h.section(
              [h.Class('behavior-docs-section')],
              [
                h.h2([], ['Used by']),
                h.ul(
                  [h.Class('behavior-docs-link-list')],
                  components.map(slug =>
                    h.li(
                      [],
                      [
                        link(
                          componentDocsPath(slug),
                          componentTitle(slug) ?? slug,
                          h,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ]),
    ],
  )
}

export const view = <Msg>(
  slug: string | undefined,
  props: ViewProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const entry = slug === undefined ? undefined : behaviorFor(slug)
  if (slug !== undefined && entry === undefined) return undefined
  const path = slug === undefined ? behaviorsPath() : behaviorDocsPath(slug)
  return h.div(
    [h.Class(docsGuideStyles.layout)],
    [
      ...docsSidebar(path, docsGuideStyles, props.sidebarScrolled, h),
      entry === undefined
        ? index(h)
        : entry.owner === undefined
          ? detail(entry, props, h)
          : h.main(
              [h.Class('behavior-docs-reference')],
              [
                h.h1([], [entry.title]),
                h.p(
                  [],
                  ['This guide has moved to the component documentation.'],
                ),
                link(
                  entry.docs,
                  'Open ' + (componentTitle(entry.owner) ?? entry.title),
                  h,
                ),
              ],
            ),
    ],
  )
}
