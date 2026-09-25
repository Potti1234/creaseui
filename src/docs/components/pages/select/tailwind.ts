import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  selectFixtures,
  type SelectFixture,
} from '@/docs/components/pages/select/shared';
import * as Field from '@/ui/field';
import * as Select from '@/ui/select';

const GotSelectPreviewMessage = defineMessageUnion({
  GotSelectPreviewMessage: { message: Select.Message },
});
type GotSelectPreviewMessage = typeof GotSelectPreviewMessage.Type;
const SelectPreviewModel = S.Struct({
  _docsPage: S.Literal('select'),
  select: Select.Model,
  maybeSelected: S.Option(S.String),
});
type SelectPreviewModel = typeof SelectPreviewModel.Type;

const ExampleSelect = Select.create<string>();

const fixtureView = (
  fixture: SelectFixture,
  model: SelectPreviewModel,
  h: HtmlBuilder<GotSelectPreviewMessage>,
): Html => {
  const select = ExampleSelect.select({
    model: model.select,
    maybeSelectedValue: model.maybeSelected,
    toParentMessage: message =>
      GotSelectPreviewMessage.GotSelectPreviewMessage({ message }),
    ariaLabel: 'Example select',
    placeholder: fixture.placeholder,
    items: fixture.items,
    itemToValue: item => item.value,
    itemToLabel: item => item.label,
    itemToConfig: item => ({ isDisabled: item.isDisabled ?? false }),
    ...(fixture.groups
      ? {
          itemGroupKey: item => item.group ?? '',
          groupToHeading: (group: string) => group,
        }
      : {}),
    ...(fixture.isDisabled === true ? { isDisabled: true } : {}),
    ...(fixture.kind === 'invalid' ? { isInvalid: true } : {}),
    ...(fixture.rtl === true ? { direction: 'rtl' as const } : {}),
    ...(fixture.triggerClass === undefined
      ? {}
      : { triggerClass: fixture.triggerClass }),
  }, h);
  return fixture.kind === 'invalid'
    ? h.div([], [
        Field.field({
          isInvalid: true,
          children: [
            Field.fieldLabel({ children: ['Fruit'] }, h),
            select,
            Field.fieldError({ children: ['Please select a fruit.'] }, h),
          ],
        }, h),
      ])
    : select;
};

export const selectTailwindPreviewProgram = definePreviewProgram<
  SelectPreviewModel,
  GotSelectPreviewMessage
>({
  Model: SelectPreviewModel,
  Message: GotSelectPreviewMessage,
  init: index => ({
    _docsPage: 'select',
    select: Select.init({
      id: `docs-select-${String(index)}`,
      isAnimated: true,
    }),
    maybeSelected: Option.none(),
  }),
  update: (model, message) => {
    const {
      model: select,
      commands: selectCommands,
      outMessage: selectOut,
    } = Select.update(model.select, message.message);
    const commands = selectCommands ?? [];
    const maybeSelected = Option.match(Option.fromNullishOr(selectOut), {
      onNone: () => model.maybeSelected,
      onSome: selection =>
        selection._tag === 'Selected'
          ? Option.some(selection.value)
          : Option.none<string>(),
    });
    return {
      model: { ...model, select, maybeSelected },
      commands: Command.mapMessages(commands, next =>
        GotSelectPreviewMessage.GotSelectPreviewMessage({ message: next })),
    };
  },
  view: (index, model, h) =>
    fixtureView(selectFixtures[index] ?? selectFixtures[0], model, h),
});
