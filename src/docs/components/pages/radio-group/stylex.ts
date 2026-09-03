import { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { radioGroupOptions } from '@/docs/components/pages/radio-group/shared';
import * as RadioGroup from '@/stylex/radio-group';

type PreviewModel = Readonly<{
  value: string;
  radioGroup: RadioGroup.Model;
}>;

export const radioGroupStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const previewModel = model as PreviewModel;
  return RadioGroup.radioGroup({
    model: previewModel.radioGroup,
    selectedValue: Option.some(previewModel.value),
    toParentMessage: message => onMessageJson(JSON.stringify({
      _tag: 'GotDocsRadioGroupMessage',
      message,
    })),
    ariaLabel: 'Interface density',
    name: 'density',
    ...(exampleIndex === 1
      ? {
          isDisabled: true,
          options: radioGroupOptions.map(({ value, label }) => ({ value, label })),
        }
      : exampleIndex === 2
        ? { isReadOnly: true, options: radioGroupOptions }
        : exampleIndex === 3
          ? {
              direction: 'rtl' as const,
              orientation: 'Horizontal' as const,
              options: radioGroupOptions.map((option, optionIndex) => ({
                ...option,
                isDisabled: optionIndex === 2,
              })),
            }
          : { options: radioGroupOptions }),
  }, h);
};
