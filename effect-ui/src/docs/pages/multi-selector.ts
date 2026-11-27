import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { MultiSelector } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const columns = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'status', label: 'Status' },
  { value: 'created', label: 'Created' },
]
const allColumns = [
  ...columns,
  { value: 'updated', label: 'Updated' },
  { value: 'actions', label: 'Actions' },
]
const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
]
const countries = [
  ['us', 'United States'],
  ['uk', 'United Kingdom'],
  ['ca', 'Canada'],
  ['au', 'Australia'],
  ['de', 'Germany'],
  ['fr', 'France'],
  ['jp', 'Japan'],
  ['br', 'Brazil'],
  ['in', 'India'],
  ['mx', 'Mexico'],
].map(([value, label]) => ({ value: value!, label: label! }))
const permissions = [
  { value: 'read_posts', label: 'Read posts', group: 'Read' },
  { value: 'read_comments', label: 'Read comments', group: 'Read' },
  { value: 'read_users', label: 'Read users', group: 'Read' },
  { value: 'write_posts', label: 'Write posts', group: 'Write' },
  { value: 'write_comments', label: 'Write comments', group: 'Write' },
]
const teams = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
]
const itemsFor = (kind: string, slot = 0) =>
  kind === 'showcase'
    ? columns
    : kind === 'searchable'
      ? countries
      : kind === 'sectioned'
        ? permissions
        : kind === 'columns'
          ? allColumns
          : kind === 'form'
            ? slot === 0
              ? allColumns.slice(0, 5)
              : statuses
            : kind === 'ghostToolbar'
              ? slot === 0
                ? columns
                : statuses
              : teams
const initialFor = (kind: string, slot = 0) =>
  kind === 'columns'
    ? ['name', 'email', 'role', 'status']
    : kind === 'form'
      ? slot === 0
        ? ['name', 'email']
        : []
      : kind === 'ghostToolbar'
        ? slot === 0
          ? ['name', 'email']
          : ['active']
        : []
const Message = UiSchema.TaggedEnum({
  ChangedSelection: { value: Schema.Array(Schema.String) },
})
const SelectorDemo = Html.component({
  name: 'DocsMultiSelectorDemo',
  props: Schema.Struct({ kind: Schema.String, slot: Schema.Number }),
  model: Schema.Struct({ value: Schema.Array(Schema.String) }),
  message: Message,
}).make({
  init: ({ props }) => ({ value: initialFor(props.kind, props.slot) }),
  update: {
    ChangedSelection: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const slot = h.props.slot
    return MultiSelector(h, {
      id: `${kind}-${slot}`,
      label:
        kind === 'showcase' || kind === 'columns'
          ? 'Columns'
          : kind === 'searchable'
            ? 'Countries'
            : kind === 'sectioned'
              ? 'Permissions'
              : kind === 'form'
                ? slot === 0
                  ? 'Visible columns'
                  : 'Status filter'
                : kind === 'ghostToolbar'
                  ? slot === 0
                    ? 'Columns'
                    : 'Status'
                  : 'Teams',
      labelHidden: kind === 'columns' || kind === 'ghostToolbar',
      description:
        kind === 'form'
          ? slot === 0
            ? 'Choose which columns to display in the table'
            : 'Filter by status'
          : undefined,
      optional: kind === 'form' && slot === 1,
      placeholder:
        kind === 'showcase'
          ? 'Select columns...'
          : kind === 'searchable'
            ? 'Select countries...'
            : kind === 'sectioned'
              ? 'Select permissions...'
              : kind === 'columns'
                ? 'Columns'
                : kind === 'form' && slot === 1
                  ? 'All statuses'
                  : kind === 'ghostToolbar'
                    ? slot === 0
                      ? 'Columns'
                      : 'Status'
                    : 'Choose teams',
      triggerDisplay:
        kind === 'form'
          ? slot === 0
            ? 'labels'
            : 'badges'
          : kind === 'ghostToolbar'
            ? 'labels'
            : 'count',
      variant: kind === 'ghostToolbar' ? 'ghost' : 'input',
      status:
        kind === 'ghostToolbar' && slot === 1
          ? { type: 'warning', message: 'Some filters hide archived rows' }
          : undefined,
      statusVariant:
        kind === 'ghostToolbar' && slot === 1 ? 'tooltip' : undefined,
      props: {
        items: itemsFor(kind, slot),
        value: model.value,
        hasSearch: kind === 'searchable' || kind === 'columns',
        hasSelectAll:
          kind === 'searchable' ||
          kind === 'columns' ||
          (kind === 'form' && slot === 0) ||
          kind === 'bottomSheet',
        presentation: kind === 'bottomSheet' ? 'bottom-sheet' : 'popover',
        required: kind === 'form' && slot === 0,
      },
      onEmit: (event: any) =>
        event._tag === 'Changed'
          ? Message.ChangedSelection({ value: event.value })
          : undefined,
    } as any)
  },
})
const one = (h: Html.H<DocsMessage>, context: any, kind: string, slot = 0) =>
  SelectorDemo(h, {
    key: `${context.idPrefix}-${kind}-${slot}`,
    props: { kind, slot },
  })
const fixture = (h: Html.H<DocsMessage>, context: any, kind: string) => {
  if (kind === 'ghostToolbar')
    return h.div
      .class('flex items-center gap-2')
      .children(
        h.button
          .class(
            'rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent',
          )
          .attrs({ type: 'button' })
          .children('Refresh'),
        one(h, context, kind, 0) as never,
        one(h, context, kind, 1) as never,
        h.button
          .class(
            'rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent',
          )
          .attrs({ type: 'button' })
          .children('Export'),
      )
  const count = kind === 'form' ? 2 : 1
  return h.div
    .class('grid w-full max-w-[300px] min-w-60 gap-4')
    .children(
      Array.from(
        { length: count },
        (_, slot) => one(h, context, kind, slot) as never,
      ),
    )
}
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    fixture(h, context, kind) as never
const source = exampleApplicationSource({
  imports: `import { MultiSelector } from '@/ui/effect/ui'`,
  body: `MultiSelector(h, {
  id: 'columns',
  label: 'Columns',
  placeholder: 'Select columns...',
  props: { items: columns, value: model.value },
  onEmit: (event: any) => event._tag === 'Changed' ? ChangedSelection({ value: event.value }) : undefined,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MultiSelector } from '@/ui/effect/ui'\n\nMultiSelector(h, { id, label, props: { items, value }, onEmit })`,
  examples: [
    { title: 'Multi Selector', view: view('showcase'), source },
    { title: 'Searchable', view: view('searchable'), source },
    { title: 'Sectioned', view: view('sectioned'), source },
    { title: 'Column Visibility', view: view('columns'), source },
    { title: 'Form Composition', view: view('form'), source },
    { title: 'Ghost Toolbar', view: view('ghostToolbar'), source },
    { title: 'Bottom Sheet', view: view('bottomSheet'), source },
  ],
})
