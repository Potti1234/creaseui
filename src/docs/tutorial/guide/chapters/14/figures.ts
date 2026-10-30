import type { Html, HtmlBuilder } from 'foldkit/html'

import step1Collection from '../../generated/14/step1-collection.diff?raw'
import step1Policy from '../../generated/14/step1-policy.diff?raw'
import step2Views from '../../generated/14/step2-views.diff?raw'
import step3Collection from '../../generated/14/step3-collection.diff?raw'
import { diffView } from '../../shared/artifacts'
import { inline, segmented } from '../../shared/prose'
import { type Message, Message as M, type Model, type Page } from './model'

type H = HtmlBuilder<Message>

type Step = Readonly<{
  commit: string
  title: string
  what: string
  controls: string
  warnings: string
  ratchet: string
  diffs: ReadonlyArray<Readonly<{ file: string; diff: string }>>
}>

const STEPS: ReadonlyArray<Step> = [
  {
    commit: '28ab20e',
    title: 'Add and deprecate',
    what: '`IssueCollection` gets `display` and `actions`. `controls` stays, now optional and marked deprecated. A policy rule warns at every caller that still passes it, and the ratchet allows exactly the four warnings that exist.',
    controls: 'optional, deprecated',
    warnings: '4',
    ratchet: '--max-warnings 4',
    diffs: [
      { file: 'src/design/issue-collection.ts', diff: step1Collection },
      { file: 'policy/product-policy.js, package.json', diff: step1Policy },
    ],
  },
  {
    commit: '4891224',
    title: 'Migrate every caller',
    what: 'Each view passes data instead of buttons. Three views drop their `button` import, and the saved views drop an empty `controls: []`. The warnings reach zero and the ratchet goes back to zero with them, so a new `controls` caller would now fail `npm run check`.',
    controls: 'unused',
    warnings: '0',
    ratchet: '--max-warnings 0',
    diffs: [{ file: 'src/features/*.ts', diff: step2Views }],
  },
  {
    commit: '441c64f',
    title: 'Remove',
    what: "The prop, its fallback and the deprecation rule go. The policy file is byte for byte what it was at `chapter-13`. The pattern's rules comment now describes the bar and names D13.",
    controls: 'removed',
    warnings: '0',
    ratchet: '--max-warnings 0',
    diffs: [{ file: 'src/design/issue-collection.ts', diff: step3Collection }],
  },
]

const stat = (h: H, label: string, value: string): Html =>
  h.div(
    [h.Class('flex flex-col gap-0.5 rounded-lg bg-muted/40 px-3 py-2')],
    [
      h.span([h.Class('text-[11.5px] text-muted-foreground')], [label]),
      h.span([h.Class('font-mono text-[13px] text-foreground')], [value]),
    ],
  )

export const steps = (h: H, model: Model): Html => {
  const step = STEPS[model.step] ?? STEPS[0]!
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.ol(
        [h.Class('grid grid-cols-3 gap-1.5')],
        STEPS.map((each, index) =>
          h.li(
            [],
            [
              h.button(
                [
                  h.Type('button'),
                  h.AriaPressed(index === model.step ? 'true' : 'false'),
                  h.OnClick(M.ChoseStep({ step: index })),
                  h.Class(
                    `flex h-full w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors ${index === model.step ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
                  ),
                ],
                [
                  h.span(
                    [h.Class('font-mono text-[11px] opacity-70')],
                    [`Step ${index + 1} · ${each.commit}`],
                  ),
                  h.span(
                    [h.Class('text-[13px] leading-tight font-semibold')],
                    [each.title],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'flex flex-col gap-3 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.p(
            [h.Class('text-[14.5px] leading-[1.6] text-foreground/90')],
            inline(h, step.what),
          ),
          h.div(
            [h.Class('grid grid-cols-3 gap-2')],
            [
              stat(h, 'controls', step.controls),
              stat(h, 'Lint warnings', step.warnings),
              stat(h, 'Ratchet', step.ratchet),
            ],
          ),
        ],
      ),
      ...step.diffs.map(each =>
        diffView(h, each.file, each.diff, `step ${model.step + 1}`),
      ),
    ],
  )
}

const PAGES: Record<
  Page,
  Readonly<{ label: string; before: string; after: string }>
> = {
  all: {
    label: 'All issues',
    before: '"Grouped by status" names the value but not the option.',
    after: '"Grouping: Status" has the same shape as every other option.',
  },
  team: {
    label: 'A team',
    before:
      '"Layout: List" next to "Grouped by status": two shapes on one bar.',
    after: '"Layout: List" and "Grouping: Status", in the fixed order.',
  },
  mine: {
    label: 'My issues',
    before: '"Sort" is the only verb on any bar.',
    after: '"Order" is the name every list uses for it.',
  },
  search: {
    label: 'Search',
    before: 'The action comes before the summary it acts on.',
    after: 'Summary first, then the action, as on every bar.',
  },
}

const shot = (
  h: H,
  src: string,
  alt: string,
  tag: string,
  note: string,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-1.5')],
    [
      h.div(
        [h.Class('flex items-baseline gap-2 text-[12.5px]')],
        [
          h.span([h.Class('font-mono font-semibold text-foreground')], [tag]),
          h.span([h.Class('text-muted-foreground')], [note]),
        ],
      ),
      h.img([
        h.Attribute('src', src),
        h.Attribute('alt', alt),
        h.Class(
          'w-full rounded-lg bg-background shadow-[0_0_0_1px_var(--border)]',
        ),
      ]),
    ],
  )

export const bars = (h: H, model: Model): Html => {
  const page = PAGES[model.page]
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      segmented(
        h,
        'Page',
        (['all', 'team', 'mine', 'search'] as const).map(value => ({
          value,
          label: PAGES[value].label,
        })),
        model.page,
        value => M.ChosePage({ page: value }),
      ),
      shot(
        h,
        `/shots/14/before-${model.page}.png`,
        `The ${page.label} bar at chapter-13`,
        'chapter-13',
        page.before,
      ),
      shot(
        h,
        `/shots/14/after-${model.page}.png`,
        `The ${page.label} bar at chapter-14`,
        'chapter-14',
        page.after,
      ),
    ],
  )
}
