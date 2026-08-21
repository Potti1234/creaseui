import * as ScrollArea from '@/ui/scroll-area';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => staticComponentApplication({ componentName: 'ScrollArea', componentSlug: 'scroll-area', exampleName: name, viewBody });
const items = Array.from({ length: 18 }, (_, index) => `Component ${String(index + 1)}`);

export const scrollAreaPage = authoredPage({
  slug: 'scroll-area', title: 'Scroll Area', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Provides a focusable overflow region with restrained native scrollbar styling.',
    architecture: 'Scroll Area is stateless and uses native scrolling. Scroll position remains browser-owned unless the application explicitly models restoration.',
    apiHref: 'https://foldkit.dev/core/preserve-scroll',
    styling: 'Always give the area a bounded height or width. Choose only the overflow axes the content actually needs.',
    accessibility: 'Give meaningful standalone regions an ariaLabel. The default tabindex makes keyboard scrolling available without custom key handlers.',
    examples: [
      {
        title: 'Vertical', description: 'Bound the height and label the independently scrollable list.',
        preview: (_model, h) => ScrollArea.scrollArea({ orientation: 'vertical', ariaLabel: 'Component list', class: 'h-56 w-72 rounded-md border p-3', children: items.map((item) => h.div([h.Class('border-b py-2 text-sm last:border-0')], [item])) }, h),
        code: source('Vertical', `ScrollArea.scrollArea({
  orientation: 'vertical',
  ariaLabel: 'Component list',
  class: 'h-56 w-72 rounded-md border p-3',
  children: Array.from({ length: 18 }, (_, index) =>
    h.div([h.Class('border-b py-2 text-sm')], [\`Component \${index + 1}\`]),
  ),
}, h),`),
      },
      {
        title: 'Horizontal', description: 'Use horizontal overflow for a deliberate one-line sequence.',
        preview: (_model, h) => ScrollArea.scrollArea({ orientation: 'horizontal', ariaLabel: 'Release versions', class: 'w-80 rounded-md border p-4', children: [h.div([h.Class('flex w-max gap-3')], items.slice(0, 8).map((item) => h.span([h.Class('rounded-md bg-muted px-3 py-2 text-sm')], [item])))] }, h),
        code: source('Horizontal', `ScrollArea.scrollArea({
  orientation: 'horizontal',
  ariaLabel: 'Release versions',
  class: 'w-80 rounded-md border p-4',
  children: [h.div([h.Class('flex w-max gap-3')], [
    'Component 1', 'Component 2', 'Component 3', 'Component 4',
    'Component 5', 'Component 6', 'Component 7', 'Component 8',
  ].map(version =>
    h.span([h.Class('rounded-md bg-muted px-3 py-2')], [version]),
  ))],
}, h),`),
      },
    ],
  },
});
