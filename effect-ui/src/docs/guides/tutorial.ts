import { TUTORIAL_CHAPTERS } from '../../../../src/docs/tutorial/chapter-meta'
import type { DocsGuide } from '../types'
import { section } from './setup'

const DEMO_REPO = 'https://github.com/Potti1234/creaseui-demo'
const tagHref = (tag: string | null) =>
  tag === null ? undefined : `${DEMO_REPO}/releases/tag/${tag}`
const chapterPath = (id: string) =>
  id === 'short' ? '/docs/tutorial' : `/docs/tutorial/${id}`
const ordered = TUTORIAL_CHAPTERS.filter(chapter => chapter.id !== 'short')
const tutorialCode = (h: Parameters<DocsGuide['view']>[0], code: string) =>
  h.pre.class('tutorial-code').children(h.code.children(code))

const tutorialTable = (
  h: Parameters<DocsGuide['view']>[0],
  rows: ReadonlyArray<readonly [string, string, string]>,
) =>
  h.div
    .class('tutorial-table-wrap')
    .children(
      h.table
        .class('tutorial-table')
        .children(
          h.thead.children(
            h.tr.children(
              h.th.children('File'),
              h.th.children('Holds'),
              h.th.children('Checked by'),
            ),
          ),
          h.tbody.children(
            rows.map(row =>
              h.tr
                .key(row[0])
                .children(
                  h.td.children(h.code.children(row[0])),
                  h.td.children(row[1]),
                  h.td.children(h.code.children(row[2])),
                ),
            ),
          ),
        ),
    )

const chapterRef = (n: number) => `chapter ${n}`

const index: DocsGuide = {
  title: 'Tutorial',
  description:
    'Build a design system on crease, in the order the guide takes it.',
  view: h =>
    h.div.class('tutorial-essay').children(
      h.header
        .class('tutorial-hero')
        .children(
          h.div
            .class('tutorial-kicker')
            .children(
              h.a
                .attr('href', '/docs/tutorial')
                .children('Crease design-system guide'),
              h.span.children('·'),
              h.span.children('The short version'),
            ),
          h.h1.children('crease in one page'),
          h.p.children(
            'The steps of building a design system on crease, in the order the guide takes them, each with the chapter that shows it in detail.',
          ),
        ),
      section(
        h,
        'idea',
        'The idea',
        h.p.children(
          `crease copies its components into your project as source, so you own them. A design system on top of crease is the set of decisions about how your product uses those components, written where tools can check them. The guide builds one for Crease Tasks, an issue tracker modelled on Linear (${chapterRef(1)}).`,
        ),
        tutorialTable(h, [
          [
            'design-system/principles.md',
            'The product decisions, each with the code that enforces it',
            'Review',
          ],
          [
            'src/theme/',
            "Tokens and control sizes from crease's preset compiler",
            'creaseui-lint css',
          ],
          [
            'src/ui/, src/lib/',
            "crease's components, narrowed or extended by the product",
            'TypeScript, the lint',
          ],
          [
            'crease.lock.json',
            'Installed files and the values each component accepts',
            'The lint, doctor',
          ],
          [
            'src/design/',
            'Named patterns: rows, collections, pickers, navigation',
            'The lint, tests',
          ],
          [
            'policy/, eslint.config.js',
            "Which components features may use, the product's own rules",
            'The lint, scope',
          ],
          [
            'AGENTS.md, design-system/patterns.md',
            'Where to look, and when to stop and ask',
            'Review, drift tests',
          ],
        ]),
      ),
      section(
        h,
        'start',
        '1. Install with the lint on',
        h.p.children(
          `Install the theme first, then only the components the first screens need. creaseui-lint init writes the receipt and a strict lint configuration. Build the first screens quickly; put their files in migration mode, where findings are warnings, and freeze the count with --max-warnings (${chapterRef(2)}).`,
        ),
        tutorialCode(
          h,
          `npx shadcn@latest add Potti1234/creaseui/crease-theme --yes
npx shadcn@latest add Potti1234/creaseui/button Potti1234/creaseui/item --yes
npx creaseui-lint init --renderer tailwind   # writes crease.lock.json and eslint.config.js`,
        ),
      ),
      section(
        h,
        'decide',
        '2. Write decisions with an address',
        h.p.children(
          `Write a short product brief, then decisions a builder can apply ("one height, never wraps"), each naming the code that enforces it or the chapter that will build that code (${chapterRef(3)}).`,
        ),
      ),
      section(
        h,
        'theme',
        '3. Generate the theme',
        h.p.children(
          `Keep the preset code and the reason for each setting, not a hand-edited stylesheet. Split the output into tokens and registered theme CSS, so it passes crease's CSS policy. Check dark mode on real screens: it found two missing sidebar tokens in Crease Tasks (${chapterRef(4)}).`,
        ),
      ),
      section(
        h,
        'components',
        '4. Turn overrides into options',
        h.ul.children(
          h.li.children(
            "Read the lint warnings grouped by class. A class that repeats across views is a missing variant; add it to your copy of the component, with a default that keeps crease's behaviour.",
          ),
          h.li.children(
            "Remove the values your product does not use from the component's types, and let the compiler list the callers.",
          ),
          h.li.children(
            `Record the allowed values in crease.lock.json, so the lint also catches values that reach a component through a variable (${chapterRef(5)}).`,
          ),
        ),
      ),
      section(
        h,
        'boundaries',
        '5. Draw the boundaries',
        h.p.children(
          `Feature code calls components only: no implementations, no raw elements, no appearance classes. Keep migration mode to files that still have findings. One command runs every check, and creaseui-lint scope, run in a protected CI job, separates feature changes from changes to the rules (${chapterRef(6)}).`,
        ),
        tutorialCode(
          h,
          `"lint": "eslint src --max-warnings 13",
"check": "tsc --noEmit && eslint src --max-warnings 0 && creaseui-lint doctor && creaseui-lint css && vitest run",
"scope": "creaseui-lint scope --baseline HEAD"`,
        ),
      ),
      section(
        h,
        'patterns',
        '6. Name the patterns',
        h.p.children(
          `Build the product's own patterns in src/design, from crease components, with their rules in a comment at the top. List them in patterns.md, and forbid feature code from importing the components the patterns wrap. When a pattern needs something a component cannot do, give your copy of the component a named option (${chapterRef(7)}).`,
        ),
      ),
      section(
        h,
        'workflows',
        '7. Decide where a change becomes real',
        h.p.children(
          `Small edits commit on change and are saved by a Command; creating something has a draft and an explicit commit. Storage is a service, so tests can provide one that fails (${chapterRef(8)}).`,
        ),
      ),
      section(
        h,
        'verify',
        '8. Test the checks',
        h.p.children(
          `Use Story tests for update, lint fixtures for the lint itself, and a browser check for layout, focus and storage. Then break the app on purpose and see which check notices. A regression no check catches shows where a check is missing (${chapterRef(9)}).`,
        ),
      ),
      section(
        h,
        'policy',
        '9. Write the policy down',
        h.p.children(
          `Keep three layers: crease's rules, the values in the receipt, and the product's rules in their own module. Narrow in the receipt when the product uses less of a component; edit the source when it disagrees with it. A decision that configuration cannot express gets its own lint rule, with tests that fail when the rule stops reporting (${chapterRef(10)}, ${chapterRef(11)}).`,
        ),
      ),
      section(
        h,
        'agents',
        '10. Work with agents',
        h.p.children(
          `Give several agents the same ticket and compare the results: each difference is a decision the system has not made. Tell agents to describe a new pattern and stop, instead of building it in a feature task. Run design-system changes as their own task, with the files they may and may not touch, the review notes, and the checks to run (${chapterRef(12)}, ${chapterRef(13)}).`,
        ),
      ),
      section(
        h,
        'change',
        '11. Change APIs in three steps',
        h.p.children(
          `Add the new API and mark the old one deprecated with a lint warning, with the ratchet set to the current count. Move every caller. Remove the old API and the warning together, and let the compiler find any caller the warning missed (${chapterRef(14)}).`,
        ),
      ),
      section(
        h,
        'upstream',
        '12. Take in crease updates',
        h.p.children(
          `The installed components are your files, so a crease update is a diff to merge. Limit the upstream diff to the files in crease.lock.json. Where upstream fixed something you worked around, take upstream and delete the workaround; where only upstream changed, take it; where both changed, merge with git merge-file and keep your product decisions. Record it as a design-system change (${chapterRef(15)}).`,
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
      h.footer
        .class('tutorial-footer')
        .children(
          'The code is the repository creaseui-demo; every chapter from 2 on is a tag. Chapter 1 explains how the guide is organised.',
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
