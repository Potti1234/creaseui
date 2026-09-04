import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const bubbleFixtures = [
  { title: 'Conversation', description: 'Map sender identity to alignment while preserving a chronological DOM order.' },
  { title: 'Reaction', description: 'Place reactions as supporting metadata without changing the message content.' },
  { title: 'Error', description: 'Use destructive tone for a failed message and include readable explanatory text.' },
] as const;

const body = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const contentVariant = (variant: string): string => renderer === 'stylex' ? ` variant: '${variant}',` : '';
  switch (index) {
    case 0: return `Bubble.bubbleGroup({
  ${renderer === 'stylex' ? 'layoutStyle: styles.group,' : "class: 'w-full max-w-md',"}
  children: [
    Bubble.bubble({ variant: 'secondary', align: 'start', children: [
      Bubble.bubbleContent({${contentVariant('secondary')} children: ['Can you review the Foldkit update?'] }, h),
    ] }, h),
    Bubble.bubble({ align: 'end', children: [
      Bubble.bubbleContent({ children: ['Yes — I will check the model and command flow.'] }, h),
    ] }, h),
  ],
}, h)`;
    case 1: return `Bubble.bubble({
  variant: 'tinted',
  children: [
    Bubble.bubbleContent({${contentVariant('tinted')} children: ['The documentation build passed.'] }, h),
    Bubble.bubbleReactions({ children: ['👍 3'] }, h),
  ],
}, h)`;
    default: return `Bubble.bubble({ variant: 'destructive', align: 'end', children: [
  Bubble.bubbleContent({${contentVariant('destructive')} children: ['Message could not be sent.'] }, h),
] }, h)`;
  }
};

export const bubbleExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => bubbleFixtures.map((fixture, index) => ({
  title: fixture.title, description: fixture.description,
  code: staticComponentApplication({ componentName: 'Bubble', componentSlug: 'bubble', renderer, exampleName: fixture.title, ...(renderer === 'stylex' && index === 0 ? { componentImports: "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ group: { width: '100%', maxWidth: '28rem' } })" } : {}), viewBody: body(index, renderer) }),
}));
