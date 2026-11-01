import type { Html, HtmlBuilder } from 'foldkit/html'

import { inline } from './prose'

/* Helpers used by the early chapters (1 to 4). */

/** A screenshot of the tutorial app at a tag, in a browser-like frame. */
export const screenshot = <Msg>(
  h: HtmlBuilder<Msg>,
  src: string,
  alt: string,
  label: string,
): Html =>
  h.div(
    [
      h.Class(
        'overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--border),0_8px_24px_-12px_rgb(0_0_0/0.18)]',
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'flex items-center gap-2 border-b border-border/70 bg-muted/40 px-3 py-1.5',
          ),
        ],
        [
          h.span(
            [h.Class('font-mono text-[11.5px] text-muted-foreground')],
            [label],
          ),
        ],
      ),
      h.img([
        h.Src(src),
        h.Alt(alt),
        h.Class('block w-full'),
        h.Attribute('loading', 'lazy'),
      ]),
    ],
  )

/** A plain table for facts: a header row, then rows of inline text. */
export const factTable = <Msg>(
  h: HtmlBuilder<Msg>,
  header: ReadonlyArray<string>,
  rows: ReadonlyArray<ReadonlyArray<string>>,
): Html =>
  h.div(
    [
      h.Class(
        'overflow-x-auto rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.table(
        [h.Class('w-full text-left text-[13.5px] leading-[1.5]')],
        [
          h.thead(
            [],
            [
              h.tr(
                [h.Class('border-b border-border')],
                header.map(cell =>
                  h.th(
                    [
                      h.Class(
                        'px-4 py-2.5 text-[12px] font-semibold text-muted-foreground',
                      ),
                    ],
                    [cell],
                  ),
                ),
              ),
            ],
          ),
          h.tbody(
            [h.Class('divide-y divide-border/70')],
            rows.map(row =>
              h.tr(
                [],
                row.map((cell, index) =>
                  h.td(
                    [
                      h.Class(
                        `px-4 py-2.5 align-top ${index === 0 ? 'font-medium text-foreground' : 'text-foreground/85'}`,
                      ),
                    ],
                    inline(h, cell),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    ],
  )

/** A header for a chapter without a starting tag. */
export const plainHeader = <Msg>(
  h: HtmlBuilder<Msg>,
  props: Readonly<{
    chapter: number
    title: string
    dek: string
    meta: string
  }>,
): Html =>
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
          h.span(
            [
              h.Class(
                'text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
              ),
            ],
            [`Chapter ${props.chapter}`],
          ),
        ],
      ),
      h.h1(
        [
          h.Class(
            'mt-4 text-[40px] leading-[1.08] font-semibold tracking-[-0.025em] text-foreground sm:text-[48px]',
          ),
        ],
        [props.title],
      ),
      h.p(
        [h.Class('mt-5 text-[19px] leading-[1.6] text-muted-foreground')],
        inline(h, props.dek),
      ),
      h.p(
        [h.Class('mt-6 text-[13px] text-muted-foreground')],
        inline(h, props.meta),
      ),
    ],
  )

/** A small choice row, the same look as `segmented` but for any number of options with a long label. */
export const choiceList = <Msg>(
  h: HtmlBuilder<Msg>,
  label: string,
  options: ReadonlyArray<Readonly<{ key: string; label: string }>>,
  current: string,
  choose: (key: string) => Msg,
): Html =>
  h.div(
    [h.Role('group'), h.AriaLabel(label), h.Class('flex flex-wrap gap-1.5')],
    options.map(option =>
      h.button(
        [
          h.Type('button'),
          h.AriaPressed(option.key === current ? 'true' : 'false'),
          h.OnClick(choose(option.key)),
          h.Class(
            `rounded-md px-2.5 py-1 text-[13px] font-medium ${option.key === current ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
          ),
        ],
        [option.label],
      ),
    ),
  )
