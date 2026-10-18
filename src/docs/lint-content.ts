import type { Html, HtmlBuilder } from 'foldkit/html'

import type {
  DocsGuideCodeProps,
  DocsGuideStyles,
} from '@/docs/getting-started-content'
import { findLintRule, LINT_RULE_GROUPS } from '@/docs/lint/rules'
import * as Heading from '@/ui/heading'
import * as Text from '@/ui/text'
import * as Typography from '@/ui/typography'
import {
  gettingStartedPath,
  lintRulePath,
  lintRulesPath,
  themingPath,
} from '@/route'

export const view = <Msg>(
  rule: string,
  h: HtmlBuilder<Msg>,
  styles: DocsGuideStyles,
  _codeBlock: DocsGuideCodeProps<Msg>,
): Html => {
  const current = rule === '' ? undefined : findLintRule(rule)
  const title = current?.title ?? 'Lint rules'
  const text = (children: ReadonlyArray<Html | string>): Html =>
    Text.text({ type: 'body', color: 'inherit', display: 'block', children }, h)
  const link = (href: string, label: string, isCurrent: boolean): Html =>
    h.a(
      [
        h.Href(href),
        ...(isCurrent ? [h.AriaCurrent('page')] : []),
        h.Class(isCurrent ? styles.navActive : styles.navLink),
      ],
      [text([label])],
    )
  const nav = (): ReadonlyArray<Html> => [
    h.div(
      [h.Class(styles.navGroup)],
      [
        h.ul(
          [h.Class(styles.navList)],
          [
            h.li([], [link(gettingStartedPath(), 'Get Started', false)]),
            h.li([], [link(themingPath(), 'Theming', false)]),
            h.li([], [link(lintRulesPath(), 'Lint rules', rule === '')]),
          ],
        ),
      ],
    ),
    ...LINT_RULE_GROUPS.map(group =>
      h.div(
        [h.Class(styles.navGroup)],
        [
          h.div(
            [h.Class(styles.navLabel)],
            [
              Text.text(
                { type: 'label', color: 'primary', children: [group.label] },
                h,
              ),
            ],
          ),
          h.ul(
            [h.Class(styles.navList)],
            group.rules.map(item =>
              h.li(
                [],
                [link(lintRulePath(item.id), item.title, item.id === rule)],
              ),
            ),
          ),
        ],
      ),
    ),
  ]
  const body: ReadonlyArray<Html> =
    current === undefined
      ? LINT_RULE_GROUPS.map(group =>
          h.section(
            [h.Id(group.id), h.Class(styles.section)],
            [
              Heading.heading({ level: 2, children: [group.label] }, h),
              Typography.typographyMuted({ children: [group.description] }, h),
              h.ul(
                [h.Class(styles.list)],
                group.rules.map(item =>
                  h.li(
                    [],
                    [
                      h.a(
                        [h.Href(lintRulePath(item.id)), h.Class(styles.link)],
                        [text([item.title])],
                      ),
                      Typography.typographyMuted(
                        { children: [item.summary] },
                        h,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        )
      : [
          h.section(
            [h.Id('overview'), h.Class(styles.section)],
            [Typography.typographyMuted({ children: [current.summary] }, h)],
          ),
        ]
  return h.div(
    [h.Class(styles.layout)],
    [
      h.aside(
        [h.Class(styles.sidebar)],
        [h.nav([h.AriaLabel('Documentation navigation')], nav())],
      ),
      h.main(
        [h.Class(styles.main)],
        [
          h.div(
            [h.Class(styles.content)],
            [
              h.header(
                [],
                [
                  Heading.heading(
                    {
                      level: 1,
                      type: 'display-2',
                      weight: 'semibold',
                      children: [title],
                    },
                    h,
                  ),
                  h.div(
                    [h.Class(styles.lead)],
                    [
                      Typography.typographyLead(
                        {
                          children: [
                            current === undefined
                              ? 'Every rule Crease UI adds, with the bad UI pattern it catches, the diagnostic it reports and the pattern to use instead.'
                              : current.group.label,
                          ],
                        },
                        h,
                      ),
                    ],
                  ),
                ],
              ),
              ...body,
            ],
          ),
        ],
      ),
    ],
  )
}
