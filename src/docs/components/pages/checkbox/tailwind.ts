import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import {
  definePreviewProgram,
} from '@/docs/components/pages/authored-page';
import {
  checkboxInitialValues,
  checkboxLabels,
} from '@/docs/components/pages/checkbox/shared';
import * as Checkbox from '@/ui/checkbox';

const PreviewModel = S.Struct({
  _docsPage: S.Literal('checkbox'),
  isChecked: S.Boolean,
});
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledCheckboxPreview', { isChecked: S.Boolean });
type PreviewMessage = typeof ToggledPreview.Type;

export const checkboxTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: ToggledPreview,
  init: index => ({
    _docsPage: 'checkbox',
    isChecked: checkboxInitialValues[index] ?? false,
  }),
  update: (model, message) => [
    { ...model, isChecked: message.isChecked },
    [],
  ],
  view: (index, model, h) => Checkbox.checkbox({
    id: `docs-checkbox-${String(index)}`,
    isChecked: model.isChecked,
    onToggle: isChecked => ToggledPreview({ isChecked }),
    label: checkboxLabels[index] ?? checkboxLabels[0],
    ...(index === 0
      ? {
          description: 'Required before creating the account.',
          name: 'terms',
          value: 'accepted',
        }
      : {}),
    ...(index === 1 ? { isIndeterminate: true } : {}),
    ...(index === 2 ? { isDisabled: true } : {}),
    ...(index === 3
      ? {
          isReadOnly: true,
          description: 'This status is supplied by your identity provider.',
        }
      : {}),
  }, h),
});
