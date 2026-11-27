import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  parseMarkdownBlocks,
  parseMarkdownInline,
  sanitizeMarkdownUrl,
  type MarkdownBlock,
  type MarkdownInline,
  type MarkdownSource,
} from '../behaviors/markdown'
import { HeadingBehavior, type HeadingLevel } from '../behaviors/heading'
import { IconBehavior } from '../behaviors/icon'
import { linkTarget } from '../behaviors/link'
import { CodeBlock } from './code-block'

export type MarkdownProps = {
  readonly id: string
  readonly source: string
  readonly display?: 'block' | 'inline'
  readonly density?: 'default' | 'compact'
  readonly headingLevelStart?: 1 | 2 | 3 | 4 | 5 | 6
  readonly sources?: Readonly<Record<string, MarkdownSource>>
  readonly citationStyle?: 'label' | 'number'
  readonly contentWidth?: number | string
  readonly contentAlign?: 'start' | 'center'
  readonly className?: string
}

const tailwind = {
  root: 'min-w-0 w-full break-words text-base text-foreground',
  block: 'min-w-0',
  heading: 'm-0',
  paragraph: 'm-0 min-w-0 wrap-break-word',
  strong: 'font-semibold',
  deleted: 'text-muted-foreground line-through',
  inlineCode:
    'rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground',
  image: 'h-auto max-w-full rounded-md',
  list: 'm-0 ps-6 data-ordered:list-decimal not-data-ordered:list-disc',
  listItem: 'min-w-0 py-1',
  task: 'flex list-none items-start gap-2',
  taskList: 'm-0 list-none p-0',
  taskMarker:
    'mt-1 inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
  quote: 'm-0 border-s-2 border-border ps-4 text-muted-foreground',
  tableBox: 'min-w-0 overflow-auto',
  table: 'w-full min-w-max border-collapse text-sm',
  tableRow: 'border-b border-border last:border-b-0',
  tableHeader: 'border-b border-border',
  cell: 'h-10 px-2 text-start align-middle whitespace-nowrap data-heading:font-medium',
  line: 'm-0 border-0 border-t border-border',
  link: 'text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ring',
  citation:
    'ms-0.5 inline-flex h-5 max-w-[15em] items-center gap-1 rounded-md border border-border px-2 align-super text-xs leading-5 text-muted-foreground no-underline hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-numbered:min-w-5 data-numbered:justify-center data-numbered:rounded-full data-numbered:border-0 data-numbered:bg-primary/10 data-numbered:px-1 data-numbered:text-[0.625rem] data-numbered:leading-4 data-numbered:font-semibold data-numbered:hover:bg-primary/20',
  citationIcon: 'size-3 shrink-0 object-contain',
  citationLabel: 'truncate',
}

const spacing = {
  default: {
    major: [24, 12],
    minor: [16, 8],
    paragraph: [12, 12],
    code: [16, 16],
    blockquote: [16, 16],
    list: [12, 12],
    table: [16, 16],
    thematicBreak: [24, 24],
    image: [12, 12],
  },
  compact: {
    major: [16, 8],
    minor: [12, 4],
    paragraph: [4, 4],
    code: [8, 8],
    blockquote: [8, 8],
    list: [4, 4],
    table: [8, 8],
    thematicBreak: [12, 12],
    image: [8, 8],
  },
} as const

export const Markdown = <Msg>(
  h: Html.H<Msg>,
  {
    id,
    source,
    display = 'block',
    density = 'default',
    headingLevelStart = 1,
    sources = {},
    citationStyle = 'label',
    contentWidth,
    contentAlign = 'start',
    className,
  }: MarkdownProps,
  styles: typeof tailwind = tailwind,
  renderCodeBlock: typeof CodeBlock = CodeBlock,
) => {
  const knownSources = new Set(Object.keys(sources))
  const citationNumbers = new Map<string, number>()
  const width =
    typeof contentWidth === 'number' ? `${contentWidth}px` : contentWidth
  const cleanLink = (url: string) => {
    const href = sanitizeMarkdownUrl(url)
    if (href === null) return
    const external = /^(https?:)?\/\//i.test(href)
    return { href, ...linkTarget(external ? '_blank' : undefined, undefined) }
  }
  const image = (url: string, alt: string) => {
    const src = sanitizeMarkdownUrl(url)
    return src === null
      ? `[${alt}]`
      : h.img.class(styles.image).attrs({ src, alt, loading: 'lazy' })
  }
  const inline = (
    nodes: readonly MarkdownInline[],
  ): View.Children<Msg, never> =>
    nodes.map((node): string | View.Content<Msg> => {
      switch (node.type) {
        case 'text':
          return node.value
        case 'strong':
          return h.strong.class(styles.strong).children(inline(node.children))
        case 'emphasis':
          return h.em.children(inline(node.children))
        case 'delete':
          return h.del.class(styles.deleted).children(inline(node.children))
        case 'inlineCode':
          return h.code.class(styles.inlineCode).children(node.value)
        case 'break':
          return h.br
        case 'image':
          return image(node.url, node.alt)
        case 'link': {
          const link = cleanLink(node.url)
          return link === undefined
            ? h.span.children(inline(node.children))
            : h.a
                .class(styles.link)
                .attrs({ ...link, 'data-slot': 'markdown-link' })
                .children(inline(node.children))
        }
        case 'citation': {
          if (!Object.hasOwn(sources, node.sourceId))
            return `[${node.sourceId}]`
          const item = sources[node.sourceId]
          if (item === undefined) return `[${node.sourceId}]`
          const number =
            citationNumbers.get(node.sourceId) ?? citationNumbers.size + 1
          citationNumbers.set(node.sourceId, number)
          const numbered = citationStyle === 'number'
          const href =
            item.url === undefined ? null : sanitizeMarkdownUrl(item.url)
          const icon =
            item.icon === undefined ? null : sanitizeMarkdownUrl(item.icon)
          const content = numbered
            ? String(number)
            : [
                icon === null
                  ? undefined
                  : h.img
                      .class(styles.citationIcon)
                      .attrs({ src: icon, alt: '', loading: 'lazy' }),
                h.span.class(styles.citationLabel).children(item.title),
              ]
          const attrs = {
            'data-slot': 'markdown-citation',
            'data-numbered': numbered ? '' : undefined,
            'aria-label': `Citation ${number}: ${item.title}`,
            title: item.title,
          }
          return href === null
            ? h.span.class(styles.citation).attrs(attrs).children(content)
            : h.a
                .class(styles.citation)
                .attrs({ ...attrs, href, ...linkTarget('_blank', undefined) })
                .children(content)
        }
      }
    })
  const listLabel = (
    children: readonly MarkdownBlock[],
    path: string,
  ): View.Input<Msg> => {
    const first = children[0]
    if (children.length === 1 && first?.type === 'paragraph')
      return h.span.children(inline(first.children))
    return h.span.children(blocks(children, path))
  }
  const bulletMarker = (ordered: boolean) =>
    ordered
      ? h.span
          .class(
            'self-baseline shrink-0 text-foreground text-sm leading-5 w-4 before:content-[counter(crease-list)_"."]',
          )
          .attr('aria-hidden', 'true')
      : h.span
          .class(
            'self-baseline box-border flex items-center justify-center shrink-0 w-4 mt-[calc((1em*1.4286-6px)/2)]',
          )
          .attr('aria-hidden', 'true')
          .children(h.span.class('w-1.5 h-1.5 rounded-full bg-foreground'))
  const taskMarker = (checked: boolean) =>
    h.span
      .class(
        checked
          ? 'size-4 shrink-0 rounded-[4px] border border-primary bg-primary text-primary-foreground inline-flex items-center justify-center'
          : 'size-4 shrink-0 rounded-[4px] border border-input inline-flex items-center justify-center',
      )
      .attr('aria-hidden', 'true')
      .children(
        checked
          ? IconBehavior(h, {
              name: 'check',
              size: 'xs',
              className: 'size-3.5',
            })
          : undefined,
      )
  const markdownListItem = (
    item: Extract<MarkdownBlock, { type: 'list' }>['children'][number],
    key: string,
    ordered: boolean,
  ) =>
    h.li
      .key(key)
      .class(
        'relative box-border flex items-center gap-2 text-start rounded-md px-[var(--_item-inset-inline)] py-1 [counter-increment:crease-list]',
      )
      .attrs({
        'data-slot': 'list-item',
        'data-density': 'compact',
      })
      .style({ '--_item-inset-inline': '8px' })
      .children(
        item.checked === null
          ? bulletMarker(ordered)
          : taskMarker(item.checked),
        h.span
          .class('flex flex-col flex-1 min-w-0 text-start')
          .attr('data-slot', 'list-item-content')
          .children(
            h.span
              .class('text-foreground text-sm leading-5')
              .children(listLabel(item.children, key)),
          ),
      )
  const blocks = (
    nodes: readonly MarkdownBlock[],
    path: string,
  ): View.Children<Msg, never> =>
    nodes.map((node, index): View.Content<Msg> => {
      const key = `${path}-${index}`
      const [start, end] =
        spacing[density][
          node.type === 'heading'
            ? node.depth <= 3
              ? 'major'
              : 'minor'
            : node.type
        ]
      const contentSized =
        node.type === 'paragraph' ||
        node.type === 'code' ||
        node.type === 'table' ||
        node.type === 'list' ||
        node.type === 'blockquote'
      const block = (slot?: string) =>
        h.div
          .key(key)
          .class(styles.block)
          .attrs({
            'data-slot': slot,
          })
          .style({
            marginBlockStart: index === 0 ? '0' : `${start}px`,
            marginBlockEnd: index === nodes.length - 1 ? '0' : `${end}px`,
            maxWidth: contentSized ? width : undefined,
            marginInline:
              contentSized && width !== undefined && contentAlign === 'center'
                ? 'auto'
                : undefined,
          })
      switch (node.type) {
        case 'heading': {
          const level = Math.min(
            6,
            Math.max(1, headingLevelStart + node.depth - 1),
          ) as HeadingLevel
          return block().children(
            HeadingBehavior(h, {
              level,
              className: styles.heading,
              children: inline(node.children),
            }),
          )
        }
        case 'paragraph':
          return block('markdown-paragraph').children(
            h.p.class(styles.paragraph).children(inline(node.children)),
          )
        case 'code':
          return block('markdown-codeblock').children(
            renderCodeBlock(h, {
              id: `${id}-code-${key}`,
              props: { code: node.value },
              ...(node.lang === null
                ? { languageLabel: false }
                : { language: node.lang }),
              collapsible: true,
            }),
          )
        case 'blockquote':
          return block().children(
            h.blockquote
              .class(styles.quote)
              .children(blocks(node.children, key)),
          )
        case 'list': {
          const allTasks =
            node.children.length > 0 &&
            node.children.every(item => item.checked !== null)
          const listStyle = allTasks
            ? 'none'
            : node.ordered
              ? 'decimal'
              : 'disc'
          return block(
            allTasks ? 'markdown-tasklist' : 'markdown-list',
          ).children(
            node.ordered && !allTasks
              ? h.ol
                  .class('m-0 ps-0 list-none flex flex-col gap-0.5 -mx-2')
                  .attrs({
                    'data-slot': 'list',
                    'data-density': 'compact',
                    role: 'list',
                    start: node.start !== 1 ? String(node.start) : undefined,
                  })
                  .style({
                    counterReset:
                      node.start !== 1
                        ? `crease-list ${node.start - 1}`
                        : 'crease-list',
                  })
                  .children(
                    node.children.map((item, row) =>
                      markdownListItem(item, `${key}-${row}`, true),
                    ),
                  )
              : h.ul
                  .class('m-0 ps-0 list-none flex flex-col gap-0.5 -mx-2')
                  .attrs({
                    'data-slot': 'list',
                    'data-density': 'compact',
                    role: 'list',
                  })
                  .style({
                    counterReset: allTasks ? undefined : 'crease-list',
                  })
                  .children(
                    node.children.map((item, row) =>
                      markdownListItem(item, `${key}-${row}`, false),
                    ),
                  ),
          )
        }
        case 'table': {
          const row = (at: number) =>
            (node.children[at]?.children ?? []).map((cell, column) => {
              const cellType = at === 0 ? 'th' : 'td'
              const align =
                node.align[column] === 'right'
                  ? 'end'
                  : (node.align[column] ?? undefined)
              const htmlStyle = h.span.style({ textAlign: align }).elementAttrs
                .style
              return h
                .el(cellType)
                .key(String(column))
                .attrs({
                  class: styles.cell,
                  style: htmlStyle,
                  scope: at === 0 ? 'col' : undefined,
                  'data-heading': at === 0 ? '' : undefined,
                })
                .children(inline(cell.children))
            })
          return block('markdown-table').children(
            h.div.class(styles.tableBox).children(
              h.table.class(styles.table).children(
                h.thead
                  .class(styles.tableHeader)
                  .children(h.tr.children(row(0))),
                h.tbody.children(
                  node.children.slice(1).map((_, at) =>
                    h.tr
                      .key(String(at))
                      .class(styles.tableRow)
                      .children(row(at + 1)),
                  ),
                ),
              ),
            ),
          )
        }
        case 'thematicBreak':
          return block('markdown-hr').children(h.hr.class(styles.line))
        case 'image':
          return block('markdown-image').children(image(node.url, node.alt))
      }
    })
  const attributes = {
    id,
    'data-slot': 'markdown',
    'data-display': display,
    'data-density': density,
    'data-align': contentAlign,
  }
  return display === 'inline'
    ? h.span
        .class(styles.root, className)
        .attrs(attributes)
        .children(inline(parseMarkdownInline(source, knownSources)))
    : h.div
        .class(styles.root, className)
        .attrs(attributes)
        .children(blocks(parseMarkdownBlocks(source, knownSources), 'root'))
}
