import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { breadcrumbAriaLabel, breadcrumbRoute, longBreadcrumbRoute } from '@/docs/components/pages/breadcrumb/shared';
import * as Breadcrumb from '@/ui/breadcrumb';

const InteractedWithBreadcrumbPreview = m('InteractedWithBreadcrumbPreview');
type InteractedWithBreadcrumbPreview = typeof InteractedWithBreadcrumbPreview.Type;
const BreadcrumbPreviewModel = S.Struct({ _docsPage: S.Literal('breadcrumb') });
type BreadcrumbPreviewModel = typeof BreadcrumbPreviewModel.Type;

export const breadcrumbTailwindPreviewProgram = definePreviewProgram<BreadcrumbPreviewModel, InteractedWithBreadcrumbPreview>({
  Model: BreadcrumbPreviewModel,
  Message: InteractedWithBreadcrumbPreview,
  init: () => ({ _docsPage: 'breadcrumb' }),
  update: model => [model, []],
  view: (index, _model, h) => index === 2
    ? Breadcrumb.breadcrumbTrail({ items: longBreadcrumbRoute, ariaLabel: 'Resource path' }, h)
    : Breadcrumb.breadcrumbTrail({
        items: breadcrumbRoute,
        maxItems: index === 0 ? 5 : 4,
        ...(index === 3 ? { direction: 'rtl' as const, ariaLabel: breadcrumbAriaLabel } : {}),
      }, h),
});
