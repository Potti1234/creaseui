import type { Html, HtmlBuilder } from 'foldkit/html'

import { behaviorNavGroup } from '@/docs/behavior-metadata'
import { COMPONENT_GROUPS, toSlug } from '@/docs/component-metadata'
import { autoCloseDetails } from '@/docs/details-nav'
import type { DocsGuideStyles } from '@/docs/getting-started-content'
import { LINT_RULE_GROUPS } from '@/docs/lint/rules'
import { sidebarScrollMemory } from '@/docs/sidebar-scroll'
import * as Icon from '@/lib/icon'
import {
  componentDocsPath,
  gettingStartedPath,
  lintRulePath,
  lintRulesPath,
  themingPath,
  tutorialIndexPath,
} from '@/route'
import * as Text from '@/ui/text'
import * as Typography from '@/ui/typography'

export const docsSidebar = <Msg>(
  currentPath: string,
  styles: DocsGuideStyles,
  sidebarScrolled: Msg,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> => {
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
  const behaviorNavigation = () => {
    const group = behaviorNavGroup((href, label) =>
      h.li([], [link(href, label, href === currentPath)]),
    )
    return h.div(
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
        h.ul([h.Class(styles.navList)], group.items),
      ],
    )
  }
  const nav = (): ReadonlyArray<Html> => [
    h.div(
      [h.Class(styles.navGroup)],
      [
        h.ul(
          [h.Class(styles.navList)],
          [
            h.li([], [link(gettingStartedPath(), 'Get Started', false)]),
            h.li([], [link(themingPath(), 'Theming', false)]),
            h.li(
              [],
              [
                link(
                  lintRulesPath(),
                  'Lint rules',
                  currentPath === lintRulesPath(),
                ),
              ],
            ),
            h.li([], [link(tutorialIndexPath(), 'Tutorial', false)]),
          ],
        ),
      ],
    ),
    ...COMPONENT_GROUPS.map(group =>
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
            group.components.map(name =>
              h.li([], [link(componentDocsPath(toSlug(name)), name, false)]),
            ),
          ),
        ],
      ),
    ),
    behaviorNavigation(),
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
                [
                  link(
                    lintRulePath(item.id),
                    item.title,
                    currentPath === lintRulePath(item.id),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  ]
  return [
    h.details(
      [h.Class(styles.mobile), autoCloseDetails(h, 'docs-reference-nav')],
      [
        h.summary(
          [h.Class(styles.summary)],
          [
            Typography.typographySmall({ children: ['Browse docs'] }, h),
            Icon.chevronDown({ class: styles.summaryChevron }, h),
          ],
        ),
        h.nav(
          [
            h.AriaLabel('Documentation navigation'),
            h.Class(styles.mobileNavOuter),
          ],
          nav(),
        ),
      ],
    ),
    h.aside(
      [h.Class(styles.sidebar), sidebarScrollMemory(h, sidebarScrolled)],
      [h.nav([h.AriaLabel('Documentation navigation')], nav())],
    ),
  ]
}
