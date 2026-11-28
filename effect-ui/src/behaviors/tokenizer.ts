import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Combobox, makeComboboxFilter } from '@effect/ui-kit'
import { Schema } from 'effect'

export const TokenizerToken = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
})
export type TokenizerToken = typeof TokenizerToken.Type

export const selectableTokenizerTokens = (
  items: readonly TokenizerToken[],
  selected: readonly TokenizerToken[],
  query: string,
  create: boolean,
  locale?: string,
): readonly TokenizerToken[] => {
  const term = query.trim()
  const filter = makeComboboxFilter(locale)
  const known = new Map([...items, ...selected].map(item => [item.id, item]))
  const selectedIds = new Set(selected.map(item => item.id))
  const matches = [...known.values()].filter(
    item => !selectedIds.has(item.id) && filter.contains(item.label, term),
  )
  if (!create || term === '') return matches
  const collator = new Intl.Collator(locale, {
    sensitivity: 'base',
    usage: 'search',
  })
  if (
    [...known.values()].some(
      item => collator.compare(item.label.trim(), term) === 0,
    )
  )
    return matches
  let id = term
  while (known.has(id)) id = `$${id}`
  return [...matches, { id, label: term }]
}

const EventCases = {
  Changed: { value: Schema.Array(TokenizerToken) },
  Queried: { query: Schema.String },
}
const Events = UiSchema.TaggedEnum(EventCases)
const Message = UiSchema.TaggedEnum({
  ...EventCases,
  Opened: {},
  Closed: {},
})
const Props = Schema.Struct({
  items: Schema.Array(TokenizerToken),
  value: Schema.Array(TokenizerToken),
  name: Schema.optional(Schema.String),
  form: Schema.optional(Schema.String),
  id: Schema.optional(Schema.String),
  disabled: Schema.optional(Schema.Boolean),
  readOnly: Schema.optional(Schema.Boolean),
  required: Schema.optional(Schema.Boolean),
  hasCreate: Schema.optional(Schema.Boolean),
  hasEntriesOnFocus: Schema.optional(Schema.Boolean),
  maxEntries: Schema.optional(Schema.Number),
  locale: Schema.optional(Schema.String),
  dir: Schema.optional(Schema.Literals(['ltr', 'rtl'])),
})

export const TokenizerBehavior = Html.component({
  name: 'CreaseTokenizer',
  props: Props,
  model: Schema.Struct({ open: Schema.Boolean, query: Schema.String }),
  message: Message,
  events: Events,
}).make({
  init: () => ({ open: false, query: '' }),
  update: {
    Opened: $ => $.evolve({ open: true }),
    Closed: $ => $.evolve({ open: false, query: '' }),
    Queried: ($, event) => $.evolve({ query: event.query }).emit(event),
    Changed: ($, event) => $.evolve({ query: '' }).emit(event),
  },
  parts: (p, model) => {
    const {
      items,
      value,
      disabled,
      readOnly,
      id,
      required,
      dir,
      locale,
      hasCreate,
      hasEntriesOnFocus,
      maxEntries,
      name,
      form,
    } = p.props
    const max =
      maxEntries === undefined ? Infinity : Math.max(0, Math.trunc(maxEntries))
    const atMax = value.length >= max
    const matches = atMax
      ? []
      : selectableTokenizerTokens(
          items,
          value,
          model.query,
          hasCreate === true,
          locale,
        )
    const catalog = new Map(
      [...items, ...value, ...matches].map(item => [item.id, item]),
    )
    const created = matches.find(
      item => !items.some(known => known.id === item.id),
    )?.id
    const asItem = (token: TokenizerToken) => ({
      value: token.id,
      label: token.label,
    })
    const clear = p.part('button', element =>
      element.on('click', Events.Changed({ value: [] })),
    )
    const openOnFocus = p.part('input', element =>
      element.on('focus', () =>
        disabled || readOnly || hasEntriesOnFocus === false || atMax
          ? undefined
          : Message.Opened(),
      ),
    )
    return p.child(Combobox, {
      props: {
        items: [...catalog.values()].map(asItem),
        filteredItems: matches.map(asItem),
        value: value.map(token => token.id),
        multiple: true,
        open: model.open && !atMax && !disabled && !readOnly,
        inputValue: model.query,
        openOnInputClick: hasEntriesOnFocus !== false,
        autoHighlight: true,
        disabled,
        readOnly,
        id,
        required,
        dir,
        locale,
        name,
        form,
      },
      onEmit: {
        RequestedOpen: () => Message.Opened(),
        RequestedClose: ({ reason }) =>
          reason === 'item-press' ? undefined : Message.Closed(),
        RequestedInputValue: ({ inputValue, reason }) =>
          reason === 'input-change' || reason === 'input-clear'
            ? Events.Queried({ query: inputValue })
            : undefined,
        Picked: ({ value: next }) =>
          !Array.isArray(next)
            ? undefined
            : Events.Changed({
                value: next
                  .flatMap(key => {
                    const token = catalog.get(key)
                    return token === undefined ? [] : [token]
                  })
                  .slice(0, Math.max(max, value.length)),
              }),
        Highlighted: () => undefined,
        Settled: () => undefined,
      },
      parts: combobox => ({
        combobox,
        clear,
        openOnFocus,
        query: model.query,
        created,
        atMax,
      }),
    })
  },
})
