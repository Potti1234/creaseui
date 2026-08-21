import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as Breadcrumb from '@/ui/breadcrumb';

const view = <Msg>(separator: string | undefined, collapsed: boolean, h: HtmlBuilder<Msg>) => Breadcrumb.breadcrumb({ children: [Breadcrumb.breadcrumbList({ children: [Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbLink({ href: '/docs', children: ['Docs'] }, h)] }, h), Breadcrumb.breadcrumbSeparator(separator === undefined ? {} : { children: [separator] }, h), ...(collapsed ? [Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbEllipsis({}, h)] }, h), Breadcrumb.breadcrumbSeparator({}, h)] : []), Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbPage({ children: ['Breadcrumb'] }, h)] }, h)] }, h)] }, h);

const source = (name: string, separator: string, middle: string): string => staticComponentApplication({
  componentName: 'Breadcrumb', componentSlug: 'breadcrumb', exampleName: name,
  viewBody: `Breadcrumb.breadcrumb({ children: [
  Breadcrumb.breadcrumbList({ children: [
    Breadcrumb.breadcrumbItem({ children: [
      Breadcrumb.breadcrumbLink({ href: '/docs', children: ['Docs'] }, h),
    ] }, h),
    Breadcrumb.breadcrumbSeparator(${separator}, h),
    ${middle}
    Breadcrumb.breadcrumbItem({ children: [
      Breadcrumb.breadcrumbPage({ children: ['Breadcrumb'] }, h),
    ] }, h),
  ] }, h),
] }, h),`,
});

export const breadcrumbPage = authoredPage({
  slug: 'breadcrumb', title: 'Breadcrumb', kind: 'recipe',
  previewMode: 'static',
  definition: {
    kind: 'recipe', description: 'Shows the current resource’s position in a hierarchy with linked ancestors and one current page.',
    architecture: 'Breadcrumb is a stateless semantic recipe. Derive its items from route data; navigation remains ordinary href behavior or your router’s link integration.',
    apiHref: 'https://foldkit.dev/ui/link',
    composition: 'Breadcrumb\n└── BreadcrumbList\n    ├── BreadcrumbItem → BreadcrumbLink / BreadcrumbPage\n    ├── BreadcrumbSeparator\n    └── BreadcrumbEllipsis',
    styling: 'Keep labels brief and collapse middle ancestors before wrapping an unreadably long trail.',
    accessibility: 'The nav landmark is named breadcrumb, separators are hidden from assistive technology, and the current page exposes aria-current=page.',
    examples: [
      { title: 'Current path', description: 'Ancestors are links; the final item is current-page text rather than a redundant link.', preview: (_model, h) => view(undefined, false, h), code: source('Current path', '{}', '') },
      { title: 'Collapsed path', description: 'Use an ellipsis for omitted middle levels while retaining the first ancestor and current page.', preview: (_model, h) => view(undefined, true, h), code: source('Collapsed path', '{}', `Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbEllipsis({}, h)] }, h),
    Breadcrumb.breadcrumbSeparator({}, h),`) },
      { title: 'Custom separator', description: 'A textual separator remains presentational and does not pollute the accessible trail.', preview: (_model, h) => view('›', false, h), code: source('Custom separator', `{ children: ['›'] }`, '') },
    ],
  },
});
