import { Effect, Stream } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { autoCloseDetails } from '@/docs/details-nav'
import { COMPONENT_GROUPS, toSlug } from '@/docs/component-metadata'
import type { DocsGuideStyles } from '@/docs/getting-started-content'
import { LINT_RULE_GROUPS } from '@/docs/lint/rules'
import { sidebarScrollMemory } from '@/docs/sidebar-scroll'
import {
  TUTORIAL_CHAPTERS,
  type TutorialChapterMeta,
} from '@/docs/tutorial/chapter-meta'
import type { TutorialChapter } from '@/docs/tutorial/chapters'
import * as Icon from '@/lib/icon'
import * as Text from '@/ui/text'
import * as Typography from '@/ui/typography'
import {
  componentDocsPath,
  gettingStartedPath,
  lintRulePath,
  lintRulesPath,
  themingPath,
  tutorialChapterPath,
  tutorialIndexPath,
} from '@/route'

export type TutorialDocsProps<Msg> = Readonly<{ sidebarScrolled: Msg }>

const DEMO_REPO = 'https://github.com/Potti1234/creaseui-demo'

export const chapterTagHref = (chapter: TutorialChapterMeta): string | null =>
  chapter.tag === null ? null : `${DEMO_REPO}/releases/tag/${chapter.tag}`

/* Mounts a chapter's essay app in `element` for the element's lifetime: the
   acquire registers `dispose` as the release, so navigating away (the keyed
   page subtree is replaced) tears the embedded runtime down. */
const tutorialChapterMount = <Msg>(
  chapter: TutorialChapter,
  h: HtmlBuilder<Msg>,
) =>
  h.OnMount({
    name: `tutorial-chapter-${chapter.id}`,
    f: element =>
      Stream.callback<Msg>(() =>
        Effect.gen(function* () {
          yield* Effect.acquireRelease(
            Effect.sync(() =>
              element instanceof HTMLElement
                ? chapter.mount(element)
                : undefined,
            ),
            handle => Effect.sync(() => handle?.dispose()),
          )
          return yield* Effect.never
        }),
      ),
  })

type Shell<Msg> = Readonly<{
  h: HtmlBuilder<Msg>
  styles: DocsGuideStyles
  props: TutorialDocsProps<Msg>
  text: (
    children: ReadonlyArray<Html | string>,
    options?: Readonly<{
      type?: Text.TextType
      color?: Text.TextColor
      display?: Text.TextDisplay
    }>,
  ) => Html
  link: (href: string, label: string, isCurrent: boolean) => Html
  externalLink: (href: string, label: string) => Html
}>

const makeShell = <Msg>(
  h: HtmlBuilder<Msg>,
  styles: DocsGuideStyles,
  props: TutorialDocsProps<Msg>,
): Shell<Msg> => {
  const text = (
    children: ReadonlyArray<Html | string>,
    options?: Readonly<{
      type?: Text.TextType
      color?: Text.TextColor
      display?: Text.TextDisplay
    }>,
  ): Html =>
    Text.text(
      {
        type: options?.type ?? 'body',
        color: options?.color ?? 'secondary',
        display: options?.display ?? 'block',
        children,
      },
      h,
    )
  const link = (href: string, label: string, isCurrent: boolean): Html =>
    h.a(
      [
        h.Href(href),
        ...(isCurrent ? [h.AriaCurrent('page')] : []),
        h.Class(isCurrent ? styles.navActive : styles.navLink),
      ],
      [text([label], { color: 'inherit' })],
    )
  const externalLink = (href: string, label: string): Html =>
    h.a(
      [
        h.Href(href),
        h.Class(styles.link),
        h.Attribute('target', '_blank'),
        h.Attribute('rel', 'noreferrer'),
      ],
      [text([label], { color: 'inherit', display: 'inline' })],
    )
  return { h, styles, props, text, link, externalLink }
}

const chapterNavLabel = (chapter: TutorialChapterMeta): string =>
  chapter.id === 'short'
    ? 'Overview: the short version'
    : `${chapter.id}. ${chapter.title}`

/* The docs nav every docs page shows: the guide links plus a Tutorial group,
   then the component and lint rule groups shared with the other sections. */
const navGroups = <Msg>(
  shell: Shell<Msg>,
  currentTutorial: 'index' | 'chapter',
  currentChapter: string | undefined,
  isMobile: boolean,
): ReadonlyArray<Html> => {
  const { h, styles, text, link } = shell
  const guideLinks = h.ul(
    [h.Class(styles.navList)],
    [
      h.li([], [link(gettingStartedPath(), 'Get Started', false)]),
      h.li([], [link(themingPath(), 'Theming', false)]),
      h.li([], [link(lintRulesPath(), 'Lint rules', false)]),
      h.li(
        [],
        [link(tutorialIndexPath(), 'Tutorial', currentTutorial === 'index')],
      ),
    ],
  )
  const group = (label: string, items: ReadonlyArray<Html>): Html =>
    h.div(
      [h.Class(styles.navGroup)],
      [
        h.div(
          [h.Class(styles.navLabel)],
          [text([label], { type: 'label', color: 'primary' })],
        ),
        h.ul([h.Class(isMobile ? styles.mobileNav : styles.navList)], items),
      ],
    )
  const linkItem = (href: string, label: string, isCurrent: boolean): Html =>
    h.li([], [link(href, label, isCurrent)])
  return [
    h.div([h.Class(styles.navGroup)], [guideLinks]),
    group(
      'Tutorial',
      TUTORIAL_CHAPTERS.map(chapter =>
        linkItem(
          tutorialChapterPath(chapter.id),
          chapterNavLabel(chapter),
          currentTutorial === 'chapter' && currentChapter === chapter.id,
        ),
      ),
    ),
    ...COMPONENT_GROUPS.map(componentGroup =>
      group(
        componentGroup.label,
        componentGroup.components.map(name =>
          linkItem(componentDocsPath(toSlug(name)), name, false),
        ),
      ),
    ),
    ...LINT_RULE_GROUPS.map(lintGroup =>
      group(
        lintGroup.label,
        lintGroup.rules.map(rule =>
          linkItem(lintRulePath(rule.id), rule.title, false),
        ),
      ),
    ),
  ]
}

const shellLayout = <Msg>(
  shell: Shell<Msg>,
  currentTutorial: 'index' | 'chapter',
  currentChapter: string | undefined,
  breadcrumb: ReadonlyArray<Html>,
  content: ReadonlyArray<Html>,
  toc: ReadonlyArray<Html>,
): Html => {
  const { h, styles, props, text } = shell
  return h.div(
    [h.Class(styles.layout)],
    [
      h.details(
        [h.Class(styles.mobile), autoCloseDetails(h, 'docs-tutorial-nav')],
        [
          h.summary(
            [h.Class(styles.summary)],
            [
              text(['Browse docs'], { type: 'label' }),
              Icon.chevronDown({ class: styles.summaryChevron }, h),
            ],
          ),
          h.nav(
            [
              h.AriaLabel('Documentation navigation'),
              h.Class(styles.mobileNavOuter),
            ],
            navGroups(shell, currentTutorial, currentChapter, true),
          ),
        ],
      ),
      h.aside(
        [
          h.Class(styles.sidebar),
          sidebarScrollMemory(h, props.sidebarScrolled),
        ],
        [
          h.nav(
            [h.AriaLabel('Documentation navigation')],
            navGroups(shell, currentTutorial, currentChapter, false),
          ),
        ],
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
                  h.div(
                    [h.AriaLabel('Breadcrumb'), h.Class(styles.breadcrumb)],
                    breadcrumb,
                  ),
                ],
              ),
              ...content,
            ],
          ),
        ],
      ),
      h.aside(
        [h.Class(styles.toc)],
        toc.length === 0
          ? []
          : [
              h.div(
                [h.Class(styles.tocLabel)],
                [text(['On this page'], { type: 'label', color: 'primary' })],
              ),
              h.ul([h.Class(styles.tocList)], toc),
            ],
      ),
    ],
  )
}

export const indexView = <Msg>(
  props: TutorialDocsProps<Msg>,
  h: HtmlBuilder<Msg>,
  styles: DocsGuideStyles,
): Html => {
  const shell = makeShell(h, styles, props)
  const { text, externalLink } = shell
  return shellLayout(
    shell,
    'index',
    undefined,
    [
      h.a(
        [h.Href(gettingStartedPath()), h.Class(styles.link)],
        [text(['Docs'], { color: 'inherit', display: 'inline' })],
      ),
      h.span(
        [h.AriaHidden(true)],
        [text(['/'], { color: 'secondary', display: 'inline' })],
      ),
      text(['Tutorial'], { color: 'primary', display: 'inline' }),
    ],
    [
      Typography.typographyMuted(
        {
          children: [
            'A design system built chapter by chapter on crease: one issue tracker, from a quick first slice to a system that carries its own decisions. Every chapter is a ',
            externalLink(DEMO_REPO, 'tag in the creaseui-demo repository'),
            '.',
          ],
        },
        h,
      ),
      h.section(
        [h.Class(styles.section)],
        [
          h.ul(
            [h.Class('space-y-6')],
            TUTORIAL_CHAPTERS.map(chapter =>
              h.li(
                [],
                [
                  h.a(
                    [
                      h.Href(tutorialChapterPath(chapter.id)),
                      h.Class(styles.link),
                    ],
                    [
                      text([chapterNavLabel(chapter)], {
                        color: 'primary',
                        display: 'inline',
                      }),
                    ],
                  ),
                  text([chapter.summary], { color: 'secondary' }),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
    TUTORIAL_CHAPTERS.map(chapter =>
      h.li(
        [],
        [
          h.a(
            [h.Href(tutorialChapterPath(chapter.id)), h.Class(styles.link)],
            [
              text([chapterNavLabel(chapter)], {
                color: 'inherit',
                display: 'inline',
              }),
            ],
          ),
        ],
      ),
    ),
  )
}

export const chapterView = <Msg>(
  chapter: TutorialChapter,
  props: TutorialDocsProps<Msg>,
  h: HtmlBuilder<Msg>,
  styles: DocsGuideStyles,
): Html => {
  const shell = makeShell(h, styles, props)
  const { text, externalLink } = shell
  const chapterIndex = TUTORIAL_CHAPTERS.findIndex(c => c.id === chapter.id)
  const previous =
    chapterIndex > 0 ? TUTORIAL_CHAPTERS[chapterIndex - 1] : undefined
  const next = TUTORIAL_CHAPTERS[chapterIndex + 1]
  const tagHref = chapterTagHref(chapter)
  const chapterLabel =
    chapter.id === 'short' ? 'The short version' : `Chapter ${chapter.id}`
  const chapterNav = (
    c: TutorialChapterMeta,
    direction: 'previous' | 'next',
  ): Html =>
    h.li(
      [],
      [
        h.a(
          [h.Href(tutorialChapterPath(c.id)), h.Class(styles.link)],
          [
            text(
              [`${direction === 'previous' ? 'Previous' : 'Next'}: ${c.title}`],
              { color: 'inherit', display: 'inline' },
            ),
          ],
        ),
      ],
    )

  return shellLayout(
    shell,
    'chapter',
    chapter.id,
    [
      h.a(
        [h.Href(tutorialIndexPath()), h.Class(styles.link)],
        [text(['Tutorial'], { color: 'inherit', display: 'inline' })],
      ),
      h.span(
        [h.AriaHidden(true)],
        [text(['/'], { color: 'secondary', display: 'inline' })],
      ),
      text([chapterLabel], { color: 'primary', display: 'inline' }),
    ],
    [
      ...(tagHref === null
        ? []
        : [
            text(
              [
                'The app at the end of this chapter is the ',
                externalLink(tagHref, `tag ${chapter.tag} on GitHub`),
                ` (git switch --detach ${chapter.tag}).`,
              ],
              { color: 'secondary' },
            ),
          ]),
      // The embedded runtime derives its id from container.id — without one
      // the fiber dies before the first render.
      h.div(
        [
          h.Id(`tutorial-chapter-${chapter.id}`),
          tutorialChapterMount(chapter, h),
        ],
        [],
      ),
      ...(previous === undefined && next === undefined
        ? []
        : [
            h.nav(
              [
                h.AriaLabel('Chapter navigation'),
                h.Class(
                  'mt-10 flex items-center justify-between gap-4 border-t border-border pt-6',
                ),
              ],
              [
                previous === undefined
                  ? h.span([], [])
                  : h.a(
                      [
                        h.Href(tutorialChapterPath(previous.id)),
                        h.Class(styles.link),
                      ],
                      [
                        text([`← ${previous.title}`], {
                          color: 'inherit',
                          display: 'inline',
                        }),
                      ],
                    ),
                next === undefined
                  ? h.span([], [])
                  : h.a(
                      [
                        h.Href(tutorialChapterPath(next.id)),
                        h.Class(styles.link),
                      ],
                      [
                        text([`${next.title} →`], {
                          color: 'inherit',
                          display: 'inline',
                        }),
                      ],
                    ),
              ],
            ),
          ]),
    ],
    [
      ...(tagHref === null
        ? []
        : [h.li([], [externalLink(tagHref, `Checkpoint: ${chapter.tag}`)])]),
      ...(previous === undefined ? [] : [chapterNav(previous, 'previous')]),
      ...(next === undefined ? [] : [chapterNav(next, 'next')]),
    ],
  )
}
