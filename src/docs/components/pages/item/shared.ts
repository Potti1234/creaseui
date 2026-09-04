import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const itemFixtures = [
  { title: 'Collection', description: 'Compose repeated items inside one semantic group.' },
  { title: 'Outlined', description: 'Use outline when an item needs a distinct boundary from its surrounding list.' },
  { title: 'Header and Footer', description: 'Use structured regions for metadata that belongs to the same item.' },
] as const;
const layout = (renderer: 'tailwind' | 'stylex'): string => renderer === 'stylex' ? 'layoutStyle: styles.wide' : "class: 'w-full max-w-lg'";
const body = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  if (index === 0) return `Item.itemGroup({ ${renderer === 'stylex' ? "layoutStyle: styles.wide, spacing: 'sm'" : "class: 'w-full max-w-lg gap-1'"}, children: [
  Item.item({ element: 'li', children: [
    Item.itemMedia({ variant: 'icon', children: ['D'] }, h),
    Item.itemContent({ children: [
      Item.itemTitle({ children: ['Documentation'] }, h),
      Item.itemDescription({ children: ['Guides and component references.'] }, h),
    ] }, h),
  ] }, h),
] }, h)`;
  if (index === 1) return `Item.item({ variant: 'outline', ${layout(renderer)}, children: [
  Item.itemContent({ children: [
    Item.itemTitle({ children: ['Registry source'] }, h),
    Item.itemDescription({ children: ['Copied into your application and owned by you.'] }, h),
  ] }, h),
] }, h)`;
  return `Item.item({ variant: 'muted', ${layout(renderer)}, children: [
  Item.itemHeader({ children: ['Build #418', 'Passed'] }, h),
  Item.itemContent({ children: [Item.itemTitle({ children: ['Documentation verification'] }, h)] }, h),
  Item.itemFooter({ children: ['main', '2 minutes ago'] }, h),
] }, h)`;
};
export const itemExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => itemFixtures.map((fixture, index) => ({ title: fixture.title, description: fixture.description, code: staticComponentApplication({ componentName: 'Item', componentSlug: 'item', renderer, exampleName: fixture.title, ...(renderer === 'stylex' ? { componentImports: "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ wide: { width: '100%', maxWidth: '32rem' } })" } : {}), viewBody: body(index, renderer) }) }));
