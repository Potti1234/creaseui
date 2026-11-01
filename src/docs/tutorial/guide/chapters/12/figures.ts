import type { Html, HtmlBuilder } from 'foldkit/html'

import diffA from '../../generated/12/bugs-a.diff?raw'
import diffB from '../../generated/12/bugs-b.diff?raw'
import diffC from '../../generated/12/bugs-c.diff?raw'
import { diffView } from '../../shared/artifacts'
import { inline, segmented } from '../../shared/prose'
import { type Agent, type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

const HASH = '0f31c8ff…'

export const ticket = (h: H): Html =>
  h.div(
    [h.Class('rounded-xl bg-background p-5 shadow-[0_0_0_1px_var(--border)]')],
    [
      h.div(
        [
          h.Class(
            'mb-2 text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
          ),
        ],
        ['Ticket'],
      ),
      h.p(
        [h.Class('text-[16px] leading-[1.6] text-foreground')],
        [
          "Add an 'Active bugs' view. The sidebar's Views section gets an entry 'Active bugs', next to Urgent & high and Unassigned. It shows the issues that have the label Bug and whose status is Todo, In Progress or In Review, grouped by status.",
        ],
      ),
      h.p(
        [h.Class('mt-3 text-[13px] text-muted-foreground')],
        [
          'Given word for word to three agents, each in its own worktree of chapter-11, with no hint about the patterns or the documents.',
        ],
      ),
    ],
  )

export const screens = (h: H): Html =>
  h.div(
    [h.Class('grid gap-3 sm:grid-cols-3')],
    (['a', 'b', 'c'] as const).map(agent =>
      h.figure(
        [h.Class('flex flex-col gap-1.5')],
        [
          h.img([
            h.Attribute('src', `/shots/12/bugs-${agent}.png`),
            h.Attribute(
              'alt',
              `The Bugs page built by agent ${agent.toUpperCase()}`,
            ),
            h.Class('w-full rounded-lg shadow-[0_0_0_1px_var(--border)]'),
          ]),
          h.figcaption(
            [h.Class('flex justify-between text-[12px] text-muted-foreground')],
            [
              h.span(
                [h.Class('font-semibold text-foreground')],
                [`Agent ${agent.toUpperCase()}`],
              ),
              h.span([h.Class('font-mono')], [`md5 ${HASH}`]),
            ],
          ),
        ],
      ),
    ),
  )

const ROWS: ReadonlyArray<
  Readonly<{
    label: string
    values: Readonly<Record<Agent, string>>
    differs?: boolean
  }>
> = [
  {
    label: 'Found AGENTS.md and patterns.md',
    values: { a: 'yes', b: 'yes', c: 'yes' },
  },
  {
    label: 'One entry added to src/features/views.ts',
    values: { a: 'yes', b: 'yes', c: 'yes' },
  },
  {
    label: 'New layouts, rows, menus or classes',
    values: { a: 'none', b: 'none', c: 'none' },
  },
  { label: 'Enforcement changes (scope)', values: { a: '0', b: '0', c: '0' } },
  {
    label: 'npm run check · browser check',
    values: { a: 'pass · 15/15', b: 'pass · 15/15', c: 'pass · 15/15' },
  },
  {
    label: "The view's id",
    values: { a: 'bugs', b: 'active-bugs', c: 'active-bugs' },
    differs: true,
  },
  {
    label: 'Tests',
    values: {
      a: 'new test/views.test.ts',
      b: 'new test/views.test.ts',
      c: 'test/update.test.ts',
    },
    differs: true,
  },
  {
    label: 'Lines added',
    values: { a: '31', b: '31', c: '26' },
    differs: true,
  },
]

export const comparison = (h: H): Html =>
  h.div(
    [
      h.Class(
        'overflow-x-auto rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.table(
        [h.Class('w-full text-left text-[13px]')],
        [
          h.thead(
            [h.Class('bg-muted/40 text-[12px] text-muted-foreground')],
            [
              h.tr(
                [],
                [
                  h.th([h.Class('px-4 py-2 font-medium')], []),
                  ...(['A', 'B', 'C'] as const).map(name =>
                    h.th([h.Class('px-4 py-2 font-medium')], [`Agent ${name}`]),
                  ),
                ],
              ),
            ],
          ),
          h.tbody(
            [h.Class('divide-y divide-border/60')],
            ROWS.map(row =>
              h.tr(
                [h.Class(row.differs === true ? 'bg-amber-50/60' : '')],
                [
                  h.td([h.Class('px-4 py-2 text-foreground')], [row.label]),
                  ...(['a', 'b', 'c'] as const).map(agent =>
                    h.td(
                      [
                        h.Class(
                          'px-4 py-2 font-mono text-[12px] text-foreground/85',
                        ),
                      ],
                      [row.values[agent]],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  )

const DIFFS: Readonly<Record<Agent, string>> = { a: diffA, b: diffB, c: diffC }

/** Only the hunks of the files where the agents differ most. */
const filesOf = (diff: string, files: ReadonlyArray<string>): string =>
  diff
    .split(/(?=^diff --git )/mu)
    .filter(part =>
      files.some(file => part.startsWith(`diff --git a/${file} `)),
    )
    .join('')

export const codeFlip = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'Agent',
        (['a', 'b', 'c'] as const).map(agent => ({
          value: agent,
          label: `Agent ${agent.toUpperCase()}`,
        })),
        model.agent,
        agent => M.ChoseAgent({ agent }),
      ),
      h.p(
        [h.Class('text-[13px] text-muted-foreground')],
        inline(
          h,
          model.agent === 'a'
            ? 'Agent A names the view `bugs` and puts its tests in a new `test/views.test.ts`.'
            : model.agent === 'b'
              ? 'Agent B names the view `active-bugs` and puts its tests in a new `test/views.test.ts`.'
              : 'Agent C names the view `active-bugs` and adds its test to `test/update.test.ts`.',
        ),
      ),
      diffView(
        h,
        `the change of agent ${model.agent.toUpperCase()}`,
        filesOf(DIFFS[model.agent], [
          'src/features/views.ts',
          'src/model.ts',
          'test/views.test.ts',
          'test/update.test.ts',
        ]),
        "the agent's uncommitted change",
      ),
    ],
  )
