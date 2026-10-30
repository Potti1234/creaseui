import type { Html, HtmlBuilder } from 'foldkit/html'

import brief from '../../generated/13/brief.txt?raw'
import browser from '../../generated/13/browser.txt?raw'
import principlesDiff from '../../generated/13/principles.diff?raw'
import scope from '../../generated/13/scope.txt?raw'
import { codeBlock, diffView, terminal } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  p,
} from '../../shared/prose'
import { boardFlip, notes, process } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const boardSteps = browser
  .split('\n')
  .filter(line => /Board|board|browser check/u.test(line))
  .join('\n')

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 13,
      title: 'A design-system change, with an agent',
      dek: 'This chapter takes the board from chapter 12 through review, a scoped system-change task done by an agent, and adoption by the design-system owner.',
      from: 'chapter-12',
      to: 'chapter-13',
      filesChanged: 14,
    }),

    p(
      h,
      'In chapter 12 an agent answered a ticket the vocabulary could not, by building a new pattern inside a feature task and editing a decision on the way. The work passed every check. It had also decided, alone, what every card in the product will look like.',
    ),
    p(
      h,
      "crease's own planning describes two kinds of task an agent can be given: a feature task, which works inside the system, and a system-change task, which may change the system within a named scope. This chapter is the second kind. These are the six steps from ticket to tag:",
    ),
    figure(h, {
      n: 1,
      title: 'From ticket to tag',
      caption:
        'Who did what, and what each step produced. Steps 1 and 2 happened in chapter 12.',
      body: [process(h, model)],
    }),

    h2(h, 'review', 'The review'),
    p(
      h,
      "Reviewing a pattern means reading it against the decisions it touches and looking at it at real widths. The card reused the row's parts in the row's order (D3) and its pickers (D7), and its rules sat at the top of the file like every other pattern's. On screen, two of five columns were missing at a normal window width:",
    ),
    figure(h, {
      n: 2,
      title: 'The board, before and after review',
      caption:
        'Both at 1280 pixels. The proposal used fixed 272px columns, so the fifth column started beyond the window.',
      bare: true,
      body: [boardFlip(h, model)],
    }),
    p(
      h,
      'The review produced four notes: a visible problem, a decision changed in the wrong place, a missing check, and two routes to the same board.',
    ),
    figure(h, {
      n: 3,
      title: 'Review notes and how they were resolved',
      caption:
        'The notes as written for the task, and the resolutions as the system-change agent reported and the checks confirmed.',
      bare: true,
      body: [notes(h)],
    }),

    h2(h, 'task', 'A task that says what may change'),
    p(
      h,
      "The task follows the system-change template in crease's plan: the decision it serves, the files it may edit, the files it may not, the invariants to keep, and the checks to run. A system change may edit patterns and decisions; the list of protected files keeps it from loosening the lint or the receipt on the way.",
    ),
    figure(h, {
      n: 4,
      title: 'The brief',
      caption:
        'The task as the system-change agent received it, apart from its working directory.',
      bare: true,
      body: [codeBlock(h, 'system-change task', brief.trimEnd())],
    }),
    p(
      h,
      "The agent resolved all four notes. It also checked its own work beyond the brief: after writing the 1280px browser step, it put the proposal's fixed column width back and ran the step again to see it fail. Chapter 9 makes the same point: a check is trusted only after it has been seen to catch its mistake. One thing it could not do: `design-system/verification.md` is outside its scope, so it named the update as open in the change record.",
    ),

    h2(h, 'decision', 'An exception, written down'),
    p(
      h,
      'A card is narrower than a row, so a title that may not wrap would lose most of its words. Allowing it to wrap is an exception to D1, and the proposal had instead widened D3. The review asked for D3 to stay as it was and for the exception to become a decision of its own:',
    ),
    figure(h, {
      n: 5,
      title: 'D12',
      caption: 'The change to `design-system/principles.md`.',
      bare: true,
      body: [
        diffView(
          h,
          'design-system/principles.md',
          principlesDiff,
          'git diff chapter-12 chapter-13',
        ),
      ],
    }),

    h2(h, 'adopt', 'Adopting it'),
    p(
      h,
      "Adoption is the owner's step. I ran every check in the main repository rather than in the agent's worktree, updated `design-system/verification.md` (the follow-up the agent named), and confirmed with `scope` that the change touched no enforcement input:",
    ),
    figure(h, {
      n: 6,
      title: 'The checks at adoption',
      caption:
        'The board steps of `npm run check:browser`, and `npx creaseui-lint scope --baseline chapter-12`, at `chapter-13`.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            terminal(h, 'npm run check:browser', boardSteps),
            terminal(h, 'npx creaseui-lint scope --baseline chapter-12', scope),
          ],
        ),
      ],
    }),
    p(
      h,
      'Zero enforcement changes is the expected result for this change: it added patterns, a decision and checks, and did not need to change what the lint allows. If it had, the brief would have had to say so, and `scope` would have listed it for the reviewer. Writing the brief took minutes; the template, the protected files and the checks are the same for every system change, and only the decision and the review notes are new.',
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-13` in the `creaseui-demo` repository, and `git diff chapter-12 chapter-13` shows all of it. Chapter 14 changes an API every list page uses and moves every caller to the new one, in steps that each keep the app working.',
    ),
  ])
