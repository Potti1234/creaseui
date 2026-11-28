import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { TransferList } from '#components'
import type { TransferListOption } from '../../behaviors/transfer-list'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const basicOptions: readonly TransferListOption[] = [
  {
    value: 'name',
    label: 'Name',
    description: 'Primary display name for the record',
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Person responsible for the record',
  },
  { value: 'status', label: 'Status', description: 'Current workflow state' },
  { value: 'priority', label: 'Priority', description: 'Relative urgency' },
  { value: 'team', label: 'Team', description: 'Owning team' },
  {
    value: 'updated',
    label: 'Last updated',
    description: 'Most recent change time',
  },
  { value: 'created', label: 'Created', description: 'Original creation time' },
]
const lockedOptions: readonly TransferListOption[] = [
  {
    value: 'name',
    label: 'Name',
    description: 'Required identity field',
    group: 'Identity',
    isTransferDisabled: true,
    isReorderDisabled: true,
    disabledMessage: 'Name is required and fixed in position.',
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Person responsible for the work',
    group: 'Identity',
    isTransferDisabled: true,
    disabledMessage: 'Owner must remain visible but can be reordered.',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Owning team',
    group: 'Identity',
  },
  {
    value: 'status',
    label: 'Status',
    description: 'Current workflow state',
    group: 'Planning',
    isReorderDisabled: true,
    disabledMessage:
      'Status can be hidden but its current position is fixed while selected.',
  },
  {
    value: 'priority',
    label: 'Priority',
    description: 'Relative urgency',
    group: 'Planning',
  },
  {
    value: 'updated',
    label: 'Last updated',
    description: 'Most recent change time',
    group: 'Activity',
  },
]
const largeOptions: readonly TransferListOption[] = Array.from(
  { length: 200 },
  (_, index) => {
    const number = index + 1
    return {
      value: `field-${String(number)}`,
      label: `Field ${String(number).padStart(3, '0')}`,
      description: `Configurable field ${String(number)}`,
      group: `Group ${String(Math.floor(index / 40) + 1)}`,
    }
  },
)

const fixtures = {
  visible: {
    label: 'Visible fields',
    description:
      'Move fields between the panels. The selected order is the display order.',
    selectedLabel: 'Visible fields',
    availableLabel: 'Available fields',
    value: ['name', 'owner', 'status'],
    options: basicOptions,
  },
  locked: {
    label: 'Record fields',
    description:
      'Transfer and reorder are constrained per option, so a field can be locked in place without being locked in the list.',
    selectedLabel: 'Shown',
    availableLabel: 'Hidden',
    value: ['name', 'owner', 'status', 'updated'],
    options: lockedOptions,
  },
  unordered: {
    label: 'Included filters',
    description:
      'With reordering off the selected panel loses its drag handles and keyboard reorder.',
    selectedLabel: 'Included',
    availableLabel: 'Not included',
    value: ['status', 'priority', 'team'],
    options: basicOptions,
    reorderable: false,
  },
  searchable: {
    label: 'Report fields',
    description:
      'One search field filters both panels across a pool of 200 grouped options.',
    selectedLabel: 'In report',
    availableLabel: 'Available',
    value: Array.from(
      { length: 12 },
      (_, index) => `field-${String(index + 1)}`,
    ),
    options: largeOptions,
    hasSearch: true,
    searchPlaceholder: 'Search 200 fields',
  },
  empty: {
    label: 'Visible fields',
    description:
      'Nothing is selected yet, so the selected panel carries its own empty copy.',
    selectedLabel: 'Visible fields',
    availableLabel: 'Available fields',
    value: [],
    options: basicOptions,
    selectedEmptyText: 'No fields are visible yet. Add one from the right.',
    availableEmptyText: 'Every field is already visible.',
  },
} as const
type Kind = keyof typeof fixtures

const Message = UiSchema.TaggedEnum({
  ChangedList: { value: Schema.Array(Schema.String) },
  ChangedSecondList: { value: Schema.Array(Schema.String) },
})
const TransferDemo = Html.component({
  name: 'DocsTransferListDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    value: Schema.Array(Schema.String),
    secondValue: Schema.Array(Schema.String),
  }),
  message: Message,
}).make({
  init: h => {
    const fixture =
      fixtures[
        (h.props.kind as Kind) in fixtures ? (h.props.kind as Kind) : 'visible'
      ]
    return { value: [...fixture.value], secondValue: ['name'] }
  },
  update: {
    ChangedList: ($, { value }) => $.evolve({ value }),
    ChangedSecondList: ($, { value }) => $.evolve({ secondValue: value }),
  },
  view: (h, model) => {
    const kind =
      (h.props.kind as Kind) in fixtures ? (h.props.kind as Kind) : 'visible'
    const fixture = fixtures[kind]
    const render = (
      key: string,
      value: readonly string[],
      second = false,
      overrides: {
        label?: string
        description?: string
        noResultsText?: string
        searchPlaceholder?: string
      } = {},
    ) =>
      TransferList(h, {
        key,
        label: overrides.label ?? fixture.label,
        description: overrides.description ?? fixture.description,
        selectedLabel: fixture.selectedLabel,
        availableLabel: fixture.availableLabel,
        showSelectAll: true,
        showClear: true,
        ...('searchPlaceholder' in fixture
          ? { searchPlaceholder: fixture.searchPlaceholder }
          : {}),
        ...(overrides.searchPlaceholder === undefined
          ? {}
          : { searchPlaceholder: overrides.searchPlaceholder }),
        ...('selectedEmptyText' in fixture
          ? { selectedEmptyText: fixture.selectedEmptyText }
          : {}),
        ...('availableEmptyText' in fixture
          ? { availableEmptyText: fixture.availableEmptyText }
          : {}),
        ...(overrides.noResultsText === undefined
          ? {}
          : { noResultsText: overrides.noResultsText }),
        props: {
          id: key,
          options: fixture.options,
          value: [...value],
          reorderable: 'reorderable' in fixture ? fixture.reorderable : true,
          hasSearch:
            'hasSearch' in fixture
              ? fixture.hasSearch === true ||
                overrides.noResultsText !== undefined
              : overrides.noResultsText !== undefined,
        },
        onEmit: {
          Changed: ({ value: next }) =>
            second
              ? Message.ChangedSecondList({ value: [...next] })
              : Message.ChangedList({ value: [...next] }),
        },
      })
    const first = render(`${h.props.idPrefix}-list`, model.value)
    return kind === 'empty'
      ? h.div.class('flex flex-col gap-6').children(
          first,
          h.hr.class('border-border'),
          render(`${h.props.idPrefix}-list-2`, model.secondValue, true, {
            label: 'Report fields',
            description:
              'A query that matches nothing replaces both panels with the no-results copy.',
            noResultsText: 'No field matches that search.',
            searchPlaceholder: 'Try a term that matches nothing',
          }),
        )
      : first
  },
})

const view =
  (kind: Kind): DocsExampleImplementation['view'] =>
  (h, context) =>
    TransferDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { TransferList } from '@/ui/effect/ui'`,
  body: `TransferList(h, {
  key: 'fields',
  label: 'Visible fields',
  selectedLabel: 'Visible fields',
  availableLabel: 'Available fields',
  showSelectAll: true,
  showClear: true,
  props: { id: 'fields', options, value, reorderable: true },
  onEmit: { Changed: ({ value }) => ChangedList({ value }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { TransferList } from '@/ui/effect/ui'\n\nTransferList(h, { key, label, props, onEmit })`,
  examples: [
    { title: 'Visible fields', view: view('visible'), source },
    { title: 'Locked fields', view: view('locked'), source },
    { title: 'Unordered', view: view('unordered'), source },
    { title: 'Searchable', view: view('searchable'), source },
    { title: 'Empty states', view: view('empty'), source },
  ],
})
