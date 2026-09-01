import type { HtmlBuilder } from 'foldkit/html'

import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page'
import * as Breadcrumb from '@/ui/breadcrumb'

const route: ReadonlyArray<Breadcrumb.BreadcrumbTrailItem> = [
  { kind: 'link', label: 'Home', href: '/' },
  { kind: 'link', label: 'Workspace', href: '/workspace' },
  { kind: 'link', label: 'Projects', href: '/workspace/projects' },
  { kind: 'link', label: 'Crease UI', href: '/workspace/projects/crease-ui' },
  { kind: 'page', label: 'Breadcrumb' },
]

const preview = <Msg>(index: number, h: HtmlBuilder<Msg>) => index === 2
  ? Breadcrumb.breadcrumbTrail({ items: [{ kind: 'link', label: 'Documentation', href: '/docs' }, { kind: 'page', label: 'A-very-long-unbroken-resource-name-that-must-wrap-without-overflow' }], ariaLabel: 'Resource path' }, h)
  : Breadcrumb.breadcrumbTrail({ items: route, maxItems: index === 0 ? 5 : 4, ...(index === 3 ? { direction: 'rtl' as const, ariaLabel: 'مسار الصفحة' } : {}) }, h)

const standardItems = `{ kind: 'link', label: 'Home', href: '/' },
    { kind: 'link', label: 'Workspace', href: '/workspace' },
    { kind: 'link', label: 'Projects', href: '/workspace/projects' },
    { kind: 'link', label: 'Crease UI', href: '/workspace/projects/crease-ui' },
    { kind: 'page', label: 'Breadcrumb' }`

const source = (name: string, options: string, items = standardItems): string => staticComponentApplication({
  componentName: 'Breadcrumb', componentSlug: 'breadcrumb', exampleName: name,
  viewBody: `Breadcrumb.breadcrumbTrail({
  items: [
    ${items},
  ]${options},
}, h)`,
})

export const breadcrumbPage = authoredPage({
  slug: 'breadcrumb', title: 'Breadcrumb', kind: 'recipe', previewMode: 'static',
  definition: {
    kind: 'recipe', description: 'Renders parent-supplied route data as a named navigation landmark and semantic ordered trail.',
    architecture: 'Breadcrumb owns no Model or route state. Typed link, current-page, and ellipsis values are per-render inputs; collapseBreadcrumbItems deterministically replaces only omitted middle ancestors.',
    apiHref: 'https://foldkit.dev/ui/link',
    composition: 'nav[aria-label]\n└── ol\n    ├── li → ancestor link\n    ├── presentational separator\n    ├── optional accessible ellipsis\n    └── li → current-page text[aria-current=page]',
    styling: 'Long labels wrap without widening the viewport. Collapse middle ancestors with maxItems before the trail becomes unreadable; the RTL direction mirrors only the default chevron.',
    accessibility: 'The nav landmark is explicitly named, the trail is an ordered list, separators are hidden, omitted levels have accessible text, and the current page is text with aria-current rather than a fake disabled link.',
    keyboard: [['Tab / Shift+Tab', 'Moves through ancestor links in document order.'], ['Enter', 'Follows the focused ancestor link.']],
    examples: [
      { title: 'Current path', description: 'Typed route values render linked ancestors and one non-link current page.', staticPreview: (_model, h) => preview(0, h), code: source('Current path', ', maxItems: 5') },
      { title: 'Collapsed middle', description: 'A finite limit preserves the first ancestor and current tail while describing omitted levels.', staticPreview: (_model, h) => preview(1, h), code: source('Collapsed middle', ', maxItems: 4') },
      { title: 'Long resource label', description: 'A long unbroken current label wraps within the available trail width.', staticPreview: (_model, h) => preview(2, h), code: source('Long resource label', ', ariaLabel: \'Resource path\'', `{ kind: 'link', label: 'Documentation', href: '/docs' },
    { kind: 'page', label: 'A-very-long-unbroken-resource-name-that-must-wrap-without-overflow' }`) },
      { title: 'RTL separator', description: 'RTL direction mirrors the default visual separator without changing semantic route order.', staticPreview: (_model, h) => preview(3, h), code: source('RTL separator', ", maxItems: 4, direction: 'rtl', ariaLabel: 'مسار الصفحة'") },
    ],
  },
})
