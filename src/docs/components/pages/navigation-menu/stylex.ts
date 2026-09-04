import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as NavigationMenu from '@/stylex/navigation-menu';
import type * as Popover from '@/stylex/popover';

const styles = stylex.create({
  sample: { display: 'grid', gap: '0.75rem' },
  routeButton: { borderColor: 'var(--border)', borderRadius: '0.25rem', borderStyle: 'solid', borderWidth: '1px', fontSize: '0.875rem', paddingBlock: '0.25rem', paddingInline: '0.75rem', width: 'max-content' },
  content: { display: 'grid', gap: '0.25rem' },
  contentLink: { borderRadius: '0.25rem', display: 'block', padding: '0.5rem' },
});

const links = <Msg>(activeRoute: string, layout: NavigationMenu.NavigationMenuLayout, direction: 'ltr' | 'rtl', labels: ReadonlyArray<string>, h: HtmlBuilder<Msg>) => NavigationMenu.navigationMenu({ ariaLabel: 'Primary', layout, direction, children: [NavigationMenu.navigationMenuList({ layout, children: labels.map(label => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: `/${label.toLowerCase()}`, isActive: activeRoute === label.toLowerCase(), children: [label] }, h)] }, h)) }, h)] }, h);
const content = <Msg>(h: HtmlBuilder<Msg>) => h.ul([h.Class(stylex.props(styles.content).className ?? '')], [h.li([], [h.a([h.Href('/products/analytics'), h.Class(stylex.props(styles.contentLink).className ?? '')], ['Analytics'])]), h.li([], [h.a([h.Href('/products/reports'), h.Class(stylex.props(styles.contentLink).className ?? '')], ['Reports'])])]);

export const navigationMenuStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const preview = model as { products: Popover.Model; route: 'home' | 'docs' };
  const sendPopover = (message: Popover.Message) => onMessageJson(JSON.stringify({ _tag: 'GotNavigationPreviewMessage', message }));
  if (index === 0) return h.div([h.Class(stylex.props(styles.sample).className ?? '')], [links(preview.route, 'inline', 'ltr', ['Home', 'Components', 'Docs'], h), h.button([h.Type('button'), h.OnClick(onMessageJson(JSON.stringify({ _tag: 'ChangedNavigationRoute', route: preview.route === 'home' ? 'docs' : 'home' }))), h.Class(stylex.props(styles.routeButton).className ?? '')], ['Reflect external route'])]);
  if (index === 1) return NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [NavigationMenu.navigationMenuList({ children: [NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '/', isActive: true, children: ['Home'] }, h)] }, h), NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuDisclosure({ model: preview.products, toParentMessage: sendPopover, label: 'Products', pointerIntent: 'hover-and-press', content: content(h) }, h)] }, h)] }, h)] }, h);
  return links(preview.route, index === 2 ? 'responsive' : 'scroll', index === 3 ? 'rtl' : 'ltr', index === 3 ? ['Home', 'Products', 'Solutions', 'Customers', 'Resources', 'Company', 'Docs'] : ['Home', 'Components', 'Docs'], h);
};
