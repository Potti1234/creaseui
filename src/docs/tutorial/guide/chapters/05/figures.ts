import type { Html, HtmlBuilder } from 'foldkit/html'

import { row as row04 } from '../../snapshots/chapter-04/features/issues'
import { myRow as myRow04 } from '../../snapshots/chapter-04/features/my-issues'
import { result as result04 } from '../../snapshots/chapter-04/features/search'
import { button as button04 } from '../../snapshots/chapter-04/ui/button'
import { icon as icon04 } from '../../snapshots/chapter-04/ui/icon'
import { SEED } from '../../snapshots/chapter-05/domain'
import { row as row05 } from '../../snapshots/chapter-05/features/issues'
import { myRow as myRow05 } from '../../snapshots/chapter-05/features/my-issues'
import { result as result05 } from '../../snapshots/chapter-05/features/search'
import { button as button05 } from '../../snapshots/chapter-05/ui/button'
import { icon as icon05 } from '../../snapshots/chapter-05/ui/icon'
import { OWNER_LABEL, SORT_ITEMS, byClass, overrides } from './data'
import {
  type Message,
  Message as M,
  type Model,
  type Owner,
  type Version,
} from './model'
import { inline, segmented } from '../../shared/prose'

type H = HtmlBuilder<Message>

/* The app's views are typed for the app's Message. These rows bind no
   events, so the essay renders them with its own builder. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const foreign = (h: H): HtmlBuilder<any> => h as unknown as HtmlBuilder<any>

const LONG_TITLE = SEED.find(issue => issue.id === 'CRE-136')!

type RowEntry = Readonly<{ view: string; file: string; render: (h: H) => Html }>

const ROWS: Readonly<Record<Version, ReadonlyArray<RowEntry>>> = {
  'chapter-04': [
    {
      view: 'All issues',
      file: 'features/issues.ts',
      render: h => row04(LONG_TITLE, foreign(h)),
    },
    {
      view: 'My issues',
      file: 'features/my-issues.ts',
      render: h => myRow04(LONG_TITLE, foreign(h)),
    },
    {
      view: 'Search',
      file: 'features/search.ts',
      render: h => result04(LONG_TITLE, foreign(h)),
    },
  ],
  'chapter-05': [
    {
      view: 'All issues',
      file: 'features/issues.ts',
      render: h => row05(LONG_TITLE, foreign(h)),
    },
    {
      view: 'My issues',
      file: 'features/my-issues.ts',
      render: h => myRow05(LONG_TITLE, foreign(h)),
    },
    {
      view: 'Search',
      file: 'features/search.ts',
      render: h => result05(LONG_TITLE, foreign(h)),
    },
  ],
}

const classesOf = (view: string): ReadonlyArray<string> =>
  overrides
    .filter(
      override =>
        override.view === view && override.component.startsWith('item'),
    )
    .flatMap(override =>
      override.classes.map(className => `${override.component}: ${className}`),
    )

const chip = (h: H, text: string, tone: 'plain' | 'hot' = 'plain'): Html =>
  h.span(
    [
      h.Class(
        `inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11.5px] leading-4 ${tone === 'hot' ? 'bg-primary/12 text-primary ring-1 ring-primary/25' : 'bg-background text-foreground/80 ring-1 ring-border'}`,
      ),
    ],
    [text],
  )

/** The same issue as each view's row, at a given width. */
export const rowComparison = (
  h: H,
  version: Version,
  width: number,
  showClasses: boolean,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-5')],
    ROWS[version].map(entry =>
      h.div(
        [h.Class('flex flex-col gap-1.5')],
        [
          h.div(
            [h.Class('flex items-baseline gap-2 text-[12.5px]')],
            [
              h.span([h.Class('font-semibold text-foreground')], [entry.view]),
              h.span(
                [h.Class('font-mono text-[11.5px] text-muted-foreground')],
                [`${version}:src/${entry.file}`],
              ),
            ],
          ),
          h.div(
            [
              h.Class(
                'max-w-full overflow-hidden rounded-lg bg-background shadow-[0_0_0_1px_var(--border)]',
              ),
              h.Style({ width: `${width}px` }),
            ],
            [entry.render(h)],
          ),
          ...(showClasses
            ? [
                h.div(
                  [h.Class('flex flex-wrap gap-1')],
                  classesOf(entry.view).map(text => chip(h, text)),
                ),
              ]
            : []),
        ],
      ),
    ),
  )

export const widthControls = (h: H, model: Model): Html =>
  h.div(
    [h.Class('mb-5 flex flex-wrap items-center gap-x-5 gap-y-3')],
    [
      segmented(
        h,
        'Chapter',
        [
          { value: 'chapter-04' as const, label: 'Chapter 4' },
          { value: 'chapter-05' as const, label: 'Chapter 5' },
        ],
        model.version,
        version => M.ChoseVersion({ version }),
      ),
      h.label(
        [h.Class('flex items-center gap-3 text-[13px] text-muted-foreground')],
        [
          'Width',
          h.input([
            h.Type('range'),
            h.Min('380'),
            h.Max('740'),
            h.Step('10'),
            h.Value(String(model.width)),
            h.OnInput(value => M.ChangedWidth({ width: Number(value) })),
            h.Class('w-48 accent-[var(--primary)]'),
          ]),
          h.span(
            [
              h.Class(
                'w-14 font-mono text-[12px] tabular-nums text-foreground',
              ),
            ],
            [`${model.width}px`],
          ),
        ],
      ),
    ],
  )

/* ---- The override wall ------------------------------------------------- */

export const overrideWall = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-5')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center justify-between gap-3')],
        [
          segmented(
            h,
            'Group the warnings',
            [
              { value: 'file' as const, label: 'By file' },
              { value: 'class' as const, label: 'By component and class' },
            ],
            model.wall,
            grouping => M.ChoseWallGrouping({ grouping }),
          ),
          h.span(
            [h.Class('text-[12.5px] text-muted-foreground')],
            ['npm run lint, at chapter-04'],
          ),
        ],
      ),
      model.wall === 'file' ? wallByFile(h) : wallByClass(h),
    ],
  )

const wallByFile = (h: H): Html =>
  h.div(
    [h.Class('grid gap-3 sm:grid-cols-2')],
    ['All issues', 'My issues', 'Search', 'Header'].map(view =>
      h.div(
        [
          h.Class(
            'rounded-xl bg-background p-3.5 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.div(
            [h.Class('mb-2.5 text-[12.5px] font-semibold text-foreground')],
            [view],
          ),
          h.div(
            [h.Class('flex flex-col gap-2')],
            overrides
              .filter(override => override.view === view)
              .map(override =>
                h.div(
                  [h.Class('flex flex-wrap items-center gap-1')],
                  [
                    h.span(
                      [
                        h.Class(
                          'mr-1 w-[86px] shrink-0 font-mono text-[11.5px] text-muted-foreground',
                        ),
                      ],
                      [`${override.component}`],
                    ),
                    ...override.classes.map(className => chip(h, className)),
                  ],
                ),
              ),
          ),
        ],
      ),
    ),
  )

const wallByClass = (h: H): Html =>
  h.div(
    [h.Class('flex flex-wrap gap-2')],
    byClass.map(group => {
      const recurring = group.views.length > 1
      return h.div(
        [
          h.Class(
            `flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${recurring ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-background ring-1 ring-border'}`,
          ),
          h.Title(group.views.join(', ')),
        ],
        [
          h.span(
            [h.Class('font-mono text-[11.5px] text-muted-foreground')],
            [group.component],
          ),
          h.span(
            [
              h.Class(
                `font-mono text-[12.5px] ${recurring ? 'font-semibold text-primary' : 'text-foreground'}`,
              ),
            ],
            [group.className],
          ),
          h.span(
            [
              h.Class(
                `rounded px-1 font-mono text-[11px] tabular-nums ${recurring ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`,
              ),
            ],
            [`×${group.views.length}`],
          ),
        ],
      )
    }),
  )

/* ---- Whose decision is it? ---------------------------------------------- */

const OWNERS: ReadonlyArray<Owner> = ['component', 'parent', 'theme', 'nobody']

export const ownerSorter = (h: H, model: Model): Html => {
  const answered = SORT_ITEMS.filter(
    item => model.answers[item.id] !== undefined,
  )
  const right = answered.filter(
    item => model.answers[item.id] === item.answer,
  ).length
  return h.div(
    [h.Class('flex flex-col gap-2.5')],
    [
      ...SORT_ITEMS.map(item => {
        const answer = model.answers[item.id]
        return h.div(
          [
            h.Class(
              'rounded-xl bg-background p-3.5 shadow-[0_0_0_1px_var(--border)]',
            ),
          ],
          [
            h.div(
              [h.Class('flex flex-wrap items-center justify-between gap-3')],
              [
                h.div(
                  [h.Class('flex flex-wrap items-baseline gap-x-2 gap-y-1')],
                  [
                    chip(h, item.classes),
                    h.span(
                      [h.Class('text-[13px] text-muted-foreground')],
                      [
                        'on ',
                        h.code(
                          [h.Class('font-mono text-[12px] text-foreground')],
                          [item.on],
                        ),
                        ` · ${item.where}`,
                      ],
                    ),
                  ],
                ),
                h.div(
                  [
                    h.Role('group'),
                    h.AriaLabel(`Who decides ${item.classes}?`),
                    h.Class('flex flex-wrap gap-1'),
                  ],
                  OWNERS.map(owner => {
                    const chosen = answer === owner
                    const tone =
                      answer === undefined
                        ? 'bg-muted/60 text-foreground hover:bg-muted'
                        : owner === item.answer
                          ? 'bg-emerald-600 text-white'
                          : chosen
                            ? 'bg-rose-600/90 text-white'
                            : 'bg-muted/40 text-muted-foreground'
                    return h.button(
                      [
                        h.Type('button'),
                        h.AriaPressed(chosen ? 'true' : 'false'),
                        h.OnClick(M.Answered({ id: item.id, owner })),
                        h.Class(
                          `rounded-md px-2.5 py-1 text-[12.5px] font-medium transition-colors ${tone}`,
                        ),
                      ],
                      [OWNER_LABEL[owner]],
                    )
                  }),
                ),
              ],
            ),
            ...(answer === undefined
              ? []
              : [
                  h.p(
                    [
                      h.Class(
                        'mt-2.5 text-[13.5px] leading-[1.55] text-foreground/85',
                      ),
                    ],
                    inline(h, item.why),
                  ),
                ]),
          ],
        )
      }),
      h.div(
        [
          h.Class(
            'flex items-center justify-between pt-1 text-[13px] text-muted-foreground',
          ),
        ],
        [
          h.span(
            [],
            [
              answered.length === 0
                ? 'Pick an owner for each class.'
                : `${right} of ${answered.length} match the chapter.`,
            ],
          ),
          ...(answered.length === 0
            ? []
            : [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick(M.ResetAnswers()),
                    h.Class('font-medium text-primary hover:underline'),
                  ],
                  ['Start over'],
                ),
              ]),
        ],
      ),
    ],
  )
}

/* ---- 48 buttons, 4 kept --------------------------------------------------- */

const VARIANTS = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'link',
] as const
const SIZES = [
  'default',
  'xs',
  'sm',
  'lg',
  'icon',
  'icon-xs',
  'icon-sm',
  'icon-lg',
] as const
const KEPT: Readonly<Record<string, string>> = {
  'default default': 'primary',
  'default icon': 'primary, icon',
  'outline default': 'secondary',
  'outline icon': 'secondary, icon',
}

export const buttonMatrix = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-5')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center justify-between gap-3')],
        [
          segmented(
            h,
            'Show',
            [
              { value: 'all' as const, label: 'crease Button: 48' },
              { value: 'kept' as const, label: 'Crease Tasks: 4' },
            ],
            model.keepOnly ? 'kept' : 'all',
            () => M.ToggledKeepOnly(),
          ),
          h.span(
            [h.Class('text-[12.5px] text-muted-foreground')],
            ['6 variants × 8 sizes, rendered with the chapter 4 theme'],
          ),
        ],
      ),
      h.div(
        [
          h.Class(
            'overflow-x-auto rounded-xl bg-background p-3 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.table(
            [h.Class('border-separate border-spacing-x-2 border-spacing-y-2')],
            [
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    [
                      h.th([], []),
                      ...SIZES.map(size =>
                        h.th(
                          [
                            h.Class(
                              'px-1 text-left font-mono text-[11px] font-normal text-muted-foreground',
                            ),
                          ],
                          [size],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              h.tbody(
                [],
                VARIANTS.map(variant =>
                  h.tr(
                    [],
                    [
                      h.th(
                        [
                          h.Class(
                            'pr-2 text-left font-mono text-[11px] font-normal text-muted-foreground',
                          ),
                        ],
                        [variant],
                      ),
                      ...SIZES.map(size => {
                        const kept = KEPT[`${variant} ${size}`]
                        const isIcon = size.startsWith('icon')
                        return h.td(
                          [
                            h.Class(
                              `rounded-lg p-1 align-middle transition-opacity duration-300 ${model.keepOnly ? (kept === undefined ? 'opacity-[0.12]' : 'bg-primary/8 ring-1 ring-primary/40') : ''}`,
                            ),
                          ],
                          [
                            button04(
                              {
                                variant,
                                size,
                                ...(isIcon ? { ariaLabel: 'Add' } : {}),
                                children: isIcon
                                  ? [icon04({ name: 'plus' }, foreign(h))]
                                  : ['Save'],
                              },
                              foreign(h),
                            ),
                          ],
                        )
                      }),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      h.div(
        [
          h.Class(
            'flex flex-wrap items-center gap-3 rounded-xl bg-background p-3.5 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.span(
            [h.Class('mr-2 text-[12.5px] font-semibold text-foreground')],
            ['Chapter 5'],
          ),
          button05({ intent: 'primary', children: ['Save'] }, foreign(h)),
          button05(
            {
              intent: 'primary',
              shape: 'icon',
              ariaLabel: 'Add',
              children: [icon05({ name: 'plus' }, foreign(h))],
            },
            foreign(h),
          ),
          button05({ children: ['Save'] }, foreign(h)),
          button05(
            {
              shape: 'icon',
              ariaLabel: 'Add',
              children: [icon05({ name: 'plus' }, foreign(h))],
            },
            foreign(h),
          ),
          h.span(
            [h.Class('font-mono text-[12px] text-muted-foreground')],
            ["intent: 'primary' | 'secondary', shape: 'text' | 'icon'"],
          ),
        ],
      ),
    ],
  )

/** The warning count, chapter by chapter. */
export const ratchet = (h: H): Html => {
  const steps = [
    { tag: 'chapter-02', count: 13, note: 'first slice' },
    { tag: 'chapter-04', count: 13, note: 'theme' },
    { tag: 'chapter-05', count: 1, note: 'this chapter' },
  ]
  return h.div(
    [
      h.Class(
        'flex flex-col gap-2.5 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    steps.map(step =>
      h.div(
        [
          h.Class(
            'grid grid-cols-[92px_1fr_auto] items-center gap-3 text-[12.5px]',
          ),
        ],
        [
          h.span([h.Class('font-mono text-muted-foreground')], [step.tag]),
          h.div(
            [h.Class('h-5 rounded bg-muted/50')],
            [
              h.div(
                [
                  h.Class(
                    `h-5 rounded ${step.count === 1 ? 'bg-primary' : 'bg-foreground/70'}`,
                  ),
                  h.Style({ width: `${(step.count / 13) * 100}%` }),
                ],
                [],
              ),
            ],
          ),
          h.span(
            [h.Class('w-36 text-foreground')],
            [
              `${step.count} ${step.count === 1 ? 'warning' : 'warnings'} · ${step.note}`,
            ],
          ),
        ],
      ),
    ),
  )
}
