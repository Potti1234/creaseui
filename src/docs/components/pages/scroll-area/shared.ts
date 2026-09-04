import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const scrollAreaItems = Array.from({ length: 18 }, (_, index) => `Component ${String(index + 1)}`);
export const scrollAreaFixtures = [
  { title: 'Vertical', description: 'Bound the height and label the independently scrollable list.', orientation: 'vertical' },
  { title: 'Horizontal', description: 'Use horizontal overflow for a deliberate one-line sequence.', orientation: 'horizontal' },
] as const;
const body = (fixture: (typeof scrollAreaFixtures)[number], renderer: 'tailwind' | 'stylex'): string => fixture.orientation === 'vertical' ? (renderer === 'tailwind' ? `ScrollArea.scrollArea({
  orientation: 'vertical', ariaLabel: 'Component list', class: 'h-56 w-72 rounded-md border p-3',
  children: Array.from({ length: 18 }, (_, index) => h.div([h.Class('border-b py-2 text-sm')], [\`Component \${index + 1}\`])),
}, h)` : `h.div([h.Class(stylex.props(styles.verticalFrame).className ?? '')], [
  ScrollArea.scrollArea({ orientation: 'vertical', ariaLabel: 'Component list', children: [
    h.div([h.Class(stylex.props(styles.verticalContent).className ?? '')], Array.from({ length: 18 }, (_, index) =>
      h.div([h.Class(stylex.props(styles.row).className ?? '')], [\`Component \${index + 1}\`]),
    )),
  ] }, h),
])`) : (renderer === 'tailwind' ? `ScrollArea.scrollArea({
  orientation: 'horizontal', ariaLabel: 'Release versions', class: 'w-80 rounded-md border p-4',
  children: [h.div([h.Class('flex w-max gap-3')], ['Component 1', 'Component 2', 'Component 3', 'Component 4', 'Component 5', 'Component 6', 'Component 7', 'Component 8'].map(version => h.span([h.Class('rounded-md bg-muted px-3 py-2')], [version])))],
}, h)` : `h.div([h.Class(stylex.props(styles.horizontalFrame).className ?? '')], [
  ScrollArea.scrollArea({ orientation: 'horizontal', ariaLabel: 'Release versions', children: [
    h.div([h.Class(stylex.props(styles.horizontalContent).className ?? '')], ['Component 1', 'Component 2', 'Component 3', 'Component 4', 'Component 5', 'Component 6', 'Component 7', 'Component 8'].map(version => h.span([h.Class(stylex.props(styles.pill).className ?? '')], [version]))),
  ] }, h),
])`);
const styleImports = "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ verticalFrame: { overflow: 'hidden', height: '14rem', width: '18rem', borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: 1 }, verticalContent: { padding: '0.75rem' }, row: { borderBottomColor: 'var(--border)', borderBottomStyle: 'solid', borderBottomWidth: 1, paddingBlock: '0.5rem', fontSize: '0.875rem' }, horizontalFrame: { overflow: 'hidden', height: '5rem', width: '20rem', borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: 1 }, horizontalContent: { gap: '0.75rem', padding: '1rem', display: 'flex', width: 'max-content' }, pill: { borderRadius: '0.375rem', paddingBlock: '0.5rem', paddingInline: '0.75rem', backgroundColor: 'var(--muted)', fontSize: '0.875rem' } })";
export const scrollAreaExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => scrollAreaFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: staticComponentApplication({ componentName: 'ScrollArea', componentSlug: 'scroll-area', renderer, exampleName: fixture.title, ...(renderer === 'stylex' ? { componentImports: styleImports } : {}), viewBody: body(fixture, renderer) }) }));
