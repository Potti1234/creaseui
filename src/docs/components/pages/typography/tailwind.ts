import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Typography from '@/ui/typography';

const InteractedWithTypographyPreview = m('InteractedWithTypographyPreview');
type InteractedWithTypographyPreview = typeof InteractedWithTypographyPreview.Type;
const TypographyPreviewModel = S.Struct({ _docsPage: S.Literal('typography') });
type TypographyPreviewModel = typeof TypographyPreviewModel.Type;

export const typographyTailwindPreviewProgram = definePreviewProgram<
  TypographyPreviewModel,
  InteractedWithTypographyPreview
>({
  Model: TypographyPreviewModel,
  Message: InteractedWithTypographyPreview,
  init: () => ({ _docsPage: 'typography' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 0
    ? h.article([h.Class('w-full max-w-2xl')], [
        Typography.typographyH2({ children: ['Foldkit architecture'] }, h),
        Typography.typographyLead({
          children: ['Model behavior explicitly and keep views pure.'],
        }, h),
        Typography.typographyP({
          children: ['Messages describe facts. The update function owns state transitions and commands describe effects.'],
        }, h),
      ])
    : index === 1
      ? Typography.typographyP({ children: [
          'Render stateful children with ',
          Typography.typographyInlineCode({ children: ['h.submodel'] }, h),
          '.',
        ] }, h)
      : Typography.typographyBlockquote({
          children: ['The architecture is solved; model the behavior.'],
        }, h),
});
