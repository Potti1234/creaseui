import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Skeleton from '@/ui/skeleton';

const InteractedWithSkeletonPreview = m('InteractedWithSkeletonPreview');
type InteractedWithSkeletonPreview = typeof InteractedWithSkeletonPreview.Type;
const SkeletonPreviewModel = S.Struct({ _docsPage: S.Literal('skeleton') });
type SkeletonPreviewModel = typeof SkeletonPreviewModel.Type;

export const skeletonTailwindPreviewProgram = definePreviewProgram<
  SkeletonPreviewModel,
  InteractedWithSkeletonPreview
>({
  Model: SkeletonPreviewModel,
  Message: InteractedWithSkeletonPreview,
  init: () => ({ _docsPage: 'skeleton' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 0
    ? h.div([
        h.Role('status'),
        h.AriaBusy(true),
        h.AriaLabel('Loading profile'),
        h.Class('flex items-center gap-4'),
      ], [
        Skeleton.skeleton({ shape: 'circle', size: 'lg' }, h),
        h.div([h.Class('space-y-2')], [
          Skeleton.skeleton({ shape: 'text', size: 'md', class: 'w-48' }, h),
          Skeleton.skeleton({ shape: 'text', size: 'md' }, h),
        ]),
      ])
    : h.div([h.Class('w-full max-w-sm space-y-3')], [
        Skeleton.skeleton({ class: 'aspect-video w-full' }, h),
        Skeleton.skeleton({ class: 'h-4 w-3/4' }, h),
        Skeleton.skeleton({ class: 'h-4 w-1/2' }, h),
      ]),
});
