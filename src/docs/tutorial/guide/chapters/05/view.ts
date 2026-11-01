import type { Html, HtmlBuilder } from 'foldkit/html'

import itemDiff from '../../generated/05/item.diff?raw'
import lockDiff from '../../generated/05/lock.diff?raw'
import lintNegative from '../../generated/05/lint-negative.txt?raw'
import scope from '../../generated/05/scope.txt?raw'
import tscAfterNarrowing from '../../generated/05/tsc-after-narrowing.txt?raw'
import tscNegative from '../../generated/05/tsc-negative.txt?raw'
import buttonSource from '../../snapshots/chapter-05/ui/button.ts?raw'
import { findingCount } from './data'
import {
  codeBlock,
  diffView,
  reviewComment,
  terminal,
} from '../../shared/artifacts'
import {
  buttonMatrix,
  overrideWall,
  ownerSorter,
  ratchet,
  rowComparison,
  widthControls,
} from './figures'
import type { Message, Model } from './model'
import { eyebrow, figure, h2, inline, list, p } from '../../shared/prose'

type H = HtmlBuilder<Message>

const between = (source: string, start: string, end: string): string => {
  const from = source.indexOf(start)
  return source.slice(from, source.indexOf(end, from)).trimEnd()
}

const shapeType = between(
  buttonSource,
  '/** A button shows its text',
  'const dataSize',
)

// The two fixture files exactly as they were checked; the tools' line numbers refer to them.
const literalFixture = `import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): ReadonlyArray<Html> => [
  button({ intent: 'ghost', children: ['Filter'] }, h),
  button({ shape: 'icon', children: ['+'] }, h),
]`

const variableFixture = `import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

// A removed variant arriving through a variable: TypeScript sees a string.
const legacyIntent: string = 'ghost'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): ReadonlyArray<Html> => [
  button({ intent: legacyIntent as 'primary', children: ['Filter'] }, h),
  button({ shape: 'icon', children: ['+'] } as never, h),
]`

const panel = (h: H, title: string, body: ReadonlyArray<Html>): Html =>
  h.div([h.Class('flex min-w-0 flex-col gap-2')], [eyebrow(h, title), ...body])

const header = (h: H): Html =>
  h.header(
    [h.Class('pt-16 pb-6 sm:pt-24')],
    [
      eyebrow(h, 'Crease design-system guide · Chapter 5'),
      h.h1(
        [
          h.Class(
            'mt-4 text-[40px] leading-[1.08] font-semibold tracking-[-0.025em] text-foreground sm:text-[48px]',
          ),
        ],
        ['Customize a component and reduce its API'],
      ),
      h.p(
        [h.Class('mt-5 text-[19px] leading-[1.6] text-muted-foreground')],
        [
          "This chapter reads the thirteen lint warnings of the first slice as a list, adds one row variant to crease's item, removes 44 of Button's 48 combinations, and records both where the lint can check them.",
        ],
      ),
      h.div(
        [
          h.Class(
            'mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground',
          ),
        ],
        [
          h.span(
            [],
            [
              'Starts at ',
              h.code([h.Class('font-mono text-foreground')], ['chapter-04']),
            ],
          ),
          h.span(
            [],
            [
              'Ends at ',
              h.code([h.Class('font-mono text-foreground')], ['chapter-05']),
            ],
          ),
          h.span([], ['11 files changed']),
          h.span([], ['Tailwind']),
        ],
      ),
    ],
  )

export const view = (model: Model, h: H): Html =>
  h.main(
    [h.Class('min-h-screen bg-background px-4 pb-32')],
    [
      h.article(
        [h.Class('mx-auto max-w-[800px]')],
        [
          header(h),

          p(
            h,
            'Crease Tasks has three views that list issues: All issues, My issues and the search results. Each one draws an issue with its own row. Figure 1 puts the same issue, `CRE-136`, through all three.',
          ),
          figure(h, {
            n: 1,
            title: 'One issue, three rows',
            caption:
              "Issue CRE-136 drawn by the row function of each view at `chapter-04`, in a 520 pixel column. The chips under each row are the classes that view passed to crease's `item`.",
            body: [rowComparison(h, 'chapter-04', 520, true)],
          }),
          p(
            h,
            "All three views were written quickly in chapter 2. Each styled its own row with a few classes on crease's `item`, and the rows came out 42, 34 and 36 pixels tall. In two of them a long title breaks the row: My issues draws its labels over the title, and Search pushes the identifier onto a second line. All three wanted the title on one line, and each reached it with `flex-nowrap` and `truncate` in a slightly different place.",
          ),
          p(
            h,
            'The lint reported every one of these classes. The views run in migration mode, so `crease/component-contract` reports an override as a warning instead of failing the build, and the ratchet in `package.json` keeps the count from growing. At `chapter-04` the count is 13.',
          ),

          h2(h, 'list', 'Read the overrides as a list'),
          p(
            h,
            'The warnings list what the system is missing. These are the thirteen from `chapter-04`, as the lint reported them. Switch the grouping from file to class.',
          ),
          figure(h, {
            n: 2,
            title: 'The override wall',
            caption: `Every class from the ${findingCount} warnings of \`npm run lint\` at \`chapter-04\`. Grouped by class, two of them repeat across views.`,
            body: [overrideWall(h, model)],
          }),
          p(
            h,
            '`flex-nowrap` appears three times on `item`, and `truncate` three times on `itemTitle`: three views asked the same component for the same behaviour and each wrote it by hand. A class that repeats like this is a missing variant. The classes that appear once raise a different question: whose decision was it?',
          ),

          h2(h, 'owners', 'Whose decision is it?'),
          p(
            h,
            'The lint that ships with crease draws one line: the parent decides where a component goes (its margin, width and position), and the component decides how it looks. A class that crosses that line has one of four owners, and only one of them leads to a new variant. Sort the classes before reading on.',
          ),
          figure(h, {
            n: 3,
            title: 'Whose decision is it?',
            caption:
              'The overrides of chapter 4, one owner each. The answers are what chapter 5 did with them.',
            body: [ownerSorter(h, model)],
          }),
          list(h, [
            "The component, when several callers need the same thing for the same reason. `flex-nowrap` and `truncate` become one variant, and the button heights become Button's single height.",
            "The parent, when the class places the component. The list's container sets the inset, and `itemGroupSeparator` draws the lines between rows. `w-56` on the search field never produced a warning, because a width is placement.",
            'The theme, when the value is a decision chapter 4 already made. The `mira` style sets inputs to 28 pixels and 13 pixel text, so `h-7 text-xs` on the search field now repeats it. Two of the thirteen warnings went dead the day the theme landed.',
            'Nobody, when the class supports something the product does not do. `hover:bg-accent` lit up search results that nobody can click yet.',
          ]),

          h2(h, 'add', 'Add a row that stays on one line'),
          p(
            h,
            'Decision D1 from chapter 3 says an issue row is 36 pixels tall, never wraps, and cuts a long title with an ellipsis. The `item` that crease installs cannot say that. Its base class is `flex-wrap`, which suits a card with a description and breaks a dense list. Crease Tasks owns its copy of `item` (`src/ui/item.ts`), so the decision goes there, as a variant.',
          ),
          figure(h, {
            n: 4,
            title: 'The inline layout',
            caption:
              'The whole change to `src/ui/item.ts`. The default stays `wrap`, which renders exactly what crease renders.',
            bare: true,
            body: [
              diffView(
                h,
                'src/ui/item.ts',
                itemDiff,
                'git diff chapter-04 chapter-05',
              ),
            ],
          }),
          p(
            h,
            "`layout: 'inline'` sets the height and stops the row from wrapping. The row also writes a `data-layout` attribute, and the title, content and actions read it, so a caller sets one prop and the children follow. Each view now asks for the same thing in the same words: `item({ size: 'xs', layout: 'inline', children })`. Narrow the column to see what that changes.",
          ),
          figure(h, {
            n: 5,
            title: 'Narrow the column',
            caption:
              'The same three rows, rendered from each tag. In chapter 4 the My issues row draws its labels over the title, and the Search row breaks the identifier onto a second line. In chapter 5 the title is the only part that gives way.',
            body: [
              widthControls(h, model),
              rowComparison(h, model.version, model.width, false),
            ],
          }),
          p(
            h,
            "One more change came with it. A row that refuses to wrap needs a container that is allowed to shrink, and crease's `sidebarInset` has no `min-w-0`. At 900 pixels the whole page grew sideways instead of cutting the titles. Width belongs to the parent, so the fix is `class: 'min-w-0'` on the inset in `src/view.ts`, a placement class the lint accepts.",
          ),

          h2(h, 'remove', 'Remove forty-four ways to draw a button'),
          p(
            h,
            'The other direction is removing options. The Button that crease installs, ported from shadcn, has six variants and eight sizes: 48 combinations. At `chapter-04` the app calls Button four times, each with a different combination, and two of those calls need classes to change the height, corners or padding. Decision D4 needs two intents, `primary` for the one main action of a region and `secondary` for everything else, both 28 pixels tall. D5 adds an icon-only shape that cannot exist without a name.',
          ),
          figure(h, {
            n: 6,
            title: '48 buttons, 4 kept',
            caption:
              'The Button crease installed at `chapter-04`, every variant at every size. Crease Tasks keeps the four highlighted ones and gives them names that say what they are for.',
            body: [buttonMatrix(h, model)],
          }),
          p(
            h,
            "The new API has two props, `intent` and `shape`. The types carry D5: choose `shape: 'icon'` and `ariaLabel` becomes required.",
          ),
          figure(h, {
            n: 7,
            title: 'The icon-only shape',
            caption: 'From `src/ui/button.ts` at `chapter-05`.',
            bare: true,
            body: [codeBlock(h, 'src/ui/button.ts', shapeType)],
          }),
          p(
            h,
            'Running the compiler right after the change lists every caller of the removed props:',
          ),
          figure(h, {
            n: 8,
            title: 'The compiler lists the callers',
            caption:
              'The output of `tsc --noEmit` right after narrowing Button, before any caller was changed. The highlighted error is in a file nobody in this project wrote.',
            bare: true,
            body: [
              terminal(
                h,
                'npx tsc --noEmit',
                tscAfterNarrowing,
                /sidebar\.ts/u,
              ),
            ],
          }),
          p(
            h,
            "Four of the five errors are calls written in this project: three views and the theme switch from chapter 4. The fifth is in `src/ui/sidebar.ts`: crease's own sidebar trigger draws itself with `buttonVariants({ variant: 'ghost', size: 'icon' })`. Removing a value from the type finds such callers, including ones in installed code nobody here has read. A note saying \"do not use ghost\" would not.",
          ),

          h2(
            h,
            'lock',
            'The types stop literals, the lock file stops the rest',
          ),
          p(
            h,
            "TypeScript rejects `intent: 'ghost'` when it is written in place. It does not see a value that arrives as a plain `string`, and it trusts a type assertion. Removed values return that way: through a settings object, a spread of old props, or an `as` added to make an error go away. A spread of old props even compiles and the old value is then ignored without a trace.",
          ),
          figure(h, {
            n: 9,
            title: 'What each check sees',
            caption:
              'Left: the removed value written in place, caught by TypeScript. Right: the same mistakes behind a variable and an assertion. TypeScript accepts them; the lint does not. They show as warnings because `src/features` still runs in migration mode.',
            bare: true,
            body: [
              h.div(
                [h.Class('grid gap-8')],
                [
                  panel(h, 'Written in place', [
                    codeBlock(
                      h,
                      'src/features/negative-fixture.ts',
                      literalFixture,
                    ),
                    terminal(h, 'npx tsc --noEmit', tscNegative),
                  ]),
                  panel(h, 'Behind a variable and an assertion', [
                    codeBlock(
                      h,
                      'src/features/negative-fixture.ts',
                      variableFixture,
                    ),
                    terminal(
                      h,
                      'npx eslint src/features/negative-fixture.ts',
                      lintNegative.trim(),
                    ),
                  ]),
                ],
              ),
            ],
          }),
          p(
            h,
            'The lint knows the allowed values because Crease Tasks wrote them down. `crease.lock.json` was created in chapter 2 by `creaseui-lint init` and lists every installed export. This chapter adds what each export accepts:',
          ),
          figure(h, {
            n: 10,
            title: 'The allowed values',
            caption:
              'The Button entry of the lock file diff. `buttonLink` and `item` get the same treatment.',
            bare: true,
            body: [
              diffView(
                h,
                'crease.lock.json',
                lockDiff,
                'git diff chapter-04 chapter-05',
                lines => lines.slice(0, 16),
              ),
            ],
          }),
          p(
            h,
            "The lint follows `legacyIntent` back to `'ghost'` and rejects it against that list. It also refuses to vouch for props hidden behind a type assertion, because it cannot see what they contain.",
          ),

          h2(h, 'scope', 'A change to the system looks different'),
          p(
            h,
            'A feature task must not edit `crease.lock.json` to make a warning disappear, and crease can tell the two kinds of change apart. `creaseui-lint scope` compares the enforcement inputs (the lock file, the lint configuration, the ignore lists) with a trusted commit.',
          ),
          figure(h, {
            n: 11,
            title: 'The scope report on this chapter',
            caption:
              'The output of `npx creaseui-lint scope --baseline chapter-04`, shown the way a pull request bot could post it.',
            bare: true,
            body: [reviewComment(h, scope, 'chapter-04')],
          }),
          p(
            h,
            "On a feature branch this report is a failure. For this chapter it is the review checklist: three exports with new allowed values and nothing else. The reviewed change runs with `--allow-enforcement-changes`, and its reasons go into `design-system/changes/001-button-intents-and-inline-rows.md`. Adding `layout: 'inline'` took fewer than twenty lines and this one review; every later option arrives the same way, as a decision someone can read and approve.",
          ),

          h2(h, 'left', 'What is left'),
          figure(h, {
            n: 12,
            title: 'The ratchet',
            caption:
              'Lint warnings per tag. The ratchet in `package.json` moves down in the same commit that removes the warnings.',
            bare: true,
            body: [ratchet(h)],
          }),
          p(
            h,
            'The remaining warning is the `bg-muted` on the status group header. The group header is not a component but a pattern, and patterns are chapter 7.',
          ),
          p(
            h,
            'In chapter 5 the three rows from Figure 5 have the same height and none of them wraps. They still show different parts in a different order: the identifier sits at the front in one view and at the end in another, and only one shows the assignee. The parts of an issue row and their order are product decision D3, and they belong in an `IssueRow` pattern, not in a variant.',
          ),

          h.footer(
            [
              h.Class(
                'mt-16 border-t border-border pt-6 text-[14px] leading-[1.7] text-muted-foreground',
              ),
            ],
            [
              h.p(
                [],
                inline(
                  h,
                  'The code for this chapter is the tag `chapter-05` in the `creaseui-demo` repository. `git diff chapter-04 chapter-05` shows every line it changed. Next, chapter 6 puts boundaries around these components, so feature code can only reach them through the API this chapter defined.',
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  )
