import { Schema as S } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { paginationFixtures } from '@/docs/components/pages/pagination/shared';
import * as Pagination from '@/ui/pagination';


const PreviewMessage = defineMessageUnion({
  'ChangedPaginationPage': { page: S.Number },
}); type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({ _docsPage: S.Literal('pagination'), page: S.Number }); type PreviewModel = typeof PreviewModel.Type;
const render = (index: number, page: number, h: HtmlBuilder<PreviewMessage>) => { const fixture = paginationFixtures[index] ?? paginationFixtures[0]; return fixture.kind === 'action' ? Pagination.paginationPages({ page, totalPages: 5, navigation: { kind: 'action', onNavigate: next => PreviewMessage['ChangedPaginationPage']({ page: next }) }, ariaLabel: 'Search result pages' }, h) : Pagination.paginationPages({ page, totalPages: 12, siblingCount: fixture.siblingCount, boundaryCount: 1, navigation: { kind: 'link', href: () => '#' }, ariaLabel: 'Invoice pages' }, h); };
export const paginationTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({ Model: PreviewModel, Message: PreviewMessage, init: index => ({ _docsPage: 'pagination', page: (paginationFixtures[index] ?? paginationFixtures[0]).page }), update: (model, message) => ({ model: { ...model, page: message.page } }), view: (index, model, h) => render(index, model.page, h) });
