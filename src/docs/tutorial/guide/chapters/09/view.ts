import type { Html, HtmlBuilder } from 'foldkit/html'

import browserOutput from '../../generated/09/browser.txt?raw'
import lintFixturesOutput from '../../generated/09/lint-fixtures.txt?raw'
import removedIntentFixture from '../../generated/09/removed-intent.ts.txt?raw'
import testsOutput from '../../generated/09/tests.txt?raw'
import testSource from '../../generated/09/update.test.ts.txt?raw'
import { codeBlock, terminal } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  list,
  p,
} from '../../shared/prose'
import { breakIt, checkCards, coverage } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const between = (text: string, start: string, end: string): string => {
  const from = text.indexOf(start)
  return text.slice(from, text.indexOf(end, from)).trimEnd()
}

const saveStory = between(
  testSource,
  "describe('changing a property in place'",
  "describe('creating an issue'",
)
const tests = testsOutput
  .split('\n')
  .map(line =>
    line
      .replace(/^ ?✓ test\/update\.test\.ts > /u, '✓ ')
      .replace(/ \d+ms$/u, '')
      .replace(/"x{20,}"/u, match => `"x" × ${match.length - 2}`),
  )
  .join('\n')

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 9,
      title: 'Verify the whole system',
      dek: 'This chapter turns the checks of chapters 5 to 8 into a suite that runs every time, then breaks the app nine times to see which check notices.',
      from: 'chapter-08',
      to: 'chapter-09',
      filesChanged: 20,
    }),

    p(
      h,
      'Rows never wrap. Every view uses the same row. Choosing a status returns focus to its glyph. A draft survives closing the composer. Until this chapter, each of these claims was checked once, by hand or by a script in a scratch folder, and nothing stopped the next change from breaking one of them.',
    ),
    p(h, 'Crease Tasks now has five checks, and none of them sees everything:'),
    figure(h, {
      n: 1,
      title: 'Five checks',
      caption:
        'From `design-system/verification.md` at `chapter-09`. `npm run check` runs the first four; the browser check runs against `npm run dev`.',
      bare: true,
      body: [checkCards(h)],
    }),

    h2(h, 'stories', 'Stories of update'),
    p(
      h,
      "Foldkit's `Story` runs Messages through the real `update` and keeps every Command that a step produces. A story only passes if each of those Commands is resolved by the test. That one rule makes it hard to forget a side effect: if a status change stops saving, there is no `SaveIssues` to resolve, and the story says so.",
    ),
    figure(h, {
      n: 2,
      title: 'Two stories about changing a property',
      caption: 'From `test/update.test.ts` at `chapter-09`.',
      bare: true,
      body: [codeBlock(h, 'test/update.test.ts', saveStory)],
    }),
    p(
      h,
      'The first story says three things at once: the status changes before anything is stored, focus goes back to the glyph (`FocusTrigger`), and the issues are saved. The second covers the failure path: the change stays, the notice appears, Retry saves again.',
    ),
    figure(h, {
      n: 3,
      title: 'The test run',
      caption: '`npx vitest run --reporter=verbose` at `chapter-09`.',
      bare: true,
      body: [terminal(h, 'npx vitest run --reporter=verbose', tests)],
    }),

    h2(h, 'fixtures', 'A test for the lint'),
    p(
      h,
      'The lint is code, and so is its configuration. Chapter 5 recorded allowed values in `crease.lock.json`; chapter 7 added a product import rule. A later change to either can switch a rule off without anyone noticing, because a lint that stops reporting looks exactly like clean code. So each rule the design system depends on gets a fixture: a small file that must fail with that rule, plus one that must pass.',
    ),
    figure(h, {
      n: 4,
      title: 'A fixture and the fixture run',
      caption:
        'One of the six fixtures in `test/lint-fixtures`, and `npm run check:lint-fixtures`, which lints each one as if it were feature code.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(
              h,
              'test/lint-fixtures/removed-intent.ts',
              removedIntentFixture.trimEnd(),
            ),
            terminal(h, 'npm run check:lint-fixtures', lintFixturesOutput),
          ],
        ),
      ],
    }),

    h2(h, 'browser', 'What only a browser sees'),
    p(
      h,
      'Row heights, sideways scrolling, focus and `localStorage` exist only in a real page. `npm run check:browser` drives the running app in Chromium with Playwright: it narrows the window, checks that a long title ends in an ellipsis, compares the row in the list with the row in search results, changes a status, creates an issue, reloads, makes storage throw, opens an issue page, uses Ctrl+K and C, switches to dark, and measures components on a check page. It takes a few seconds and waits for the page to render before it measures.',
    ),
    figure(h, {
      n: 5,
      title: 'The browser check',
      caption: '`npm run check:browser` against `npm run dev` at `chapter-09`.',
      bare: true,
      body: [terminal(h, 'npm run check:browser', browserOutput)],
    }),

    h2(h, 'break', 'Breaking it nine times'),
    p(
      h,
      'A check that never fails might be checking nothing. So nine small regressions were applied to the app, one at a time, all five checks ran against each, and the file was restored. Each regression is a mistake someone could plausibly make; the ninth is one that actually happened while this guide was written. Choose one to see the change and what each check said.',
    ),
    figure(h, {
      n: 6,
      title: 'Break it',
      caption:
        'Real results: each regression was applied to the app at `chapter-09`, all five checks ran, and the first failure line of each failing check is shown. The first regression also has the result from the first build of this chapter, before the component check existed.',
      body: [breakIt(h, model)],
    }),
    p(
      h,
      "When this chapter was first built, the first regression passed every check. A browser step that measures search results on a 480 pixel phone screen did not catch it either, and measuring the rows showed why: since chapter 7, every list uses `IssueRow`, which puts the identifier in the row's media, outside the content. No text in the app sits where the removed class matters.",
    ),
    p(
      h,
      'The class protects a guarantee of the inline layout itself: a row never wraps, whatever a pattern puts into its content. So the guarantee is tested at the component. `component-check.html` renders an inline `item` with an identifier and a long title in its content, in a 240 pixel column, and the browser check measures it. Switch the first regression to With it to see the check fail.',
    ),
    p(
      h,
      "The ellipsis regression is the same kind of gap, found the hard way. In chapter 8 the row's title became a link, and a long title was clipped at the row's edge without an ellipsis. Every check passed; a screenshot in chapter 8's essay showed it. The browser check now has a step for it, and that step is the only check that catches the regression.",
    ),
    p(
      h,
      "The others show the shape of the suite. Types and lint catch mistakes in how components are called, before anything runs. Stories catch mistakes in what update does. Closing the composer and dropping the draft is caught only by a story: the browser check closes the dialog with Escape, which goes through the dialog's own message, not through the Cancel button the regression touched.",
    ),
    figure(h, {
      n: 7,
      title: 'Which check catches what',
      caption:
        'All nine regressions against `chapter-09`. Every row is caught by at least one check, and no single column covers everything.',
      bare: true,
      body: [coverage(h)],
    }),
    p(
      h,
      'The lint fixtures column is empty: none of these regressions touched the lint or its configuration. The fixtures are for the day a change does, because a lint that stops reporting looks exactly like clean code.',
    ),

    essayFooter(
      h,
      "The code for this chapter is the tag `chapter-09` in the `creaseui-demo` repository, and `git diff chapter-08 chapter-09` shows all of it. Chapter 10 collects the product's rules into one policy: what crease enforces, what the lock file narrows, and what the product adds.",
    ),
  ])
