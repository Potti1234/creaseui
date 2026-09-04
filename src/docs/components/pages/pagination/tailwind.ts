import { Schema as S } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { paginationFixtures } from '@/docs/components/pages/pagination/shared';
import * as Pagination from '@/ui/pagination';

const ChangedPage = m('ChangedPaginationPage', { page: S.Number });
const PreviewMessage = S.Union([ChangedPage]); type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({ _docsPage: S.Literal('pagination'), page: S.Number }); type PreviewModel = typeof PreviewModel.Type;
const render = (index: number, page: number, h: HtmlBuilder<PreviewMessage>) => { const fixture = paginationFixtures[index] ?? paginationFixtures[0]; return fixture.kind === 'action' ? Pagination.paginationPages({ page, totalPages: 5, navigation: { kind: 'action', onNavigate: next => ChangedPage({ page: next }) }, ariaLabel: 'Search result pages' }, h) : Pagination.paginationPages({ page, totalPages: 12, siblingCount: fixture.siblingCount, boundaryCount: 1, navigation: { kind: 'link', href: next => `/invoices?page=${String(next)}` }, ariaLabel: 'Invoice pages' }, h); };
export const paginationTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({ Model: PreviewModel, Message: PreviewMessage, init: index => ({ _docsPage: 'pagination', page: (paginationFixtures[index] ?? paginationFixtures[0]).page }), update: (model, message) => [{ ...model, page: message.page }, []], view: (index, model, h) => render(index, model.page, h) });
