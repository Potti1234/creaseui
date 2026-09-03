import type { Html, HtmlBuilder } from 'foldkit/html';

import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

type StaticPreview = <Msg>(
  model: Readonly<Record<string, never>>,
  h: HtmlBuilder<Msg>,
) => Html;

const metadata = [
  {
    title: 'Determinate',
    description: 'Pass a numeric percentage when total work is known.',
    tailwindView: `Progress.progress({ value: 64, max: 80, ariaLabel: 'Upload progress', valueText: '64 of 80 files', class: 'max-w-md' }, h),`,
    stylexView: `Progress.progress({ value: 64, max: 80, ariaLabel: 'Upload progress', valueText: '64 of 80 files', layoutStyle: styles.wide }, h),`,
  },
  {
    title: 'Indeterminate',
    description: 'Pass null while work is active but its total cannot be measured.',
    tailwindView: `Progress.progress({ value: null, ariaLabel: 'Loading report', valueText: 'Loading', class: 'max-w-md' }, h),`,
    stylexView: `Progress.progress({ value: null, ariaLabel: 'Loading report', valueText: 'Loading', layoutStyle: styles.wide }, h),`,
  },
  {
    title: 'Narrow range',
    description: 'A compact track still reports its normalized custom range.',
    tailwindView: `Progress.progress({ value: 3, max: 4, ariaLabel: 'Setup progress', valueText: '3 of 4 steps', class: 'w-24' }, h),`,
    stylexView: `Progress.progress({ value: 3, max: 4, ariaLabel: 'Setup progress', valueText: '3 of 4 steps', layoutStyle: styles.narrow }, h),`,
  },
] as const;

export const progressExamples = (
  renderer: 'tailwind' | 'stylex',
  staticPreviews: ReadonlyArray<StaticPreview> = [],
): ReadonlyArray<DocsExample> => metadata.map((item, index) => ({
  title: item.title,
  description: item.description,
  ...(staticPreviews[index] === undefined
    ? {}
    : { staticPreview: staticPreviews[index] }),
  code: staticComponentApplication({
    componentName: 'Progress',
    componentSlug: 'progress',
    renderer,
    exampleName: item.title,
    ...(renderer === 'stylex'
      ? {
          componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  wide: { maxWidth: '28rem' },
  narrow: { width: '6rem' },
})`,
        }
      : {}),
    viewBody: renderer === 'tailwind' ? item.tailwindView : item.stylexView,
  }),
}));
