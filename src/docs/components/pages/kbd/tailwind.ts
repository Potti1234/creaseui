import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Kbd from '@/ui/kbd';

const InteractedWithKbdPreview = m('InteractedWithKbdPreview');
type InteractedWithKbdPreview = typeof InteractedWithKbdPreview.Type;
const KbdPreviewModel = S.Struct({ _docsPage: S.Literal('kbd') });
type KbdPreviewModel = typeof KbdPreviewModel.Type;

export const kbdTailwindPreviewProgram = definePreviewProgram<
  KbdPreviewModel,
  InteractedWithKbdPreview
>({
  Model: KbdPreviewModel,
  Message: InteractedWithKbdPreview,
  init: () => ({ _docsPage: 'kbd' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 0
    ? h.p([h.Class('text-sm')], [
        'Press ',
        Kbd.kbd({ children: ['Esc'] }, h),
        ' to close.',
      ])
    : Kbd.kbdGroup({
        children: [
          Kbd.kbd({ children: ['⌘'] }, h),
          Kbd.kbd({ children: ['K'] }, h),
        ],
      }, h),
});
