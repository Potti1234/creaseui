import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  switchInitialValues,
  switchLabels,
} from '@/docs/components/pages/switch/shared';
import * as Switch from '@/ui/switch';

const PreviewModel = S.Struct({
  _docsPage: S.Literal('switch'),
  isChecked: S.Boolean,
});
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledSwitchPreview', { isChecked: S.Boolean });
type PreviewMessage = typeof ToggledPreview.Type;

export const switchTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: ToggledPreview,
  init: index => ({
    _docsPage: 'switch',
    isChecked: switchInitialValues[index] ?? false,
  }),
  update: (model, message) => [
    { ...model, isChecked: message.isChecked },
    [],
  ],
  view: (index, model, h) => Switch.switchControl({
    id: `docs-switch-${String(index)}`,
    isChecked: model.isChecked,
    onToggle: isChecked => ToggledPreview({ isChecked }),
    label: switchLabels[index] ?? switchLabels[0],
    ...(index === 0
      ? {
          description: 'Receive build and deployment updates.',
          name: 'notifications',
          value: 'enabled',
        }
      : {}),
    ...(index === 1 ? { size: 'sm' as const } : {}),
    ...(index === 2
      ? {
          isDisabled: true,
          description: 'Required by your organization.',
        }
      : {}),
    ...(index === 3
      ? {
          isReadOnly: true,
          description: 'Supplied by your identity provider.',
        }
      : {}),
    ...(index === 4
      ? {
          direction: 'rtl' as const,
          description: 'The thumb follows the inline direction.',
        }
      : {}),
  }, h),
});
