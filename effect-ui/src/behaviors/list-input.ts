import { Command, UiSchema } from '@effect/ui'
import { Html, HtmlCommand } from '@effect/ui/html'
import { Schema } from 'effect'

export type ListInputColumnWidth = {
  readonly type: 'pixel' | 'proportional'
  readonly value: number
}

export const resolveColumnTrack = (width?: ListInputColumnWidth): string =>
  width?.type === 'pixel'
    ? `${Math.max(0, width.value)}px`
    : `minmax(140px, ${Math.max(0, width?.value ?? 1)}fr)`

export const moveListInputItem = <T>(
  items: readonly T[],
  from: number,
  to: number,
): readonly T[] => {
  if (
    from < 0 ||
    from >= items.length ||
    to < 0 ||
    to >= items.length ||
    from === to
  )
    return items
  const next = [...items]
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}

const Add = Html.ref('CreaseListInputAdd', 'button')
const Remove = Html.ref('CreaseListInputRemove', 'button')
const Reorder = Html.ref('CreaseListInputReorder', 'button')

const Cases = {
  Added: {},
  Removed: { key: Schema.String },
  Reordered: { from: Schema.Number, to: Schema.Number },
}
const Events = UiSchema.TaggedEnum(Cases)
const Message = UiSchema.TaggedEnum({
  Add: {},
  Remove: { key: Schema.String },
  Toggle: { key: Schema.String },
  Move: { key: Schema.String, direction: Schema.Literals([-1, 1]) },
  Cancel: { key: Schema.String },
})

export const ListInputBehavior = Html.component({
  name: 'CreaseListInput',
  props: Schema.Struct({
    keys: Schema.Array(Schema.String),
    itemName: Schema.optional(Schema.String),
    disabled: Schema.optional(Schema.Boolean),
    reorderable: Schema.optional(Schema.Boolean),
    canAdd: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({
    draft: Schema.NullOr(
      Schema.Struct({ key: Schema.String, index: Schema.Number }),
    ),
    announcement: Schema.String,
  }),
  message: Message,
  events: Events,
}).make({
  init: () => ({ draft: null, announcement: '' }),
  update: {
    Add: $ =>
      $.props.disabled || $.props.canAdd === false
        ? $.model
        : $.evolve({
            announcement: `Added ${$.props.itemName ?? 'item'} ${$.props.keys.length + 1}.`,
          }).emit(Events.Added()),
    Remove: ($, { key }) => {
      const index = $.props.keys.indexOf(key)
      if ($.props.disabled || index < 0) return $.model
      const neighbor = $.props.keys[index + 1] ?? $.props.keys[index - 1]
      return $.evolve({
        draft: null,
        announcement: `Removed ${$.props.itemName ?? 'item'} ${index + 1}.`,
      })
        .emit(Events.Removed({ key }))
        .run(
          HtmlCommand.Focus.make({
            ref: neighbor === undefined ? Add : Remove.at(neighbor),
          }).pipe(Command.asNoop),
        )
    },
    Toggle: ($, { key }) => {
      const from = $.props.keys.indexOf(key)
      if (from < 0 || $.props.disabled || !$.props.reorderable) return $.model
      const draft = $.model.draft
      if (draft?.key !== key) {
        return $.evolve({
          draft: { key, index: from },
          announcement: `Grabbed ${$.props.itemName ?? 'item'} ${from + 1}. Use the arrow keys to move, Space or Enter to drop, or Escape to cancel.`,
        })
      }
      const to = draft.index
      const next = $.evolve({
        draft: null,
        announcement: `Dropped at position ${to + 1} of ${$.props.keys.length}.`,
      })
      return from === to
        ? next
        : next
            .emit(Events.Reordered({ from, to }))
            .run(
              HtmlCommand.Focus.make({ ref: Reorder.at(key) }).pipe(
                Command.asNoop,
              ),
            )
    },
    Move: ($, { key, direction }) => {
      const from = $.props.keys.indexOf(key)
      if (from < 0 || $.props.disabled || !$.props.reorderable) return $.model
      const draft = $.model.draft?.key === key ? $.model.draft : null
      const to = (draft?.index ?? from) + direction
      if (to < 0 || to >= $.props.keys.length)
        return $.evolve({
          announcement: `This ${$.props.itemName ?? 'item'} is already ${direction < 0 ? 'first' : 'last'}.`,
        })
      const announcement = `Moved ${$.props.itemName ?? 'item'} to position ${to + 1} of ${$.props.keys.length}.`
      return draft !== null
        ? $.evolve({ draft: { key, index: to }, announcement })
        : $.evolve({ announcement })
            .emit(Events.Reordered({ from, to }))
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
  },
  parts: (p, model) => {
    const draft = model.draft
    const order =
      draft === null
        ? p.props.keys
        : moveListInputItem(
            p.props.keys,
            p.props.keys.indexOf(draft.key),
            draft.index,
          )
    return {
      draftKey: draft?.key,
      announcement: model.announcement,
      order,
      add: p.part('button', element =>
        element.ref(Add).on('click', Message.Add()),
      ),
      remove: p.part(
        'button',
        (element, key: string, allowed: () => boolean = () => true) =>
          element
            .ref(Remove.at(key))
            .on('click', () =>
              allowed() ? Message.Remove({ key }) : undefined,
            ),
      ),
      reorder: p.part('button', (element, key: string) =>
        element
          .ref(Reorder.at(key))
          .on('click', Message.Toggle({ key }))
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
    }
  },
})
