import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as Pagination from '@/ui/pagination';

const pages = <Msg>(active: number, h: HtmlBuilder<Msg>) => Pagination.pagination({ children: [Pagination.paginationContent({ children: [Pagination.paginationItem({ children: [Pagination.paginationPrevious({ href: '/invoices?page=1' }, h)] }, h), ...[1, 2, 3].map((page) => Pagination.paginationItem({ children: [Pagination.paginationLink({ href: `/invoices?page=${String(page)}`, isActive: page === active, children: [String(page)] }, h)] }, h)), Pagination.paginationItem({ children: [Pagination.paginationNext({ href: '/invoices?page=3' }, h)] }, h)] }, h)] }, h);

const source = (name: string, compact: boolean): string => staticComponentApplication({
  componentName: 'Pagination', componentSlug: 'pagination', exampleName: name,
  viewBody: `Pagination.pagination({ children: [
  Pagination.paginationContent({ children: [
    Pagination.paginationItem({ children: [
      Pagination.paginationPrevious({ href: '/invoices?page=1'${compact ? ", class: '[&_span]:hidden'" : ''} }, h),
    ] }, h),
    ...[1, 2, 3].map(page => Pagination.paginationItem({ children: [
      Pagination.paginationLink({
        href: \`/invoices?page=\${page}\`,
        isActive: page === 2,
        children: [String(page)],
      }, h),
    ] }, h)),
    Pagination.paginationItem({ children: [
      Pagination.paginationNext({ href: '/invoices?page=3'${compact ? ", class: '[&_span]:hidden'" : ''} }, h),
    ] }, h),
  ] }, h),
] }, h),`,
});

export const paginationPage = authoredPage({
  slug: 'pagination', title: 'Pagination', kind: 'recipe',
  previewMode: 'static',
  definition: {
    kind: 'recipe', description: 'Links between result pages through a named navigation landmark with explicit current-page state.',
    architecture: 'Pagination is stateless. Derive hrefs and isActive from the route or query model instead of maintaining a second hidden page index.',
    apiHref: 'https://foldkit.dev/ui/link',
    composition: 'Pagination\n└── PaginationContent\n    └── PaginationItem\n        ├── PaginationLink\n        ├── PaginationPrevious / PaginationNext\n        └── PaginationEllipsis',
    styling: 'Keep the current neighborhood small on mobile and use ellipses for skipped ranges, never as interactive controls.',
    accessibility: 'The wrapper is a pagination navigation landmark, the active link exposes aria-current=page, and direction links have explicit accessible labels.',
    keyboard: [['Tab', 'Moves through each available page link.'], ['Enter', 'Navigates to the focused page href.']],
    examples: [
      { title: 'Result pages', description: 'Generate page hrefs from route data and mark exactly one link as current.', preview: (_model, h) => pages(2, h), code: source('Result pages', false) },
      { title: 'Compact directions', description: 'Hide direction text visually in narrow layouts while preserving each link’s accessible label.', preview: (_model, h) => h.div([h.Class('[&_a:first-of-type_span]:hidden [&_a:last-of-type_span]:hidden')], [pages(2, h)]), code: source('Compact directions', true) },
    ],
  },
});
