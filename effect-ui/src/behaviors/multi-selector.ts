import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  Combobox,
  ComboboxItem,
  Drawer,
  makeComboboxFilter,
} from '@effect/ui-kit'
import { Schema } from 'effect'

export type MultiSelectorOption = {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}
export type MultiSelectorSection = {
  readonly title: string
  readonly options: readonly MultiSelectorOption[]
}

export const flattenMultiSelectorOptions = (
  options: readonly (MultiSelectorOption | MultiSelectorSection)[],
): readonly ComboboxItem[] =>
  options.flatMap(option =>
    'options' in option
      ? option.options.map(item => ({ ...item, group: option.title }))
      : [option],
  )

export const toggleVisibleOptions = (
  value: readonly string[],
  visible: readonly string[],
): readonly string[] => {
  const selected = new Set(value)
  if (visible.every(item => selected.has(item))) {
    const removed = new Set(visible)
    return value.filter(item => !removed.has(item))
  }
  return [...new Set([...value, ...visible])]
}

const Props = Schema.Struct({
  items: Schema.Array(ComboboxItem),
  value: Schema.Array(Schema.String),
  id: Schema.optional(Schema.String),
  defaultOpen: Schema.optional(Schema.Boolean),
  open: Schema.optional(Schema.Boolean),
  name: Schema.optional(Schema.String),
  form: Schema.optional(Schema.String),
  disabled: Schema.optional(Schema.Boolean),
  readOnly: Schema.optional(Schema.Boolean),
  required: Schema.optional(Schema.Boolean),
  hasSearch: Schema.optional(Schema.Boolean),
  hasSelectAll: Schema.optional(Schema.Boolean),
  selectAllLabel: Schema.optional(Schema.String),
  presentation: Schema.optional(Schema.Literals(['popover', 'bottom-sheet'])),
  dir: Schema.optional(Schema.Literals(['ltr', 'rtl'])),
  locale: Schema.optional(Schema.String),
})

const EventCases = {
  Changed: { value: Schema.Array(Schema.String) },
  OpenChanged: { open: Schema.Boolean },
}
const Events = UiSchema.TaggedEnum(EventCases)
const Message = UiSchema.TaggedEnum({
  ...EventCases,
  Edited: { query: Schema.String },
})

export const MultiSelectorBehavior = Html.component({
  name: 'CreaseMultiSelector',
  props: Props,
  model: Schema.Struct({ open: Schema.Boolean, query: Schema.String }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false, query: '' }),
  update: {
    OpenChanged: ($, event) =>
      $.evolve({
        open: event.open,
        query: event.open ? $.model.query : '',
      }).emit(event),
    Edited: ($, { query }) => $.evolve({ query }),
    Changed: ($, event) => $.emit(event),
  },
  parts: (p, model) => {
    const {
      items,
      value,
      disabled,
      readOnly,
      required,
      hasSearch,
      hasSelectAll,
      selectAllLabel = 'Select all',
      dir,
      locale,
    } = p.props
    const open = p.props.open ?? model.open
    const query = hasSearch ? model.query : ''
    const sheet = p.props.presentation === 'bottom-sheet'
    const filter = makeComboboxFilter(locale)
    const filtered = items.filter(
      item => query === '' || filter.contains(item.label, query),
    )
    const selectable = filtered
      .filter(item => !item.disabled)
      .map(item => item.value)
    let allValue = '$select-all'
    const known = new Set([...items.map(item => item.value), ...value])
    while (known.has(allValue)) allValue += '$'
    const allItem =
      !hasSelectAll || selectable.length === 0
        ? undefined
        : { value: allValue, label: selectAllLabel }
    const allSelected =
      allItem !== undefined && selectable.every(item => value.includes(item))
    const addAll = (options: readonly ComboboxItem[]) =>
      allItem === undefined ? options : [allItem, ...options]
    const clear = p.part('button', element =>
      element.on('click', Events.Changed({ value: [] })),
    )
    return p.child(Drawer, {
      props: { open: sheet && open, swipeDirection: 'down' },
      onEmit: {
        RequestedOpen: () => Events.OpenChanged({ open: true }),
        RequestedClose: () => Events.OpenChanged({ open: false }),
        Settled: () => undefined,
        Snapped: () => undefined,
      },
      parts: drawer =>
        p.child(Combobox, {
          props: {
            items: addAll(items),
            filteredItems: addAll(filtered),
            value: allSelected ? [allValue, ...value] : value,
            open,
            multiple: true,
            inputValue: query,
            inputInPopup: !sheet,
            inline: sheet,
            autoHighlight: true,
            disabled,
            readOnly,
            required,
            dir,
            locale,
          },
          onEmit: {
            RequestedOpen: () =>
              sheet ? undefined : Events.OpenChanged({ open: true }),
            RequestedClose: ({ reason }) =>
              sheet || reason === 'item-press'
                ? undefined
                : Events.OpenChanged({ open: false }),
            RequestedInputValue: ({ inputValue, reason }) =>
              hasSearch &&
              (reason === 'input-change' || reason === 'input-clear')
                ? Message.Edited({ query: inputValue })
                : undefined,
            Picked: ({ value: next }) => {
              if (!Array.isArray(next)) return undefined
              return Events.Changed({
                value:
                  allItem !== undefined &&
                  next.includes(allValue) !== allSelected
                    ? toggleVisibleOptions(value, selectable)
                    : next.filter(item => item !== allValue),
              })
            },
            Highlighted: () => undefined,
            Settled: () => undefined,
          },
          parts: combobox => ({ combobox, clear, allValue, query, drawer }),
        }),
    })
  },
})
