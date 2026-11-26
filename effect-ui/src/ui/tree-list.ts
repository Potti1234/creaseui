import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import { TreeListBehavior, type TreeListNode } from '../behaviors/tree-list'

type Options<Msg> = Parameters<typeof TreeListBehavior<Msg>>[1]
export type TreeListItem<Msg, R = never> = {
  readonly id: string
  readonly label: View.Input<Msg, R>
  readonly description?: string
  readonly typeaheadText?: string
  readonly startContent?: View.Input<Msg, R>
  readonly endContent?: View.Input<Msg, R>
  readonly children?: readonly TreeListItem<Msg, R>[]
  readonly onSelect?: boolean
  readonly href?: string
  readonly target?: string
  readonly isDisabled?: boolean
  readonly isSelected?: boolean
  readonly isExpanded?: boolean
}
export type TreeListProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback' | 'props'
> & {
  readonly props: Omit<Options<Msg>['props'], 'items'> & {
    readonly items: readonly TreeListItem<Msg, R>[]
  }
  readonly header?: View.Input<Msg, R>
  readonly ariaLabel?: string
  readonly density?: 'compact' | 'balanced' | 'spacious'
  readonly variant?: 'lineGuides' | 'noGuides'
  readonly className?: string
}

const tailwind = {
  shell: 'grid min-w-0 gap-2',
  header: 'text-sm font-medium',
  root: 'm-0 min-w-0 list-none p-0',
  item: 'relative outline-none focus-visible:[&>[data-slot=tree-list-row]]:ring-2 focus-visible:[&>[data-slot=tree-list-row]]:ring-ring',
  row: 'relative flex min-w-0 items-center gap-1.5 rounded-sm px-1.5 text-sm text-foreground data-[density=compact]:min-h-7 data-[density=balanced]:min-h-9 data-[density=spacious]:min-h-11 data-disabled:opacity-50 data-selected:bg-accent data-grabbed:bg-accent data-[drop=before]:shadow-[inset_0_2px_var(--ring)] data-[drop=after]:shadow-[inset_0_-2px_var(--ring)] data-[drop=inside]:ring-1 data-[drop=inside]:ring-ring',
  children:
    'm-0 ms-3 list-none ps-2 data-guides:border-s data-guides:border-border',
  expand:
    'inline-grid size-6 shrink-0 place-items-center rounded-sm border-0 bg-transparent text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
  spacer: 'size-6 shrink-0',
  action:
    'flex min-w-0 flex-1 items-center gap-1.5 rounded-sm border-0 bg-transparent px-1 py-1 text-start text-inherit no-underline hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
  content: 'grid min-w-0 flex-1 text-start',
  title: 'truncate',
  description: 'truncate text-xs text-muted-foreground',
  prefix: 'inline-flex shrink-0 text-muted-foreground',
  end: 'ms-auto shrink-0',
  grip: 'inline-grid size-5 shrink-0 cursor-grab place-items-center text-muted-foreground',
  hidden: 'sr-only',
}

export const TreeList = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    header,
    ariaLabel,
    density = 'balanced',
    variant = 'lineGuides',
    className,
    ...options
  }: TreeListProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const { id, items, dir, reorderable } = options.props
  const visual = new Map<string, TreeListItem<Msg, R>>()
  const describe = (
    items: readonly TreeListItem<Msg, R>[],
  ): readonly TreeListNode[] =>
    items.map(item => {
      visual.set(item.id, item)
      return {
        id: item.id,
        text:
          item.typeaheadText ??
          (typeof item.label === 'string' ? item.label : item.id),
        isDisabled: item.isDisabled,
        isSelected: item.isSelected,
        isExpanded: item.isExpanded,
        actionable: item.onSelect,
        linked: item.href !== undefined,
        children:
          item.children === undefined ? undefined : describe(item.children),
      }
    })
  const nodes = describe(items)
  const headerId = `${id}-header`
  return TreeListBehavior(h, {
    ...options,
    key: options.key ?? id,
    props: { ...options.props, items: nodes },
    view: tree => {
      const byId = new Map(tree.rows.map(row => [row.node.id, row]))
      const render = (node: TreeListNode): View.Content<Msg, R> | undefined => {
        const row = byId.get(node.id)
        const item = visual.get(node.id)
        if (row === undefined || item === undefined) return undefined
        const branch = (node.children?.length ?? 0) > 0
        const disabled = node.isDisabled === true
        const selected = node.isSelected === true
        const grabbed = tree.draftId === node.id
        const labelId = `${id}-label-${encodeURIComponent(node.id)}`
        const descId = `${id}-description-${encodeURIComponent(node.id)}`
        const body = [
          item.startContent === undefined
            ? undefined
            : h.span.class(styles.prefix).children(item.startContent),
          h.span
            .class(styles.content)
            .children(
              h.span
                .class(styles.title)
                .attr('id', labelId)
                .children(item.label),
              item.description === undefined
                ? undefined
                : h.span
                    .class(styles.description)
                    .attr('id', descId)
                    .children(item.description),
            ),
        ] as const
        const control =
          item.href !== undefined && !disabled
            ? tree
                .link(
                  h.a.class(styles.action).attrs({
                    href: item.href,
                    target: item.target,
                    rel:
                      item.target === '_blank'
                        ? 'noopener noreferrer'
                        : undefined,
                    tabindex: '-1',
                    'data-slot': 'tree-list-link',
                  }),
                  node.id,
                )
                .children(body)
            : (node.actionable || branch) && !disabled
              ? (node.actionable ? tree.action : tree.toggle)(
                  h.button.class(styles.action).attrs({
                    type: 'button',
                    tabindex: '-1',
                    'data-slot': 'tree-list-action',
                  }),
                  node.id,
                ).children(body)
              : h.div.class(styles.action).children(body)
        return tree
          .row(
            h.li
              .key(node.id)
              .class(styles.item)
              .attrs({
                role: 'treeitem',
                tabindex: tree.focused === node.id ? '0' : '-1',
                'data-slot': 'tree-list-item',
                'data-grabbed': grabbed ? '' : undefined,
                'aria-expanded': branch ? String(row.expanded) : undefined,
                'aria-selected':
                  node.isSelected === undefined ? undefined : String(selected),
                'aria-disabled': disabled ? 'true' : undefined,
                'aria-level': String(row.depth),
                'aria-posinset': String(row.position),
                'aria-setsize': String(row.count),
                'aria-labelledby': labelId,
                'aria-describedby':
                  item.description === undefined ? undefined : descId,
              }),
            node.id,
          )
          .children(
            tree
              .itemBody(
                h.div.class(styles.row).attrs({
                  'data-slot': 'tree-list-row',
                  'data-density': density,
                  'data-disabled': disabled ? '' : undefined,
                  'data-selected': selected ? '' : undefined,
                  'data-grabbed': grabbed ? '' : undefined,
                  'data-drop':
                    tree.dropMark?.id === node.id
                      ? tree.dropMark.edge
                      : undefined,
                }),
                node.id,
              )
              .children(
                branch
                  ? tree
                      .toggle(
                        h.button
                          .class(styles.expand)
                          .attrs({
                            type: 'button',
                            tabindex: '-1',
                            'aria-label': row.expanded ? 'Collapse' : 'Expand',
                            'data-slot': 'tree-list-toggle',
                          })
                          .disabled(disabled),
                        node.id,
                      )
                      .children(
                        IconBehavior(h, {
                          name: 'chevron-right',
                          size: 'sm',
                          rotation: row.expanded ? 90 : dir === 'rtl' ? 180 : 0,
                        }),
                      )
                  : h.span.class(styles.spacer).attr('aria-hidden', 'true'),
                control,
                item.endContent === undefined
                  ? undefined
                  : h.span.class(styles.end).children(item.endContent),
                reorderable && !disabled
                  ? tree
                      .grip(
                        h.span.class(styles.grip).attrs({
                          'aria-hidden': 'true',
                          'data-slot': 'tree-list-grip',
                          title: 'Drag to reorder',
                        }),
                        node.id,
                      )
                      .children(
                        IconBehavior(h, { name: 'grip-vertical', size: 'xs' }),
                      )
                  : undefined,
              ),
            !row.expanded || node.children === undefined
              ? undefined
              : h.ul
                  .class(styles.children)
                  .attrs({
                    role: 'group',
                    'data-slot': 'tree-list-group',
                    'data-guides': variant === 'lineGuides' ? '' : undefined,
                  })
                  .children(node.children.map(render)),
          )
      }
      return h.div
        .class(styles.shell, className)
        .attrs({ 'data-slot': 'tree-list', dir })
        .children(
          header === undefined
            ? undefined
            : h.div.class(styles.header).attr('id', headerId).children(header),
          tree
            .root(
              h.ul.class(styles.root).attrs({
                id,
                role: 'tree',
                'data-slot': 'tree-list-root',
                'aria-label': ariaLabel,
                'aria-labelledby':
                  ariaLabel !== undefined || header === undefined
                    ? undefined
                    : headerId,
                'aria-describedby': reorderable
                  ? `${id}-instructions`
                  : undefined,
              }),
            )
            .children(tree.items.map(render)),
          reorderable
            ? h.span
                .class(styles.hidden)
                .attr('id', `${id}-instructions`)
                .children(
                  'Press Shift and Space to grab an item, arrow keys to move it, and Enter to drop. Press Escape to cancel.',
                )
            : undefined,
          h.span
            .class(styles.hidden)
            .attrs({ 'aria-live': 'polite', 'aria-atomic': 'true' })
            .children(tree.announcement),
        )
    },
  })
}
