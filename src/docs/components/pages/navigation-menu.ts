import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as NavigationMenu from '@/ui/navigation-menu';
import * as Popover from '@/ui/popover';

const links = <Msg>(h: HtmlBuilder<Msg>) => NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [NavigationMenu.navigationMenuList({ children: ['Home', 'Components', 'Docs'].map((label, index) => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: `/${label.toLowerCase()}`, isActive: index === 0, children: [label] }, h)] }, h)) }, h)] }, h);

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
type GotNavigationPreviewMessage = typeof GotNavigationPreviewMessage.Type;
const NavigationPreviewModel = S.Struct({ _docsPage: S.Literal('navigation-menu'), products: Popover.Model });
type NavigationPreviewModel = typeof NavigationPreviewModel.Type;
const previewProgram = definePreviewProgram<NavigationPreviewModel, GotNavigationPreviewMessage>({
  Model: NavigationPreviewModel, Message: GotNavigationPreviewMessage,
  init: index => ({ _docsPage: 'navigation-menu', products: Popover.init({ id: `docs-navigation-products-${String(index)}`, isAnimated: true, contentFocus: true }) }),
  update: (model, message) => {
    const [products, commands] = Popover.update(model.products, message.message);
    return [{ ...model, products }, Command.mapMessages(commands, next => GotNavigationPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => index === 0 ? links(h) : NavigationMenu.navigationMenu({ ariaLabel: 'Primary', children: [NavigationMenu.navigationMenuList({ children: [NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '/', isActive: true, children: ['Home'] }, h)] }, h), NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuDisclosure({ model: model.products, toParentMessage: message => GotNavigationPreviewMessage({ message }), label: 'Products', content: h.ul([h.Class('grid gap-1')], [h.li([], [h.a([h.Href('/products/analytics'), h.Class('block rounded p-2 hover:bg-accent')], ['Analytics'])]), h.li([], [h.a([h.Href('/products/reports'), h.Class('block rounded p-2 hover:bg-accent')], ['Reports'])])]) }, h)] }, h)] }, h)] }, h),
});

export const navigationMenuPage = authoredPage({
  slug: 'navigation-menu', title: 'Navigation Menu', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Composes semantic site-navigation links and optional Foldkit Popover disclosures.',
    architecture: 'The nav/list/item/link helpers are stateless Html composition. A disclosure is intentionally different: it receives a parent-owned Popover Model and Message mapping, keeping navigation semantics separate from overlay state.',
    apiHref: 'https://foldkit.dev/ui/popover',
    composition: 'nav landmark\n└── ul\n    ├── li → active/current link\n    └── li → disclosure trigger\n        └── Popover child Model → navigation links',
    styling: 'Use ordinary links for destinations and reserve disclosures for small link collections. Keep the active route derived from the router model rather than local widget state.',
    accessibility: 'The helpers render nav, list, list-item, link, and aria-current semantics. Name multiple navigation landmarks distinctly. Disclosure links remain real anchors inside a keyboard-operable Popover.',
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
    ],
  },
});
