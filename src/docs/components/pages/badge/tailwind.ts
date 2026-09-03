import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { badgeVariants } from '@/docs/components/pages/badge/shared';
import * as Badge from '@/ui/badge';

const InteractedWithBadgePreview = m('InteractedWithBadgePreview');
type InteractedWithBadgePreview = typeof InteractedWithBadgePreview.Type;
const BadgePreviewModel = S.Struct({ _docsPage: S.Literal('badge') });
type BadgePreviewModel = typeof BadgePreviewModel.Type;

export const badgeTailwindPreviewProgram = definePreviewProgram<
  BadgePreviewModel,
  InteractedWithBadgePreview
>({
  Model: BadgePreviewModel,
  Message: InteractedWithBadgePreview,
  init: () => ({ _docsPage: 'badge' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 0
    ? h.div([h.Class('flex flex-wrap gap-2')], badgeVariants.map(item =>
        Badge.badge({
          variant: item.variant,
          children: [item.label],
        }, h),
      ))
    : Badge.badge({
        variant: 'secondary',
        children: ['Ready to publish'],
      }, h),
});
