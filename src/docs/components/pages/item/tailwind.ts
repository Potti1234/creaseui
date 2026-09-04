import type { Html, HtmlBuilder } from 'foldkit/html';
import { itemFixtures } from '@/docs/components/pages/item/shared';
import * as Item from '@/ui/item';

export type ItemStaticPreview = <Msg>(model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => Html;
const entry = <Msg>(title: string, description: string, h: HtmlBuilder<Msg>) => Item.item({ element: 'li', children: [Item.itemMedia({ variant: 'icon', children: [title.slice(0, 1)] }, h), Item.itemContent({ children: [Item.itemTitle({ children: [title] }, h), Item.itemDescription({ children: [description] }, h)] }, h)] }, h);
export const itemTailwindPreviews: ReadonlyArray<ItemStaticPreview> = itemFixtures.map((_fixture, index) => <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => {
  if (index === 0) return Item.itemGroup({ class: 'w-full max-w-lg gap-1', children: [entry('Documentation', 'Guides and component references.', h), entry('Examples', 'Complete Foldkit applications.', h)] }, h);
  if (index === 1) return Item.item({ variant: 'outline', class: 'w-full max-w-lg', children: [Item.itemContent({ children: [Item.itemTitle({ children: ['Registry source'] }, h), Item.itemDescription({ children: ['Copied into your application and owned by you.'] }, h)] }, h)] }, h);
  return Item.item({ variant: 'muted', class: 'w-full max-w-lg', children: [Item.itemHeader({ children: ['Build #418', 'Passed'] }, h), Item.itemContent({ children: [Item.itemTitle({ children: ['Documentation verification'] }, h)] }, h), Item.itemFooter({ children: ['main', '2 minutes ago'] }, h)] }, h);
});
