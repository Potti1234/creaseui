import type { Html, HtmlBuilder } from 'foldkit/html'

import { inline } from '../../shared/prose'
import { DECISIONS, enforcedCount, isPlanned } from './data'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

const label = (h: H, text: string): Html =>
  h.div(
    [
      h.Class(
        'text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
      ),
    ],
    [text],
  )

/* ---- Principle, decision, enforcement ----------------------------------- */

export const ladder = (h: H): Html => {
  const d1 = DECISIONS.find(decision => decision.id === 'D1')!
  const steps = [
    {
      title: 'Principle',
      body: d1.principle,
      note: 'Why. Says what the product wants, not what to build.',
    },
    {
      title: 'Decision D1',
      body: d1.text,
      note: 'What a builder does. Two people applying it get the same row.',
    },
    {
      title: 'Enforced by',
      body: d1.enforcedAt07,
      note: 'Where it is held, as of chapter 7. At chapter 3 this said "The row component\'s variant (chapter 5)".',
    },
  ]
  return h.ol(
    [h.Class('flex flex-col gap-2')],
    steps.map((step, index) =>
      h.li(
        [
          h.Class(
            'grid gap-3 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)] sm:grid-cols-[140px_1fr]',
          ),
        ],
        [
          h.div(
            [h.Class('flex items-center gap-2 sm:flex-col sm:items-start')],
            [
              h.span(
                [
                  h.Class(
                    'flex size-6 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground',
                  ),
                ],
                [String(index + 1)],
              ),
              label(h, step.title),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-1')],
            [
              h.p(
                [h.Class('text-[15px] leading-[1.55] text-foreground')],
                inline(h, step.body),
              ),
              h.p([h.Class('text-[13px] text-muted-foreground')], [step.note]),
            ],
          ),
        ],
      ),
    ),
  )
}

/* ---- The ten decisions -------------------------------------------------- */

const status = (h: H, enforced: string): Html =>
  h.span(
    [
      h.Class(
        `w-fit rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${isPlanned(enforced) ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`,
      ),
    ],
    [isPlanned(enforced) ? 'Planned' : 'Enforced'],
  )

export const decisionExplorer = (h: H, model: Model): Html => {
  const chosen =
    DECISIONS.find(decision => decision.id === model.decision) ?? DECISIONS[0]!
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.div(
        [h.Class('grid gap-2 sm:grid-cols-2')],
        [
          h.div(
            [
              h.Class(
                'rounded-lg bg-background px-3 py-2 text-[13px] shadow-[0_0_0_1px_var(--border)]',
              ),
            ],
            [
              h.span(
                [h.Class('font-semibold text-foreground')],
                [
                  `${enforcedCount(d => d.enforcedAt03)} of ${DECISIONS.length}`,
                ],
              ),
              ' enforced at chapter-03',
            ],
          ),
          h.div(
            [
              h.Class(
                'rounded-lg bg-background px-3 py-2 text-[13px] shadow-[0_0_0_1px_var(--border)]',
              ),
            ],
            [
              h.span(
                [h.Class('font-semibold text-foreground')],
                [
                  `${enforcedCount(d => d.enforcedAt07)} of ${DECISIONS.length}`,
                ],
              ),
              ' enforced at chapter-07',
            ],
          ),
        ],
      ),
      h.div(
        [
          h.Role('group'),
          h.AriaLabel('Decisions'),
          h.Class('flex flex-wrap gap-1.5'),
        ],
        DECISIONS.map(decision =>
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(decision.id === chosen.id ? 'true' : 'false'),
              h.OnClick(M.ChoseDecision({ id: decision.id })),
              h.Class(
                `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-semibold ${decision.id === chosen.id ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
              ),
            ],
            [
              h.span(
                [
                  h.Class(
                    `size-1.5 rounded-full ${isPlanned(decision.enforcedAt07) ? 'bg-amber-500' : 'bg-emerald-500'}`,
                  ),
                ],
                [],
              ),
              decision.id,
            ],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'flex flex-col gap-4 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.div(
            [h.Class('flex flex-col gap-1')],
            [
              label(h, `Principle: ${chosen.principle}`),
              h.p(
                [h.Class('text-[15.5px] leading-[1.55] text-foreground')],
                inline(h, `${chosen.id}. ${chosen.text}`),
              ),
            ],
          ),
          h.div(
            [h.Class('grid gap-3 sm:grid-cols-2')],
            [
              h.div(
                [h.Class('flex flex-col gap-1.5 rounded-lg bg-muted/40 p-3')],
                [
                  label(h, 'Enforced by, at chapter-03'),
                  status(h, chosen.enforcedAt03),
                  h.p(
                    [h.Class('text-[13.5px] leading-[1.5] text-foreground/90')],
                    inline(h, chosen.enforcedAt03),
                  ),
                ],
              ),
              h.div(
                [h.Class('flex flex-col gap-1.5 rounded-lg bg-muted/40 p-3')],
                [
                  label(h, 'Enforced by, at chapter-07'),
                  status(h, chosen.enforcedAt07),
                  h.p(
                    [h.Class('text-[13.5px] leading-[1.5] text-foreground/90')],
                    inline(h, chosen.enforcedAt07),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
