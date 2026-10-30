import type { Html, HtmlBuilder } from 'foldkit/html'

import lint from '../../generated/14/lint-step1.txt?raw'
import oldCaller from '../../generated/14/old-caller.ts.txt?raw'
import principlesDiff from '../../generated/14/principles.diff?raw'
import tscOld from '../../generated/14/tsc-old.txt?raw'
import { codeBlock, diffView, terminal } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  p,
} from '../../shared/prose'
import { bars, steps } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 14,
      title: 'Evolve an API and migrate its callers',
      dek: "This chapter replaces the free-form slot of IssueCollection's bar with structured options, and moves every caller over in three commits that each pass every check.",
      from: 'chapter-13',
      to: 'chapter-14',
      filesChanged: 8,
    }),

    p(
      h,
      "Since chapter 7, `IssueCollection` has taken a prop called `controls`: a list of anything, drawn at the start of the bar above the list. The pattern's rules comment said what belongs there, display controls first and a summary after them, but a list of `Html` accepts whatever a view puts in it.",
    ),
    p(
      h,
      'By chapter 13 the bars disagreed. All issues said "Grouped by status", a value without a name, and a team page showed it next to "Layout: List", a name and a value. My issues said "Sort: Priority", the only verb on any bar. Search put its "Clear search" button before the summary it clears. Each view had built its own buttons.',
    ),
    figure(h, {
      n: 1,
      title: 'The bars, before and after',
      caption:
        'Screenshots of the top of each page, cropped to the header and the bar. The bars at `chapter-13` were built by the views; at `chapter-14` they are built by `IssueCollection` from data.',
      bare: true,
      body: [bars(h, model)],
    }),
    p(
      h,
      'None of this is a bug, and no test would show it. It is drift in a place the drift test of chapter 12 did not reach: the saved view the agents built has no bar controls, so they never chose a label. The fix is to make the choice once, in the pattern, and have views pass data.',
    ),

    h2(h, 'api', 'The new shape'),
    p(
      h,
      'The collection now takes two lists. `display` holds options that change how the list is shown, each with a `name` from a closed set (Layout, Grouping, Order), the current `value`, and the message to send on click. `actions` holds things that act on the list itself, each a label and a message. The collection draws both: options as "Name: value" buttons in a fixed order, then the summary, then the actions.',
    ),
    p(
      h,
      'A view can no longer choose a label shape or an order, because it no longer builds the buttons. Chapter 5 did the same for a single component: it narrowed what a caller may pass, so the answer is always the same.',
    ),

    h2(h, 'steps', 'Three steps'),
    p(
      h,
      "With four callers in one repository, changing the prop's type and every caller in one commit would also work. It stops working once callers sit in branches you cannot see, or in another team's code. The usual route has three steps, and each leaves the app working: add the new API next to the old one and mark the old one deprecated, move every caller, then remove the old API. Each step also shows a tool at work: the warning lists the work, the ratchet keeps it from growing, the compiler confirms it is done.",
    ),
    figure(h, {
      n: 2,
      title: 'The three commits',
      caption:
        'Pick a step to see its diff. `npm run check` passes at each of the three commits; the 38 tests pass at each.',
      bare: true,
      body: [steps(h, model)],
    }),
    p(
      h,
      "Step 1 is where the tools do the bookkeeping. TypeScript's `@deprecated` tag strikes the prop through in an editor, but it does not fail a build and nobody reads a strikethrough in a file they did not open. So the product policy from chapter 10 gets a temporary rule: a `no-restricted-syntax` warning on every `controls` property inside an `issueCollection` call, with a message that says what to use instead.",
    ),
    figure(h, {
      n: 3,
      title: 'The work list',
      caption:
        'The four warnings `npm run lint` printed at step 1. The saved views passed `controls: []`, which still counts, because the prop is going away whether it is empty or not.',
      bare: true,
      body: [terminal(h, 'npm run lint', lint.trimEnd())],
    }),
    p(
      h,
      'The ratchet from chapter 5 turns that list into a limit. With `--max-warnings 4`, the check passes with the four callers that exist and fails on a fifth, so nobody can add a new caller of the old API while the migration runs. Every migrated view lowers the count, and the last one lets the ratchet return to zero.',
    ),

    h2(h, 'remove', 'Removing it'),
    p(
      h,
      'Step 3 deletes the prop, the `?? []` fallback and the deprecation rule. After it, the policy file and `package.json` are exactly what they were at `chapter-13`: the migration needed enforcement for two commits and left none behind. `git diff chapter-13 chapter-14` lists eight files, and none of them is in `policy/` or the ESLint configuration.',
    ),
    p(
      h,
      'The lint rule did not have to catch everything. Its selector matches calls to a function named `issueCollection`, so a view that imported it under another name would not get the warning. Removing the prop covers that case: once it is gone from the type, the compiler rejects every caller that still passes it, whatever the import is called:',
    ),
    figure(h, {
      n: 4,
      title: 'An old caller, after step 3',
      caption:
        'A view written against the `chapter-13` API, added to `src/features/` at `chapter-14` and checked with `tsc --noEmit`. The type in the message is shortened.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(h, 'src/features/__old.ts', oldCaller.trimEnd()),
            terminal(h, 'npx tsc --noEmit', tscOld.trimEnd()),
          ],
        ),
      ],
    }),
    p(
      h,
      'The two tools split the work. During the migration, the lint warns without breaking anything and counts what is left. At removal, the type system rejects every caller the lint missed, at the exact line.',
    ),

    h2(h, 'decision', 'The decision behind it'),
    p(
      h,
      "An API change that settles how something looks is a design decision, and chapter 3's rule applies: a decision gets a number and a place where it is enforced. Here the place is the prop types. Adding a fourth option name later is a change to the pattern and to D13, reviewed like the board in chapter 13.",
    ),
    figure(h, {
      n: 5,
      title: 'D13',
      caption:
        'The change to `design-system/principles.md`, with the change record in `design-system/changes/009-display-options.md`.',
      bare: true,
      body: [
        diffView(
          h,
          'design-system/principles.md',
          principlesDiff,
          'git diff chapter-13 chapter-14',
        ),
      ],
    }),

    essayFooter(
      h,
      "The code for this chapter is the tag `chapter-14` in the `creaseui-demo` repository; `git log chapter-13..chapter-14` shows the three commits. Chapter 15 takes in crease's fixes for the problems this tutorial found.",
    ),
  ])
