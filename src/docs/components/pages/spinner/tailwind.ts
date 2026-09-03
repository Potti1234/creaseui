import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Spinner from '@/ui/spinner';

const InteractedWithSpinnerPreview = m('InteractedWithSpinnerPreview');
type InteractedWithSpinnerPreview = typeof InteractedWithSpinnerPreview.Type;
const SpinnerPreviewModel = S.Struct({ _docsPage: S.Literal('spinner') });
type SpinnerPreviewModel = typeof SpinnerPreviewModel.Type;

export const spinnerTailwindPreviewProgram = definePreviewProgram<
  SpinnerPreviewModel,
  InteractedWithSpinnerPreview
>({
  Model: SpinnerPreviewModel,
  Message: InteractedWithSpinnerPreview,
  init: () => ({ _docsPage: 'spinner' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 0
    ? Spinner.spinner({ label: 'Loading content', size: 'md', tone: 'primary' }, h)
    : h.div([h.Role('status'), h.Class('flex items-center gap-2 text-sm')], [
        Spinner.spinner({ isDecorative: true, size: 'sm', tone: 'muted' }, h),
        'Saving changes',
      ]),
});
