import type { Html, HtmlBuilder } from 'foldkit/html'

import badgeDiff from '../../generated/10/badge.diff?raw'
import lockDiff from '../../generated/10/lock.diff?raw'
import loosenDiff from '../../generated/10/loosen.diff?raw'
import policySource from '../../generated/10/product-policy.js?raw'
import scopeLoosen from '../../generated/10/scope-loosen.txt?raw'
import { codeBlock, diffView, reviewComment } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  p,
} from '../../shared/prose'
import { labelFlip, whoSaysNo } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 10,
      title: 'Configure the product policy',
      dek: "This chapter collects the rules from crease's lint, the receipt and the ESLint configuration into one policy in three layers, narrows two components in the receipt, and finds where configuration ends.",
      from: 'chapter-09',
      to: 'chapter-10',
      filesChanged: 11,
    }),

    p(
      h,
      'After chapter 9, the answer to "may a view use a filled badge?" was spread over a lint package, a JSON receipt with hundreds of lines, and an object in the middle of `eslint.config.js`. Each was correct, but none of them said what the product had decided, or why.',
    ),
    p(
      h,
      "This chapter writes the policy down in three layers. Each layer may only narrow the one before it, and each is changed in its own place by a design-system change. Each layer answers a different question for a different reader: crease's rules say what any crease app may do, the receipt says which values this product uses, and the product rules say which components a view may reach.",
    ),

    h2(h, 'layers', 'Three layers, one question'),
    p(
      h,
      'Choose a call. Each was linted as feature code at `chapter-10`, and the figure shows which layer rejected it.',
    ),
    figure(h, {
      n: 1,
      title: 'Which layer says no?',
      caption:
        "Seven calls in a feature file, linted at `chapter-10`. The message is the lint's own.",
      body: [whoSaysNo(h, model)],
    }),
    p(
      h,
      "crease's strict rules are the floor: no raw elements, no appearance classes, no implementation imports. The allowed values in the lock file narrow each component to what the product uses. The product rules on top say which components feature code may reach at all. The lint checks all three at once, and each call is rejected by the layer whose question it touches.",
    ),

    h2(h, 'narrow', 'Narrowing without touching a component'),
    p(
      h,
      "Chapter 5 narrowed Button by editing its source, so the variants were gone from the type and the compiler found every caller. That fits when the product disagrees with a component. Often the product only uses less of it. crease's `text` has eleven sizes; Crease Tasks uses `xsm` and `sm`. The badge has six variants; the product uses one. For those, the receipt is enough:",
    ),
    figure(h, {
      n: 2,
      title: 'Allowed values',
      caption:
        "The receipt diff of this chapter. `src/ui/text.ts` and the badge's other variants are unchanged.",
      bare: true,
      body: [
        diffView(
          h,
          'crease.lock.json',
          lockDiff,
          'git diff chapter-09 chapter-10',
        ),
      ],
    }),
    p(
      h,
      'The component source stays as crease wrote it, so a later crease update merges without conflicts, and giving a view a third text size is a one-line receipt change that a reviewer can read.',
    ),

    h2(h, 'replace', 'Replacing a default on purpose'),
    p(
      h,
      "Sometimes a product needs a choice to look different instead. Crease Tasks shows issue labels as outline badges, and crease's outline badge uses the full text colour. Decision D2 says metadata is quiet, and labels are metadata. So the outline look itself changes, in the component, with the reason beside it:",
    ),
    figure(h, {
      n: 3,
      title: 'The label look',
      caption:
        'The same `IssueRow` at `chapter-09` and `chapter-10`. Only `src/ui/badge.ts` changed.',
      body: [labelFlip(h, model)],
    }),
    figure(h, {
      n: 4,
      title: 'The replacement',
      caption: 'The whole change to `src/ui/badge.ts`.',
      bare: true,
      body: [
        diffView(
          h,
          'src/ui/badge.ts',
          badgeDiff,
          'git diff chapter-09 chapter-10',
        ),
      ],
    }),
    p(
      h,
      "This replacement will conflict when crease changes the same line. The conflict asks whether the product's reason still holds, and the comment at the variant gives the reviewer that reason.",
    ),

    h2(h, 'product', "The product's own rules"),
    p(
      h,
      'The import rule from chapter 7 moves out of `eslint.config.js` into a module of its own. Each entry names its decision, and the module adds `dialog` for D8 and `command` for D9, so a view can neither open its own way to create an issue nor a second command menu.',
    ),
    figure(h, {
      n: 5,
      title: 'policy/product-policy.js',
      caption:
        "At `chapter-10`. `eslint.config.js` spreads it after crease's rules.",
      bare: true,
      body: [codeBlock(h, 'policy/product-policy.js', policySource.trimEnd())],
    }),
    p(
      h,
      'Does `npm run scope` still see a change to a rule in this module? A feature change that deletes a line from it would loosen the policy. So I deleted the `item` rule, without committing, and ran `scope`:',
    ),
    figure(h, {
      n: 6,
      title: 'Loosening the policy',
      caption:
        'The uncommitted change, and `npx creaseui-lint scope --baseline HEAD`.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            diffView(
              h,
              'policy/product-policy.js',
              loosenDiff,
              'git diff (uncommitted)',
            ),
            reviewComment(h, scopeLoosen, 'HEAD'),
          ],
        ),
      ],
    }),
    p(
      h,
      '`scope` follows the modules the ESLint configuration imports, so the policy can live in its own file without leaving the review net. I had written the opposite into the first draft of `design-system/policy.md` and corrected it after this run.',
    ),

    h2(h, 'limits', 'Where configuration ends'),
    p(
      h,
      "Figure 1 has one call that no layer rejects although the receipt seems to forbid it. A heading's `level` is a number, and the lint resolves only string values against the receipt. I tried narrowing `level` to 4, saw it had no effect, and took it back out, so the receipt does not claim a rule it cannot keep. It is on the guide's list of crease issues, together with the other half of the gap: crease's strict configuration has no declarative place yet for forbidding a prop or allowing a placement class per component.",
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-10` in the `creaseui-demo` repository, and `git diff chapter-09 chapter-10` shows all of it. Chapter 11 writes a lint rule of its own, for a decision no configuration can express: one primary action per file.',
    ),
  ])
