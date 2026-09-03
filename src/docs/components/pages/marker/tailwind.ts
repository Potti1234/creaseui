import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Marker from '@/ui/marker';

const InteractedWithMarkerPreview = m('InteractedWithMarkerPreview');
type InteractedWithMarkerPreview = typeof InteractedWithMarkerPreview.Type;
const MarkerPreviewModel = S.Struct({ _docsPage: S.Literal('marker') });
type MarkerPreviewModel = typeof MarkerPreviewModel.Type;

export const markerTailwindPreviewProgram = definePreviewProgram<
  MarkerPreviewModel,
  InteractedWithMarkerPreview
>({
  Model: MarkerPreviewModel,
  Message: InteractedWithMarkerPreview,
  init: () => ({ _docsPage: 'marker' }),
  update: model => [model, []],
  view: (index, _model, h) => Marker.marker({
    ...(index === 0 ? { variant: 'separator' as const } : {}),
    ...(index === 2 ? { variant: 'border' as const } : {}),
    class: 'max-w-lg',
    children: index === 1
      ? [
          Marker.markerIcon({ children: ['●'] }, h),
          Marker.markerContent({ children: ['Deployment completed'] }, h),
        ]
      : [Marker.markerContent({ children: [index === 0 ? 'Today' : 'Earlier'] }, h)],
  }, h),
});
