import type { Html, HtmlBuilder } from 'foldkit/html'

import ruleSource from '../../generated/11/index.js?raw'
import lintTwo from '../../generated/11/lint-two.txt?raw'
import policySource from '../../generated/11/product-policy.js?raw'
import { codeBlock, terminal } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  p,
} from '../../shared/prose'
import { cases } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const ruleOnly = ruleSource
  .slice(ruleSource.indexOf('/** D4:'), ruleSource.indexOf('export default'))
  .trimEnd()
const registration = policySource
  .slice(
    policySource.indexOf("  {\n    name: 'crease-tasks/rules'"),
    policySource.lastIndexOf(']'),
  )
  .trimEnd()

const twoPrimaries = `import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

export const fixture = <Msg>(onSave: Msg, onPublish: Msg, h: HtmlBuilder<Msg>): ReadonlyArray<Html> => [
  button({ intent: 'primary', onClick: onSave, children: ['Save'] }, h),
  button({ intent: 'primary', onClick: onPublish, children: ['Publish'] }, h),
]`

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 11,
      title: 'Write a product lint rule',
      dek: "This chapter writes a lint rule of the product's own for decision D4, one primary action per region, tests it with RuleTester, and checks that the tests fail when the rule stops reporting.",
      from: 'chapter-10',
      to: 'chapter-11',
      filesChanged: 8,
    }),

    p(
      h,
      'Every rule so far was configuration: a list of allowed values, a list of forbidden imports. "At most one primary button per region" is not a list; it needs code that looks at a whole file and counts.',
    ),
    p(
      h,
      "crease's guide plan calls a custom rule the last resort, because it is code that has to be maintained, tested and explained. D4 is worth it: two primary buttons look fine on their own, together they leave the person without a main action, and in review the second one is often in a different hunk from the first. The rule looks at the whole file every time.",
    ),

    h2(h, 'rule', 'The rule'),
    p(
      h,
      "A region is the file that renders it: the page header in `src/view.ts`, the composer's footer in `src/design/issue-composer.ts`, a pattern. The rule remembers the first `intent: 'primary'` it meets on a `button` or `buttonLink` from `@/ui/button`, and reports every later one in the same file.",
    ),
    figure(h, {
      n: 1,
      title: 'one-primary-action',
      caption:
        'The rule in `tooling/eslint-plugin-crease-tasks/index.js` at `chapter-11`.',
      bare: true,
      body: [
        codeBlock(h, 'tooling/eslint-plugin-crease-tasks/index.js', ruleOnly),
      ],
    }),
    p(
      h,
      "The rule handles three cases from real code. It tracks the local name of the import, so `import { button as action }` is still counted. It reads both branches of a condition, so `isMain ? 'primary' : 'secondary'` counts as primary. And it only looks at Button from the app's own module, not at buttons from other libraries.",
    ),

    h2(h, 'message', 'A message that says what to do'),
    p(
      h,
      'A lint message is read by someone in the middle of other work. It should name the decision and offer the two ways out:',
    ),
    figure(h, {
      n: 2,
      title: 'Two primaries in one file',
      caption:
        'The fixture `test/lint-fixtures/two-primaries.ts`, linted as feature code.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(h, 'src/features/__two.ts', twoPrimaries),
            terminal(h, 'npx eslint src/features/__two.ts', lintTwo),
          ],
        ),
      ],
    }),

    h2(h, 'tests', 'Testing the rule, and the tests'),
    p(
      h,
      "ESLint's RuleTester runs a rule against small pieces of code: three that must pass and three that must be reported, including the renamed import and the conditional intent. A test suite that always passes proves nothing, so I also removed the rule's `context.report` call and ran the tests again. Switch between the two runs and choose a case.",
    ),
    figure(h, {
      n: 3,
      title: 'Six cases, two runs',
      caption:
        'The cases from `test/rules/one-primary-action.test.ts` at `chapter-11`, and both real test runs. With the report removed, every case that must be reported fails, and the cases that must pass still pass.',
      body: [cases(h, model)],
    }),
    p(
      h,
      'That asymmetry is the point of having both kinds of case. The valid cases guard against a rule that reports too much; the invalid ones guard against a rule that stops reporting. A rule tested only with valid cases would have passed both runs.',
    ),

    h2(h, 'register', 'Turning it on'),
    p(
      h,
      'The rule ships in a local plugin and is turned on in the product policy from chapter 10, next to the import rules, with the decision it serves:',
    ),
    figure(h, {
      n: 4,
      title: 'Registration',
      caption: 'From `policy/product-policy.js` at `chapter-11`.',
      bare: true,
      body: [codeBlock(h, 'policy/product-policy.js', registration)],
    }),
    p(
      h,
      'Because the plugin lives in the repository and the policy imports it, `npm run scope` treats a change to either as an enforcement change, the same as an edit to `eslint.config.js`. A feature task cannot switch it off quietly.',
    ),

    h2(h, 'limit', 'The limit, written down'),
    p(
      h,
      'A file is a coarse region. A page header and a dialog footer in the same module count as one region, and the second primary is reported although it belongs to a different region. A precise notion of region would need the rule to understand view structure. The change record names the limit and the remedy, one region per file, which every file in this app already follows.',
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-11` in the `creaseui-demo` repository, and `git diff chapter-10 chapter-11` shows all of it. Chapter 12 hands the system to agents: three of them get the same ticket, and the chapter compares what they build.',
    ),
  ])
