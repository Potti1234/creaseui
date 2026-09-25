import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const IMAGE_URL = 'https://avatar.vercel.sh/shadcn1';

export type AspectRatioFixture = Readonly<{
  title: string;
  description: string;
  ratioExpr: string;
  direction?: 'rtl';
  caption?: string;
  widthClass: { tailwind: string; stylex: 'w12' | 'w10' | 'w24' };
}>;

export const aspectRatioFixtures: Readonly<
  [AspectRatioFixture, ...Array<AspectRatioFixture>]
> = [
  {
    title: 'Square',
    description: 'A 1:1 ratio keeps avatars and artwork square.',
    ratioExpr: '1 / 1',
    widthClass: { tailwind: 'w-full max-w-48 overflow-hidden rounded-lg bg-muted', stylex: 'w12' },
  },
  {
    title: 'Portrait',
    description: 'A 9:16 ratio for portrait media.',
    ratioExpr: '9 / 16',
    widthClass: { tailwind: 'w-full max-w-40 overflow-hidden rounded-lg bg-muted', stylex: 'w10' },
  },
  {
    title: 'RTL',
    description: 'dir="rtl" with a figure caption for right-to-left layouts.',
    ratioExpr: '16 / 9',
    direction: 'rtl',
    caption: 'منظر طبيعي جميل',
    widthClass: { tailwind: 'w-full max-w-sm', stylex: 'w24' },
  },
]

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const fixture = aspectRatioFixtures[index] ?? aspectRatioFixtures[0];
  const isStyleX = renderer === 'stylex';
  const componentImports = isStyleX
    ? `import * as stylex from '@stylexjs/stylex'
import { className } from '@/stylex/style'`
    : '';
  const styles = isStyleX
    ? `\nconst styles = stylex.create({
  frame: { maxWidth: '${fixture.widthClass.stylex === 'w12' ? '12rem' : fixture.widthClass.stylex === 'w10' ? '10rem' : '24rem'}', width: '100%', borderRadius: '0.5rem', backgroundColor: 'var(--muted)', overflow: 'hidden' },
  content: { borderRadius: '0.5rem', objectFit: 'cover', width: '100%', height: '100%' },
  caption: { marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' },
})\n`
    : '';
  const imgExpr = `h.img([h.Src('${IMAGE_URL}'), h.Alt('Photo'), h.Class(${
    isStyleX ? "className(styles.content)" : `'rounded-lg object-cover w-full h-full grayscale dark:brightness-20'`
  })])`;
  const caption = fixture.caption
    ? `,\n      h.figcaption([h.Class(${isStyleX ? 'className(styles.caption)' : `'mt-2 text-center text-sm text-muted-foreground'`})], ['${fixture.caption}'])`
    : '';
  const viewBody = `h.figure(
      [h.Class(${isStyleX ? 'className(styles.frame)' : `'${fixture.widthClass.tailwind}'`})${fixture.direction === 'rtl' ? ", h.Dir('rtl')" : ''}],
      [
        AspectRatio.aspectRatio({
          ratio: ${fixture.ratioExpr},
          ${renderer === 'tailwind' ? `class: 'rounded-lg bg-muted overflow-hidden',` : ''}
          children: [${imgExpr}],
        }, h)${caption}
      ],
    )`;

  return staticComponentApplication({
    componentName: 'AspectRatio',
    componentSlug: 'aspect-ratio',
    renderer,
    exampleName: fixture.title,
    componentImports: `${componentImports}${styles}`,
    viewBody,
  });
};

export const aspectRatioExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => aspectRatioFixtures.map((fixture, index) => ({
  title: fixture.title,
  description: fixture.description,
  code: source(index, renderer),
}));
