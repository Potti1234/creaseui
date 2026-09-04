import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { selectFixtures, selectFruits } from '@/docs/components/pages/select/shared';
import * as Select from '@/ui/select';

const GotSelectPreviewMessage = m('GotSelectPreviewMessage', { message: Select.Message });
type GotSelectPreviewMessage = typeof GotSelectPreviewMessage.Type;
const SelectPreviewModel = S.Struct({ _docsPage: S.Literal('select'), select: Select.Model, maybeFruit: S.Option(S.String) });
type SelectPreviewModel = typeof SelectPreviewModel.Type;

export const selectTailwindPreviewProgram = definePreviewProgram<SelectPreviewModel, GotSelectPreviewMessage>({
  Model: SelectPreviewModel, Message: GotSelectPreviewMessage,
  init: index => ({ _docsPage: 'select', select: Select.init({ id: `docs-select-${String(index)}`, isAnimated: true }), maybeFruit: Option.some('apple') }),
  update: (model, message) => {
    const [select, commands, maybeSelection] = Select.update(model.select, message.message);
    const maybeFruit = Option.match(maybeSelection, { onNone: () => model.maybeFruit, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<string>() });
    return [{ ...model, select, maybeFruit }, Command.mapMessages(commands, next => GotSelectPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = selectFixtures[index] ?? selectFixtures[0];
    return Select.select({
      model: model.select, maybeSelectedValue: model.maybeFruit,
      toParentMessage: message => GotSelectPreviewMessage({ message }),
      items: selectFruits, itemToValue: item => item.value, itemToLabel: item => item.label,
      placeholder: 'Select a fruit', ariaLabel: 'Fruit', name: 'fruit',
      ...(fixture.grouped ? { itemGroupKey: (item: typeof selectFruits[number]) => item.value === 'blueberry' ? 'Berries' : 'Common', groupToHeading: (group: string) => group } : {}),
      ...(fixture.disabled ? { itemToConfig: (item: typeof selectFruits[number]) => ({ isDisabled: item.value === 'banana' }) } : {}),
      ...(fixture.readOnly ? { isReadOnly: true, direction: 'rtl' as const } : {}),
    }, h);
  },
});
