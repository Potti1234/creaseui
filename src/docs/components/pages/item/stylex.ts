import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { itemFixtures } from '@/docs/components/pages/item/shared';
import * as Item from '@/stylex/item';

const styles = stylex.create({ wide: { width: '100%', maxWidth: '32rem' } });
const entry = <Msg>(title: string, description: string, h: HtmlBuilder<Msg>) => Item.item({ element: 'li', children: [Item.itemMedia({ variant: 'icon', children: [title.slice(0, 1)] }, h), Item.itemContent({ children: [Item.itemTitle({ children: [title] }, h), Item.itemDescription({ children: [description] }, h)] }, h)] }, h);
export const itemStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, _model: unknown, _onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = itemFixtures[index] ?? itemFixtures[0];
  if (fixture.title === 'Collection') return Item.itemGroup({ layoutStyle: styles.wide, spacing: 'sm', children: [entry('Documentation', 'Guides and component references.', h), entry('Examples', 'Complete Foldkit applications.', h)] }, h);
  if (fixture.title === 'Outlined') return Item.item({ variant: 'outline', layoutStyle: styles.wide, children: [Item.itemContent({ children: [Item.itemTitle({ children: ['Registry source'] }, h), Item.itemDescription({ children: ['Copied into your application and owned by you.'] }, h)] }, h)] }, h);
  return Item.item({ variant: 'muted', layoutStyle: styles.wide, children: [Item.itemHeader({ children: ['Build #418', 'Passed'] }, h), Item.itemContent({ children: [Item.itemTitle({ children: ['Documentation verification'] }, h)] }, h), Item.itemFooter({ children: ['main', '2 minutes ago'] }, h)] }, h);
};
