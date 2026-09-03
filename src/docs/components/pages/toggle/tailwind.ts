import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  toggleChildren,
  toggleInitialValues,
} from '@/docs/components/pages/toggle/shared';
import * as Toggle from '@/ui/toggle';

const PreviewModel = S.Struct({
  _docsPage: S.Literal('toggle'),
  isPressed: S.Boolean,
});
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledTogglePreview');
type PreviewMessage = typeof ToggledPreview.Type;

export const toggleTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: ToggledPreview,
  init: index => ({
    _docsPage: 'toggle',
    isPressed: toggleInitialValues[index] ?? false,
  }),
  update: model => [{ ...model, isPressed: !model.isPressed }, []],
  view: (index, model, h) => Toggle.toggle({
    isPressed: model.isPressed,
    onToggle: ToggledPreview(),
    children: [toggleChildren[index] ?? toggleChildren[0]],
    ...(index === 1 ? { variant: 'outline' as const } : {}),
    ...(index === 2 ? { isDisabled: true } : {}),
    ...(index === 3
      ? { ariaLabel: 'Bold formatting', size: 'sm' as const }
      : {}),
  }, h),
});
