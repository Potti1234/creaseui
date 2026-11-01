import type { Html, HtmlBuilder } from 'foldkit/html'

import buttonDiff from '../../generated/07/button.diff?raw'
import collapseFixture from '../../generated/07/collapse-fixture.txt?raw'
import eslintDiff from '../../generated/07/eslint.config.diff?raw'
import lintArchive from '../../generated/07/lint-archive.txt?raw'
import appSidebarRules from '../../generated/07/app-sidebar-rules.txt?raw'
import lintAria from '../../generated/07/lint-aria.txt?raw'
import ownedDiff from '../../generated/07/owned-components.diff?raw'
import scope from '../../generated/07/scope.txt?raw'
import issuesView from '../../snapshots/chapter-07/features/issues.ts?raw'
import issueRowSource from '../../snapshots/chapter-07/design/issue-row.ts?raw'
import menuSource from '../../snapshots/chapter-07/ui/dropdown-menu.ts?raw'
import {
  codeBlock,
  diffView,
  reviewComment,
  terminal,
} from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  list,
  p,
} from '../../shared/prose'
import {
  anatomy,
  liveApp,
  ratchet,
  rowsFlip,
  viewSizes,
  vocabulary,
} from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

/* Source as the tag has it: without the snapshot header line, and with the
   `@/` imports that the snapshot script rewrote to relative paths restored. */
const source = (text: string): string =>
  text
    .split('\n')
    .slice(1)
    .join('\n')
    .replace(/(['"])(?:\.\.\/)+(ui|lib)\//gu, '$1@/$2/')
    .trimEnd()

const between = (text: string, start: string, end: string): string => {
  const from = text.indexOf(start)
  return text.slice(from, text.indexOf(end, from) + end.length).trimEnd()
}

const menuFix = between(
  menuSource,
  '    /* Crease Tasks: a selection',
  ': {}),',
)

const archiveFixture = `import type { Html, HtmlBuilder } from 'foldkit/html'

import { item, itemTitle } from '@/ui/item'

// A fourth view that draws its own row.
export const archiveRow = <Msg>(title: string, h: HtmlBuilder<Msg>): Html =>
  item({ size: 'xs', layout: 'inline', children: [itemTitle({ children: [title] }, h)] }, h)`

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 7,
      title: 'Compose named product patterns',
      dek: 'This chapter builds five named patterns in src/design, one row and one navigation for every page, writes their rules down, and adds a lint rule that makes them the only way to list an issue.',
      from: 'chapter-06',
      to: 'chapter-07',
      filesChanged: 27,
    }),

    p(
      h,
      'After chapter 5 every row has the same height and none of them wraps, but no component decides which parts an issue row shows. In chapter 6, issue `CRE-142` still appears as three different rows, one per view.',
    ),
    figure(h, {
      n: 1,
      title: 'One issue, three rows, then one',
      caption:
        '`CRE-142` drawn by the row of each view. Switch to chapter 7: all three views use `IssueRow`.',
      body: [rowsFlip(h, model.version)],
    }),
    p(
      h,
      'In two rows the identifier comes first; in My issues it comes last. Only All issues shows the date and the assignee. My issues puts the status before the priority.',
    ),
    p(
      h,
      "Matt Rothenberg describes the same drift with settings pages in [You Don't Have a Design System](https://mattrothenberg.com/notes/you-dont-have-a-design-system/): a component library gives teams parts and leaves the arrangement open, so every team decides it again. His answer is a named pattern with its rules beside it, which is what this chapter builds.",
    ),

    h2(h, 'names', 'Five names'),
    p(
      h,
      'Crease Tasks needs five patterns for the pages it has. Each settles one question that the components below it leave open:',
    ),
    list(h, [
      "`PropertyPicker`: how an issue's status, priority or assignee changes. crease's dropdown menu, with the domain's vocabulary.",
      '`IssueRow`: which parts an issue shows, and in which order. An `item` with three pickers.',
      '`IssueGroup`: how the issues of one status are grouped and collapsed. A muted `item` as the header, then rows.',
      '`IssueCollection`: what the body of a list page is. Controls, an optional summary, then groups, rows or an empty state.',
      '`AppSidebar`: what the navigation of every page contains, and in which order.',
    ]),
    p(
      h,
      'They live in `src/design`, compose crease components only, and the strict lint checks them like any other application code. Each file opens with its rules:',
    ),
    figure(h, {
      n: 2,
      title: 'IssueRow',
      caption:
        'The whole of `src/design/issue-row.ts` at `chapter-07`. It contains no class: every bit of styling comes from crease components.',
      bare: true,
      body: [codeBlock(h, 'src/design/issue-row.ts', source(issueRowSource))],
    }),
    p(
      h,
      'The code makes the order unavoidable. The comment says why the title is the part that gives way and why there is no compact variant, so the next person who wants one sees that it was decided.',
    ),

    h2(h, 'anatomy', 'Anatomy of a row'),
    p(h, 'Choose a part to see where it sits and the rule that puts it there.'),
    figure(h, {
      n: 3,
      title: 'The parts of IssueRow',
      caption:
        'A real `IssueRow` from `chapter-07`. The outline marks the chosen part.',
      body: [anatomy(h, model)],
    }),

    h2(h, 'views', 'Views that only choose'),
    p(
      h,
      'With the patterns in place, a view decides which issues to show and in which order, and nothing else. The three views went from 232 lines to 101:',
    ),
    figure(h, {
      n: 4,
      title: 'The views, before and after',
      caption:
        'Line counts of `src/features/issues.ts`, `my-issues.ts` and `search.ts`, then the whole of All issues at `chapter-07`.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            viewSizes(h),
            codeBlock(h, 'src/features/issues.ts', source(issuesView)),
          ],
        ),
      ],
    }),
    p(
      h,
      'All issues is now one call to `issueCollection` with a grouping button and a list of groups. It contains no row, no header and no class.',
    ),

    h2(h, 'sidebar', 'One navigation for every page'),
    p(
      h,
      "At chapter 6 the sidebar had two links, built in `src/view.ts`. Linear's navigation, the reference from the product brief, has more: personal links, teams with their own pages, saved views, and the signed-in person with their settings. Chapter 7 adds all of it as a fifth pattern, `AppSidebar`. A page passes data (links, teams, views, the person, the actions) and the pattern draws it in a fixed order:",
    ),
    figure(h, {
      n: 5,
      title: 'AppSidebar',
      caption:
        'The rules at the top of `src/design/app-sidebar.ts` at `chapter-07`.',
      bare: true,
      body: [
        codeBlock(h, 'src/design/app-sidebar.ts', appSidebarRules.trimEnd()),
      ],
    }),
    p(
      h,
      "The data behind it is new too. The domain gains two teams, Engineering and Design, and every issue belongs to one. A team's Issues page is All issues with that team's issues. A saved view (Urgent & high, Unassigned) is one entry in `src/features/views.ts`: a name, an icon and a filter. The sidebar, the page title and the page body are all built from that list.",
    ),
    p(
      h,
      "Two crease components could not draw the reference as installed. crease's nested sidebar link is an anchor, which cannot take keyboard focus without a URL, and it has no place for a count. And the avatar's fill is `bg-muted`, which in this theme is exactly the sidebar's colour, so the initials of a team or a person had no visible circle. Crease Tasks owns both files, so each gets one small option:",
    ),
    figure(h, {
      n: 6,
      title: 'Two options on owned components',
      caption:
        "The changes to `src/ui/sidebar.ts` and `src/ui/avatar.ts` from `chapter-06` to `chapter-07`. Both are on the guide's list of crease issues.",
      bare: true,
      body: [
        diffView(
          h,
          'src/ui/sidebar.ts, src/ui/avatar.ts',
          ownedDiff,
          'git diff chapter-06 chapter-07',
        ),
      ],
    }),
    p(
      h,
      "Each option is named after what it means (`indent`, `tone: 'accent'`), not after the classes it sets, and the default renders what crease renders. That is the same rule chapter 5 used for `layout: 'inline'`. crease later fixed both problems, and chapter 15 replaces the two options with crease's own.",
    ),

    h2(h, 'picker', 'Changing an issue in place'),
    p(
      h,
      "Decision D7 asks for status, priority and assignee to change where they are shown. `PropertyPicker` is crease's dropdown menu with three product decisions on top: the trigger is the property's own glyph, the items are the domain's vocabulary in workflow order, and the current value is checked. The figure below is the chapter 7 app, running inside the page; it shows only the issues that are In Review, In Progress or Done.",
    ),
    figure(h, {
      n: 7,
      title: 'The app, running',
      caption:
        'The `view` and `update` of `chapter-07`, with the issues that are In Review, In Progress and Done. Change a status, and the issue moves to its group; the sidebar links switch pages.',
      body: [liveApp(h, model)],
    }),
    p(
      h,
      'The page keeps one menu Model, for the menu that is open, and renders every closed picker from a fresh `init`. All Issues has 42 pickers, and they cost one small record in the Model.',
    ),
    p(
      h,
      "Testing the picker in a browser found a gap in crease's menu. Choosing an item with the mouse closed the menu and left focus on the page body, because the menu returned focus to its trigger only on an explicit close. D7 says focus returns to the row. Crease Tasks owns its copy of the menu, so the fix went there:",
    ),
    figure(h, {
      n: 8,
      title: 'Focus after a selection',
      caption:
        'From `src/ui/dropdown-menu.ts` at `chapter-07`. A selection that closes the menu now sends focus back to the trigger, even when the issue has moved to another group.',
      bare: true,
      body: [codeBlock(h, 'src/ui/dropdown-menu.ts', menuFix)],
    }),
    p(h, "The bug is also on the guide's list of crease issues."),

    h2(h, 'behaviour', 'A behaviour is not an appearance'),
    p(
      h,
      "The group header's collapse button needs `aria-expanded`. Button had one route for extra attributes, `buttonAttributes`, and the lint treats every use of it as an appearance override:",
    ),
    figure(h, {
      n: 9,
      title: 'aria-expanded, rejected',
      caption:
        'A fixture that passes `aria-expanded` the only way Button allowed.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(
              h,
              'src/features/tmp/collapse.ts',
              collapseFixture.trimEnd(),
            ),
            terminal(h, 'npx eslint src/features/tmp/collapse.ts', lintAria),
          ],
        ),
      ],
    }),
    p(
      h,
      'The lint distrusts an open list of attributes because a class can be passed through it. For a behaviour the answer is the same as in chapter 5: give it a name. Button gained an `ariaExpanded` prop, and the pattern passes a boolean.',
    ),
    figure(h, {
      n: 10,
      title: 'A named prop for a behaviour',
      caption: 'The change to `src/ui/button.ts`.',
      bare: true,
      body: [
        diffView(
          h,
          'src/ui/button.ts',
          buttonDiff,
          'git diff chapter-06 chapter-07',
        ),
      ],
    }),

    h2(h, 'unavoidable', 'Making the names unavoidable'),
    p(
      h,
      'Patterns that are optional get bypassed. Crease Tasks adds one product rule to its lint configuration: feature code may not import `item` or `dropdown-menu`. The patterns themselves import them freely. A fourth view that draws its own row fails, and the message names the decision it breaks:',
    ),
    figure(h, {
      n: 11,
      title: 'A fourth row, rejected',
      caption:
        'The product rule at work. The patterns in `src/design` may import both components; feature code may not.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(h, 'src/features/tmp/archive.ts', archiveFixture),
            terminal(h, 'npx eslint src/features/tmp/archive.ts', lintArchive),
          ],
        ),
      ],
    }),
    p(
      h,
      'The rule is sixteen lines of configuration, and it turns decisions D3 and D7 from conventions into checks. The same diff removes migration mode: the group header is a muted `item` now, so the last override is gone.',
    ),
    figure(h, {
      n: 12,
      title: 'The lint configuration',
      caption: 'The whole change to `eslint.config.js`.',
      bare: true,
      body: [
        diffView(
          h,
          'eslint.config.js',
          eslintDiff,
          'git diff chapter-06 chapter-07',
        ),
      ],
    }),
    figure(h, {
      n: 13,
      title: 'The ratchet reaches zero',
      caption:
        'Lint warnings per tag. From chapter 7 on, every finding is an error.',
      bare: true,
      body: [ratchet(h)],
    }),

    h2(h, 'vocabulary', "Saying it in the system's words"),
    p(
      h,
      '`design-system/patterns.md` lists the five names, with what each is for and when not to use it, and `AGENTS.md` now asks agents to describe a page in that vocabulary before building it. Rothenberg makes the case in [Speaking Design at Scale](https://mattrothenberg.com/notes/design-system-language/): a name points to the code, the rules and the examples behind a decision, so a person or an agent can find them. Here is how five requests resolve against the vocabulary, including two that do not fit.',
    ),
    figure(h, {
      n: 14,
      title: "Say it in the system's words",
      caption:
        'Each request either resolves to the four patterns, or shows where the vocabulary ends.',
      body: [vocabulary(h, model)],
    }),
    p(
      h,
      'A board and a timeline are new decisions, and the vocabulary shows that before anyone builds a fourth kind of row. Chapter 13 adds the board.',
    ),

    h2(h, 'scope', 'The size of this change'),
    figure(h, {
      n: 15,
      title: 'The scope report on this chapter',
      caption: 'The output of `npx creaseui-lint scope --baseline chapter-06`.',
      bare: true,
      body: [reviewComment(h, scope, 'chapter-06')],
    }),
    p(
      h,
      'Seven enforcement changes: a new component in the lock file, the lint configuration, two scripts and `AGENTS.md`. The edits to Button, the menu, the sidebar and the avatar do not appear, because component source is not an enforcement input. They are recorded in `design-system/changes/003-patterns.md` with the reason for each.',
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-07` in the `creaseui-demo` repository, and `git diff chapter-06 chapter-07` shows all of it. Chapter 8 adds the composer, saving in the browser, an issue page, and the command menu.',
    ),
  ])
