import type { DocsExample } from '@/docs/components/page-definition';
import { statelessComponentApplication } from '@/docs/components/pages/authored-page';

const rowImports = `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    justifyContent: 'center',
  },
})`;

const source = (
  name: string,
  renderer: 'tailwind' | 'stylex',
  viewBody: string,
  componentImports?: string,
): string => statelessComponentApplication({
  componentName: 'Button',
  componentSlug: 'button',
  renderer,
  exampleName: name,
  viewBody,
  ...(componentImports === undefined ? {} : { componentImports }),
});

const rowClass = (renderer: 'tailwind' | 'stylex'): string =>
  renderer === 'tailwind'
    ? "h.Class('flex flex-wrap items-center justify-center gap-3')"
    : "h.Class(stylex.props(styles.row).className ?? '')";

export const buttonExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Basic',
    description: 'Pass a domain message to onClick. The view stays pure and the update function owns the resulting state change.',
    code: source('Basic', renderer, `Button.button({
  onClick: ClickedExample(),
  children: [\`Clicked \${model.clickCount} times\`],
}, h),`),
  },
  {
    title: 'Variants',
    description: 'Use semantic variants to communicate hierarchy without changing the Foldkit message flow.',
    code: source('Variants', renderer, `h.div([${rowClass(renderer)}], [
  Button.button({ onClick: ClickedExample(), children: ['Primary'] }, h),
  Button.button({ variant: 'secondary', onClick: ClickedExample(), children: ['Secondary'] }, h),
  Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Outline'] }, h),
  Button.button({ variant: 'ghost', onClick: ClickedExample(), children: ['Ghost'] }, h),
  Button.button({ variant: 'destructive', onClick: ClickedExample(), children: ['Delete'] }, h),
]),`, renderer === 'stylex' ? rowImports : undefined),
  },
  {
    title: 'Sizes',
    description: 'Size changes the control’s hit area and density while preserving the same typed Message.',
    code: source('Sizes', renderer, `h.div([${rowClass(renderer)}], [
  Button.button({ size: 'sm', onClick: ClickedExample(), children: ['Small'] }, h),
  Button.button({ onClick: ClickedExample(), children: ['Default'] }, h),
  Button.button({ size: 'lg', onClick: ClickedExample(), children: ['Large'] }, h),
  Button.button({ size: 'icon', onClick: ClickedExample(), children: ['+'] }, h),
]),`, renderer === 'stylex' ? rowImports : undefined),
  },
  {
    title: 'Loading',
    description: 'Disable the button while work is in flight and pair the state with a visible progress label.',
    code: source('Loading', renderer, `Button.button({
  isLoading: true,
  loadingContent: [Spinner.spinner({ isDecorative: true, size: 'md' }, h)],
  children: ['Save changes'],
}, h),`, `import * as Spinner from '@/${renderer === 'tailwind' ? 'ui' : 'stylex'}/spinner'`),
  },
  {
    title: 'Button Group',
    description: 'Group related actions visually while each button continues to dispatch an ordinary application Message.',
    code: source('Button Group', renderer, `ButtonGroup.buttonGroup({
  children: [
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Back'] }, h),
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Next'] }, h),
  ],
}, h),`, `import * as ButtonGroup from '@/${renderer === 'tailwind' ? 'ui' : 'stylex'}/button-group'`),
  },
  {
    title: 'As Link',
    description: 'Use buttonLink for navigation so the rendered element retains link semantics.',
    code: source('As Link', renderer, `Button.buttonLink({
  href: 'https://foldkit.dev',
  target: '_blank',
  children: ['Foldkit docs ↗'],
}, h),`),
  },
  {
    title: 'RTL',
    description: 'Direction comes from the surrounding document or region; the button requires no alternate state model.',
    code: source('RTL', renderer, `h.div([h.Dir('rtl')], [
  Button.button({ onClick: ClickedExample(), children: ['التالي', '←'] }, h),
]),`),
  },
];
