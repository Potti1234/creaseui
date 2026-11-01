import type { Html, HtmlBuilder } from 'foldkit/html'

/* Real tool output and source, shown the way the reader would meet it. */

/* ---- Code, diffs and terminal output ------------------------------------ */

const lineTone = (line: string): string =>
  line.startsWith('+')
    ? 'bg-emerald-500/12 text-emerald-950'
    : line.startsWith('-')
      ? 'bg-rose-500/12 text-rose-950'
      : line.startsWith('@@')
        ? 'text-sky-700/80'
        : 'text-foreground/75'

/** A unified diff from the tutorial repository, with its file header. */
export const diffView = <Msg>(
  h: HtmlBuilder<Msg>,
  file: string,
  diff: string,
  range: string,
  keep?: (lines: ReadonlyArray<string>) => ReadonlyArray<string>,
): Html => {
  const body = diff
    .split('\n')
    .filter(
      line => !/^(diff --git|index |--- |\+\+\+ )/u.test(line) && line !== '',
    )
  const shown = keep === undefined ? body : keep(body)
  return h.div(
    [
      h.Class(
        'overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'flex items-center justify-between border-b border-border/70 px-4 py-2 text-[12px]',
          ),
        ],
        [
          h.span([h.Class('font-mono text-foreground')], [file]),
          h.span([h.Class('text-muted-foreground')], [range]),
        ],
      ),
      h.pre(
        [h.Class('overflow-x-auto py-2 font-mono text-[12.5px] leading-[1.6]')],
        shown.map(line =>
          h.div(
            [h.Class(`px-4 whitespace-pre ${lineTone(line)}`)],
            [line === '' ? ' ' : line],
          ),
        ),
      ),
    ],
  )
}

/** A source file. With `scroll`, a long file keeps a fixed height and scrolls inside the frame. */
export const codeBlock = <Msg>(
  h: HtmlBuilder<Msg>,
  file: string,
  code: string,
  scroll = false,
): Html =>
  h.div(
    [
      h.Class(
        'overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'border-b border-border/70 px-4 py-2 font-mono text-[12px] text-foreground',
          ),
        ],
        [file],
      ),
      h.pre(
        [
          ...(scroll
            ? [h.Tabindex(0), h.AriaLabel(`${file}, scrollable`)]
            : []),
          h.Class(
            `${scroll ? 'max-h-[28rem] overflow-auto overscroll-contain' : 'overflow-x-auto'} px-4 py-3 font-mono text-[12.5px] leading-[1.6] text-foreground/85`,
          ),
        ],
        [code],
      ),
    ],
  )

/** Terminal output, as the tool printed it. */
export const terminal = <Msg>(
  h: HtmlBuilder<Msg>,
  command: string,
  output: string,
  highlight?: RegExp,
): Html =>
  h.div(
    [
      h.Class(
        'overflow-hidden rounded-xl bg-[oklch(0.2_0.01_270)] text-[oklch(0.9_0.01_270)] shadow-[0_1px_2px_rgb(0_0_0/0.1)]',
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'border-b border-white/8 px-4 py-2 font-mono text-[12px] text-white/55',
          ),
        ],
        [`$ ${command}`],
      ),
      h.pre(
        [h.Class('overflow-x-auto py-3 font-mono text-[12px] leading-[1.65]')],
        output
          .trimEnd()
          .split('\n')
          .map(line =>
            h.div(
              [
                h.Class(
                  `py-px pr-4 pl-8 -indent-4 whitespace-pre-wrap break-words ${highlight !== undefined && highlight.test(line) ? 'bg-amber-300/15 text-amber-100' : ''}`,
                ),
              ],
              [line === '' ? ' ' : line],
            ),
          ),
      ),
    ],
  )

/** The scope report, as it would appear on a pull request. */
export const reviewComment = <Msg>(
  h: HtmlBuilder<Msg>,
  output: string,
  baseline: string,
): Html => {
  const problems = output
    .split('\n')
    .filter(line => line.startsWith('problem '))
  return h.div(
    [
      h.Class(
        'overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'flex flex-wrap items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5 text-[13px]',
          ),
        ],
        [
          h.span(
            [
              h.Class(
                'flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background',
              ),
            ],
            ['C'],
          ),
          h.span(
            [h.Class('font-semibold text-foreground')],
            ['creaseui-lint scope'],
          ),
          h.span(
            [h.Class('text-muted-foreground')],
            [`checked the enforcement inputs against ${baseline}`],
          ),
          h.span(
            [
              h.Class(
                'ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11.5px] font-semibold text-amber-900',
              ),
            ],
            ['System change: needs review'],
          ),
        ],
      ),
      h.ul(
        [h.Class('divide-y divide-border/60')],
        problems.map(line => {
          const match = /changes variants of (\S+)#(\S+)/u.exec(line)
          return h.li(
            [
              h.Class(
                'flex flex-wrap items-baseline gap-x-2 px-4 py-2 text-[13px]',
              ),
            ],
            match === null
              ? [line.replace(/^problem /u, '')]
              : [
                  h.span(
                    [h.Class('font-mono text-[12px] text-muted-foreground')],
                    ['crease.lock.json'],
                  ),
                  h.span([], ['changes the allowed values of']),
                  h.code(
                    [h.Class('font-mono text-[12.5px] text-foreground')],
                    [match[2] ?? ''],
                  ),
                  h.span(
                    [h.Class('font-mono text-[12px] text-muted-foreground')],
                    [`in ${match[1]}`],
                  ),
                ],
          )
        }),
      ),
      h.div(
        [
          h.Class(
            'border-t border-border/70 px-4 py-2.5 text-[12.5px] text-muted-foreground',
          ),
        ],
        [
          'A feature change may not change these. A reviewed system change reruns with ',
          h.code(
            [h.Class('font-mono text-foreground')],
            ['--allow-enforcement-changes'],
          ),
          '.',
        ],
      ),
    ],
  )
}
