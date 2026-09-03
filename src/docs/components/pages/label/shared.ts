import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const stylexImports = `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  field: { display: 'grid', gap: '0.5rem', maxWidth: '24rem', width: '100%' },
  input: {
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    borderStyle: 'solid',
    borderWidth: 1,
    height: '2.25rem',
    paddingInline: '0.75rem',
  },
  supporting: { color: 'var(--muted-foreground)', fontSize: '0.75rem' },
})`;

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => staticComponentApplication({
  componentName: 'Label',
  componentSlug: 'label',
  renderer,
  exampleName: index === 0 ? 'Input Label' : 'Supporting Text',
  ...(renderer === 'stylex' ? { componentImports: stylexImports } : {}),
  viewBody: index === 0
    ? `h.div([${renderer === 'tailwind' ? "h.Class('grid w-full max-w-sm gap-2')" : "h.Class(stylex.props(styles.field).className ?? '')"}], [
  Label.label({ for: 'email', children: ['Email address'] }, h),
  h.input([
    h.Id('email'),
    h.Type('email'),
    ${renderer === 'tailwind' ? "h.Class('h-9 rounded-md border px-3')" : "h.Class(stylex.props(styles.input).className ?? '')"},
  ]),
]),`
    : `h.div([${renderer === 'tailwind' ? "h.Class('grid w-full max-w-sm gap-2')" : "h.Class(stylex.props(styles.field).className ?? '')"}], [
  Label.label({ for: 'project', children: ['Project name'] }, h),
  h.input([
    h.Id('project'),
    ${renderer === 'tailwind' ? "h.Class('h-9 rounded-md border px-3')" : "h.Class(stylex.props(styles.input).className ?? '')"},
  ]),
  h.p([${renderer === 'tailwind' ? "h.Class('text-xs text-muted-foreground')" : "h.Class(stylex.props(styles.supporting).className ?? '')"}], [
    'Use 3–32 characters.',
  ]),
]),`,
});

export const labelExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Input Label',
    description: 'Match the label for value to the input id.',
    code: source(0, renderer),
  },
  {
    title: 'Supporting Text',
    description: 'Keep requirements adjacent to the labeled control.',
    code: source(1, renderer),
  },
];
