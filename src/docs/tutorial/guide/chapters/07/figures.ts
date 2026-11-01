import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineView } from 'foldkit/submodel'

import { row as row06 } from '../../snapshots/chapter-06/features/issues'
import { myRow as myRow06 } from '../../snapshots/chapter-06/features/my-issues'
import { result as result06 } from '../../snapshots/chapter-06/features/search'
import { SEED } from '../../snapshots/chapter-07/domain'
import { issueRow } from '../../snapshots/chapter-07/design/issue-row'
import { closedMenu } from '../../snapshots/chapter-07/design/property-picker'
import type * as App from '../../snapshots/chapter-07/model'
import { view as appPage } from '../../snapshots/chapter-07/view'
import { inline, segmented } from '../../shared/prose'
import { type Fit, PARTS, REQUESTS } from './data'
import { type Message, Message as M, type Model, type Version } from './model'

type H = HtmlBuilder<Message>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const foreign = (h: H): HtmlBuilder<any> => h as unknown as HtmlBuilder<any>

const ISSUE = SEED.find(issue => issue.id === 'CRE-142')!

/* Rows rendered outside the app: their pickers stay closed. */
const closedPickers = {
  menuFor: closedMenu,
  toParentMessage: () => () => M.Ignored(),
}
const row07 = (h: H): Html =>
  issueRow({ issue: ISSUE, pickers: closedPickers }, h)

const VIEWS = ['All issues', 'My issues', 'Search'] as const

const frame = (h: H, body: Html): Html =>
  h.div(
    [
      h.Class(
        'overflow-hidden rounded-lg bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [body],
  )

export const rowsFlip = (h: H, version: Version): Html => {
  const render: Readonly<Record<(typeof VIEWS)[number], () => Html>> =
    version === 'chapter-06'
      ? {
          'All issues': () => row06(ISSUE, foreign(h)),
          'My issues': () => myRow06(ISSUE, foreign(h)),
          Search: () => result06(ISSUE, foreign(h)),
        }
      : {
          'All issues': () => row07(h),
          'My issues': () => row07(h),
          Search: () => row07(h),
        }
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      segmented(
        h,
        'Chapter',
        [
          { value: 'chapter-06' as const, label: 'Chapter 6' },
          { value: 'chapter-07' as const, label: 'Chapter 7' },
        ],
        version,
        value => M.ChoseVersion({ version: value }),
      ),
      ...VIEWS.map(view =>
        h.div(
          [h.Class('flex flex-col gap-1.5')],
          [
            h.div(
              [h.Class('text-[12.5px] font-semibold text-foreground')],
              [view],
            ),
            frame(h, render[view]()),
          ],
        ),
      ),
    ],
  )
}

/* ---- Anatomy of a row ---------------------------------------------------- */

export const anatomy = (h: H, model: Model): Html => {
  const chosen = PARTS.find(each => each.part === model.part) ?? PARTS[0]!
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.div(
        [
          h.Role('group'),
          h.AriaLabel('Parts of the row'),
          h.Class('flex flex-wrap gap-1.5'),
        ],
        PARTS.map((each, index) =>
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(each.part === chosen.part ? 'true' : 'false'),
              h.OnClick(M.ChosePart({ part: each.part })),
              h.Class(
                `rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors ${each.part === chosen.part ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
              ),
            ],
            [`${index + 1}. ${each.label}`],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            `pointer-events-none rounded-lg bg-background p-1 shadow-[0_0_0_1px_var(--border)] ${chosen.selector}`,
          ),
        ],
        [row07(h)],
      ),
      h.p(
        [h.Class('min-h-[48px] text-[14px] leading-[1.6] text-foreground/90')],
        inline(h, chosen.rule),
      ),
    ],
  )
}

/* ---- Views that only choose -------------------------------------------- */

const SIZES = [
  { view: 'All issues', before: 104, after: 33 },
  { view: 'My issues', before: 61, after: 39 },
  { view: 'Search', before: 67, after: 29 },
]

export const viewSizes = (h: H): Html =>
  h.div(
    [
      h.Class(
        'flex flex-col gap-3 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      ...SIZES.map(size =>
        h.div(
          [
            h.Class(
              'grid grid-cols-[92px_1fr] items-center gap-3 text-[12.5px]',
            ),
          ],
          [
            h.span([h.Class('font-medium text-foreground')], [size.view]),
            h.div(
              [h.Class('flex flex-col gap-1')],
              [
                h.div(
                  [h.Class('flex items-center gap-2')],
                  [
                    h.div(
                      [
                        h.Class('h-3.5 rounded-sm bg-foreground/25'),
                        h.Style({ width: `${(size.before / 104) * 75}%` }),
                      ],
                      [],
                    ),
                    h.span(
                      [
                        h.Class(
                          'font-mono text-[11.5px] text-muted-foreground',
                        ),
                      ],
                      [`${size.before} lines at chapter-06`],
                    ),
                  ],
                ),
                h.div(
                  [h.Class('flex items-center gap-2')],
                  [
                    h.div(
                      [
                        h.Class('h-3.5 rounded-sm bg-primary'),
                        h.Style({ width: `${(size.after / 104) * 75}%` }),
                      ],
                      [],
                    ),
                    h.span(
                      [h.Class('font-mono text-[11.5px] text-foreground')],
                      [`${size.after} lines at chapter-07`],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    ],
  )

/* ---- The app, running --------------------------------------------------- */

const appView = defineView<App.Model, App.Message>(appPage)

export const liveApp = (h: H, model: Model): Html =>
  h.div(
    [
      h.Class(
        'h-[560px] [transform:translateZ(0)] overflow-auto rounded-xl bg-background shadow-[0_0_0_1px_var(--border)] [&_[data-slot=sidebar-wrapper]]:min-h-full',
      ),
    ],
    [
      h.submodel({
        slotId: 'chapter-07-app',
        model: model.app,
        view: appView,
        toParentMessage: (message: App.Message) => M.GotAppMessage({ message }),
      }),
    ],
  )

/* ---- Say it in the system's words ---------------------------------------- */

const tree = (h: H, node: Fit, depth = 0): Html =>
  h.div(
    [
      h.Class(
        depth === 0
          ? 'flex flex-col gap-1.5'
          : 'ml-4 flex flex-col gap-1.5 border-l border-border pl-3',
      ),
    ],
    [
      h.span(
        [
          h.Class(
            'w-fit rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[12px] text-primary',
          ),
        ],
        [node.pattern],
      ),
      ...(node.children ?? []).map(child => tree(h, child, depth + 1)),
    ],
  )

export const vocabulary = (h: H, model: Model): Html => {
  const request = REQUESTS[model.request] ?? REQUESTS[0]!
  return h.div(
    [h.Class('grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]')],
    [
      h.div(
        [
          h.Role('group'),
          h.AriaLabel('Requests'),
          h.Class('flex flex-col gap-1.5'),
        ],
        REQUESTS.map((each, index) =>
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(index === model.request ? 'true' : 'false'),
              h.OnClick(M.ChoseRequest({ index })),
              h.Class(
                `rounded-lg px-3 py-2 text-left text-[13.5px] leading-snug transition-colors ${index === model.request ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
              ),
            ],
            [`“${each.text}”`],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'flex min-w-0 flex-col gap-3 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.div(
            [
              h.Class(
                `w-fit rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${request.fits ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`,
              ),
            ],
            [request.fits ? 'Fits the vocabulary' : 'A design-system question'],
          ),
          h.p(
            [h.Class('text-[14px] leading-[1.6] text-foreground/90')],
            [request.answer],
          ),
          ...(request.tree === undefined ? [] : [tree(h, request.tree)]),
          ...(request.sketch === undefined
            ? []
            : [
                h.pre(
                  [
                    h.Class(
                      'overflow-x-auto rounded-lg bg-muted/50 px-3 py-2.5 font-mono text-[12px] leading-[1.6] text-foreground/85',
                    ),
                  ],
                  [request.sketch],
                ),
              ]),
        ],
      ),
    ],
  )
}

/* ---- The ratchet, chapters 2 to 7 ----------------------------------------- */

export const ratchet = (h: H): Html => {
  const steps = [
    { tag: 'chapter-02', count: 13 },
    { tag: 'chapter-04', count: 13 },
    { tag: 'chapter-05', count: 1 },
    { tag: 'chapter-06', count: 1 },
    { tag: 'chapter-07', count: 0 },
  ]
  return h.div(
    [
      h.Class(
        'flex flex-col gap-2 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    steps.map(step =>
      h.div(
        [
          h.Class(
            'grid grid-cols-[92px_1fr_100px] items-center gap-3 text-[12.5px]',
          ),
        ],
        [
          h.span([h.Class('font-mono text-muted-foreground')], [step.tag]),
          h.div(
            [h.Class('h-4 rounded bg-muted/50')],
            [
              h.div(
                [
                  h.Class(
                    `h-4 rounded ${step.count === 0 ? '' : 'bg-foreground/60'}`,
                  ),
                  h.Style({ width: `${(step.count / 13) * 100}%` }),
                ],
                [],
              ),
            ],
          ),
          h.span(
            [
              h.Class(
                step.count === 0
                  ? 'font-semibold text-primary'
                  : 'text-foreground',
              ),
            ],
            [`${step.count} ${step.count === 1 ? 'warning' : 'warnings'}`],
          ),
        ],
      ),
    ),
  )
}
