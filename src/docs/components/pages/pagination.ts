import { Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import { authoredPage, definePreviewProgram, foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page'
import * as Pagination from '@/ui/pagination'

const ChangedPage = m('ChangedPaginationPage', { page: S.Number })
const PreviewMessage = S.Union([ChangedPage])
type PreviewMessage = typeof PreviewMessage.Type
const PreviewModel = S.Struct({ _docsPage: S.Literal('pagination'), page: S.Number })
type PreviewModel = typeof PreviewModel.Type

const linkExample = (page: number, siblingCount: number, h: HtmlBuilder<PreviewMessage>) => Pagination.paginationPages({ page, totalPages: 12, siblingCount, boundaryCount: 1, navigation: { kind: 'link', href: next => `/invoices?page=${String(next)}` }, ariaLabel: 'Invoice pages' }, h)
const actionExample = (page: number, h: HtmlBuilder<PreviewMessage>) => Pagination.paginationPages({ page, totalPages: 5, navigation: { kind: 'action', onNavigate: next => ChangedPage({ page: next }) }, ariaLabel: 'Search result pages' }, h)

const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: index => ({ _docsPage: 'pagination', page: index === 3 ? 1 : index === 0 || index === 2 ? 6 : 2 }),
  update: (model, message) => [{ ...model, page: message.page }, []],
  view: (index, model, h) => index === 1 || index === 3 ? actionExample(model.page, h) : linkExample(model.page, index === 2 ? 0 : 1, h),
})

const linkSource = staticComponentApplication({
  componentName: 'Pagination', componentSlug: 'pagination', exampleName: 'Addressable pages',
  viewBody: `Pagination.paginationPages({
  page: 6,
  totalPages: 12,
  siblingCount: 1,
  boundaryCount: 1,
  navigation: { kind: 'link', href: page => \`/invoices?page=\${page}\` },
  ariaLabel: 'Invoice pages',
}, h)`,
})

const actionSource = foldkitApplication({
  title: 'Pagination — In-place results',
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Pagination from '@/ui/pagination'`,
  model: `export const Model = S.Struct({ page: S.Number })
export type Model = typeof Model.Type`,
  messages: `export const ChangedPage = m('ChangedPage', { page: S.Number })
export const Message = S.Union([ChangedPage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [{ page: 2 }, []]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedPage': return [{ ...model, page: message.page }, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Pagination — In-place results',
  body: h.main([], [Pagination.paginationPages({
    page: model.page,
    totalPages: 5,
    navigation: { kind: 'action', onNavigate: page => ChangedPage({ page }) },
    ariaLabel: 'Search result pages',
  }, h)]),
})`,
})

export const paginationPage = authoredPage({
  slug: 'pagination', title: 'Pagination', kind: 'recipe', previewProgram,
  definition: {
    kind: 'recipe', description: 'A parent-controlled page recipe with addressable link and in-place action policies.',
    architecture: 'The parent or router owns the current page and URL. The shared helper only normalizes finite boundary/sibling counts and derives a per-render page window; it stores no hidden navigation state.',
    apiHref: 'https://foldkit.dev/ui/link',
    composition: 'nav[aria-label]\n└── ul\n    ├── disabled boundary or previous control\n    ├── page links/buttons and inert ellipses\n    └── disabled boundary or next control',
    styling: 'Use siblingCount=0 for the smallest viewport neighborhood. Ellipses describe omitted ranges and are never interactive.',
    accessibility: 'Addressable destinations are anchors; in-place updates are native buttons. The current control exposes aria-current=page and an explicit current-page name. Disabled boundaries are native disabled buttons or non-focusable aria-disabled link semantics.',
    keyboard: [['Tab / Shift+Tab', 'Moves only through available links or action buttons; disabled boundaries are skipped.'], ['Enter', 'Follows an addressable page link or activates an in-place page button.'], ['Space', 'Activates an in-place page button.']],
    examples: [
      { title: 'Addressable pages', description: 'The router-owned page generates real URLs and a finite current neighborhood.', code: linkSource },
      { title: 'In-place results', description: 'A parent Message updates results without pretending the action is a link.', code: actionSource },
      { title: 'Compact neighborhood', description: 'Zero siblings preserves boundaries and the current page for narrow layouts.', code: linkSource.replace('siblingCount: 1', 'siblingCount: 0') },
      { title: 'Disabled boundary', description: 'At page one, Previous is disabled and removed from sequential keyboard focus.', code: actionSource.replace('page: 2', 'page: 1') },
    ],
  },
})
