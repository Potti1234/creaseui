import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Command,
  ListInput,
  MultiSelector,
  Tokenizer,
  TransferList,
  TreeList,
} from '#components'
import { TokenizerToken } from './behaviors/tokenizer'

const Entry = Schema.Struct({ id: Schema.Number, title: Schema.String })
const Message = UiSchema.TaggedEnum({
  CommandPicked: { value: Schema.String },
  OptionsPicked: { value: Schema.Array(Schema.String) },
  TokensChanged: { value: Schema.Array(TokenizerToken) },
  TasksChanged: { value: Schema.Array(Entry) },
  Transferred: { value: Schema.Array(Schema.String) },
  TreePicked: { id: Schema.String },
})
const sections = [
  { value: 'draft', label: 'Draft', group: 'Workflow' },
  { value: 'review', label: 'Review', group: 'Workflow' },
  { value: 'published', label: 'Published', group: 'Visibility' },
]

export const SelectorExamples = Html.component({
  name: 'EffectUiSelectorExamples',
  message: Message,
  model: Schema.Struct({
    lastCommand: Schema.String,
    options: Schema.Array(Schema.String),
    tokens: Schema.Array(TokenizerToken),
    tasks: Schema.Array(Entry),
    channels: Schema.Array(Schema.String),
    treeSelection: Schema.String,
  }),
}).make({
  init: () => ({
    lastCommand: '',
    options: ['draft'],
    tokens: [],
    channels: ['notes'],
    treeSelection: '',
    tasks: [{ id: 1, title: 'Check focus order' }],
  }),
  update: {
    CommandPicked: ($, { value }) => $.evolve({ lastCommand: value }),
    OptionsPicked: ($, { value }) => $.evolve({ options: value }),
    TokensChanged: ($, { value }) => $.evolve({ tokens: value }),
    TasksChanged: ($, { value }) => $.evolve({ tasks: value }),
    Transferred: ($, { value }) => $.evolve({ channels: value }),
    TreePicked: ($, { id }) => $.evolve({ treeSelection: id }),
  },
  view: (h, model) =>
    h.section.class('example').children(
      h.h2.children('Selection and editing'),
      Command(h, {
        label: 'Review commands',
        placeholder: 'Find a review command',
        props: {
          items: [
            {
              value: 'new-review',
              label: 'Start review',
              keywords: ['create', 'new'],
            },
            {
              value: 'release-note',
              label: 'Release notes',
              keywords: ['changes'],
            },
          ],
        },
        onEmit: event =>
          event._tag === 'Picked'
            ? Message.CommandPicked({ value: event.value })
            : undefined,
      }),
      h.output.attr('aria-label', 'Command result').children(model.lastCommand),
      MultiSelector(h, {
        id: 'review-states',
        label: 'Review states',
        showClear: true,
        props: {
          items: sections,
          value: model.options,
          name: 'review-state',
          hasSelectAll: true,
        },
        onEmit: event =>
          event._tag === 'Changed'
            ? Message.OptionsPicked({ value: event.value })
            : undefined,
      }),
      Tokenizer(h, {
        id: 'review-tags',
        label: 'Review tags',
        placeholder: 'Add a tag',
        props: {
          items: [
            { id: 'keyboard', label: 'Keyboard' },
            { id: 'forms', label: 'Forms' },
          ],
          value: model.tokens,
          hasCreate: true,
          name: 'review-tag',
        },
        onEmit: event =>
          event._tag === 'Changed'
            ? Message.TokensChanged({ value: event.value })
            : undefined,
      }),
      ListInput(h, {
        id: 'review-checks',
        value: model.tasks,
        label: 'Checks',
        itemName: 'check',
        reorderable: true,
        maxItems: 6,
        getItemKey: row => row.id,
        createItem: () => ({
          id: Math.max(0, ...model.tasks.map(row => row.id)) + 1,
          title: '',
        }),
        columns: [
          {
            key: 'title',
            header: 'Check',
            renderInput: ({ item, label, updateItem }) =>
              h.input
                .class('example-input')
                .attr('aria-label', label)
                .value(item.title)
                .on('input', ({ value }) =>
                  updateItem({ ...item, title: value }),
                ),
          },
        ],
        onChange: value => Message.TasksChanged({ value }),
      }),
      TransferList(h, {
        label: 'Review channels',
        showSelectAll: true,
        showClear: true,
        props: {
          id: 'review-channels',
          value: model.channels,
          reorderable: true,
          options: [
            { value: 'notes', label: 'Notes', isTransferDisabled: true },
            { value: 'email', label: 'Email' },
            { value: 'summary', label: 'Daily summary' },
          ],
        },
        onEmit: { Changed: ({ value }) => Message.Transferred({ value }) },
      }),
      TreeList(h, {
        ariaLabel: 'Review folders',
        props: {
          id: 'review-folders',
          expandedIds: ['reviews'],
          items: [
            {
              id: 'reviews',
              label: 'Reviews',
              children: [
                {
                  id: 'checklist',
                  label: 'Checklist',
                  onSelect: true,
                  isSelected: model.treeSelection === 'checklist',
                },
                {
                  id: 'attachments',
                  label: 'Files',
                  onSelect: true,
                  isSelected: model.treeSelection === 'attachments',
                },
              ],
            },
          ],
        },
        onEmit: event =>
          event._tag === 'Selected'
            ? Message.TreePicked({ id: event.id })
            : undefined,
      }),
    ),
})
