import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Select from '@/ui/select';

const fruits = [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }, { value: 'blueberry', label: 'Blueberry' }] as const;

const source = (name: string, grouped: boolean): string => foldkitApplication({
  title: `Select — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Select from '@/ui/select'`,
  model: `export const FruitValue = S.Literals(['apple', 'banana', 'blueberry'])
export type FruitValue = typeof FruitValue.Type
export const Model = S.Struct({
  select: Select.Model,
  maybeFruit: S.Option(FruitValue),
})
export type Model = typeof Model.Type`,
  messages: `export const GotSelectMessage = m('GotSelectMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Select.Message })
export const Message = S.Union([GotSelectMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { select: Select.init({ id: 'fruit-select', isAnimated: true }), maybeFruit: Option.some('apple') },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotSelectMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [select, commands, maybeSelection] = Select.update(model.select, message.message)
      const maybeFruit = Option.match(maybeSelection, {
        onNone: () => model.maybeFruit,
        onSome: selection => selection._tag === 'Selected'
          ? Option.some(selection.value as FruitValue)
          : Option.none<FruitValue>(),
      })
      return [
        { ...model, select, maybeFruit },
        Command.mapMessages(commands, next => GotSelectMessage({ message: next })),
      ]
    }
  }
}`,
  view: `const fruits: ReadonlyArray<Readonly<{ value: FruitValue; label: string; group: string }>> = [
  { value: 'apple', label: 'Apple', group: 'Common' },
  { value: 'banana', label: 'Banana', group: 'Common' },
  { value: 'blueberry', label: 'Blueberry', group: 'Berries' },
]

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Select — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Select.select({
      model: model.select,
      maybeSelectedValue: model.maybeFruit,
      toParentMessage: message => GotSelectMessage({ message }),
      items: fruits,
      itemToValue: fruit => fruit.value,
      itemToLabel: fruit => fruit.label,
      placeholder: 'Select a fruit',
      ariaLabel: 'Fruit',${grouped ? `
      itemGroupKey: fruit => fruit.group,
      groupToHeading: group => group,` : ''}
    }, h),
  ]),
})`,
});

const GotSelectPreviewMessage = m('GotSelectPreviewMessage', { message: Select.Message });
type GotSelectPreviewMessage = typeof GotSelectPreviewMessage.Type;
const SelectPreviewModel = S.Struct({ _docsPage: S.Literal('select'), select: Select.Model, maybeFruit: S.Option(S.String) });
type SelectPreviewModel = typeof SelectPreviewModel.Type;
const previewProgram = definePreviewProgram<SelectPreviewModel, GotSelectPreviewMessage>({
  Model: SelectPreviewModel, Message: GotSelectPreviewMessage,
  init: index => ({ _docsPage: 'select', select: Select.init({ id: `docs-select-${String(index)}`, isAnimated: true }), maybeFruit: Option.some('apple') }),
  update: (model, message) => {
    const [select, commands, maybeSelection] = Select.update(model.select, message.message);
    const maybeFruit = Option.match(maybeSelection, { onNone: () => model.maybeFruit, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<string>() });
    return [{ ...model, select, maybeFruit }, Command.mapMessages(commands, next => GotSelectPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => Select.select({ model: model.select, maybeSelectedValue: model.maybeFruit, toParentMessage: message => GotSelectPreviewMessage({ message }), items: fruits, itemToValue: item => item.value, itemToLabel: item => item.label, placeholder: 'Select a fruit', ariaLabel: 'Fruit', ...(index === 1 ? { itemGroupKey: (item: typeof fruits[number]) => item.value === 'blueberry' ? 'Berries' : 'Common', groupToHeading: (group: string) => group } : {}) }, h),
});

export const selectPage = authoredPage({
  slug: 'select', title: 'Select', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Lets a user choose one typed value from a disclosure listbox.',
    architecture: 'Select wraps Foldkit’s Listbox child Model. The parent owns the selected Option separately, delegates Message, persists the Selected or Cleared OutMessage, and maps focus/positioning Commands.',
    apiHref: 'https://foldkit.dev/ui/listbox',
    composition: 'Parent Model\n├── Select child Model (open, active item, search)\n├── selected Option<Value>\n└── anchored listbox view\n    ├── trigger / selected label\n    └── options, groups, separators',
    styling: 'Project domain items through stable, unique string values. Grouping is optional view data and does not alter the parent update contract.',
    accessibility: 'The primitive supplies listbox/option semantics, active-descendant navigation, typeahead, disabled states, and trigger relationships. Always provide a visible label or ariaLabel.',
    keyboard: [['Enter / Space', 'Opens the listbox and commits the active option.'], ['Arrow Up / Down', 'Moves the active option.'], ['Home / End', 'Moves to the first or last enabled option.'], ['Escape', 'Closes without changing the stored selection.']],
    examples: [
      { title: 'Typed selection', description: 'Persist the child OutMessage into a domain Option instead of deriving selection from the child’s disclosure state.',  code: source('Typed selection', false) },
      { title: 'Grouped fruit', description: 'Group headings are projections over the same typed item collection.',  code: source('Grouped fruit', true) },
    ],
  },
});
