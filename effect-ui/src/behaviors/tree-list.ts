import { Command, Mount, UiSchema } from '@effect/ui'
import { Html, HtmlCommand } from '@effect/ui/html'
import { makeComboboxFilter } from '@effect/ui-kit'
import { Effect, Schema, Stream } from 'effect'

import { Placement, place, placementFor } from './tree-list-reorder'
export {
  Placement as TreeListPlacement,
  place as placeTreeListItem,
} from './tree-list-reorder'

export type TreeListNode = {
  readonly id: string
  readonly text: string
  readonly isDisabled?: boolean | undefined
  readonly isSelected?: boolean | undefined
  readonly isExpanded?: boolean | undefined
  readonly actionable?: boolean | undefined
  readonly linked?: boolean | undefined
  readonly children?: readonly TreeListNode[] | undefined
}
const Node: Schema.Codec<TreeListNode> = Schema.suspend(() =>
  Schema.Struct({
    id: Schema.String,
    text: Schema.String,
    isDisabled: Schema.optional(Schema.Boolean),
    isSelected: Schema.optional(Schema.Boolean),
    isExpanded: Schema.optional(Schema.Boolean),
    actionable: Schema.optional(Schema.Boolean),
    linked: Schema.optional(Schema.Boolean),
    children: Schema.optional(Schema.Array(Node)),
  }),
)
type Row = {
  readonly node: TreeListNode
  readonly parent: string | null
  readonly position: number
  readonly count: number
  readonly depth: number
  readonly expanded: boolean
}
const allRows = (
  items: readonly TreeListNode[],
  isExpanded: (node: TreeListNode) => boolean,
  all = false,
  parent: string | null = null,
  depth = 1,
): Row[] =>
  items.flatMap((node, index) => {
    const expanded = isExpanded(node)
    return [
      {
        node,
        parent,
        depth,
        position: index + 1,
        count: items.length,
        expanded,
      },
      ...(all || expanded
        ? allRows(node.children ?? [], isExpanded, all, node.id, depth + 1)
        : []),
    ]
  })

const RowRef = Html.ref('CreaseTreeRow', 'li')
const ActivateLink = Mount.makeStream(
  'ActivateCreaseTreeLink',
  { args: {} },
  (root: HTMLElement) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        const activate = (event: KeyboardEvent) => {
          if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.isComposing ||
            (event.key !== 'Enter' && event.key !== ' ')
          )
            return
          const row = event.target
          if (
            !(row instanceof HTMLElement) ||
            !row.matches(
              '[role="treeitem"]:not([aria-disabled="true"]):not([data-grabbed])',
            )
          )
            return
          const link = row.querySelector<HTMLAnchorElement>(
            ':scope > [data-slot="tree-list-row"] [data-slot="tree-list-link"]',
          )
          if (link === null) return
          event.preventDefault()
          event.stopPropagation()
          link.click()
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => root.addEventListener('keydown', activate, true)),
          () =>
            Effect.sync(() =>
              root.removeEventListener('keydown', activate, true),
            ),
        )
        return yield* Effect.never
      }),
    ),
)

const Events = UiSchema.TaggedEnum({
  Selected: { id: Schema.String },
  Expanded: { id: Schema.String, open: Schema.Boolean },
  Reordered: { placements: Schema.Array(Placement) },
})
const Message = UiSchema.TaggedEnum({
  Focused: { id: Schema.String },
  Focus: { id: Schema.String },
  Toggle: { id: Schema.String },
  Activate: { id: Schema.String },
  Typed: { term: Schema.String, at: Schema.Number },
  Grabbed: { id: Schema.String },
  DraftMoved: {
    direction: Schema.Literals(['up', 'down', 'indent', 'outdent']),
  },
  Accepted: {},
  Cancelled: {},
  Dropped: { placement: Placement },
  DraggedOver: {
    id: Schema.String,
    edge: Schema.Literals(['before', 'inside', 'after']),
  },
  DragEnded: {},
})
const Model = Schema.Struct({
  expanded: Schema.Record(Schema.String, Schema.Boolean),
  focused: Schema.NullOr(Schema.String),
  typeahead: Schema.Struct({ value: Schema.String, at: Schema.Number }),
  placed: Schema.Array(Placement),
  draft: Schema.NullOr(
    Schema.Struct({ id: Schema.String, changes: Schema.Array(Placement) }),
  ),
  dropMark: Schema.NullOr(
    Schema.Struct({
      id: Schema.String,
      edge: Schema.Literals(['before', 'inside', 'after']),
    }),
  ),
  announcement: Schema.String,
})

const applyChanges = (
  items: readonly TreeListNode[],
  model: typeof Model.Type,
) => {
  const placements = [...model.placed, ...(model.draft?.changes ?? [])]
  return placements.reduce<readonly TreeListNode[]>(
    (tree, placement) => place(tree, placement),
    items,
  )
}
const openOf = (node: TreeListNode, model: typeof Model.Type) =>
  (node.children?.length ?? 0) > 0 &&
  (model.draft?.changes.some(placement => placement.parent === node.id) ===
    true ||
    (Object.hasOwn(model.expanded, node.id)
      ? model.expanded[node.id]
      : node.isExpanded) === true)
const findRow = (items: readonly TreeListNode[], id: string) =>
  allRows(items, () => true, true).find(row => row.node.id === id)
const focus = (id: string) =>
  HtmlCommand.Focus.make({ ref: RowRef.at(id) }).pipe(Command.asNoop)

export const TreeListBehavior = Html.component({
  name: 'CreaseTreeList',
  props: Schema.Struct({
    id: Schema.String,
    items: Schema.Array(Node),
    expandedIds: Schema.optional(Schema.Array(Schema.String)),
    reorderable: Schema.optional(Schema.Boolean),
    dir: Schema.optional(Schema.Literals(['ltr', 'rtl'])),
    locale: Schema.optional(Schema.String),
  }),
  model: Model,
  events: Events,
  message: Message,
}).make({
  init: ({ props }) => ({
    expanded: Object.fromEntries(
      (props.expandedIds ?? []).map(id => [id, true]),
    ),
    focused: null,
    typeahead: { value: '', at: 0 },
    placed: [],
    draft: null,
    dropMark: null,
    announcement: '',
  }),
  update: {
    Focused: ($, { id }) =>
      $.model.focused === id ? $.model : $.evolve({ focused: id }),
    Focus: ($, { id }) => $.evolve({ focused: id }).run(focus(id)),
    Toggle: ($, { id }) => {
      const node = findRow(applyChanges($.props.items, $.model), id)?.node
      if (node === undefined || node.isDisabled || !node.children?.length)
        return $.model
      const open = !openOf(node, $.model)
      return $.evolve({ expanded: { ...$.model.expanded, [id]: open } }).emit(
        Events.Expanded({ id, open }),
      )
    },
    Activate: ($, { id }) => {
      const node = findRow(applyChanges($.props.items, $.model), id)?.node
      return node === undefined || node.isDisabled || !node.actionable
        ? $.model
        : $.emit(Events.Selected({ id }))
    },
    Typed: ($, { term, at }) => {
      const rows = allRows(applyChanges($.props.items, $.model), node =>
        openOf(node, $.model),
      ).filter(row => !row.node.isDisabled)
      const previous =
        at - $.model.typeahead.at < 500 ? $.model.typeahead.value : ''
      const value = previous === term ? term : previous + term
      const filter = makeComboboxFilter($.props.locale)
      const index = rows.findIndex(row => row.node.id === $.model.focused)
      const next = [...rows.slice(index + 1), ...rows.slice(0, index + 1)].find(
        row => filter.startsWith(row.node.text, value),
      )
      return next === undefined
        ? $.evolve({ typeahead: { value, at } })
        : $.evolve({ typeahead: { value, at }, focused: next.node.id }).run(
            focus(next.node.id),
          )
    },
    Grabbed: ($, { id }) => {
      const row = findRow(applyChanges($.props.items, $.model), id)
      return !$.props.reorderable || row === undefined || row.node.isDisabled
        ? $.model
        : $.evolve({
            draft: { id, changes: [] },
            announcement:
              'Item grabbed. Use arrow keys to move it, Space or Enter to drop, or Escape to cancel.',
          })
    },
    DraftMoved: ($, { direction }) => {
      const draft = $.model.draft
      if (draft === null) return $.model
      const placement = placementFor(
        applyChanges($.props.items, $.model),
        draft.id,
        direction,
      )
      return placement === undefined
        ? $.evolve({ announcement: 'Cannot move farther in that direction.' })
        : $.evolve({
            draft: { ...draft, changes: [...draft.changes, placement] },
            announcement: 'Item moved.',
          }).run(focus(draft.id))
    },
    Accepted: $ => {
      const draft = $.model.draft
      if (draft === null) return $.model
      const expanded = { ...$.model.expanded }
      for (const placement of draft.changes)
        if (placement.parent !== null) expanded[placement.parent] = true
      const next = $.evolve({
        draft: null,
        expanded,
        placed: [...$.model.placed, ...draft.changes],
        announcement: 'Item dropped.',
      })
      return draft.changes.length === 0
        ? next
        : next
            .emit(Events.Reordered({ placements: draft.changes }))
            .run(focus(draft.id))
    },
    Cancelled: $ =>
      $.model.draft === null
        ? $.model
        : $.evolve({ draft: null, announcement: 'Reordering cancelled.' }).run(
            focus($.model.draft.id),
          ),
    Dropped: ($, { placement }) => {
      if (!$.props.reorderable) return $.model
      const tree = applyChanges($.props.items, $.model)
      const placed = place(tree, placement)
      if (tree === placed) return $.evolve({ dropMark: null })
      const expanded =
        placement.parent === null
          ? $.model.expanded
          : { ...$.model.expanded, [placement.parent]: true }
      return $.evolve({
        placed: [...$.model.placed, placement],
        expanded,
        draft: null,
        dropMark: null,
        focused: placement.id,
        announcement: 'Item dropped.',
      })
        .emit(Events.Reordered({ placements: [placement] }))
        .run(focus(placement.id))
    },
    DraggedOver: ($, { id, edge }) =>
      $.model.dropMark?.id === id && $.model.dropMark.edge === edge
        ? $.model
        : $.evolve({ dropMark: { id, edge } }),
    DragEnded: $ =>
      $.model.dropMark === null ? $.model : $.evolve({ dropMark: null }),
  },
  parts: (p, model) => {
    const tree = applyChanges(p.props.items, model)
    const rows = allRows(tree, node => openOf(node, model))
    const enabled = rows.filter(row => !row.node.isDisabled)
    const focused = enabled.some(row => row.node.id === model.focused)
      ? model.focused
      : (enabled.find(row => row.node.isSelected)?.node.id ??
        enabled[0]?.node.id)
    const current = enabled.find(row => row.node.id === focused)
    const left = p.props.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    const right = p.props.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const choose = (row: Row | undefined) =>
      row === undefined ? undefined : Message.Focus({ id: row.node.id })
    const mime = `application/x-crease-tree-${encodeURIComponent(p.props.id).toLowerCase()}`
    const edgeOf = (y: number, height: number) =>
      y < height / 3 ? 'before' : y >= (2 * height) / 3 ? 'after' : 'inside'
    const keys = ({
      key,
      alt,
      ctrl,
      meta,
      shift,
      composing,
      editable,
    }: Html.KeyPayload) => {
      if (current === undefined || alt || ctrl || meta || composing || editable)
        return undefined
      if (model.draft !== null) {
        if (key === 'Escape') return Message.Cancelled()
        if (key === 'Enter' || key === ' ') return Message.Accepted()
        const direction =
          key === 'ArrowUp'
            ? 'up'
            : key === 'ArrowDown'
              ? 'down'
              : key === left
                ? 'outdent'
                : key === right
                  ? 'indent'
                  : undefined
        return direction === undefined
          ? undefined
          : Message.DraftMoved({ direction })
      }
      if (key === ' ' && shift && p.props.reorderable)
        return Message.Grabbed({ id: current.node.id })
      const index = enabled.indexOf(current)
      if (key === 'ArrowUp') return choose(enabled[index - 1] ?? current)
      if (key === 'ArrowDown') return choose(enabled[index + 1] ?? current)
      if (key === 'Home') return choose(enabled[0])
      if (key === 'End') return choose(enabled.at(-1))
      if (key === left)
        return current.expanded
          ? Message.Toggle({ id: current.node.id })
          : choose(
              enabled.find(row => row.node.id === current.parent) ?? current,
            )
      if (key === right)
        return !current.expanded && current.node.children?.length
          ? Message.Toggle({ id: current.node.id })
          : choose(
              enabled.find(row => row.parent === current.node.id) ?? current,
            )
      if (key === 'Enter' || key === ' ')
        return current.node.linked
          ? undefined
          : current.node.actionable
            ? Message.Activate({ id: current.node.id })
            : Message.Toggle({ id: current.node.id })
      return Array.from(key).length === 1 && key.trim() !== ''
        ? Message.Typed({ term: key.toLowerCase(), at: Date.now() })
        : undefined
    }
    return {
      items: tree,
      rows,
      focused,
      draftId: model.draft?.id,
      announcement: model.announcement,
      dropMark: model.dropMark,
      root: p.part('ul', element =>
        element
          .onMount(ActivateLink())
          .on('keydown', keys, { preventDefault: true }),
      ),
      row: p.part('li', (element, id: string) =>
        element.ref(RowRef.at(id)).on('focus', Message.Focused({ id })),
      ),
      toggle: p.part('button', (element, id: string) =>
        element.on('click', Message.Toggle({ id })),
      ),
      action: p.part('button', (element, id: string) =>
        element.on('click', Message.Activate({ id })),
      ),
      link: p.part('a', (element, id: string) =>
        element.on('click', Message.Activate({ id })),
      ),
      itemBody: p.part('div', (element, id: string) =>
        p.props.reorderable
          ? element
              .dropTarget({ accepts: [mime], dropEffect: 'move' })
              .on('dragover', ({ y, height }) =>
                Message.DraggedOver({ id, edge: edgeOf(y, height) }),
              )
              .on('dragleave', () =>
                model.dropMark?.id === id ? Message.DragEnded() : undefined,
              )
              .on('drop', ({ data, y, height }) => {
                const key = data[mime]
                const target = rows.find(row => row.node.id === id)
                if (
                  key === undefined ||
                  target === undefined ||
                  key === id ||
                  target.node.isDisabled
                )
                  return Message.DragEnded()
                const edge = edgeOf(y, height)
                const peer = allRows(tree, () => true, true).find(
                  row =>
                    row.parent === target.parent &&
                    row.position === target.position + 1,
                )
                const placement =
                  edge === 'inside'
                    ? { id: key, parent: id, before: null }
                    : {
                        id: key,
                        parent: target.parent,
                        before:
                          edge === 'before' ? id : (peer?.node.id ?? null),
                      }
                return Message.Dropped({ placement })
              })
          : element,
      ),
      grip: p.part('span', (element, id: string) =>
        element
          .draggable({ [mime]: id }, { effectAllowed: 'move' })
          .on('dragend', Message.DragEnded()),
      ),
    }
  },
})
