import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';
import type { BreadcrumbTrailItem } from '@/lib/breadcrumb';

export const breadcrumbRoute: ReadonlyArray<BreadcrumbTrailItem> = [
  { kind: 'link', label: 'Home', href: '/' },
  { kind: 'link', label: 'Workspace', href: '/workspace' },
  { kind: 'link', label: 'Projects', href: '/workspace/projects' },
  { kind: 'link', label: 'Crease UI', href: '/workspace/projects/crease-ui' },
  { kind: 'page', label: 'Breadcrumb' },
];

export const longBreadcrumbRoute: ReadonlyArray<BreadcrumbTrailItem> = [
  { kind: 'link', label: 'Documentation', href: '/docs' },
  { kind: 'page', label: 'A-very-long-unbroken-resource-name-that-must-wrap-without-overflow' },
];

export const breadcrumbAriaLabel = 'مسار الصفحة';

const standardItems = `{ kind: 'link', label: 'Home', href: '/' },
    { kind: 'link', label: 'Workspace', href: '/workspace' },
    { kind: 'link', label: 'Projects', href: '/workspace/projects' },
    { kind: 'link', label: 'Crease UI', href: '/workspace/projects/crease-ui' },
    { kind: 'page', label: 'Breadcrumb' }`;

const source = (
  name: string,
  options: string,
  renderer: 'tailwind' | 'stylex',
  items = standardItems,
): string => staticComponentApplication({
  componentName: 'Breadcrumb',
  componentSlug: 'breadcrumb',
  renderer,
  exampleName: name,
  viewBody: `Breadcrumb.breadcrumbTrail({
  items: [
    ${items},
  ]${options},
}, h)`,
});

export const breadcrumbExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  { title: 'Current path', description: 'Typed route values render linked ancestors and one non-link current page.', code: source('Current path', ', maxItems: 5', renderer) },
  { title: 'Collapsed middle', description: 'A finite limit preserves the first ancestor and current tail while describing omitted levels.', code: source('Collapsed middle', ', maxItems: 4', renderer) },
  {
    title: 'Long resource label',
    description: 'A long unbroken current label wraps within the available trail width.',
    code: source('Long resource label', ", ariaLabel: 'Resource path'", renderer, `{ kind: 'link', label: 'Documentation', href: '/docs' },
    { kind: 'page', label: 'A-very-long-unbroken-resource-name-that-must-wrap-without-overflow' }`),
  },
  { title: 'RTL separator', description: 'RTL direction mirrors the default visual separator without changing semantic route order.', code: source('RTL separator', ", maxItems: 4, direction: 'rtl', ariaLabel: 'مسار الصفحة'", renderer) },
];
