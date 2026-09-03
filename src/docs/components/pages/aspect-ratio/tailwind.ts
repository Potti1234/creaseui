import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { aspectRatioFixtures } from '@/docs/components/pages/aspect-ratio/shared';
import * as AspectRatio from '@/ui/aspect-ratio';

const InteractedWithAspectRatioPreview = m('InteractedWithAspectRatioPreview');
type InteractedWithAspectRatioPreview = typeof InteractedWithAspectRatioPreview.Type;
const AspectRatioPreviewModel = S.Struct({
  _docsPage: S.Literal('aspect-ratio'),
});
type AspectRatioPreviewModel = typeof AspectRatioPreviewModel.Type;

export const aspectRatioTailwindPreviewProgram = definePreviewProgram<
  AspectRatioPreviewModel,
  InteractedWithAspectRatioPreview
>({
  Model: AspectRatioPreviewModel,
  Message: InteractedWithAspectRatioPreview,
  init: () => ({ _docsPage: 'aspect-ratio' }),
  update: model => [model, []],
  view: (index, _model, h) => {
    const item = aspectRatioFixtures[index] ?? aspectRatioFixtures[0];
    return AspectRatio.aspectRatio({
      ratio: item.ratio,
      class: index === 0
        ? 'w-full max-w-lg overflow-hidden rounded-lg bg-muted'
        : 'w-48 overflow-hidden rounded-lg bg-muted',
      children: [
        h.div([
          h.Class('flex size-full items-center justify-center text-sm text-muted-foreground'),
        ], [item.label]),
      ],
    }, h);
  },
});
