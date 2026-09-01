import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { m } from 'foldkit/message'

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page'
import * as ToggleGroup from '@/ui/toggle-group'

const source = (name: string, multiple: boolean, extra = ''): string => foldkitApplication({
  title: `Toggle Group — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ToggleGroup from '@/ui/toggle-group'`,
  model: `export const Alignment = S.Literals(['left', 'center', 'right'])
export type Alignment = typeof Alignment.Type
const AlignmentGroup = ToggleGroup.create<Alignment>()
export const Model = S.Struct({
  toggleGroup: ToggleGroup.Model,
  ${multiple ? 'alignments: S.Array(Alignment)' : 'alignment: Alignment'},
})
export type Model = typeof Model.Type`,
  messages: `export const GotToggleGroupMessage = m('GotToggleGroupMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: ToggleGroup.Message })
export const Message = S.Union([GotToggleGroupMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { toggleGroup: ToggleGroup.init({ id: 'alignment-group' }), ${multiple ? "alignments: ['left']" : "alignment: 'center'"} },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [toggleGroup, commands, maybeSelection] = AlignmentGroup.update(model.toggleGroup, message.message)
  return [
    {
      ...model,
      toggleGroup,
      ${multiple
        ? `alignments: Option.match(maybeSelection, {
        onNone: () => model.alignments,
        onSome: ({ value }) => model.alignments.includes(value)
          ? model.alignments.filter(item => item !== value)
          : [...model.alignments, value],
      }),`
        : `alignment: Option.match(maybeSelection, {
        onNone: () => model.alignment,
        onSome: ({ value }) => value,
      }),`}
    },
    Command.mapMessages(commands, next => GotToggleGroupMessage({ message: next })),
  ]
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Toggle Group — ${name}',
  body: h.main([], [
    AlignmentGroup.toggleGroup({
      model: model.toggleGroup,
      toParentMessage: message => GotToggleGroupMessage({ message }),
      ariaLabel: 'Text alignment',
      ${multiple ? 'values: model.alignments,' : 'value: model.alignment,'}
      items: [
        { value: 'left', children: ['Left'] },
        { value: 'center', children: ['Center']${name === 'Disabled item' ? ', isDisabled: true' : ''} },
        { value: 'right', children: ['Right'] },
      ],
      ${extra}
    }, h),
    ${name === 'Form policy' ? "h.input([h.Type('hidden'), h.Name('alignment'), h.Value(model.alignment)])," : ''}
  ]),
})`,
})

const items = [
  { value: 'left', children: ['Left'] },
  { value: 'center', children: ['Center'] },
  { value: 'right', children: ['Right'] },
] as const
type Alignment = typeof items[number]['value']
const PreviewToggleGroup = ToggleGroup.create<Alignment>()
const GotToggleGroupPreviewMessage = m('GotToggleGroupPreviewMessage', { message: ToggleGroup.Message })
type PreviewMessage = typeof GotToggleGroupPreviewMessage.Type
const PreviewModel = S.Struct({
  _docsPage: S.Literal('toggle-group'),
  toggleGroup: ToggleGroup.Model,
  value: S.Literals(['left', 'center', 'right']),
  values: S.Array(S.Literals(['left', 'center', 'right'])),
})
type PreviewModel = typeof PreviewModel.Type
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: GotToggleGroupPreviewMessage,
  init: index => ({
    _docsPage: 'toggle-group',
    toggleGroup: ToggleGroup.init({ id: `docs-toggle-group-${String(index)}` }),
    value: index === 2 ? 'right' : 'center',
    values: ['left'],
  }),
  update: (model, message) => {
    const [toggleGroup, commands, maybeSelection] = PreviewToggleGroup.update(model.toggleGroup, message.message)
    const selected = Option.getOrUndefined(maybeSelection)?.value
    const isMultiple = model.toggleGroup.id.endsWith('-1')
    return [
      {
        ...model,
        toggleGroup,
        value: selected === undefined || isMultiple ? model.value : selected,
        values: selected === undefined || !isMultiple
          ? model.values
          : model.values.includes(selected)
            ? model.values.filter(value => value !== selected)
            : [...model.values, selected],
      },
      Command.mapMessages(commands, next => GotToggleGroupPreviewMessage({ message: next })),
    ]
  },
  view: (index, model, h) => PreviewToggleGroup.toggleGroup({
    model: model.toggleGroup,
    toParentMessage: message => GotToggleGroupPreviewMessage({ message }),
    ariaLabel: 'Text alignment',
    ...(index === 1 ? { values: model.values } : { value: model.value }),
    items: index === 3
      ? items.map((item) => item.value === 'center' ? { ...item, isDisabled: true } : item)
      : items,
    ...(index === 1 ? { arrangement: 'wrapped' as const } : {}),
    ...(index === 2 ? { direction: 'rtl' as const } : {}),
    ...(index === 3 ? { variant: 'outline' as const } : {}),
  }, h),
})

export const toggleGroupPage = authoredPage({
  slug: 'toggle-group',
  title: 'Toggle Group',
  kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel',
    description: 'Groups related toggle buttons while coordinating roving focus around parent-owned single or multiple selection.',
    architecture: 'Bind the value union once with ToggleGroup.create<Value>(). The parent owns selected value(s); the child Model owns only the roving-focus cursor. Fold the typed Selected OutMessage according to exclusive or multiple-selection policy.',
    apiHref: 'https://foldkit.dev/ui/tabs',
    styling: 'Use short labels or familiar icons. Joined arrangement reads as one segmented control; wrapped arrangement preserves individual boundaries on narrow viewports.',
    accessibility: 'The shared behavior adapts Foldkit manual roving focus to a named button group while removing tab-specific semantics. Each item remains a native button with aria-pressed; disabled items are skipped.',
    keyboard: [
      ['Arrow keys', 'Moves focus between enabled items without changing selection.'],
      ['Home / End', 'Moves focus to the first or last enabled item.'],
      ['Space / Enter', 'Toggles the focused item.'],
    ],
    examples: [
      { title: 'Single selection', description: 'Persist the emitted value as the exclusive parent-owned selection.', code: source('Single selection', false) },
      { title: 'Multiple selection', description: 'Add or remove the emitted value while the child continues to own only focus.', code: source('Multiple selection', true, "arrangement: 'wrapped',") },
      { title: 'RTL', description: 'Horizontal arrow order mirrors while the selected domain value remains parent-owned.', code: source('RTL', false, "direction: 'rtl',") },
      { title: 'Disabled item', description: 'Disabled buttons remain unavailable and roving focus skips them.', code: source('Disabled item', false, "variant: 'outline',") },
      { title: 'Form policy', description: 'Toggle buttons do not submit values implicitly; mirror parent state into a named hidden input when the server needs it.', code: source('Form policy', false) },
    ],
  },
})
