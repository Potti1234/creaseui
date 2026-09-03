import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const keySource = (renderer: 'tailwind' | 'stylex'): string =>
  staticComponentApplication({
    componentName: 'Kbd',
    componentSlug: 'kbd',
    renderer,
    exampleName: 'Key',
    ...(renderer === 'stylex'
      ? {
          componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({ instruction: { fontSize: '0.875rem' } })`,
        }
      : {}),
    viewBody: `h.p([${
      renderer === 'tailwind'
        ? "h.Class('text-sm')"
        : "h.Class(stylex.props(styles.instruction).className ?? '')"
    }], [
  'Press ',
  Kbd.kbd({ children: ['Esc'] }, h),
  ' to close.',
]),`,
  });

export const kbdExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Key',
    description: 'Display a single key inline with instructions.',
    code: keySource(renderer),
  },
  {
    title: 'Shortcut',
    description: 'Group keys that form one shortcut.',
    code: staticComponentApplication({
      componentName: 'Kbd',
      componentSlug: 'kbd',
      renderer,
      exampleName: 'Shortcut',
      viewBody: `Kbd.kbdGroup({
  children: [
    Kbd.kbd({ children: ['⌘'] }, h),
    Kbd.kbd({ children: ['K'] }, h),
  ],
}, h),`,
    }),
  },
];
