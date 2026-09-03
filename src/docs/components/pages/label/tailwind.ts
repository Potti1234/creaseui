import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Label from '@/ui/label';

const InteractedWithLabelPreview = m('InteractedWithLabelPreview');
type InteractedWithLabelPreview = typeof InteractedWithLabelPreview.Type;
const LabelPreviewModel = S.Struct({ _docsPage: S.Literal('label') });
type LabelPreviewModel = typeof LabelPreviewModel.Type;

export const labelTailwindPreviewProgram = definePreviewProgram<
  LabelPreviewModel,
  InteractedWithLabelPreview
>({
  Model: LabelPreviewModel,
  Message: InteractedWithLabelPreview,
  init: () => ({ _docsPage: 'label' }),
  update: model => [model, []],
  view: (index, _model, h) => h.div(
    [h.Class('grid w-full max-w-sm gap-2')],
    index === 0
      ? [
          Label.label({ for: 'docs-email', children: ['Email address'] }, h),
          h.input([h.Id('docs-email'), h.Type('email'), h.Class('h-9 rounded-md border px-3')]),
        ]
      : [
          Label.label({ for: 'docs-project', children: ['Project name'] }, h),
          h.input([h.Id('docs-project'), h.Class('h-9 rounded-md border px-3')]),
          h.p([h.Class('text-xs text-muted-foreground')], ['Use 3–32 characters.']),
        ],
  ),
});
