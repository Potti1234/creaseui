import type { HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { paginationFixtures } from '@/docs/components/pages/pagination/shared';
import * as Pagination from '@/stylex/pagination';

export const paginationStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = paginationFixtures[index] ?? paginationFixtures[0]; const page = (model as { page: number }).page;
  return fixture.kind === 'action' ? Pagination.paginationPages({ page, totalPages: 5, navigation: { kind: 'action', onNavigate: next => onMessageJson(JSON.stringify({ _tag: 'ChangedPaginationPage', page: next })) }, ariaLabel: 'Search result pages' }, h) : Pagination.paginationPages({ page, totalPages: 12, siblingCount: fixture.siblingCount, boundaryCount: 1, navigation: { kind: 'link', href: next => `/invoices?page=${String(next)}` }, ariaLabel: 'Invoice pages' }, h);
};
