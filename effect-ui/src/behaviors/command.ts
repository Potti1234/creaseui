import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Combobox, ComboboxItem } from '@effect/ui-kit'
import { Schema } from 'effect'

import {
  foldText,
  fuzzyFilter,
  fuzzyScore,
  matchRanges,
  matchSegments,
} from './command-text-match'

export const CommandItem = Schema.Struct({
  ...ComboboxItem.fields,
  searchText: Schema.optional(Schema.String),
  keywords: Schema.optional(Schema.Array(Schema.String)),
  fallbackKeywords: Schema.optional(Schema.Array(Schema.String)),
})
export type CommandItem = typeof CommandItem.Type

export const normalizeCommandQuery = (value: string) => foldText(value).trim()

export const commandLabelSegments = (label: string, query: string) =>
  matchSegments(label, matchRanges(label, query, 'fuzzy'))

export const filterCommandItems = (
  items: readonly CommandItem[],
  query: string,
) => {
  const normalized = normalizeCommandQuery(query)
  const matching =
    normalized === ''
      ? items
      : items
          .map(item => ({
            item,
            score: Math.max(
              fuzzyFilter(
                {
                  label: item.searchText ?? item.label,
                  ...(item.keywords === undefined
                    ? {}
                    : { keywords: item.keywords }),
                },
                normalized,
              ),
              ...(item.fallbackKeywords ?? []).map(
                word => fuzzyScore(word, normalized) * 0.9,
              ),
            ),
          }))
          .filter(({ score }) => score > 0)
          .sort((left, right) => right.score - left.score)
          .map(({ item }) => item)
  const groups = new Map<string | undefined, CommandItem[]>()
  for (const item of matching) {
    const group = groups.get(item.group)
    if (group === undefined) groups.set(item.group, [item])
    else group.push(item)
  }
  return [...groups.values()].flat()
}

const Message = UiSchema.TaggedEnum({
  Edited: { query: Schema.String },
  Picked: { value: Schema.String },
})
const Props = Schema.Struct({
  items: Schema.Array(CommandItem),
  value: Schema.optional(Schema.NullOr(Schema.String)),
  query: Schema.optional(Schema.String),
  defaultQuery: Schema.optional(Schema.String),
  disabled: Schema.optional(Schema.Boolean),
  status: Schema.optional(Schema.Literals(['ready', 'loading'])),
  maxVisibleItems: Schema.optional(Schema.Number),
  id: Schema.optional(Schema.String),
  dir: Schema.optional(Schema.Literals(['ltr', 'rtl'])),
})

export const CommandBehavior = Html.component({
  name: 'CreaseCommand',
  props: Props,
  model: Schema.Struct({ query: Schema.String }),
  message: Message,
  events: Message,
}).make({
  init: ({ props }) => ({ query: props.defaultQuery ?? '' }),
  update: {
    Edited: ($, event) => $.evolve({ query: event.query }).emit(event),
    Picked: ($, event) => $.emit(event),
  },
  parts: (p, model) => {
    const {
      items,
      disabled,
      status = 'ready',
      value,
      id,
      dir,
      maxVisibleItems,
    } = p.props
    const query = p.props.query ?? model.query
    const rawMatches = filterCommandItems(items, query)
    const allMatches = status === 'loading' ? [] : rawMatches
    const visible =
      maxVisibleItems === undefined
        ? allMatches
        : allMatches.slice(0, Math.max(0, Math.trunc(maxVisibleItems)))
    return p.child(Combobox, {
      props: {
        items,
        filteredItems: visible,
        value,
        inputValue: query,
        open: true,
        inline: true,
        autoHighlight: true,
        disabled,
        id,
        dir,
      },
      onEmit: {
        RequestedOpen: () => undefined,
        RequestedClose: () => undefined,
        RequestedInputValue: ({ inputValue, reason }) =>
          reason === 'input-change' ||
          reason === 'input-clear' ||
          reason === 'clear-press'
            ? Message.Edited({ query: inputValue })
            : undefined,
        Picked: ({ value }) =>
          typeof value === 'string' ? Message.Picked({ value }) : undefined,
        Highlighted: () => undefined,
        Settled: () => undefined,
      },
      parts: combobox => ({
        combobox,
        query,
        status,
        total: allMatches.length,
        visible: visible.length,
      }),
    })
  },
})
