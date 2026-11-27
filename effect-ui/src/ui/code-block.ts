import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  CodeBlockBehavior,
  codeLines,
  flatTokensToLines,
  tokenize,
  type SyntaxToken,
} from '../behaviors/code-block'
import { IconBehavior } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof CodeBlockBehavior<Msg>>[1]
export type CodeBlockProps<Msg> = Omit<Options<Msg>, 'view' | 'fallback'> & {
  readonly id: string
  readonly language?: string
  readonly title?: string
  readonly languageLabel?: boolean
  readonly lineNumbers?: boolean
  readonly highlightLines?: readonly number[]
  readonly copyButton?: boolean
  readonly wrapped?: boolean
  readonly maxHeight?: number | string
  readonly collapsible?: boolean
  readonly collapsibleThreshold?: number
  readonly size?: 'sm' | 'md'
  readonly width?: string
  readonly container?: 'card' | 'section'
  readonly tokenizer?: (
    code: string,
    language: string,
  ) => ReadonlyArray<SyntaxToken>
  readonly className?: string
}
const tokenColors: Readonly<Partial<Record<string, string>>> = {
  keyword: 'var(--chart-3)',
  string: 'var(--chart-2)',
  comment: 'var(--muted-foreground)',
  number: 'var(--chart-4)',
  constant: 'var(--chart-4)',
  function: 'var(--chart-3)',
  type: 'var(--chart-5)',
  variable: 'var(--foreground)',
  operator: 'var(--chart-2)',
  property: 'var(--chart-2)',
  attribute: 'var(--chart-2)',
  tag: 'var(--destructive)',
  punctuation: 'var(--muted-foreground)',
}
const tailwind = {
  root: 'relative isolate flex min-w-0 max-w-full flex-col overflow-hidden rounded-md border bg-muted text-foreground data-[container=section]:rounded-none data-[container=section]:border-0 data-[container=section]:bg-transparent',
  header:
    'sticky top-0 z-10 flex min-w-0 items-center justify-between gap-2 bg-muted px-4 py-2 font-mono text-xs leading-5 text-muted-foreground data-numbered:border-b',
  title: 'min-w-0 truncate font-medium',
  controls: 'flex shrink-0 items-center gap-2',
  control:
    'inline-flex min-h-6 items-center gap-1 rounded-sm border-0 bg-transparent px-1 font-medium text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-overlay:absolute data-overlay:end-2 data-overlay:top-2',
  disclosure:
    'inline-flex min-w-0 items-center gap-1 rounded-sm border-0 bg-transparent text-start [font:inherit] focus-visible:ring-2 focus-visible:ring-ring',
  region:
    'grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 data-collapsed:grid-rows-[0fr] motion-reduce:transition-none',
  clip: 'min-h-0 overflow-hidden',
  viewport:
    'm-0 min-w-0 overflow-auto px-4 py-3 font-mono text-sm tab-size-2 focus-visible:outline-2 focus-visible:outline-ring data-[size=sm]:text-xs data-overlay:pe-10',
  line: 'flex min-w-0 gap-3 leading-[1.4286] data-highlighted:-mx-4 data-highlighted:bg-primary/10 data-highlighted:px-4',
  number:
    'shrink-0 border-e border-border pe-3 text-end text-muted-foreground select-none',
  body: 'min-w-0 whitespace-pre data-wrapped:break-all data-wrapped:whitespace-pre-wrap',
  footer: 'flex items-center justify-center border-t px-3 py-1.5 text-xs',
  feedback: 'sr-only',
}

export const CodeBlock = <Msg>(
  h: Html.H<Msg>,
  {
    id,
    language = 'plaintext',
    title,
    languageLabel = true,
    lineNumbers,
    highlightLines = [],
    copyButton = true,
    wrapped,
    maxHeight,
    collapsible,
    collapsibleThreshold = 10,
    size = 'md',
    width = 'fit-content',
    container = 'card',
    tokenizer,
    className,
    ...options
  }: CodeBlockProps<NoInfer<Msg>>,
  styles: typeof tailwind = tailwind,
) => {
  const code = options.props.code
  const lines = codeLines(code)
  const tokens =
    tokenizer === undefined
      ? tokenize(code, language)
      : flatTokensToLines(tokenizer(code, language), code)
  const mayCollapse =
    collapsible === true && lines.length >= collapsibleThreshold
  const highlights = new Set(highlightLines)
  const shownLanguage =
    languageLabel && language !== 'plaintext' ? language : undefined
  const headerText =
    title === undefined
      ? shownLanguage
      : shownLanguage === undefined
        ? title
        : `${title} — ${shownLanguage}`
  const displayLine = (line: string, spans: readonly SyntaxToken[]) => {
    const content: (string | View.Content<Msg>)[] = []
    let cursor = 0
    for (const token of spans) {
      const start = Math.max(cursor, token.start)
      const end = Math.min(token.end, line.length)
      if (end <= start) continue
      if (start > cursor) content.push(line.slice(cursor, start))
      content.push(
        h.span
          .attrs({ 'data-slot': 'code-token', 'data-type': token.type })
          .style({
            color: Object.hasOwn(tokenColors, token.type)
              ? tokenColors[token.type]
              : undefined,
          })
          .children(line.slice(start, end)),
      )
      cursor = end
    }
    if (cursor < line.length) content.push(line.slice(cursor))
    return content.length === 0 ? '\u200b' : content
  }
  return CodeBlockBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: block => {
      const copy = copyButton
        ? block
            .copy(
              h.button.class(styles.control).attrs({
                'data-slot': 'code-block-copy',
                'data-overlay': headerText === undefined ? '' : undefined,
                'aria-label': block.copied ? 'Copied' : 'Copy code',
              }),
            )
            .children(
              IconBehavior(h, {
                name: block.copied ? 'check' : 'copy',
                size: 'xs',
              }),
              h.span
                .class(styles.feedback)
                .attr('aria-live', 'polite')
                .children(
                  block.copied === null
                    ? undefined
                    : block.copied
                      ? 'Copied'
                      : 'Copy unavailable',
                ),
            )
        : undefined
      const toggle = (className: string) =>
        block.toggle(
          h.button.class(className).attrs({
            'data-slot': 'code-block-toggle',
            'aria-expanded': String(!block.collapsed),
            'aria-controls': id,
          }),
        )
      const viewport = h.div
        .class(
          'm-0 min-w-0 overflow-auto focus-visible:outline-2 focus-visible:outline-ring',
        )
        .attrs({
          'data-size': size,
          'data-slot': 'code-block-scroll-container',
          'data-overlay':
            headerText === undefined && copyButton ? '' : undefined,
          'aria-label': shownLanguage ?? 'Code',
          role: 'group',
          tabindex: '0',
        })
        .style({
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        })
        .children(
          h.div
            .class(
              'flex min-w-fit',
              headerText !== undefined && !lineNumbers ? '-mt-2' : undefined,
            )
            .children(
              h.code
                .class(
                  'm-0 block flex-1 px-4 py-3 font-mono whitespace-pre text-foreground [tab-size:2]',
                  size === 'sm' ? 'text-xs' : 'text-sm',
                )
                .attr('data-slot', 'code-block-code')
                .children(
                  lines.map((line, index) =>
                    h.span
                      .key(String(index))
                      .class(styles.line)
                      .attrs({
                        'data-slot': 'code-block-line',
                        'data-highlighted': highlights.has(index + 1)
                          ? ''
                          : undefined,
                        'data-line': lineNumbers
                          ? String(index + 1)
                          : undefined,
                      })
                      .children(
                        lineNumbers
                          ? h.span
                              .class(styles.number)
                              .attr('aria-hidden', 'true')
                              .style({
                                width: `calc(${String(lines.length).length}ch + 0.75rem)`,
                              })
                              .children(String(index + 1))
                          : undefined,
                        h.span
                          .class(styles.body)
                          .attr('data-wrapped', wrapped ? '' : undefined)
                          .children(displayLine(line, tokens[index] ?? [])),
                      ),
                  ),
                ),
            ),
        )
      return h.div
        .class(styles.root, className)
        .attrs({
          'data-slot': 'code-block',
          'data-container': container,
          'data-size': size,
        })
        .style({
          width,
          minWidth: width === 'fit-content' ? 'min(100%, 400px)' : undefined,
        })
        .children(
          headerText === undefined
            ? undefined
            : h.div
                .class(styles.header)
                .attrs({
                  'data-slot': 'code-block-header',
                  'data-numbered': lineNumbers ? '' : undefined,
                })
                .children(
                  mayCollapse
                    ? toggle(styles.disclosure).children(
                        IconBehavior(h, {
                          name: block.collapsed
                            ? 'chevron-right'
                            : 'chevron-down',
                          size: 'xs',
                        }),
                        h.span
                          .class(styles.title)
                          .attr('data-slot', 'code-block-title')
                          .children(headerText),
                      )
                    : h.span
                        .class(styles.title)
                        .attr('data-slot', 'code-block-title')
                        .children(headerText),
                  h.div.class(styles.controls).children(copy),
                ),
          mayCollapse
            ? h.div
                .class(styles.region)
                .attrs({
                  id,
                  'data-collapsed': block.collapsed ? '' : undefined,
                  inert: block.collapsed ? '' : undefined,
                })
                .children(h.div.class(styles.clip).children(viewport))
            : viewport.attr('id', id),
          headerText === undefined ? copy : undefined,
          headerText === undefined && mayCollapse
            ? h.div
                .class(styles.footer)
                .children(
                  toggle(styles.control).children(
                    block.collapsed ? 'Show code' : 'Hide code',
                  ),
                )
            : undefined,
        )
    },
  })
}
