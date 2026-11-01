import type { Html, HtmlBuilder } from 'foldkit/html'

import principlesDiff from '../../generated/03/principles.md.diff?raw'
import brief from '../../generated/03/product-brief.md?raw'
import { codeBlock, diffView } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  list,
  p,
} from '../../shared/prose'
import { decisionExplorer, ladder } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 3,
      title: 'Write down principles and decisions',
      dek: 'This chapter adds no code. It writes a short product brief and ten decisions, each naming the code that enforces it or the chapter that will build that code.',
      from: 'chapter-02',
      to: 'chapter-03',
      filesChanged: 2,
    }),

    p(
      h,
      'In chapter 2, All issues, My issues and Search each decided on their own what an issue row looks like, and they decided differently. Nothing written down said otherwise.',
    ),
    p(
      h,
      "Matt Rothenberg describes the same effect in [You Don't Have a Design System](https://mattrothenberg.com/notes/you-dont-have-a-design-system/). Three agents with the same component library built three settings pages that used tabs, cards and long forms in different places. After he wrote the rules for a settings page next to the code, the next three pages were much more alike.",
    ),
    p(
      h,
      'This chapter writes the decisions for Crease Tasks in two files in `design-system/`.',
    ),

    h2(h, 'brief', 'The brief'),
    p(
      h,
      'The brief says what the product is, what the tutorial app covers, and what Linear is used for:',
    ),
    figure(h, {
      n: 1,
      title: 'The product brief',
      caption:
        '`design-system/product-brief.md` at `chapter-03`, the whole file.',
      bare: true,
      body: [codeBlock(h, 'design-system/product-brief.md', brief.trimEnd())],
    }),
    p(
      h,
      "Linear is the reference for how the product should feel, not a specification. Linear does not publish its measurements, so the numbers in the decisions are Crease Tasks' own, and a review can check them against this file instead of against a guess about the reference.",
    ),

    h2(h, 'ladder', 'Principle, decision, enforcement'),
    p(
      h,
      '`design-system/principles.md` is built from three layers, and each answers a different question:',
    ),
    figure(h, {
      n: 2,
      title: 'From principle to code',
      caption:
        'Principle 1 and decision D1, with the enforcing place it has at `chapter-07`.',
      body: [ladder(h)],
    }),
    list(h, [
      'A principle says why. "The issue is the loudest thing on the screen" explains the decisions below it, but it does not say how to build a row.',
      'A decision says what a builder does. "One height (36px), never wraps, the title is cut with an ellipsis" gives two people the same row.',
      'The enforcing place is the code that makes the decision hard to break: a type, a component option, a lint rule or a check. Until it exists, the decision is a convention.',
    ]),
    p(
      h,
      'Every decision in the file therefore has an "Enforced by" column. When the code does not exist yet, the column names the chapter that will build it.',
    ),

    h2(h, 'decisions', 'The ten decisions'),
    p(
      h,
      'Choose a decision to see its principle, and where it was enforced when it was written and five chapters later.',
    ),
    figure(h, {
      n: 3,
      title: 'Ten decisions, then and now',
      caption:
        'Parsed from `design-system/principles.md` at `chapter-03` and at `chapter-07`. A decision counts as planned while its column still names a chapter that has not built the place.',
      body: [decisionExplorer(h, model)],
    }),
    p(
      h,
      'At `chapter-03`, only D10 has an enforcing place: the issue vocabulary is already a schema in `src/domain.ts`. By `chapter-07`, seven of the ten do. Three still point ahead. D8 waits for the composer. D6 names a page header pattern that chapter 7 did not need to build, because the app has no main page action yet. D9, "every action has a pointer route", is a decision no type can hold, and its column says so: review and browser checks.',
    ),

    h2(h, 'changes', 'How a decision changes'),
    p(
      h,
      'The file ends with one rule about itself: a decision changes in the same commit as its enforcing code, with the reason in the commit message. Here is everything that happened to the file between chapter 3 and chapter 7:',
    ),
    figure(h, {
      n: 4,
      title: 'principles.md, chapter 3 to chapter 7',
      caption:
        'Only the "Enforced by" column changed. Chapter 5 filled it for D1, D4 and D5; chapter 7 for D2, D3 and D7.',
      bare: true,
      body: [
        diffView(
          h,
          'design-system/principles.md',
          principlesDiff,
          'git diff chapter-03 chapter-07',
        ),
      ],
    }),
    p(
      h,
      'No decision text changed, and each new entry arrived in the same commit as the code it names. The decisions cover the screens that exist; a new screen that needs a decision gets one before it is built, which chapter 7 turns into a rule for builders.',
    ),

    essayFooter(
      h,
      "The documents for this chapter are in the tag `chapter-03` of the `creaseui-demo` repository. Chapter 4 generates the theme with crease's preset compiler and adds a dark mode.",
    ),
  ])
