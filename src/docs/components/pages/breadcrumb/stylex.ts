import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { breadcrumbAriaLabel, breadcrumbRoute, longBreadcrumbRoute } from '@/docs/components/pages/breadcrumb/shared';
import * as Breadcrumb from '@/stylex/breadcrumb';

export const breadcrumbStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 2
  ? Breadcrumb.breadcrumbTrail({ items: longBreadcrumbRoute, ariaLabel: 'Resource path' }, h)
  : Breadcrumb.breadcrumbTrail({
      items: breadcrumbRoute,
      maxItems: exampleIndex === 0 ? 5 : 4,
      ...(exampleIndex === 3 ? { direction: 'rtl' as const, ariaLabel: breadcrumbAriaLabel } : {}),
    }, h);
