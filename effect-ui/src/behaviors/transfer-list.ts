import { Command, UiSchema } from '@effect/ui'
import { Html, HtmlCommand } from '@effect/ui/html'
import { makeComboboxFilter } from '@effect/ui-kit'
import { Schema } from 'effect'

const Option = Schema.Struct({
  value: Schema.String,
  label: Schema.String,
  description: Schema.optional(Schema.String),
  group: Schema.optional(Schema.String),
  isTransferDisabled: Schema.optional(Schema.Boolean),
  isReorderDisabled: Schema.optional(Schema.Boolean),
  disabledMessage: Schema.optional(Schema.String),
})
export type TransferListOption = typeof Option.Type

const Action = Html.ref('CreaseTransferAction', 'button')
const Search = Html.ref('CreaseTransferSearch', 'input')
const Reorder = Html.ref('CreaseTransferReorder', 'button')
const Root = Html.ref('CreaseTransferRoot', 'div')

export const transferListMovableRange = (
  value: readonly string[],
  options: readonly TransferListOption[],
  key: string,
) => {
  const index = value.indexOf(key)
  const byKey = new Map(options.map(option => [option.value, option]))
  const movable = (candidate: string | undefined) => {
    const item = candidate === undefined ? undefined : byKey.get(candidate)
    return item !== undefined && !item.isReorderDisabled
  }
  if (index < 0 || !movable(key)) return undefined
  let start = index
  let end = index
  while (start > 0 && movable(value[start - 1])) start -= 1
  while (end < value.length - 1 && movable(value[end + 1])) end += 1
  return { index, start, end }
}
const moveItem = (value: readonly string[], from: number, to: number) => {
  if (
    from < 0 ||
    from >= value.length ||
    to < 0 ||
    to >= value.length ||
    from === to
  )
    return value
  const next = [...value]
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}
const matching = (
  option: TransferListOption,
  query: string,
  locale?: string,
) => {
  const filter = makeComboboxFilter(locale)
  return [option.label, option.description, option.group].some(
    part => part !== undefined && filter.contains(part, query.trim()),
  )
}
const Side = Schema.Literals(['selected', 'available'])
const Props = Schema.Struct({
  id: Schema.String,
  options: Schema.Array(Option),
  value: Schema.Array(Schema.String),
  reorderable: Schema.optional(Schema.Boolean),
  locale: Schema.optional(Schema.String),
  hasSearch: Schema.optional(Schema.Boolean),
})
const Events = UiSchema.TaggedEnum({
  Changed: { value: Schema.Array(Schema.String) },
})
const Message = UiSchema.TaggedEnum({
  Search: { query: Schema.String },
  ClearedSearch: {},
  Transfer: { key: Schema.String, side: Side },
  SelectAll: {},
  Clear: {},
  Grab: { key: Schema.String },
  Move: { key: Schema.String, direction: Schema.Literals([-1, 1]) },
  Cancel: { key: Schema.String },
  Dropped: { key: Schema.String, target: Schema.String, after: Schema.Boolean },
  DraggedOver: { target: Schema.String, after: Schema.Boolean },
  DragEnded: {},
})

export const TransferListBehavior = Html.component({
  name: 'CreaseTransferList',
  props: Props,
  model: Schema.Struct({
    query: Schema.String,
    announcement: Schema.String,
    draft: Schema.NullOr(
      Schema.Struct({ key: Schema.String, index: Schema.Number }),
    ),
    dropMark: Schema.NullOr(
      Schema.Struct({ target: Schema.String, after: Schema.Boolean }),
    ),
  }),
  message: Message,
  events: Events,
}).make({
  init: () => ({ query: '', announcement: '', draft: null, dropMark: null }),
  update: {
    Search: ($, { query }) => $.evolve({ query, draft: null }),
    ClearedSearch: $ =>
      $.evolve({ query: '', draft: null }).run(
        HtmlCommand.Focus.make({ ref: Search }).pipe(Command.asNoop),
      ),
    Transfer: ($, { key, side }) => {
      const { value, options, locale } = $.props
      const item = options.find(option => option.value === key)
      if (
        item === undefined ||
        item.isTransferDisabled ||
        value.includes(key) !== (side === 'selected')
      )
        return $.model
      const available = options.filter(option => !value.includes(option.value))
      const selected = value.flatMap(key => {
        const item = options.find(option => option.value === key)
        return item === undefined ? [] : [item]
      })
      const focusable = (side === 'selected' ? selected : available).filter(
        option =>
          !option.isTransferDisabled && matching(option, $.model.query, locale),
      )
      const index = focusable.findIndex(option => option.value === key)
      const neighbor =
        focusable[index + 1]?.value ?? focusable[index - 1]?.value
      const next =
        side === 'selected'
          ? value.filter(item => item !== key)
          : [...value, key]
      const ref =
        neighbor === undefined
          ? $.props.hasSearch
            ? Search
            : Root
          : Action.at(`${side}:${neighbor}`)
      return $.evolve({
        draft: null,
        announcement: `${side === 'selected' ? 'Removed' : 'Added'} ${item.label}. ${next.length} selected.`,
      })
        .emit(Events.Changed({ value: next }))
        .run(HtmlCommand.Focus.make({ ref }).pipe(Command.asNoop))
    },
    SelectAll: $ => {
      const additions = $.props.options
        .filter(
          option =>
            !option.isTransferDisabled && !$.props.value.includes(option.value),
        )
        .map(option => option.value)
      return additions.length === 0
        ? $.model
        : $.evolve({
            draft: null,
            announcement: `Added ${additions.length} options.`,
          }).emit(Events.Changed({ value: [...$.props.value, ...additions] }))
    },
    Clear: $ => {
      const next = $.props.value.filter(key => {
        const option = $.props.options.find(option => option.value === key)
        return option === undefined || option.isTransferDisabled
      })
      const removed = $.props.value.length - next.length
      return removed === 0
        ? $.model
        : $.evolve({
            draft: null,
            announcement: `Removed ${removed} options.`,
          }).emit(Events.Changed({ value: next }))
    },
    Grab: ($, { key }) => {
      const range = transferListMovableRange(
        $.props.value,
        $.props.options,
        key,
      )
      if (
        $.props.reorderable === false ||
        range === undefined ||
        range.start === range.end
      )
        return $.model
      if ($.model.draft?.key !== key)
        return $.evolve({
          draft: { key, index: range.index },
          announcement:
            'Item grabbed. Use the arrow keys to move it, Space or Enter to drop, or Escape to cancel.',
        })
      const to = $.model.draft.index
      const next = $.evolve({
        draft: null,
        announcement: `Dropped at position ${to + 1} of ${$.props.value.length}.`,
      })
      return to === range.index
        ? next
        : next
            .emit(
              Events.Changed({
                value: moveItem($.props.value, range.index, to),
              }),
            )
            .run(
              HtmlCommand.Focus.make({ ref: Reorder.at(key) }).pipe(
                Command.asNoop,
              ),
            )
    },
    Move: ($, { key, direction }) => {
      const range = transferListMovableRange(
        $.props.value,
        $.props.options,
        key,
      )
      if ($.props.reorderable === false || range === undefined) return $.model
      const draft = $.model.draft?.key === key ? $.model.draft : null
      const to = (draft?.index ?? range.index) + direction
      if (to < range.start || to > range.end)
        return $.evolve({ announcement: 'Cannot move past this position.' })
      const announcement = `Moved to position ${to + 1} of ${$.props.value.length}.`
      return draft !== null
        ? $.evolve({ draft: { key, index: to }, announcement })
        : $.evolve({ announcement })
            .emit(
              Events.Changed({
                value: moveItem($.props.value, range.index, to),
              }),
            )
            .run(
              HtmlCommand.Focus.make({ ref: Reorder.at(key) }).pipe(
                Command.asNoop,
              ),
            )
    },
    Cancel: ($, { key }) =>
      $.model.draft?.key !== key
        ? $.model
        : $.evolve({ draft: null, announcement: 'Reordering cancelled.' }),
    DraggedOver: ($, { target, after }) =>
      $.model.dropMark?.target === target && $.model.dropMark.after === after
        ? $.model
        : $.evolve({ dropMark: { target, after } }),
    DragEnded: $ =>
      $.model.dropMark === null ? $.model : $.evolve({ dropMark: null }),
    Dropped: ($, { key, target, after }) => {
      const range = transferListMovableRange(
        $.props.value,
        $.props.options,
        key,
      )
      const index = $.props.value.indexOf(target)
      if (range === undefined || index < 0 || $.props.reorderable === false)
        return $.model
      const insertion = index + (after ? 1 : 0)
      const to = Math.max(
        range.start,
        Math.min(range.end, insertion - (insertion > range.index ? 1 : 0)),
      )
      return to === range.index
        ? $.evolve({ dropMark: null })
        : $.evolve({
            draft: null,
            dropMark: null,
            announcement: `Dropped at position ${to + 1} of ${$.props.value.length}.`,
          }).emit(
            Events.Changed({ value: moveItem($.props.value, range.index, to) }),
          )
    },
  },
  parts: (p, model) => {
    const { options, value, locale, id } = p.props
    const byKey = new Map(options.map(option => [option.value, option]))
    const known = new Set(value)
    const draft = model.draft
    const order =
      draft === null
        ? value
        : moveItem(value, value.indexOf(draft.key), draft.index)
    const mime = `application/x-crease-transfer-${encodeURIComponent(id).toLowerCase()}`
    return {
      query: model.query,
      announcement: model.announcement,
      draftKey: draft?.key,
      dropMark: model.dropMark,
      order,
      selected: value.flatMap(key => {
        const item = byKey.get(key)
        return item === undefined || !matching(item, model.query, locale)
          ? []
          : [item]
      }),
      available: options.filter(
        option =>
          !known.has(option.value) && matching(option, model.query, locale),
      ),
      canSelectAll: options.some(
        option => !known.has(option.value) && !option.isTransferDisabled,
      ),
      canClear: value.some(
        key => byKey.has(key) && !byKey.get(key)?.isTransferDisabled,
      ),
      root: p.part('div', element => element.ref(Root)),
      clearSearch: p.part('button', element =>
        element.on('click', Message.ClearedSearch()),
      ),
      search: p.part('input', element =>
        element
          .ref(Search)
          .value(model.query)
          .on('input', ({ value }) => Message.Search({ query: value })),
      ),
      action: p.part('button', (element, key: string, side: typeof Side.Type) =>
        element
          .ref(Action.at(`${side}:${key}`))
          .on('click', Message.Transfer({ key, side })),
      ),
      selectAll: p.part('button', element =>
        element.on('click', Message.SelectAll()),
      ),
      clear: p.part('button', element => element.on('click', Message.Clear())),
      reorder: p.part('button', (element, key: string) =>
        element
          .ref(Reorder.at(key))
          .draggable({ [mime]: key }, { effectAllowed: 'move' })
          .on('dragend', Message.DragEnded())
          .on('click', Message.Grab({ key }))
          .on('blur', Message.Cancel({ key }))
          .on(
            'keydown',
            ({ key: pressed }) =>
              pressed === 'ArrowUp' || pressed === 'ArrowDown'
                ? Message.Move({
                    key,
                    direction: pressed === 'ArrowUp' ? -1 : 1,
                  })
                : pressed === 'Escape' && draft?.key === key
                  ? Message.Cancel({ key })
                  : undefined,
            { preventDefault: true },
          ),
      ),
      drop: p.part('li', (element, target: string) =>
        element
          .dropTarget({ accepts: [mime], dropEffect: 'move' })
          .on('drop', ({ data, y, height }) =>
            data[mime] === undefined
              ? undefined
              : Message.Dropped({
                  key: data[mime],
                  target,
                  after: y >= height / 2,
                }),
          )
          .on('dragover', ({ y, height }) =>
            Message.DraggedOver({ target, after: y >= height / 2 }),
          )
          .on('dragleave', () =>
            model.dropMark?.target === target ? Message.DragEnded() : undefined,
          ),
      ),
    }
  },
})
