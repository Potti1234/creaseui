import { TUTORIAL_CHAPTERS } from '../../../../src/docs/tutorial/chapter-meta'
import type { DocsGuide } from '../types'
import { section } from './setup'

const DEMO_REPO = 'https://github.com/Potti1234/creaseui-demo'
const tagHref = (tag: string | null) =>
  tag === null ? undefined : `${DEMO_REPO}/releases/tag/${tag}`
const chapterPath = (id: string) =>
  id === 'short' ? '/docs/tutorial' : `/docs/tutorial/${id}`
const ordered = TUTORIAL_CHAPTERS.filter(chapter => chapter.id !== 'short')
const index: DocsGuide = {
  title: 'Tutorial',
  description:
    'Build a design system on crease, in the order the guide takes it.',
  view: h =>
    h.div.children(
      section(
        h,
        'short',
        'crease in one page',
        h.p.children(
          'The steps of building a design system on crease, in the order the guide takes them.',
        ),
      ),
      section(
        h,
        'chapters',
        'Chapters',
        h.ol
          .class('docs-compact-list')
          .children(
            ordered.map(chapter =>
              h.li
                .key(chapter.id)
                .children(
                  h.a
                    .class('docs-inline-link')
                    .attr('href', chapterPath(chapter.id))
                    .children(`${chapter.id}. ${chapter.title}`),
                  h.span.class('docs-muted').children(` ${chapter.summary}`),
                ),
            ),
          ),
      ),
    ),
}
const chapterGuide = (id: string): DocsGuide | undefined => {
  const index = ordered.findIndex(chapter => chapter.id === id)
  const chapter = ordered[index]
  if (chapter === undefined) return undefined
  const previous = index === 0 ? undefined : ordered[index - 1]
  const next = ordered[index + 1]
  const href = tagHref(chapter.tag)
  return {
    title: `${chapter.id}. ${chapter.title}`,
    description: chapter.summary,
    view: h =>
      h.div.children(
        h.nav
          .class('docs-breadcrumb')
          .attr('aria-label', 'Breadcrumb')
          .children(
            h.a.attr('href', '/docs/tutorial').children('Tutorial'),
            h.span.attr('aria-hidden', 'true').children('/'),
            h.span
              .attr('aria-current', 'page')
              .children(`Chapter ${chapter.id}`),
          ),
        href === undefined
          ? undefined
          : h.p
              .class('docs-muted')
              .children(
                'The app at the end of this chapter is the ',
                h.a
                  .class('docs-inline-link')
                  .attrs({ href, target: '_blank', rel: 'noreferrer' })
                  .children(`tag ${chapter.tag} on GitHub`),
                `.`,
              ),
        h.div
          .class('docs-pending')
          .children(
            h.p.children(
              'The interactive Foldkit chapter essay is pending its Effect UI runtime port. Chapter navigation, ordering, summaries and repository checkpoints are migrated.',
            ),
          ),
        h.nav
          .class('docs-pager')
          .attr('aria-label', 'Adjacent chapters')
          .children(
            previous === undefined
              ? undefined
              : h.a
                  .attr('href', chapterPath(previous.id))
                  .children('Previous', ` ${previous.title}`),
            next === undefined
              ? undefined
              : h.a
                  .attr('href', chapterPath(next.id))
                  .children('Next', ` ${next.title}`),
          ),
      ),
  }
}
const entries: Record<string, DocsGuide> = { '/docs/tutorial': index }
for (const chapter of ordered) {
  const guide = chapterGuide(chapter.id)
  if (guide !== undefined) entries[chapterPath(chapter.id)] = guide
}
export const tutorialGuides: Readonly<Record<string, DocsGuide>> = entries
