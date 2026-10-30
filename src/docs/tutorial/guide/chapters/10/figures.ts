import type { Html, HtmlBuilder } from 'foldkit/html'

import layerResults from '../../generated/10/layers.json'
import { SEED } from '../../snapshots/chapter-10/domain'
import { issueRow as row09 } from '../../snapshots/chapter-09/design/issue-row'
import { closedMenu as closed09 } from '../../snapshots/chapter-09/design/property-picker'
import { issueRow as row10 } from '../../snapshots/chapter-10/design/issue-row'
import { closedMenu as closed10 } from '../../snapshots/chapter-10/design/property-picker'
import { inline, segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

type Layer = 'crease' | 'receipt' | 'product' | 'none'

type Result = Readonly<{
  id: string
  call: string
  messages: ReadonlyArray<Readonly<{ rule: string; message: string }>>
}>

const RESULTS = layerResults as ReadonlyArray<Result>

const layerOf = (result: Result): Layer => {
  const first = result.messages[0]
  if (first === undefined) return 'none'
  if (first.rule === 'no-restricted-imports') return 'product'
  if (
    first.rule === 'crease/component-contract' &&
    /variant \(allowed:/u.test(first.message)
  )
    return 'receipt'
  return 'crease'
}

const LAYERS: ReadonlyArray<
  Readonly<{
    id: Exclude<Layer, 'none'>
    name: string
    where: string
    who: string
  }>
> = [
  {
    id: 'crease',
    name: "crease's strict rules",
    where: '`@creaseui/lint`, via `creaseui()`',
    who: 'Nobody here. Turning one off is a reported enforcement change.',
  },
  {
    id: 'receipt',
    name: 'Allowed values',
    where: '`crease.lock.json`',
    who: 'A design-system change, one line per value.',
  },
  {
    id: 'product',
    name: 'Product rules',
    where: '`policy/product-policy.js`',
    who: 'A design-system change; each rule names its decision.',
  },
]

const LABELS: Readonly<Record<string, string>> = {
  'text-lg': 'A large text size',
  'badge-secondary': 'A filled badge',
  'button-rounded': 'A rounded button',
  'raw-div': 'A raw div in a view',
  'own-row': 'An item in a view',
  'heading-2': 'A level-2 heading',
  'text-xsm': "The row's metadata text",
}

export const whoSaysNo = (h: H, model: Model): Html => {
  const result = RESULTS.find(each => each.id === model.call) ?? RESULTS[0]!
  const layer = layerOf(result)
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.div(
        [
          h.Role('group'),
          h.AriaLabel('Calls'),
          h.Class('flex flex-wrap gap-1.5'),
        ],
        RESULTS.map(each =>
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(each.id === result.id ? 'true' : 'false'),
              h.OnClick(M.ChoseCall({ id: each.id })),
              h.Class(
                `rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors ${each.id === result.id ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
              ),
            ],
            [LABELS[each.id] ?? each.id],
          ),
        ),
      ),
      h.pre(
        [
          h.Class(
            'overflow-x-auto rounded-lg bg-background px-3 py-2.5 font-mono text-[12.5px] shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [result.call],
      ),
      h.div(
        [h.Class('flex flex-col gap-1.5')],
        LAYERS.map(each =>
          h.div(
            [
              h.Class(
                `grid grid-cols-[150px_1fr] items-start gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${each.id === layer ? 'bg-rose-50 ring-1 ring-rose-400/60' : 'bg-background ring-1 ring-border'}`,
              ),
            ],
            [
              h.div(
                [],
                [
                  h.div(
                    [h.Class('font-semibold text-foreground')],
                    [each.name],
                  ),
                  h.div(
                    [h.Class('text-[12px] text-muted-foreground')],
                    inline(h, each.where),
                  ),
                ],
              ),
              each.id === layer
                ? h.div(
                    [h.Class('text-foreground/90')],
                    [
                      h.span(
                        [h.Class('mr-1.5 font-semibold text-rose-700')],
                        ['Says no:'],
                      ),
                      ...inline(
                        h,
                        result.messages[0]?.message.replace(
                          / \([a-z-]+\)$/u,
                          '',
                        ) ?? '',
                      ),
                    ],
                  )
                : h.div(
                    [h.Class('text-muted-foreground')],
                    inline(h, each.who),
                  ),
            ],
          ),
        ),
      ),
      h.p(
        [
          h.Class(
            `text-[13.5px] font-medium ${layer === 'none' ? 'text-foreground' : 'text-muted-foreground'}`,
          ),
        ],
        [
          layer === 'none'
            ? result.id === 'heading-2'
              ? 'No layer says no. The receipt only checks string values, and a heading level is a number.'
              : 'No layer says no: this call is inside the policy.'
            : `Rejected by the layer whose question it touches; the other layers have nothing to say about it.`,
        ],
      ),
    ],
  )
}

/* ---- The label look, before and after --------------------------------- */

const ISSUE = SEED.find(issue => issue.id === 'CRE-136')!

export const labelFlip = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-4')],
    [
      segmented(
        h,
        'Chapter',
        [
          { value: 'chapter-09' as const, label: "crease's outline badge" },
          { value: 'chapter-10' as const, label: "The product's label look" },
        ],
        model.version,
        version => M.ChoseVersion({ version }),
      ),
      h.div(
        [
          h.Class(
            'pointer-events-none overflow-hidden rounded-lg bg-background p-1 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          model.version === 'chapter-09'
            ? row09(
                {
                  issue: ISSUE,
                  pickers: {
                    menuFor: closed09,
                    toParentMessage: () => () =>
                      M.ChoseCall({ id: model.call }),
                  },
                  onOpen: () => M.ChoseCall({ id: model.call }),
                },
                h,
              )
            : row10(
                {
                  issue: ISSUE,
                  pickers: {
                    menuFor: closed10,
                    toParentMessage: () => () =>
                      M.ChoseCall({ id: model.call }),
                  },
                  onOpen: () => M.ChoseCall({ id: model.call }),
                },
                h,
              ),
        ],
      ),
    ],
  )
