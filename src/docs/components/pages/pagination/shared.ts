import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';

export const paginationFixtures = [
  { title: 'Addressable pages', description: 'The router-owned page generates real URLs and a finite current neighborhood.', kind: 'link', page: 6, siblingCount: 1 },
  { title: 'In-place results', description: 'A parent Message updates results without pretending the action is a link.', kind: 'action', page: 2, siblingCount: 1 },
  { title: 'Compact neighborhood', description: 'Zero siblings preserves boundaries and the current page for narrow layouts.', kind: 'link', page: 6, siblingCount: 0 },
  { title: 'Disabled boundary', description: 'At page one, Previous is disabled and removed from sequential keyboard focus.', kind: 'action', page: 1, siblingCount: 1 },
] as const;

const linkSource = (fixture: (typeof paginationFixtures)[number], renderer: 'tailwind' | 'stylex'): string => staticComponentApplication({ componentName: 'Pagination', componentSlug: 'pagination', renderer, exampleName: fixture.title, viewBody: `Pagination.paginationPages({
  page: 6,
  totalPages: 12,
  siblingCount: ${fixture.siblingCount},
  boundaryCount: 1,
  navigation: { kind: 'link', href: page => \`/invoices?page=\${page}\` },
  ariaLabel: 'Invoice pages',
}, h)` });
const actionSource = (fixture: (typeof paginationFixtures)[number], renderer: 'tailwind' | 'stylex'): string => foldkitApplication({
  title: `Pagination — ${fixture.title}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Pagination from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/pagination'`,
  model: `export const Model = S.Struct({ page: S.Number })
export type Model = typeof Model.Type`,
  messages: `export const ChangedPage = m('ChangedPage', { page: S.Number })
export const Message = S.Union([ChangedPage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [{ page: ${fixture.page} }, []]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedPage': return [{ ...model, page: message.page }, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Pagination — ${fixture.title}',
  body: h.main([], [Pagination.paginationPages({
    page: model.page,
    totalPages: 5,
    navigation: { kind: 'action', onNavigate: page => ChangedPage({ page }) },
    ariaLabel: 'Search result pages',
  }, h)]),
})`,
});
export const paginationExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => paginationFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: fixture.kind === 'link' ? linkSource(fixture, renderer) : actionSource(fixture, renderer) }));
