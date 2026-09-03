import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { radioGroupOptions } from '@/docs/components/pages/radio-group/shared';
import * as RadioGroup from '@/ui/radio-group';

const PreviewModel = S.Struct({
  _docsPage: S.Literal('radio-group'),
  value: S.String,
  radioGroup: RadioGroup.Model,
});
type PreviewModel = typeof PreviewModel.Type;
const ChangedPreview = m('ChangedRadioGroupPreview', { value: S.String });
const GotRadioGroupMessage = m('GotDocsRadioGroupMessage', {
  message: RadioGroup.Message,
});
const PreviewMessage = S.Union([ChangedPreview, GotRadioGroupMessage]);
type PreviewMessage = typeof PreviewMessage.Type;

export const radioGroupTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: index => ({
    _docsPage: 'radio-group',
    value: 'comfortable',
    radioGroup: RadioGroup.init({ id: `docs-radio-${String(index)}` }),
  }),
  update: (model, message) => {
    if (message._tag === 'ChangedRadioGroupPreview') {
      return [{ ...model, value: message.value }, []];
    }
    const [radioGroup, commands, maybeSelection] =
      RadioGroup.update(model.radioGroup, message.message);
    return [
      {
        ...model,
        radioGroup,
        value: Option.match(maybeSelection, {
          onNone: () => model.value,
          onSome: selection => selection.value,
        }),
      },
      Command.mapMessages(
        commands,
        child => GotRadioGroupMessage({ message: child }),
      ),
    ];
  },
  view: (index, model, h) => RadioGroup.radioGroup({
    model: model.radioGroup,
    selectedValue: Option.some(model.value),
    toParentMessage: message => GotRadioGroupMessage({ message }),
    ariaLabel: 'Interface density',
    name: 'density',
    ...(index === 1
      ? {
          isDisabled: true,
          options: radioGroupOptions.map(({ value, label }) => ({ value, label })),
        }
      : index === 2
        ? { isReadOnly: true, options: radioGroupOptions }
        : index === 3
          ? {
              direction: 'rtl' as const,
              orientation: 'Horizontal' as const,
              options: radioGroupOptions.map((option, optionIndex) => ({
                ...option,
                isDisabled: optionIndex === 2,
              })),
            }
          : { options: radioGroupOptions }),
  }, h),
});
