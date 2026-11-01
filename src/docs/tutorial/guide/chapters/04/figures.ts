import type { Html, HtmlBuilder } from 'foldkit/html'

import contrastTokens from '../../generated/04/contrast-tokens.json'
import theme from '../../generated/04/theme.md?raw'
import { factTable, screenshot } from '../../shared/early'
import { segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

/* ---- Before and after --------------------------------------------------- */

export const beforeAfter = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'Tag',
        [
          { value: 'chapter-03' as const, label: 'Chapter 3: crease default' },
          { value: 'chapter-04' as const, label: 'Chapter 4: generated theme' },
        ],
        model.tag,
        tag => M.ChoseTag({ tag }),
      ),
      screenshot(
        h,
        model.tag === 'chapter-03'
          ? '/shots/chapter-02-all.png'
          : '/shots/chapter-04-all.png',
        `All issues at ${model.tag}`,
        `creaseui-demo · ${model.tag} · All issues`,
      ),
    ],
  )

/* ---- The knobs, from design-system/theme.md ----------------------------- */

const knobRows: ReadonlyArray<ReadonlyArray<string>> = theme
  .replace(/\r/gu, '')
  .split('\n')
  .filter(
    line =>
      line.startsWith('| ') &&
      !line.startsWith('| Knob') &&
      !line.startsWith('|---'),
  )
  .map(line => line.slice(2, -2).split(' | '))

export const knobs = (h: H): Html =>
  factTable(h, ['Knob', 'Value', 'Why'], knobRows)

/* ---- Surface contrast --------------------------------------------------- */

type TokenRow = Readonly<{ token: string; c22: string; c6: string }>
const TOKENS = contrastTokens as ReadonlyArray<TokenRow>
const value = (token: string, contrast: '22' | '6'): string => {
  const row = TOKENS.find(each => each.token === token)
  return (contrast === '22' ? row?.c22 : row?.c6) ?? 'transparent'
}

const SWATCHES = [
  '--background',
  '--sidebar',
  '--muted',
  '--border',
  '--primary',
]

export const contrastPlayground = (h: H, model: Model): Html => {
  const v = (token: string): string => value(token, model.contrast)
  const bar = (width: string, tone: string): Html =>
    h.div(
      [h.Class('h-2 rounded-full'), h.Style({ width, background: tone })],
      [],
    )
  const row = (title: string): Html =>
    h.div(
      [
        h.Class('flex items-center gap-2.5 px-3 py-2.5'),
        h.Style({ 'border-bottom': `1px solid ${v('--border')}` }),
      ],
      [
        h.div(
          [
            h.Class('size-2.5 rounded-full'),
            h.Style({ border: `1.5px solid ${v('--primary')}` }),
          ],
          [],
        ),
        h.span(
          [
            h.Class('min-w-0 truncate text-[12.5px]'),
            h.Style({ color: v('--foreground') }),
          ],
          [title],
        ),
      ],
    )
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      segmented(
        h,
        'Surface contrast',
        [
          { value: '22' as const, label: 'surfaceContrast 22 (default)' },
          { value: '6' as const, label: 'surfaceContrast 6 (Crease Tasks)' },
        ],
        model.contrast,
        contrast => M.ChoseContrast({ contrast }),
      ),
      h.div(
        [h.Class('grid gap-4 sm:grid-cols-[1.3fr_1fr]')],
        [
          h.div(
            [
              h.Class(
                'flex overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--border)]',
              ),
              h.Style({ background: v('--background') }),
            ],
            [
              h.div(
                [
                  h.Class('flex w-[34%] flex-col gap-2 p-3'),
                  h.Style({
                    background: v('--sidebar'),
                    'border-right': `1px solid ${v('--border')}`,
                  }),
                ],
                [
                  bar('70%', 'oklch(0.205 0.008 286 / 0.7)'),
                  bar('55%', 'oklch(0.205 0.008 286 / 0.35)'),
                  bar('62%', 'oklch(0.205 0.008 286 / 0.35)'),
                ],
              ),
              h.div(
                [h.Class('flex flex-1 flex-col')],
                [
                  h.div(
                    [
                      h.Class('px-3 py-1.5 text-[11.5px] font-medium'),
                      h.Style({
                        background: v('--muted'),
                        color: v('--foreground'),
                      }),
                    ],
                    ['In Progress'],
                  ),
                  row('Assignee picker filters by name'),
                  row('Draft survives closing the composer'),
                  h.div(
                    [
                      h.Class('px-3 py-1.5 text-[11.5px] font-medium'),
                      h.Style({
                        background: v('--muted'),
                        color: v('--foreground'),
                      }),
                    ],
                    ['Todo'],
                  ),
                  row('Search matches issue identifiers'),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('flex min-w-0 flex-col gap-1.5')],
            SWATCHES.map(token =>
              h.div(
                [
                  h.Class(
                    'flex items-center gap-2.5 rounded-lg bg-background px-2.5 py-1.5 shadow-[0_0_0_1px_var(--border)]',
                  ),
                ],
                [
                  h.div(
                    [
                      h.Class(
                        'size-6 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]',
                      ),
                      h.Style({ background: v(token) }),
                    ],
                    [],
                  ),
                  h.div(
                    [h.Class('flex min-w-0 flex-col')],
                    [
                      h.span(
                        [h.Class('font-mono text-[12px] text-foreground')],
                        [token],
                      ),
                      h.span(
                        [
                          h.Class(
                            'truncate font-mono text-[11px] text-muted-foreground',
                          ),
                        ],
                        [v(token)],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  )
}

const labelled = (h: H, label: string, src: string, alt: string): Html =>
  h.div(
    [h.Class('flex flex-col gap-1.5')],
    [
      h.span([h.Class('text-[12.5px] text-muted-foreground')], [label]),
      screenshot(h, src, alt, 'creaseui-demo · chapter-04 · dark'),
    ],
  )

export const darkPair = (h: H): Html =>
  h.div(
    [h.Class('grid gap-4')],
    [
      labelled(
        h,
        'With the generated tokens only',
        '/shots/chapter-04-dark-broken.png',
        'Dark mode with a light sidebar whose link labels are white on white',
      ),
      labelled(
        h,
        'With the sidebar tokens added by hand',
        '/shots/chapter-04-dark.png',
        'Dark mode with a dark sidebar and readable links',
      ),
    ],
  )
