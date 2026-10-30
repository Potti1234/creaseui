import type { Html, HtmlBuilder } from 'foldkit/html'

import { codeBlock } from '../../shared/artifacts'
import { factTable } from '../../shared/early'
import {
  essayFooter,
  essayPage,
  eyebrow,
  figure,
  h2,
  inline,
  list,
  p,
} from '../../shared/prose'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const install = `npx shadcn@latest add Potti1234/creaseui/crease-theme --yes
npx shadcn@latest add Potti1234/creaseui/button Potti1234/creaseui/item --yes
npx creaseui-lint init --renderer tailwind   # writes crease.lock.json and eslint.config.js`

const scripts = `"lint": "eslint src --max-warnings 13",
"check": "tsc --noEmit && eslint src --max-warnings 0 && creaseui-lint doctor && creaseui-lint css && vitest run",
"scope": "creaseui-lint scope --baseline HEAD"`

const header = (h: H): Html =>
  h.header(
    [h.Class('pt-16 pb-6 sm:pt-24')],
    [
      h.div(
        [h.Class('flex items-center gap-3')],
        [
          h.a(
            [
              h.Href('/docs/tutorial'),
              h.Class(
                'text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground',
              ),
            ],
            ['Crease design-system guide'],
          ),
          h.span([h.Class('text-muted-foreground/60')], ['·']),
          eyebrow(h, 'The short version'),
        ],
      ),
      h.h1(
        [
          h.Class(
            'mt-4 text-[40px] leading-[1.08] font-semibold tracking-[-0.025em] text-foreground sm:text-[48px]',
          ),
        ],
        ['crease in one page'],
      ),
      h.p(
        [h.Class('mt-5 text-[19px] leading-[1.6] text-muted-foreground')],
        inline(
          h,
          'The steps of building a design system on crease, in the order the guide takes them, each with the chapter that shows it in detail.',
        ),
      ),
    ],
  )

const chapter = (n: number): string =>
  `[chapter ${n}](/docs/tutorial/${String(n).padStart(2, '0')})`

export const view = (_model: Model, h: H): Html =>
  essayPage(h, [
    header(h),

    h2(h, 'idea', 'The idea'),
    p(
      h,
      `crease copies its components into your project as source, so you own them. A design system on top of crease is the set of decisions about how your product uses those components, written where tools can check them. The guide builds one for Crease Tasks, an issue tracker modelled on Linear (${chapter(1)}).`,
    ),
    figure(h, {
      n: 1,
      title: 'Where the decisions live',
      caption:
        'The files of Crease Tasks that carry decisions, and the check that reads each one.',
      bare: true,
      body: [
        factTable(
          h,
          ['File', 'Holds', 'Checked by'],
          [
            [
              '`design-system/principles.md`',
              'The product decisions, each with the code that enforces it',
              'Review',
            ],
            [
              '`src/theme/`',
              "Tokens and control sizes from crease's preset compiler",
              '`creaseui-lint css`',
            ],
            [
              '`src/ui/`, `src/lib/`',
              "crease's components, narrowed or extended by the product",
              'TypeScript, the lint',
            ],
            [
              '`crease.lock.json`',
              'Installed files and the values each component accepts',
              'The lint, `doctor`',
            ],
            [
              '`src/design/`',
              'Named patterns: rows, collections, pickers, navigation',
              'The lint, tests',
            ],
            [
              '`policy/`, `eslint.config.js`',
              "Which components features may use, the product's own rules",
              'The lint, `scope`',
            ],
            [
              '`AGENTS.md`, `design-system/patterns.md`',
              'Where to look, and when to stop and ask',
              'Review, drift tests',
            ],
          ],
        ),
      ],
    }),

    h2(h, 'start', '1. Install with the lint on'),
    p(
      h,
      `Install the theme first, then only the components the first screens need. \`creaseui-lint init\` writes the receipt and a strict lint configuration. Build the first screens quickly; put their files in migration mode, where findings are warnings, and freeze the count with \`--max-warnings\` (${chapter(2)}).`,
    ),
    codeBlock(h, 'terminal', install),

    h2(h, 'decide', '2. Write decisions with an address'),
    p(
      h,
      `Write a short product brief, then decisions a builder can apply ("one height, never wraps"), each naming the code that enforces it or the chapter that will build that code (${chapter(3)}).`,
    ),

    h2(h, 'theme', '3. Generate the theme'),
    p(
      h,
      `Keep the preset code and the reason for each setting, not a hand-edited stylesheet. Split the output into tokens and registered theme CSS, so it passes crease\'s CSS policy. Check dark mode on real screens: it found two missing sidebar tokens in Crease Tasks (${chapter(4)}).`,
    ),

    h2(h, 'components', '4. Turn overrides into options'),
    list(h, [
      "Read the lint warnings grouped by class. A class that repeats across views is a missing variant; add it to your copy of the component, with a default that keeps crease's behaviour.",
      "Remove the values your product does not use from the component's types, and let the compiler list the callers.",
      `Record the allowed values in \`crease.lock.json\`, so the lint also catches values that reach a component through a variable (${chapter(5)}).`,
    ]),

    h2(h, 'boundaries', '5. Draw the boundaries'),
    p(
      h,
      `Feature code calls components only: no implementations, no raw elements, no appearance classes. Keep migration mode to files that still have findings. One command runs every check, and \`creaseui-lint scope\`, run in a protected CI job, separates feature changes from changes to the rules (${chapter(6)}).`,
    ),
    codeBlock(h, 'package.json', scripts),

    h2(h, 'patterns', '6. Name the patterns'),
    p(
      h,
      `Build the product\'s own patterns in \`src/design\`, from crease components, with their rules in a comment at the top. List them in \`patterns.md\`, and forbid feature code from importing the components the patterns wrap. When a pattern needs something a component cannot do, give your copy of the component a named option (${chapter(7)}).`,
    ),

    h2(h, 'workflows', '7. Decide where a change becomes real'),
    p(
      h,
      `Small edits commit on change and are saved by a Command; creating something has a draft and an explicit commit. Storage is a service, so tests can provide one that fails (${chapter(8)}).`,
    ),

    h2(h, 'verify', '8. Test the checks'),
    p(
      h,
      `Use Story tests for \`update\`, lint fixtures for the lint itself, and a browser check for layout, focus and storage. Then break the app on purpose and see which check notices. A regression no check catches shows where a check is missing (${chapter(9)}).`,
    ),

    h2(h, 'policy', '9. Write the policy down'),
    p(
      h,
      `Keep three layers: crease\'s rules, the values in the receipt, and the product\'s rules in their own module. Narrow in the receipt when the product uses less of a component; edit the source when it disagrees with it. A decision that configuration cannot express gets its own lint rule, with tests that fail when the rule stops reporting (${chapter(10)}, ${chapter(11)}).`,
    ),

    h2(h, 'agents', '10. Work with agents'),
    p(
      h,
      `Give several agents the same ticket and compare the results: each difference is a decision the system has not made. Tell agents to describe a new pattern and stop, instead of building it in a feature task. Run design-system changes as their own task, with the files they may and may not touch, the review notes, and the checks to run (${chapter(12)}, ${chapter(13)}).`,
    ),

    h2(h, 'change', '11. Change APIs in three steps'),
    p(
      h,
      `Add the new API and mark the old one deprecated with a lint warning, with the ratchet set to the current count. Move every caller. Remove the old API and the warning together, and let the compiler find any caller the warning missed (${chapter(14)}).`,
    ),

    h2(h, 'upstream', '12. Take in crease updates'),
    p(
      h,
      `The installed components are your files, so a crease update is a diff to merge. Limit the upstream diff to the files in \`crease.lock.json\`. Where upstream fixed something you worked around, take upstream and delete the workaround; where only upstream changed, take it; where both changed, merge with \`git merge-file\` and keep your product decisions. Record it as a design-system change (${chapter(15)}).`,
    ),

    essayFooter(
      h,
      'The code is the repository `creaseui-demo`; every chapter from 2 on is a tag. Chapter 1 explains how the guide is organised.',
    ),
  ])
