import type { Html, HtmlBuilder } from 'foldkit/html'

import agents from '../../generated/06/AGENTS.md?raw'
import check from '../../generated/06/check.txt?raw'
import eslintDiff from '../../generated/06/eslint.config.diff?raw'
import lintBoundary from '../../generated/06/lint-boundary.txt?raw'
import scope from '../../generated/06/scope.txt?raw'
import staleDiff from '../../generated/06/stale-diff.txt?raw'
import staleDoctor from '../../generated/06/stale-doctor.txt?raw'
import staleLint from '../../generated/06/stale-lint.txt?raw'
import staleTsc from '../../generated/06/stale-tsc.txt?raw'
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
  p,
} from '../../shared/prose'
import { boundaryMap, placementMatrix, verdicts } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const boundaryFixture = `import type { Html, HtmlBuilder } from 'foldkit/html'

import { renderButton } from '@/lib/button'
import { buttonVariants } from '@/ui/button'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): ReadonlyArray<Html> => [
  renderButton({ children: ['Save'] }, [], h),
  h.button([h.Class(buttonVariants({ intent: 'primary' }))], ['Save']),
]`

const twoKinds = agents
  .slice(agents.indexOf('## Two kinds of change'), agents.indexOf('## Checks'))
  .trimEnd()

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 6,
      title: 'Contracts and boundaries',
      dek: 'This chapter makes the public API of each component the only way to use it, shrinks migration mode to one file, and separates feature changes from design-system changes.',
      from: 'chapter-05',
      to: 'chapter-06',
      filesChanged: 6,
    }),

    p(
      h,
      "After chapter 5, Button accepts two intents and one shape, and the lint rejects every other value, as long as feature code calls `button`. Three other ways to draw a button were still open: call the function `button` is built on, draw a raw `<button>` with Button's own classes, or keep passing classes and let migration mode absorb them.",
    ),
    p(
      h,
      "Chapter 5 left four files in migration mode, where a finding is only a warning, and set the ratchet to one warning. The ratchet counts warnings but not where they are: fix the group header's `bg-muted` and add an override to My issues in the same commit, and the count stays at one.",
    ),
    p(
      h,
      'Each of these routes keeps the build green when the API is in the way. This chapter closes them and writes down where the lines run.',
    ),

    h2(h, 'map', 'The map'),
    p(
      h,
      'Crease Tasks has six kinds of file, and each may use some of the others. Choose a layer to see what it may use and which check holds that line.',
    ),
    figure(h, {
      n: 1,
      title: 'Who may use what',
      caption:
        'The layers of `design-system/boundaries.md` at `chapter-06`. Green marks the layers the selected one may use.',
      body: [boundaryMap(h, model)],
    }),
    p(
      h,
      'Features see only components. Components may draw raw elements and call implementations, and implementations are reachable only from components. The enforcement files in the top right decide all of this; the second half of this chapter is about them.',
    ),

    h2(h, 'around', 'Three ways around the API'),
    p(
      h,
      'Here are the first two routes, and a class on a raw element, in one file that is not in migration mode:',
    ),
    figure(h, {
      n: 2,
      title: 'Going around Button',
      caption:
        'A fixture in `src/fixtures`, outside migration mode, so every finding is an error.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(h, 'src/fixtures/boundary-fixture.ts', boundaryFixture),
            terminal(
              h,
              'npx eslint src/fixtures/boundary-fixture.ts',
              lintBoundary,
            ),
          ],
        ),
      ],
    }),
    p(
      h,
      '`renderButton` is registered in `crease.lock.json` as an implementation, so calling it from a feature is rejected, with the reason and the public replacement. A raw `button` is rejected anywhere outside a registered component, and `h.Class` is rejected in feature code whatever it contains. `buttonVariants` itself is allowed; it only returns a string. Nothing left in feature code may receive that string.',
    ),

    h2(h, 'placement', 'What a feature may pass to a component'),
    p(
      h,
      'Features do pass classes to components: a search field needs a width, and a toolbar needs one button pushed to the end. The lint lets through classes that place a component and rejects classes that change how it looks. To find where that line runs, Crease Tasks ran the lint on 108 calls: 18 classes on 6 components.',
    ),
    figure(h, {
      n: 3,
      title: 'Placement or appearance?',
      caption:
        'Every cell is a real lint result at `chapter-06`. Choose one to read the message.',
      body: [placementMatrix(h, model)],
    }),
    p(
      h,
      'Margin, width, `min-w-0`, `flex-1`, alignment and order pass everywhere. A height passes on everything except `button` and `input`, which own their height through decision D4 and the theme. Padding, gap, corners, borders, colours, shadows, type and truncation fail everywhere, because each of them is a variant, a token or a pattern.',
    ),
    p(
      h,
      "One row looks wrong. `hidden md:flex` fails on every component, although hiding something below a breakpoint is the parent's decision, like its width. crease has no other way to express it: `stack` has no visibility option. This is on the guide's list of crease issues.",
    ),

    h2(h, 'migration', 'Migration mode shrinks to one file'),
    p(
      h,
      'Migration mode lets a project adopt the lint before everything is fixed, and should cover only the files that still have findings. After chapter 5, three of the four files in it were clean, so chapter 6 takes them out:',
    ),
    figure(h, {
      n: 4,
      title: 'Migration mode, before and after',
      caption: 'The whole change to `eslint.config.js`.',
      bare: true,
      body: [
        diffView(
          h,
          'eslint.config.js',
          eslintDiff,
          'git diff chapter-05 chapter-06',
        ),
      ],
    }),
    p(
      h,
      'Now `src/features/issues.ts` is the only file where a finding is a warning, and it has exactly one: the group header that chapter 7 replaces. An override anywhere else fails the build, whatever the ratchet says.',
    ),

    h2(h, 'commands', 'One command to check, one to ask'),
    p(
      h,
      'Chapter 6 also bundles the checks. `npm run check` runs the typecheck, the lint with its ratchet, `creaseui-lint doctor` (which reports any UI file the lint does not cover) and the CSS policy:',
    ),
    figure(h, {
      n: 5,
      title: 'npm run check',
      caption: 'At `chapter-06`. The one warning is the group header.',
      bare: true,
      body: [
        terminal(h, 'npm run check', check.replace(/^> .*\n?/gmu, '').trim()),
      ],
    }),
    p(
      h,
      '`npm run scope` asks something else: did this change touch the files that decide what everything else may do? Those are `crease.lock.json`, `eslint.config.js`, the scripts in `package.json` and `AGENTS.md`. For a feature change the answer has to be no. For this chapter it is yes, as it should be:',
    ),
    figure(h, {
      n: 6,
      title: 'The scope report on this chapter',
      caption:
        'The output of `npx creaseui-lint scope --baseline chapter-05`. This chapter is a design-system change, so it lists four enforcement changes.',
      bare: true,
      body: [reviewComment(h, scope, 'chapter-05')],
    }),
    p(
      h,
      '`AGENTS.md`, the file agents read first, now describes the two kinds of change:',
    ),
    figure(h, {
      n: 7,
      title: 'The two kinds of change',
      caption: 'From `AGENTS.md` at `chapter-06`.',
      bare: true,
      body: [codeBlock(h, 'AGENTS.md', twoKinds)],
    }),
    p(
      h,
      '`AGENTS.md` does not stop anyone; an agent can still edit `eslint.config.js`. The lint cannot stop it either, because it runs inside the change it checks. The edit does show up in `npm run scope`, and when a protected CI job runs that command against the merge base, the edit cannot pass as a feature.',
    ),

    h2(h, 'receipt', 'When the source and the receipt disagree'),
    p(
      h,
      "One gap is left, and it is in crease. A component's variants live in two places: its TypeScript type and its entry in `crease.lock.json`. Chapter 5 changed both in one commit. This is what happens when someone changes only the source and adds a `danger` intent to Button:",
    ),
    figure(h, {
      n: 8,
      title: 'Three checks, three answers',
      caption:
        "The same change seen by each check. `src/fixtures/stale.ts` calls `button({ intent: 'danger' })`.",
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            verdicts(h, [
              { check: 'tsc --noEmit', answer: 'Accepts it', good: false },
              { check: 'eslint', answer: 'Rejects it', good: true },
              {
                check: 'creaseui-lint doctor',
                answer: 'Reports nothing',
                good: false,
              },
            ]),
            diffView(
              h,
              'src/ui/button.ts',
              staleDiff,
              'an edit that skips the receipt',
            ),
            terminal(h, 'npx tsc --noEmit', staleTsc),
            terminal(h, 'npx eslint src/fixtures/stale.ts', staleLint),
            terminal(h, 'npx creaseui-lint doctor', staleDoctor),
          ],
        ),
      ],
    }),
    p(
      h,
      "TypeScript accepts the new value, the lint rejects it because the receipt does not list it, and `doctor` finds nothing to report. Nothing breaks, since the lint wins, but the first person to use the new intent gets an error that contradicts the type. The fix belongs in crease: `doctor` should compare each receipt entry with the component's variants. Until it does, `design-system/boundaries.md` asks for both changes in the same commit.",
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-06` in the `creaseui-demo` repository, and `git diff chapter-05 chapter-06` shows all of it. Chapter 7 builds the first patterns: one `IssueRow` for every view, a picker that changes an issue in place, and the full sidebar with teams and saved views.',
    ),
  ])
