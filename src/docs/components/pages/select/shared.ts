import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const selectFruits = [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }, { value: 'blueberry', label: 'Blueberry' }] as const;
export const selectFixtures = [
  { title: 'Typed selection', description: 'Persist the child OutMessage into a domain Option instead of deriving selection from the child’s disclosure state.', grouped: false, disabled: false, readOnly: false },
  { title: 'Grouped fruit', description: 'Group headings are projections over the same typed item collection.', grouped: true, disabled: false, readOnly: false },
  { title: 'Disabled option', description: 'Keep unavailable choices visible while keyboard traversal skips them.', grouped: false, disabled: true, readOnly: false },
  { title: 'Read only RTL', description: 'Allow inspection and typeahead without committing a new value in an RTL subtree.', grouped: false, disabled: false, readOnly: true },
] as const;

const source = (fixture: (typeof selectFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  return foldkitApplication({
    title: `Select — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Select from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/select'`,
    model: `export const FruitValue = S.Literals(['apple', 'banana', 'blueberry'])
export type FruitValue = typeof FruitValue.Type
const FruitSelect = Select.create<FruitValue>()
export const Model = S.Struct({
  select: Select.Model,
  maybeFruit: S.Option(FruitValue),
})
export type Model = typeof Model.Type`,
    messages: `export const GotSelectMessage = m('GotSelectMessage${tag}', { message: Select.Message })
export const Message = S.Union([GotSelectMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { select: Select.init({ id: 'fruit-select', isAnimated: true }), maybeFruit: Option.some('apple') },
  [],
]`,
    update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotSelectMessage${tag}': {
      const [select, commands, maybeSelection] = FruitSelect.update(model.select, message.message)
      const maybeFruit = Option.match(maybeSelection, {
        onNone: () => model.maybeFruit,
        onSome: selection => selection._tag === 'Selected'
          ? Option.some(selection.value)
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
  title: 'Select — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    FruitSelect.select({
      model: model.select,
      maybeSelectedValue: model.maybeFruit,
      toParentMessage: message => GotSelectMessage({ message }),
      items: fruits,
      itemToValue: fruit => fruit.value,
      itemToLabel: fruit => fruit.label,
      placeholder: 'Select a fruit',
      ariaLabel: 'Fruit',
${fixture.grouped ? "      itemGroupKey: fruit => fruit.group,\n      groupToHeading: group => group,\n" : ''}      name: 'fruit',
${fixture.disabled ? "      itemToConfig: fruit => ({ isDisabled: fruit.value === 'banana' }),\n" : ''}${fixture.readOnly ? "      isReadOnly: true,\n      direction: 'rtl',\n" : ''}    }, h),
  ]),
})`,
  });
};

export const selectExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => selectFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer) }));
