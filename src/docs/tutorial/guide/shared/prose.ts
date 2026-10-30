import type { Html, HtmlBuilder } from 'foldkit/html'

/* Prose building blocks shared by every chapter's essay. All of them are
   generic in the chapter's Message. */

const INLINE = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/gu

/** Text with `code` spans and [links](url). */
export const inline = <Msg>(
  h: HtmlBuilder<Msg>,
  text: string,
): ReadonlyArray<Html | string> =>
  text.split(INLINE).flatMap((part): ReadonlyArray<Html | string> => {
    if (part === '') return []
    if (part.startsWith('`'))
      return [
        h.code(
          [
            h.Class(
              'rounded-[5px] bg-muted px-[0.3em] py-[0.1em] font-mono text-[0.86em] text-foreground',
            ),
          ],
          [part.slice(1, -1)],
        ),
      ]
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/u.exec(part)
    if (link !== null)
      return [
        h.a(
          [
            h.Href(link[2] ?? '#'),
            h.Class(
              'text-primary underline decoration-primary/30 underline-offset-[3px] hover:decoration-primary',
            ),
          ],
          [link[1] ?? ''],
        ),
      ]
    return [part]
  })

export const p = <Msg>(h: HtmlBuilder<Msg>, text: string): Html =>
  h.p(
    [h.Class('my-5 text-[17px] leading-[1.7] text-foreground/90')],
    inline(h, text),
  )

export const h2 = <Msg>(h: HtmlBuilder<Msg>, id: string, text: string): Html =>
  h.h2(
    [
      h.Id(id),
      h.Class(
        'mt-16 mb-4 scroll-mt-8 text-[24px] leading-tight font-semibold tracking-[-0.015em] text-foreground',
      ),
    ],
    [text],
  )

export const list = <Msg>(
  h: HtmlBuilder<Msg>,
  items: ReadonlyArray<string>,
  ordered = false,
): Html =>
  (ordered ? h.ol : h.ul)(
    [
      h.Class(
        `my-5 space-y-2 pl-6 text-[17px] leading-[1.65] text-foreground/90 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-muted-foreground`,
      ),
    ],
    items.map(item => h.li([h.Class('pl-1')], inline(h, item))),
  )

export type FigureProps = Readonly<{
  n: number
  title: string
  caption: string
  body: ReadonlyArray<Html>
  /** A plain surface instead of the tinted frame (for artifacts that have their own chrome). */
  bare?: boolean
}>

/** A numbered figure, as wide as the text column. */
export const figure = <Msg>(h: HtmlBuilder<Msg>, props: FigureProps): Html =>
  h.figure(
    [h.Class('my-12 w-full')],
    [
      h.div(
        [
          h.Class(
            props.bare === true
              ? ''
              : 'rounded-2xl border border-border/70 bg-[color-mix(in_oklch,var(--muted)_55%,white)] p-4 sm:p-6',
          ),
        ],
        [...props.body],
      ),
      h.figcaption(
        [h.Class('mt-3 text-[13.5px] leading-[1.55] text-muted-foreground')],
        [
          h.span(
            [h.Class('mr-1.5 font-semibold text-foreground')],
            [
              `Figure ${props.n}. ${props.title}${/[.?!]$/u.test(props.title) ? '' : '.'}`,
            ],
          ),
          ...inline(h, props.caption),
        ],
      ),
    ],
  )

/** A small segmented control for figure settings. */
export const segmented = <Msg, Value extends string>(
  h: HtmlBuilder<Msg>,
  label: string,
  options: ReadonlyArray<Readonly<{ value: Value; label: string }>>,
  current: Value,
  choose: (value: Value) => Msg,
): Html =>
  h.div(
    [
      h.Role('group'),
      h.AriaLabel(label),
      h.Class(
        'inline-flex rounded-lg border border-border bg-background p-0.5 text-[13px]',
      ),
    ],
    options.map(option =>
      h.button(
        [
          h.Type('button'),
          h.AriaPressed(option.value === current ? 'true' : 'false'),
          h.OnClick(choose(option.value)),
          h.Class(
            `rounded-md px-3 py-1 font-medium transition-colors ${option.value === current ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`,
          ),
        ],
        [option.label],
      ),
    ),
  )

export const eyebrow = <Msg>(h: HtmlBuilder<Msg>, text: string): Html =>
  h.div(
    [
      h.Class(
        'text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
      ),
    ],
    [text],
  )

type HeaderProps = Readonly<{
  chapter: number
  title: string
  dek: string
  from: string
  to: string
  filesChanged: number
}>

export const essayHeader = <Msg>(
  h: HtmlBuilder<Msg>,
  props: HeaderProps,
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
          eyebrow(h, `Chapter ${props.chapter}`),
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
      h.div(
        [
          h.Class(
            'mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground',
          ),
        ],
        [
          h.span(
            [],
            [
              'Starts at ',
              h.code([h.Class('font-mono text-foreground')], [props.from]),
            ],
          ),
          h.span(
            [],
            [
              'Ends at ',
              h.code([h.Class('font-mono text-foreground')], [props.to]),
            ],
          ),
          h.span([], [`${props.filesChanged} files changed`]),
          h.span([], ['Tailwind']),
        ],
      ),
    ],
  )

/** The page around an essay: one column for text and figures. Rendered inside
   the docs shell, so it is a div, not a second top-level <main>. */
export const essayPage = <Msg>(
  h: HtmlBuilder<Msg>,
  children: ReadonlyArray<Html>,
): Html =>
  h.div(
    [h.Class('bg-background px-4 pb-32')],
    [h.article([h.Class('mx-auto max-w-[800px]')], [...children])],
  )

export const essayFooter = <Msg>(h: HtmlBuilder<Msg>, text: string): Html =>
  h.footer(
    [
      h.Class(
        'mt-16 border-t border-border pt-6 text-[14px] leading-[1.7] text-muted-foreground',
      ),
    ],
    [h.p([], inline(h, text))],
  )
