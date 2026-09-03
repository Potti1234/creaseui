import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Separator from '@/ui/separator';

const InteractedWithSeparatorPreview = m('InteractedWithSeparatorPreview');
type InteractedWithSeparatorPreview = typeof InteractedWithSeparatorPreview.Type;
const SeparatorPreviewModel = S.Struct({ _docsPage: S.Literal('separator') });
type SeparatorPreviewModel = typeof SeparatorPreviewModel.Type;

export const separatorTailwindPreviewProgram = definePreviewProgram<
  SeparatorPreviewModel,
  InteractedWithSeparatorPreview
>({
  Model: SeparatorPreviewModel,
  Message: InteractedWithSeparatorPreview,
  init: () => ({ _docsPage: 'separator' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 0
    ? h.div([h.Class('w-full max-w-md space-y-4')], [
        'Account',
        Separator.separator({}, h),
        'Preferences',
      ])
    : h.div([h.Class('flex h-5 items-center gap-4')], [
        'Docs',
        Separator.separator({ orientation: 'vertical', decorative: false }, h),
        'API',
      ]),
});
