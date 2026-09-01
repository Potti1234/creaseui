import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as NavigationMenu from '@/ui/navigation-menu';
import * as Popover from '@/ui/popover';

const links = <Msg>(activeRoute: string, layout: NavigationMenu.NavigationMenuLayout, direction: 'ltr' | 'rtl', labels: ReadonlyArray<string>, h: HtmlBuilder<Msg>) => NavigationMenu.navigationMenu({ ariaLabel: 'Primary', layout, direction, children: [NavigationMenu.navigationMenuList({ layout, children: labels.map((label) => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: `/${label.toLowerCase()}`, isActive: activeRoute === label.toLowerCase(), children: [label] }, h)] }, h)) }, h)] }, h);

const disclosureSource = foldkitApplication({
  title: 'Navigation Menu — Disclosure',
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as NavigationMenu from '@/ui/navigation-menu'
import * as Popover from '@/ui/popover'`,
  model: `export const Model = S.Struct({ products: Popover.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotProductsMessage = m('GotNavigationProductsMessage', { message: Popover.Message })
export const Message = S.Union([GotProductsMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { products: Popover.init({ id: 'products-navigation', isAnimated: true, contentFocus: true }) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotNavigationProductsMessage': {
      const [products, commands] = Popover.update(model.products, message.message)
      return [{ ...model, products }, Command.mapMessages(commands, next => GotProductsMessage({ message: next }))]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Navigation Menu — Disclosure',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [
      NavigationMenu.navigationMenuList({ children: [
        NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '/', isActive: true, children: ['Home'] }, h)] }, h),
        NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuDisclosure({
          model: model.products,
          toParentMessage: message => GotProductsMessage({ message }),
          label: 'Products',
          pointerIntent: 'hover-and-press',
          content: h.ul([h.Class('grid gap-1')], [
            h.li([], [h.a([h.Href('/products/analytics'), h.Class('block rounded p-2 hover:bg-accent')], ['Analytics'])]),
            h.li([], [h.a([h.Href('/products/reports'), h.Class('block rounded p-2 hover:bg-accent')], ['Reports'])]),
          ]),
        }, h)] }, h),
      ] }, h),
    ] }, h),
  ]),
})`,
});

const GotNavigationPreviewMessage = m('GotNavigationPreviewMessage', { message: Popover.Message });
const ChangedNavigationRoute = m('ChangedNavigationRoute', { route: S.Literals(['home', 'docs']) });
const NavigationPreviewMessage = S.Union([GotNavigationPreviewMessage, ChangedNavigationRoute]);
type NavigationPreviewMessage = typeof NavigationPreviewMessage.Type;
const NavigationPreviewModel = S.Struct({ _docsPage: S.Literal('navigation-menu'), products: Popover.Model, route: S.Literals(['home', 'docs']) });
type NavigationPreviewModel = typeof NavigationPreviewModel.Type;
const previewProgram = definePreviewProgram<NavigationPreviewModel, NavigationPreviewMessage>({
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
      ? NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [NavigationMenu.navigationMenuList({ children: [NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '/', isActive: true, children: ['Home'] }, h)] }, h), NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuDisclosure({ model: model.products, toParentMessage: message => GotNavigationPreviewMessage({ message }), label: 'Products', pointerIntent: 'hover-and-press', content: h.ul([h.Class('grid gap-1')], [h.li([], [h.a([h.Href('/products/analytics'), h.Class('block rounded p-2 hover:bg-accent')], ['Analytics'])]), h.li([], [h.a([h.Href('/products/reports'), h.Class('block rounded p-2 hover:bg-accent')], ['Reports'])])]) }, h)] }, h)] }, h)] }, h)
      : links(model.route, index === 2 ? 'responsive' : 'scroll', index === 3 ? 'rtl' : 'ltr', index === 3 ? ['Home', 'Products', 'Solutions', 'Customers', 'Resources', 'Company', 'Docs'] : ['Home', 'Components', 'Docs'], h),
});

export const navigationMenuPage = authoredPage({
  slug: 'navigation-menu', title: 'Navigation Menu', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'Composes parent-controlled route links with optional Foldkit Popover disclosure behavior and finite responsive layouts.',
    architecture: 'Route/current item stays in the parent or router and is passed to semantic link helpers each render. Only disclosures receive a Popover child Model. Layout and direction are finite view inputs; link data never enters interaction state.',
    apiHref: 'https://foldkit.dev/ui/popover',
    composition: 'nav landmark\n└── ul\n    ├── li → active/current link\n    └── li → disclosure trigger\n        └── Popover child Model → navigation links',
    styling: 'Use ordinary links for destinations and reserve disclosures for small link collections. Choose responsive for a stacked narrow fallback or scroll for deliberate horizontal overflow.',
    accessibility: 'The helpers render nav, list, list-item, link, and aria-current semantics. Name multiple navigation landmarks distinctly. Unlike Radix Navigation Menu, disclosures deliberately use canonical Popover press/focus behavior; optional hover intent only opens and outside/Escape dismissal remains canonical.',
    keyboard: [['Tab / Shift+Tab', 'Moves through links and disclosure triggers in document order.'], ['Enter', 'Follows a link or opens the focused disclosure.'], ['Escape', 'Closes an open disclosure and restores its trigger focus.']],
    examples: [
      { title: 'Semantic links', description: 'Plain site navigation needs no Foldkit child model; the active route supplies aria-current.',  code: staticComponentApplication({ componentName: 'NavigationMenu', componentSlug: 'navigation-menu', exampleName: 'Semantic links', viewBody: `NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [
  NavigationMenu.navigationMenuList({ children: ['Home', 'Components', 'Docs'].map((label, index) =>
    NavigationMenu.navigationMenuItem({ children: [
      NavigationMenu.navigationMenuLink({ href: \`/\${label.toLowerCase()}\`, isActive: index === 0, children: [label] }, h),
    ] }, h),
  ) }, h),
] }, h)` }) },
      { title: 'Popover disclosure', description: 'A rich navigation disclosure uses an explicit Popover child integration rather than hidden component-local state.',  code: disclosureSource },
      { title: 'Responsive fallback', description: 'A finite responsive layout stacks the list on narrow viewports without moving route data into widget state.', code: staticComponentApplication({ componentName: 'NavigationMenu', componentSlug: 'navigation-menu', exampleName: 'Responsive fallback', viewBody: `NavigationMenu.navigationMenu({ ariaLabel: 'Primary', layout: 'responsive', children: [
	  NavigationMenu.navigationMenuList({ layout: 'responsive', children: ['Home', 'Components', 'Docs'].map(label => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: \`/\${label.toLowerCase()}\`, children: [label] }, h)] }, h)) }, h),
] }, h)` }) },
      { title: 'RTL overflow', description: 'A scroll layout contains long navigation sets and preserves RTL reading direction.', code: staticComponentApplication({ componentName: 'NavigationMenu', componentSlug: 'navigation-menu', exampleName: 'RTL overflow', viewBody: `NavigationMenu.navigationMenu({ ariaLabel: 'Primary', direction: 'rtl', layout: 'scroll', children: [
	  NavigationMenu.navigationMenuList({ layout: 'scroll', children: ['Home', 'Products', 'Solutions', 'Customers', 'Resources', 'Company', 'Docs'].map(label => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: \`/\${label.toLowerCase()}\`, children: [label] }, h)] }, h)) }, h),
] }, h)` }) },
    ],
  },
});
