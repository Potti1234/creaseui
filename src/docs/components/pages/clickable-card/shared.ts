import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export type ClickableCardFixture = Readonly<{
  title: string;
  description: string;
  label: string;
  elevation?: 'med';
  kind: 'settings' | 'report' | 'product';
}>;

/* Example set ported from Meta Astryx
   packages/cli/assets/templates/blocks/components/Card/ClickableCard*.tsx —
   same demos, same labels and copy. */
export const clickableCardFixtures: Readonly<
  [ClickableCardFixture, ...Array<ClickableCardFixture>]
> = [
  {
    title: 'ClickableCard',
    description:
      'A clickable card that navigates on click. Nested interactive elements work independently.',
    label: 'Settings',
    kind: 'settings',
  },
  {
    title: 'ClickableCard — Elevated',
    description:
      'A clickable card raised with `elevation="med"` so the shadow signals the whole surface is interactive.',
    label: 'Open report',
    elevation: 'med',
    kind: 'report',
  },
  {
    title: 'ClickableCardWithNestedButton',
    description:
      'A product card that navigates on click but has an independent "Add to cart" button inside.',
    label: 'Product',
    kind: 'product',
  },
];

const ui = (renderer: 'tailwind' | 'stylex'): string =>
  renderer === 'stylex' ? 'stylex' : 'ui';

const cls = (
  renderer: 'tailwind' | 'stylex',
  tailwindValue: string,
  styleKey: string,
): string =>
  renderer === 'tailwind'
    ? `h.Class('${tailwindValue}')`
    : `h.Class(stylex.props(styles.${styleKey}).className ?? '')`;

const STYLEX_STYLES = {
  stack2: `{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }`,
  stack3: `{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }`,
  stack1: `{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }`,
  heading: `{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' }`,
  body: `{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--muted-foreground)' }`,
} as const;
type StylexStyleKey = keyof typeof STYLEX_STYLES;

const stylexImports = (keys: ReadonlyArray<StylexStyleKey>): string =>
  `import * as stylex from '@stylexjs/stylex'\n\nconst styles = stylex.create({\n${keys.map(k => `  ${k}: ${STYLEX_STYLES[k]},`).join('\n')}\n})`;

const textBlock = (
  renderer: 'tailwind' | 'stylex',
  heading: string,
  body: string,
): string => `h.div([${cls(renderer, 'flex flex-col gap-2', 'stack2')}], [
        h.h4([${cls(renderer, 'scroll-m-20 text-xl font-semibold tracking-tight', 'heading')}], ['${heading}']),
        h.p([${cls(renderer, 'text-sm text-muted-foreground', 'body')}], ['${body}']),
      ])`;

const bodySource = (
  fixture: ClickableCardFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  switch (fixture.kind) {
    case 'settings':
      return textBlock(
        renderer,
        'Settings',
        'Click anywhere on this card to navigate. Nested buttons and links work independently.',
      );
    case 'report':
      return textBlock(
        renderer,
        'Quarterly report',
        'A raised shadow signals the whole card is clickable, lifting it above the surrounding content.',
      );
    case 'product':
      return `h.div([${cls(renderer, 'flex flex-col gap-3', 'stack3')}], [
        h.div([${cls(renderer, 'flex flex-col gap-1', 'stack1')}], [
          h.h4([${cls(renderer, 'scroll-m-20 text-xl font-semibold tracking-tight', 'heading')}], ['Wireless Headphones']),
          h.p([${cls(renderer, 'text-sm text-muted-foreground', 'body')}], ['$79.99']),
        ]),
        Button.button({ variant: 'default', children: ['Add to cart'] }, h),
      ])`;
  }
};

const styleKeysFor = (
  kind: ClickableCardFixture['kind'],
): ReadonlyArray<StylexStyleKey> =>
  kind === 'product'
    ? ['stack3', 'stack1', 'heading', 'body']
    : ['stack2', 'heading', 'body'];

const source = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const fixture = clickableCardFixtures[index] ?? clickableCardFixtures[0];
  const componentImports = [
    ...(fixture.kind === 'product'
      ? [`import * as Button from '@/${ui(renderer)}/button'`]
      : []),
    ...(renderer === 'stylex' ? [stylexImports(styleKeysFor(fixture.kind))] : []),
  ]
    .filter(Boolean)
    .join('\n');
  return staticComponentApplication({
    componentName: 'ClickableCard',
    componentSlug: 'clickable-card',
    renderer,
    exampleName: fixture.title,
    componentImports,
    viewBody: `ClickableCard.clickableCard({
      label: '${fixture.label}',
      href: '#',
      width: '20rem',${fixture.elevation === undefined ? '' : `\n      elevation: '${fixture.elevation}',`}
      children: [
        ${bodySource(fixture, renderer)},
      ],
    }, h)`,
  });
};

export const clickableCardExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  clickableCardFixtures.map((fixture, index) => ({
    title: fixture.title,
    description: fixture.description,
    code: source(index, renderer),
  }));
