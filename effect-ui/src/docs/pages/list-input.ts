import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { ListInput } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Guest = {
  readonly id: string
  readonly name: string
  readonly email: string
}
const GuestSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
})
const Message = UiSchema.TaggedEnum({
  ChangedGuests: { guests: Schema.Array(GuestSchema) },
})
const initial = (kind: string): ReadonlyArray<Guest> =>
  kind === 'keyboard'
    ? [
        { id: 'g-1', name: 'Ada Lovelace', email: 'ada@example.com' },
        { id: 'g-2', name: 'Grace Hopper', email: 'grace@example.com' },
        { id: 'g-3', name: 'Margaret Hamilton', email: 'margaret@example.com' },
      ]
    : kind === 'controlled'
      ? [{ id: 'g-1', name: 'Ada Lovelace', email: 'ada@example.com' }]
      : [
          { id: 'g-1', name: 'Ada Lovelace', email: 'ada@example.com' },
          { id: 'g-2', name: 'Grace Hopper', email: 'grace@example.com' },
        ]

const GuestsDemo = Html.component({
  name: 'DocsListInputGuests',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ guests: Schema.Array(GuestSchema) }),
  message: Message,
}).make({
  init: ({ props }) => ({ guests: [...initial(props.kind)] }),
  update: {
    ChangedGuests: ($, { guests }) => $.evolve({ guests: [...guests] }),
  },
  view: (h, model) => {
    const controlled = h.props.kind === 'controlled'
    const inputFor = (key: 'name' | 'email') => ({
      key,
      header: key === 'name' ? 'Name' : 'Email',
      renderInput: ({
        item,
        label,
        updateItem,
      }: {
        readonly item: Guest
        readonly label: string
        readonly updateItem: (
          item: Guest,
          columnKey?: string,
        ) => typeof Message.Type | undefined
      }) =>
        h.input
          .class('list-input-docs-control')
          .attrs({ 'aria-label': label })
          .value(item[key])
          .on('input', ({ value }) => updateItem({ ...item, [key]: value })),
    })
    return ListInput<Guest, typeof Message.Type>(h, {
      id: `${h.props.idPrefix}-guests`,
      value: model.guests,
      label: 'Guests',
      ...(controlled
        ? { description: 'Everyone attending the workshop.' }
        : {}),
      getItemKey: guest => guest.id,
      createItem: () => ({
        id: `g-${String(Date.now())}`,
        name: '',
        email: '',
      }),
      columns: [inputFor('name'), inputFor('email')],
      reorderable: h.props.kind !== 'basic',
      ...(controlled
        ? {
            maxItems: 6,
            getFieldStatus: (guest: Guest, key: string) =>
              key === 'email' && guest.email === ''
                ? { type: 'error' as const, message: 'Enter an email address' }
                : undefined,
            ...(model.guests.length === 0
              ? {
                  status: {
                    type: 'error' as const,
                    message: 'Add at least one guest',
                  },
                }
              : {}),
          }
        : {}),
      onChange: guests => Message.ChangedGuests({ guests: [...guests] }),
    })
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    GuestsDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    })

const source = exampleApplicationSource({
  imports: `import { ListInput } from '@/ui/effect/ui'`,
  body: `ListInput(h, {
  id: 'guests',
  value: model.guests,
  label: 'Guests',
  getItemKey: guest => guest.id,
  createItem: () => ({ id: crypto.randomUUID(), name: '', email: '' }),
  columns,
  onChange: guests => ChangedGuests({ guests }),
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { ListInput } from '@/ui/effect/ui'

ListInput(h, { id, value, label, getItemKey, createItem, columns, onChange })`,
  examples: [
    { title: 'List Input', view: view('basic'), source },
    { title: 'Controlled guest list', view: view('controlled'), source },
    { title: 'Keyboard reordering', view: view('keyboard'), source },
  ],
})
