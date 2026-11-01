import type { Html, HtmlBuilder } from 'foldkit/html'

import { inline } from '../../shared/prose'
import { CLASSES, COMPONENTS, LAYERS, PLACEMENT, resultFor } from './data'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

/* ---- The boundary map --------------------------------------------------- */

export const boundaryMap = (h: H, model: Model): Html => {
  const selected = LAYERS.find(layer => layer.id === model.layer) ?? LAYERS[0]!
  const tone = (id: string): string =>
    id === selected.id
      ? 'bg-foreground text-background ring-2 ring-foreground'
      : selected.mayUse.includes(id as never)
        ? 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500/50'
        : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'
  const card = (id: string): Html => {
    const layer = LAYERS.find(each => each.id === id)!
    return h.button(
      [
        h.Type('button'),
        h.AriaPressed(id === selected.id ? 'true' : 'false'),
        h.OnClick(M.ChoseLayer({ layer: layer.id })),
        h.Class(
          `flex flex-col items-start gap-1 rounded-xl px-3.5 py-3 text-left transition-colors ${tone(id)}`,
        ),
      ],
      [
        h.span([h.Class('text-[14px] font-semibold')], [layer.name]),
        h.span([h.Class('font-mono text-[11.5px] opacity-70')], [layer.files]),
      ],
    )
  }
  return h.div(
    [h.Class('flex flex-col gap-5')],
    [
      h.div(
        [h.Class('grid gap-2.5 sm:grid-cols-3')],
        [
          card('entry'),
          card('features'),
          card('enforcement'),
          card('theme'),
          card('components'),
          card('implementations'),
        ],
      ),
      h.div(
        [
          h.Class(
            'grid gap-4 rounded-xl bg-background p-4 text-[14px] leading-[1.6] shadow-[0_0_0_1px_var(--border)] sm:grid-cols-[1fr_1fr]',
          ),
        ],
        [
          h.div(
            [],
            [
              h.div(
                [
                  h.Class(
                    'mb-1 text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
                  ),
                ],
                [`${selected.name} may use`],
              ),
              h.p([h.Class('text-foreground/90')], inline(h, selected.uses)),
            ],
          ),
          h.div(
            [],
            [
              h.div(
                [
                  h.Class(
                    'mb-1 text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
                  ),
                ],
                ['Held by'],
              ),
              h.p(
                [h.Class('text-foreground/90')],
                inline(h, selected.enforcedBy),
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/* ---- Placement or appearance? ------------------------------------------- */

export const placementMatrix = (h: H, model: Model): Html => {
  const chosen =
    model.cell === null
      ? undefined
      : resultFor(model.cell.component, model.cell.className)
  const allowedCount = PLACEMENT.filter(result => result.allowed).length
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
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
                      h.th(
                        [
                          h.Class(
                            'text-left font-normal text-muted-foreground',
                          ),
                        ],
                        ['class on …'],
                      ),
                      ...COMPONENTS.map(component =>
                        h.th(
                          [
                            h.Class(
                              'px-1 font-mono text-[11.5px] font-normal text-muted-foreground',
                            ),
                          ],
                          [component],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              h.tbody(
                [],
                CLASSES.map(className =>
                  h.tr(
                    [],
                    [
                      h.th(
                        [
                          h.Class(
                            'pr-3 text-left font-mono text-[12px] font-normal whitespace-nowrap text-foreground',
                          ),
                        ],
                        [className],
                      ),
                      ...COMPONENTS.map(component => {
                        const result = resultFor(component, className)
                        const isChosen =
                          model.cell?.component === component &&
                          model.cell.className === className
                        return h.td(
                          [],
                          [
                            h.button(
                              [
                                h.Type('button'),
                                h.AriaLabel(
                                  `${className} on ${component}: ${result?.allowed === true ? 'allowed' : 'rejected'}`,
                                ),
                                h.AriaPressed(isChosen ? 'true' : 'false'),
                                h.OnClick(
                                  M.ChoseCell({
                                    cell: { component, className },
                                  }),
                                ),
                                h.Class(
                                  `flex h-6 w-full min-w-12 items-center justify-center rounded-md text-[12px] font-semibold transition-shadow ${result?.allowed === true ? 'bg-emerald-500/12 text-emerald-800' : 'bg-rose-500/10 text-rose-700'} ${isChosen ? 'ring-2 ring-foreground' : 'hover:ring-1 hover:ring-foreground/30'}`,
                                ),
                              ],
                              [result?.allowed === true ? '✓' : '✕'],
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
            'min-h-[76px] rounded-xl bg-background p-4 text-[13.5px] leading-[1.55] shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        chosen === undefined
          ? [
              h.span(
                [h.Class('text-muted-foreground')],
                [
                  `${allowedCount} of ${PLACEMENT.length} calls pass. Pick a cell to read what the lint said.`,
                ],
              ),
            ]
          : [
              h.div(
                [h.Class('mb-1.5 font-mono text-[12.5px] text-foreground')],
                [`${chosen.component}({ class: '${chosen.className}' }, h)`],
              ),
              h.p(
                [
                  h.Class(
                    chosen.allowed ? 'text-emerald-800' : 'text-foreground/85',
                  ),
                ],
                chosen.allowed
                  ? ['No finding: the lint counts this class as placement.']
                  : inline(
                      h,
                      chosen.message.replace(/ \(component-contract\)$/u, ''),
                    ),
              ),
            ],
      ),
    ],
  )
}

/* ---- Three checks, three answers ---------------------------------------- */

export const verdicts = (
  h: H,
  rows: ReadonlyArray<
    Readonly<{ check: string; answer: string; good: boolean }>
  >,
): Html =>
  h.div(
    [h.Class('grid gap-2.5 sm:grid-cols-3')],
    rows.map(row =>
      h.div(
        [
          h.Class(
            `rounded-xl p-3.5 ${row.good ? 'bg-emerald-50 ring-1 ring-emerald-500/40' : 'bg-amber-50 ring-1 ring-amber-500/40'}`,
          ),
        ],
        [
          h.div(
            [h.Class('font-mono text-[12px] text-muted-foreground')],
            [row.check],
          ),
          h.div(
            [
              h.Class(
                `mt-1 text-[15px] font-semibold ${row.good ? 'text-emerald-900' : 'text-amber-900'}`,
              ),
            ],
            [row.answer],
          ),
        ],
      ),
    ),
  )
