import * as Item from '@/ui/item';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => staticComponentApplication({ componentName: 'Item', componentSlug: 'item', exampleName: name, viewBody });

const entry = <Msg>(title: string, description: string, h: Parameters<typeof Item.item<Msg>>[1]) => Item.item({ element: 'li', children: [
  Item.itemMedia({ variant: 'icon', children: [title.slice(0, 1)] }, h),
  Item.itemContent({ children: [Item.itemTitle({ children: [title] }, h), Item.itemDescription({ children: [description] }, h)] }, h),
] }, h);

export const itemPage = authoredPage({
  slug: 'item', title: 'Item', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Composes media, copy, metadata, and actions into a reusable list item.',
    architecture: 'Item is a stateless composition helper. Collections and selection state remain in the parent Model and are mapped to item views.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'ItemGroup\n├── Item → ItemMedia / ItemContent / ItemActions\n│           └── ItemTitle / ItemDescription\n└── ItemSeparator',
    styling: 'Use li inside semantic collections and article for standalone feed entries. Variants change surface emphasis without changing document meaning.',
    accessibility: 'ItemGroup supplies list semantics and Item supplies listitem semantics. Preserve a useful title even when media is decorative.',
    examples: [
      {
        title: 'Collection', description: 'Compose repeated items inside one semantic group.',
        preview: (_model, h) => Item.itemGroup({ class: 'w-full max-w-lg gap-1', children: [entry('Documentation', 'Guides and component references.', h), entry('Examples', 'Complete Foldkit applications.', h)] }, h),
        code: source('Collection', `Item.itemGroup({ class: 'w-full max-w-lg gap-1', children: [
  Item.item({ element: 'li', children: [
    Item.itemMedia({ variant: 'icon', children: ['D'] }, h),
    Item.itemContent({ children: [
      Item.itemTitle({ children: ['Documentation'] }, h),
      Item.itemDescription({ children: ['Guides and component references.'] }, h),
    ] }, h),
  ] }, h),
] }, h),`),
      },
      {
        title: 'Outlined', description: 'Use outline when an item needs a distinct boundary from its surrounding list.',
        preview: (_model, h) => Item.item({ variant: 'outline', class: 'w-full max-w-lg', children: [Item.itemContent({ children: [Item.itemTitle({ children: ['Registry source'] }, h), Item.itemDescription({ children: ['Copied into your application and owned by you.'] }, h)] }, h)] }, h),
        code: source('Outlined', `Item.item({ variant: 'outline', class: 'w-full max-w-lg', children: [
  Item.itemContent({ children: [
    Item.itemTitle({ children: ['Registry source'] }, h),
    Item.itemDescription({ children: ['Copied into your application and owned by you.'] }, h),
  ] }, h),
] }, h),`),
      },
      {
        title: 'Header and Footer', description: 'Use structured regions for metadata that belongs to the same item.',
        preview: (_model, h) => Item.item({ variant: 'muted', class: 'w-full max-w-lg', children: [Item.itemHeader({ children: ['Build #418', 'Passed'] }, h), Item.itemContent({ children: [Item.itemTitle({ children: ['Documentation verification'] }, h)] }, h), Item.itemFooter({ children: ['main', '2 minutes ago'] }, h)] }, h),
        code: source('Header and Footer', `Item.item({ variant: 'muted', class: 'w-full max-w-lg', children: [
  Item.itemHeader({ children: ['Build #418', 'Passed'] }, h),
  Item.itemContent({ children: [Item.itemTitle({ children: ['Documentation verification'] }, h)] }, h),
  Item.itemFooter({ children: ['main', '2 minutes ago'] }, h),
] }, h),`),
      },
    ],
  },
});
