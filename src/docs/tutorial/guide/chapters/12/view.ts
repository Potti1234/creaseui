import type { Html, HtmlBuilder } from 'foldkit/html'

import rulesDiff from '../../generated/12/rules.diff?raw'
import { diffView } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  p,
} from '../../shared/prose'
import { codeFlip, comparison, screens, ticket } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const quote = (h: H, who: string, text: string): Html =>
  h.blockquote(
    [
      h.Class(
        'my-4 border-l-2 border-primary/40 pl-4 text-[15.5px] leading-[1.65] text-foreground/85',
      ),
    ],
    [
      h.p([], [text]),
      h.footer([h.Class('mt-1 text-[12.5px] text-muted-foreground')], [who]),
    ],
  )

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 12,
      title: 'Feature work by agents',
      dek: 'Three agents get the same ticket in separate copies of the app, and this chapter compares what they build. A fourth gets a ticket the vocabulary cannot answer.',
      from: 'chapter-11',
      to: 'chapter-12',
      filesChanged: 7,
    }),

    p(
      h,
      "Matt Rothenberg describes the experiment in [You Don't Have a Design System](https://mattrothenberg.com/notes/you-dont-have-a-design-system/): give several builders the same ticket and the same component library, keep them from seeing each other's work, and compare. Whatever differs between their results is a decision the system has not made. With only a component library, his three settings pages came out as three different products.",
    ),
    p(
      h,
      'Crease Tasks has named patterns with rules beside them, a lint that enforces the boundaries, and an `AGENTS.md` that says where to look. The drift test checks whether that is enough in practice.',
    ),

    h2(h, 'setup', 'The setup'),
    figure(h, {
      n: 1,
      title: 'The ticket',
      caption:
        'The whole instruction each agent got, apart from its working directory and the rule to run `npm run check`.',
      bare: true,
      body: [ticket(h)],
    }),
    p(
      h,
      'Each agent worked in its own git worktree of `chapter-11`, with no access to the others and no hint about the patterns or the documentation. Each result went through the same evaluation: the diff, `npm run scope`, `npm run check`, the browser check, and a screenshot of the new page.',
    ),

    h2(h, 'screens', 'Three screens'),
    figure(h, {
      n: 2,
      title: 'The Bugs page, three times',
      caption:
        "Screenshots of each agent's result at 1280 pixels, taken by the same script. The three PNG files have the same MD5 hash.",
      bare: true,
      body: [screens(h)],
    }),
    p(
      h,
      'All three agents found `AGENTS.md` and `design-system/patterns.md` on their own. `patterns.md` says a saved view is one entry in `src/features/views.ts`, and all three added exactly that: a name, an icon and a filter, with no layout code. Agent B described it like this:',
    ),
    quote(
      h,
      'Agent B, in its report',
      'The project\'s design notes say a saved view needs only a name, an icon and a filter. The sidebar link, the page heading, the "Go to" entry in the Ctrl+K menu, the grouping by status and the empty state all come from that list, so no layout code changed.',
    ),
    figure(h, {
      n: 3,
      title: 'The three results',
      caption:
        'From the evaluation script. The browser check ran with each change applied to the main repository in turn, because the worktrees borrow `node_modules` from outside their folder and cannot serve the font file. The highlighted rows are where the agents differ.',
      bare: true,
      body: [comparison(h)],
    }),

    h2(h, 'code', 'Where the drift went'),
    p(
      h,
      'The filter is the same code in the same place in all three changes. They differ in two details: agent A named the view `bugs` and the others `active-bugs`, and two agents put the tests in a new `test/views.test.ts` while one added them to `test/update.test.ts`.',
    ),
    figure(h, {
      n: 4,
      title: 'The same feature, three ways',
      caption:
        "Each agent's change to `src/features/views.ts`, `src/model.ts` and the tests.",
      bare: true,
      body: [codeFlip(h, model)],
    }),
    p(
      h,
      "Everything a person sees was settled by the vocabulary. The remaining differences sit where the system had no decision: the id of a view and the place of its tests. Two of three agents chose `active-bugs` and a separate test file, and that became decision D11. Agent B's change was adopted, because it already follows it.",
    ),

    h2(h, 'board', 'The ticket that did not fit'),
    p(
      h,
      'A fourth agent got a different ticket: "Add a board view to team pages: each team\'s Issues page gets a toggle between the list and a board with one column per status, where each issue is a card. The sidebar gets a Board link under each team." `patterns.md` names no board, and it says what to do then: a new pattern is decided first, added to the vocabulary, then used. The agent read that and did all three itself.',
    ),
    h.figure(
      [h.Class('my-12 w-full')],
      [
        h.img([
          h.Attribute('src', '/shots/12/board.png'),
          h.Attribute('alt', 'The board the fourth agent built'),
          h.Class('w-full rounded-xl shadow-[0_0_0_1px_var(--border)]'),
        ]),
        h.figcaption(
          [h.Class('mt-3 text-[13.5px] leading-[1.55] text-muted-foreground')],
          [
            h.span(
              [h.Class('mr-1.5 font-semibold text-foreground')],
              ['Figure 5. The board the fourth agent built.'],
            ),
            'New IssueBoard and IssueCard patterns, a change record, tests, and an edit to decision D3. It passes npm run check and the browser check. At 1280 pixels In Review is cut off and Done is not visible.',
          ],
        ),
      ],
    ),
    quote(
      h,
      'The board agent, in its report',
      "The project's AGENTS.md treats feature work and design-system work as separate kinds of change. If the team wants the card and board decided by someone else first, the two new design files and the doc edits can be split out.",
    ),
    p(
      h,
      'A new pattern decides something for every later page, and here it was decided inside a feature task, by the first builder who needed it, without a review. The agent also changed decision D3 to cover cards. It said itself that the decision may belong to someone else; the instructions had told it a board needs a design-system change, but not to stop there. Now they do:',
    ),
    figure(h, {
      n: 6,
      title: 'What the experiment changed',
      caption:
        '`AGENTS.md` and `design-system/principles.md`, from `chapter-11` to `chapter-12`.',
      bare: true,
      body: [
        diffView(
          h,
          'AGENTS.md, design-system/principles.md',
          rulesDiff,
          'git diff chapter-11 chapter-12',
        ),
      ],
    }),
    p(
      h,
      "The board is not part of `chapter-12`. Chapter 13 takes the agent's proposal and reviews it as what it is: a change to the design system.",
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-12` in the `creaseui-demo` repository; `design-system/drift-tests.md` records both experiments. Chapter 13 reviews the board proposal and adds it to the system on purpose.',
    ),
  ])
