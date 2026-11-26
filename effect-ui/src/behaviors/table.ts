import type { View } from '@effect/ui'
import { Html } from '@effect/ui/html'

type Slot<Msg, R> = {
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}
type Part =
  | 'container'
  | 'root'
  | 'header'
  | 'body'
  | 'footer'
  | 'row'
  | 'head'
  | 'cell'
  | 'caption'
type Classes = Partial<Record<Part, string>>

export const TableParts = <Msg>(h: Html.H<Msg>, styles: Classes = {}) => {
  const part =
    (
      name: 'header' | 'body' | 'footer' | 'caption',
      tag: 'thead' | 'tbody' | 'tfoot' | 'caption',
    ) =>
    <R = never>({ className, children }: Slot<NoInfer<Msg>, R>) =>
      h
        .el(tag)
        .attrs({
          'data-slot': `table-${name}`,
          class: Html.classNames(styles[name], className),
        })
        .children(children)

  return {
    header: part('header', 'thead'),
    body: part('body', 'tbody'),
    footer: part('footer', 'tfoot'),
    caption: part('caption', 'caption'),
    row: <R = never>({
      selected,
      className,
      children,
    }: Slot<NoInfer<Msg>, R> & { readonly selected?: boolean }) =>
      h.tr
        .class(styles.row, className)
        .attrs({
          'data-slot': 'table-row',
          'data-selected': selected ? '' : undefined,
        })
        .children(children),
    head: <R = never>({
      scope = 'col',
      className,
      children,
    }: Slot<NoInfer<Msg>, R> & { readonly scope?: 'col' | 'row' }) =>
      h.th
        .class(styles.head, className)
        .attrs({ 'data-slot': 'table-head', scope })
        .children(children),
    cell: <R = never>({
      colspan,
      className,
      children,
    }: Slot<NoInfer<Msg>, R> & { readonly colspan?: number }) =>
      h.td
        .class(styles.cell, className)
        .attrs({
          'data-slot': 'table-cell',
          colspan: colspan === undefined ? undefined : String(colspan),
        })
        .children(children),
  }
}

export type TableProps<Msg, R = never> = Omit<Slot<Msg, R>, 'children'> & {
  readonly ariaLabel?: string
  readonly children?:
    | View.Children<Msg, R>
    | ((parts: ReturnType<typeof TableParts<Msg>>) => View.Children<Msg, R>)
}

export const TableBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { ariaLabel, children, className }: TableProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.container)
    .attrs({ 'data-slot': 'table-container', tabindex: '0' })
    .children(
      h.table
        .class(styles.root, className)
        .attrs({ 'data-slot': 'table', 'aria-label': ariaLabel })
        .children(
          typeof children === 'function'
            ? children(TableParts(h, styles))
            : children,
        ),
    )
