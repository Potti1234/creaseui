import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { comboboxFixtures, comboboxFrameworks, comboboxLabel } from '@/docs/components/pages/combobox/shared';
import * as Combobox from '@/ui/combobox';

const GotComboboxPreviewMessage = defineMessageUnion({
  GotComboboxPreviewMessage: { message: Combobox.Message },
});
type GotComboboxPreviewMessage = typeof GotComboboxPreviewMessage.Type;
const ComboboxPreviewModel = S.Struct({ _docsPage: S.Literal('combobox'), combobox: Combobox.Model, maybeFramework: S.Option(S.String) });
type ComboboxPreviewModel = typeof ComboboxPreviewModel.Type;

export const comboboxTailwindPreviewProgram = definePreviewProgram<ComboboxPreviewModel, GotComboboxPreviewMessage>({
  Model: ComboboxPreviewModel, Message: GotComboboxPreviewMessage,
  init: index => ({ _docsPage: 'combobox', combobox: Combobox.init({ id: `docs-combobox-${String(index)}`, isAnimated: true }), maybeFramework: comboboxFixtures[index]?.readOnly === true ? Option.some('next') : Option.none() }),
  update: (model, message) => {
    const { model: combobox, commands: comboboxCommands__, outMessage: comboboxOut__ } = Combobox.update(model.combobox, message.message)
    const commands = comboboxCommands__ ?? []
    const maybeSelection = Option.fromNullishOr(comboboxOut__)
    const maybeFramework = Option.match(maybeSelection, { onNone: () => model.maybeFramework, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<string>() });
    return { model: { ...model, combobox, maybeFramework }, commands: Command.mapMessages(commands, next => GotComboboxPreviewMessage.GotComboboxPreviewMessage({ message: next })) };
  },
  view: (index, model, h) => {
    const fixture = comboboxFixtures[index] ?? comboboxFixtures[0];
    return h.div([h.Class('grid gap-2')], [
      Combobox.combobox({
        model: model.combobox, maybeSelectedValue: model.maybeFramework,
        restingInputValue: Option.match(model.maybeFramework, { onNone: () => '', onSome: comboboxLabel }),
        toParentMessage: message => GotComboboxPreviewMessage.GotComboboxPreviewMessage({ message }),
        items: fixture.empty ? [] : comboboxFrameworks,
        itemToValue: item => item.value, itemToLabel: item => item.label,
        placeholder: 'Search frameworks…', ariaLabel: 'Framework', formName: 'framework',
        ...(fixture.grouped ? { itemGroupKey: (item: typeof comboboxFrameworks[number]) => item.value === 'next' ? 'React' : 'Other', groupToHeading: (group: string) => group } : {}),
        ...(fixture.readOnly ? { isReadOnly: true, direction: 'rtl' as const } : {}),
      }, h),
      ...(fixture.empty ? [h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], ['No frameworks match this query.'])] : []),
    ]);
  },
});
