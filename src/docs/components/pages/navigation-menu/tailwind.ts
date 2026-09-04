import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as NavigationMenu from '@/ui/navigation-menu';
import * as Popover from '@/ui/popover';

const links = <Msg>(activeRoute: string, layout: NavigationMenu.NavigationMenuLayout, direction: 'ltr' | 'rtl', labels: ReadonlyArray<string>, h: HtmlBuilder<Msg>) => NavigationMenu.navigationMenu({ ariaLabel: 'Primary', layout, direction, children: [NavigationMenu.navigationMenuList({ layout, children: labels.map(label => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: `/${label.toLowerCase()}`, isActive: activeRoute === label.toLowerCase(), children: [label] }, h)] }, h)) }, h)] }, h);
const content = <Msg>(h: HtmlBuilder<Msg>) => h.ul([h.Class('grid gap-1')], [h.li([], [h.a([h.Href('/products/analytics'), h.Class('block rounded p-2 hover:bg-accent')], ['Analytics'])]), h.li([], [h.a([h.Href('/products/reports'), h.Class('block rounded p-2 hover:bg-accent')], ['Reports'])])]);
const GotNavigationPreviewMessage = m('GotNavigationPreviewMessage', { message: Popover.Message });
const ChangedNavigationRoute = m('ChangedNavigationRoute', { route: S.Literals(['home', 'docs']) });
const NavigationPreviewMessage = S.Union([GotNavigationPreviewMessage, ChangedNavigationRoute]);
type NavigationPreviewMessage = typeof NavigationPreviewMessage.Type;
const NavigationPreviewModel = S.Struct({ _docsPage: S.Literal('navigation-menu'), products: Popover.Model, route: S.Literals(['home', 'docs']) });
type NavigationPreviewModel = typeof NavigationPreviewModel.Type;

export const navigationMenuTailwindPreviewProgram = definePreviewProgram<NavigationPreviewModel, NavigationPreviewMessage>({
  Model: NavigationPreviewModel, Message: NavigationPreviewMessage,
  init: index => ({ _docsPage: 'navigation-menu', products: Popover.init({ id: `docs-navigation-products-${String(index)}`, isAnimated: true, contentFocus: true }), route: 'home' }),
  update: (model, message) => {
    if (message._tag === 'ChangedNavigationRoute') return [{ ...model, route: message.route }, []];
    const [products, commands] = Popover.update(model.products, message.message);
    return [{ ...model, products }, Command.mapMessages(commands, next => GotNavigationPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => index === 0
    ? h.div([h.Class('grid gap-3')], [links(model.route, 'inline', 'ltr', ['Home', 'Components', 'Docs'], h), h.button([h.Type('button'), h.OnClick(ChangedNavigationRoute({ route: model.route === 'home' ? 'docs' : 'home' })), h.Class('w-fit rounded border px-3 py-1 text-sm')], ['Reflect external route'])])
    : index === 1
      ? NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [NavigationMenu.navigationMenuList({ children: [NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '/', isActive: true, children: ['Home'] }, h)] }, h), NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuDisclosure({ model: model.products, toParentMessage: message => GotNavigationPreviewMessage({ message }), label: 'Products', pointerIntent: 'hover-and-press', content: content(h) }, h)] }, h)] }, h)] }, h)
      : links(model.route, index === 2 ? 'responsive' : 'scroll', index === 3 ? 'rtl' : 'ltr', index === 3 ? ['Home', 'Products', 'Solutions', 'Customers', 'Resources', 'Company', 'Docs'] : ['Home', 'Components', 'Docs'], h),
});
