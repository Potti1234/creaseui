import type { Html, HtmlBuilder } from 'foldkit/html'

import firstRun from '../../generated/09/break-it-first.json'
import finalRun from '../../generated/09/break-it-final.json'
import { inline, segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

type Regression = Readonly<{
  id: string
  title: string
  file: string
  from: string
  to: string
  caught: Readonly<Record<string, string | null>>
}>

const FIRST = firstRun as ReadonlyArray<Regression>
const FINAL = finalRun as ReadonlyArray<Regression>
export const CHECKS = [
  'types',
  'lint',
  'lint fixtures',
  'tests',
  'browser',
] as const

const CHECK_INFO: Readonly<
  Record<
    (typeof CHECKS)[number],
    Readonly<{ command: string; proves: string; misses: string }>
  >
> = {
  types: {
    command: 'npm run typecheck',
    proves:
      "Removed values written in place; required props such as an icon button's name.",
    misses: 'Values that arrive as a plain `string`, assertions, behaviour.',
  },
  lint: {
    command: 'npm run lint',
    proves:
      'Restyling, raw elements, implementation imports, variant values against the lock file, the product import rule.',
    misses: 'Whether the app does the right thing.',
  },
  'lint fixtures': {
    command: 'npm run check:lint-fixtures',
    proves:
      'That the lint still rejects what it should, after a lint or configuration change.',
    misses: 'Everything the lint does not look at.',
  },
  tests: {
    command: 'npm test',
    proves:
      'update: commits, saves, validation, drafts, and every Command a step produces.',
    misses: 'Layout, CSS and focus in a real page.',
  },
  browser: {
    command: 'npm run check:browser',
    proves:
      'Rows on one line, the same row everywhere, focus after a picker, the composer, reload, failing storage, and component guarantees on a check page.',
    misses: 'Whatever it does not click through.',
  },
}

export const checkCards = (h: H): Html =>
  h.div(
    [h.Class('grid gap-2.5 sm:grid-cols-5')],
    CHECKS.map(check =>
      h.div(
        [
          h.Class(
            'flex flex-col gap-2 rounded-xl bg-background p-3 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.div(
            [h.Class('text-[14px] font-semibold text-foreground capitalize')],
            [check],
          ),
          h.code(
            [h.Class('font-mono text-[11px] text-muted-foreground')],
            [CHECK_INFO[check].command],
          ),
          h.p(
            [h.Class('text-[12.5px] leading-[1.5] text-foreground/85')],
            inline(h, CHECK_INFO[check].proves),
          ),
          h.p(
            [
              h.Class(
                'mt-auto text-[12px] leading-[1.5] text-muted-foreground',
              ),
            ],
            ['Misses: ', ...inline(h, CHECK_INFO[check].misses)],
          ),
        ],
      ),
    ),
  )

const verdict = (h: H, value: string | null | undefined): Html =>
  h.span(
    [
      h.Class(
        `inline-flex h-6 min-w-14 items-center justify-center rounded-md px-2 text-[12px] font-semibold ${value === null ? 'bg-muted/60 text-muted-foreground' : 'bg-rose-500/12 text-rose-700'}`,
      ),
    ],
    [value === null ? 'passes' : 'fails'],
  )

export const breakIt = (h: H, model: Model): Html => {
  const runs = model.chosen === 'wrap' && model.run === 'first' ? FIRST : FINAL
  const regression = runs.find(each => each.id === model.chosen) ?? FINAL[0]!
  const caughtBy = CHECKS.filter(check => regression.caught[check] !== null)
  return h.div(
    [h.Class('grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]')],
    [
      h.div(
        [
          h.Role('group'),
          h.AriaLabel('Regressions'),
          h.Class('flex flex-col gap-1.5'),
        ],
        FINAL.map(each => {
          const isChosen = each.id === model.chosen
          return h.button(
            [
              h.Type('button'),
              h.AriaPressed(isChosen ? 'true' : 'false'),
              h.OnClick(M.ChoseRegression({ id: each.id })),
              h.Class(
                `rounded-lg px-3 py-2 text-left text-[13.5px] leading-snug transition-colors ${isChosen ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
              ),
            ],
            [each.title],
          )
        }),
      ),
      h.div(
        [
          h.Class(
            'flex min-w-0 flex-col gap-3 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          ...(regression.id === 'wrap'
            ? [
                segmented(
                  h,
                  'Run',
                  [
                    {
                      value: 'first' as const,
                      label: 'Before the component check',
                    },
                    { value: 'final' as const, label: 'With it' },
                  ],
                  model.run,
                  run => M.ChoseRun({ run }),
                ),
              ]
            : []),
          h.div(
            [h.Class('font-mono text-[12px] text-muted-foreground')],
            [regression.file],
          ),
          h.pre(
            [
              h.Class(
                'overflow-x-auto rounded-lg bg-muted/40 py-2 font-mono text-[12px] leading-[1.6]',
              ),
            ],
            [
              ...regression.from
                .split('\n')
                .map(line =>
                  h.div(
                    [
                      h.Class(
                        'px-3 whitespace-pre bg-rose-500/10 text-rose-950',
                      ),
                    ],
                    [`- ${line}`],
                  ),
                ),
              ...(regression.to === ''
                ? []
                : regression.to
                    .split('\n')
                    .map(line =>
                      h.div(
                        [
                          h.Class(
                            'px-3 whitespace-pre bg-emerald-500/10 text-emerald-950',
                          ),
                        ],
                        [`+ ${line}`],
                      ),
                    )),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-1.5')],
            CHECKS.map(check =>
              h.div(
                [
                  h.Class(
                    'grid grid-cols-[96px_64px_1fr] items-start gap-2 text-[12.5px]',
                  ),
                ],
                [
                  h.span(
                    [h.Class('pt-0.5 font-medium text-foreground capitalize')],
                    [check],
                  ),
                  verdict(h, regression.caught[check]),
                  h.span(
                    [
                      h.Class(
                        'min-w-0 pt-0.5 font-mono text-[11.5px] break-words text-muted-foreground',
                      ),
                    ],
                    [regression.caught[check] ?? ''],
                  ),
                ],
              ),
            ),
          ),
          h.p(
            [
              h.Class(
                `text-[13.5px] font-medium ${caughtBy.length === 0 ? 'text-rose-700' : 'text-foreground'}`,
              ),
            ],
            [
              caughtBy.length === 0
                ? 'Every check passes. This regression would ship.'
                : `Caught by: ${caughtBy.join(', ')}.`,
            ],
          ),
        ],
      ),
    ],
  )
}

export const coverage = (h: H): Html =>
  h.div(
    [
      h.Class(
        'overflow-x-auto rounded-xl bg-background p-3 shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.table(
        [h.Class('w-full border-separate border-spacing-1 text-[12.5px]')],
        [
          h.thead(
            [],
            [
              h.tr(
                [],
                [
                  h.th([], []),
                  ...CHECKS.map(check =>
                    h.th(
                      [
                        h.Class(
                          'px-1 font-normal text-muted-foreground capitalize',
                        ),
                      ],
                      [check],
                    ),
                  ),
                ],
              ),
            ],
          ),
          h.tbody(
            [],
            FINAL.map(regression =>
              h.tr(
                [],
                [
                  h.th(
                    [h.Class('pr-3 text-left font-normal text-foreground')],
                    [regression.title],
                  ),
                  ...CHECKS.map(check =>
                    h.td(
                      [
                        h.Class(
                          `h-6 min-w-14 rounded-md text-center font-semibold ${regression.caught[check] === null ? 'bg-muted/40 text-muted-foreground/50' : 'bg-rose-500/12 text-rose-700'}`,
                        ),
                      ],
                      [regression.caught[check] === null ? '·' : 'caught'],
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
