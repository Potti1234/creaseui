import * as Direction from '@/ui/direction';
import * as Button from '@/ui/button';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, statelessComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => statelessComponentApplication({
  componentName: 'Direction', componentSlug: 'direction', exampleName: name, viewBody,
  componentImports: `import * as Button from '@/ui/button'`,
});
const clicked = State.ClickedPreviewAction();

export const directionPage = authoredPage({
  slug: 'direction', title: 'Direction', kind: 'helper',
  definition: {
    kind: 'helper', description: 'Sets left-to-right or right-to-left writing direction for a subtree.',
    architecture: 'Direction is a stateless wrapper around the native dir attribute. It changes layout context without introducing component state.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'Prefer setting direction at the document root. Use this helper for isolated previews or mixed-direction regions.',
    accessibility: 'Correct direction improves reading order and punctuation for assistive technology. Do not use CSS flex reversal as a substitute.',
    examples: [
      {
        title: 'Right to Left', description: 'Apply RTL direction to content and direction-aware child controls.',
        preview: (_model, h) => Direction.direction({ direction: 'rtl', class: 'flex items-center gap-3', children: [Button.button({ onClick: clicked, children: ['التالي', '←'] }, h)] }, h),
        code: source('Right to Left', `Direction.direction({
  direction: 'rtl',
  class: 'flex items-center gap-3',
  children: [Button.button({ onClick: ClickedExample(), children: ['التالي', '←'] }, h)],
}, h),`),
      },
      {
        title: 'Mixed Direction', description: 'Nest a local LTR token inside an RTL sentence when the content requires it.',
        preview: (_model, h) => Direction.direction({ direction: 'rtl', children: ['الإصدار ', Direction.direction({ direction: 'ltr', class: 'inline-block font-mono', children: ['v0.137.0'] }, h)] }, h),
        code: source('Mixed Direction', `Direction.direction({ direction: 'rtl', children: [
  'الإصدار ',
  Direction.direction({ direction: 'ltr', class: 'inline-block font-mono', children: ['v0.137.0'] }, h),
] }, h),`),
      },
    ],
  },
});
