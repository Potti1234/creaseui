import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Icon, NativeSelect, Pagination } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './pagination.css'

const Message = UiSchema.TaggedEnum({
  ChangedPage: { page: Schema.Number },
  ChangedRows: { value: Schema.String },
})

const ActionPagination = Html.component({
  name: 'DocsPaginationAction',
  props: Schema.Struct({
    initialPage: Schema.Number,
    totalPages: Schema.Number,
    siblingCount: Schema.Number,
  }),
  model: Schema.Struct({ page: Schema.Number }),
  message: Message,
}).make({
  init: ({ props }) => ({ page: props.initialPage }),
  update: {
    ChangedPage: ($, { page }) => $.evolve({ page }),
    ChangedRows: $ => $.model,
  },
  view: (h, model) =>
    Pagination(h, {
      page: model.page,
      totalPages: h.props.totalPages,
      siblingCount: h.props.siblingCount,
      boundaryCount: 1,
      navigation: {
        kind: 'action',
        onNavigate: page => Message.ChangedPage({ page }),
      },
      ariaLabel: 'Search result pages',
    }),
})

const link =
  (
    page: number,
    totalPages: number,
    siblingCount: number,
  ): DocsExampleImplementation['view'] =>
  h =>
    Pagination(h, {
      page,
      totalPages,
      siblingCount,
      boundaryCount: 1,
      navigation: {
        kind: 'link',
        href: target => `/invoices?page=${String(target)}`,
      },
      ariaLabel: 'Invoice pages',
    })

const action =
  (initialPage: number): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    ActionPagination(h, {
      key: `${context.idPrefix}-pagination`,
      props: { initialPage, totalPages: 5, siblingCount: 1 },
    })

const numbered = <Msg>(
  h: Html.H<Msg>,
  pages: ReadonlyArray<number>,
  active: number,
) =>
  pages.map(page =>
    h.li.children(
      h.a
        .class('pagination-docs-link')
        .attrs({
          href: '#',
          ...(page === active ? { 'aria-current': 'page' as const } : {}),
        })
        .children(String(page)),
    ),
  )

const simple: DocsExampleImplementation['view'] = h =>
  h.nav
    .class('pagination-docs-nav')
    .attr('aria-label', 'Pagination')
    .children(
      h.ul
        .class('pagination-docs-list')
        .children(numbered(h, [1, 2, 3, 4, 5], 2)),
    )

const rtl: DocsExampleImplementation['view'] = h =>
  h.nav
    .class('pagination-docs-nav')
    .attrs({ 'aria-label': 'Pagination', dir: 'rtl' })
    .children(
      h.ul
        .class('pagination-docs-list')
        .children(
          h.li.children(
            h.a
              .class('pagination-docs-link')
              .attr('href', '#')
              .children('السابق'),
          ),
          numbered(h, [1, 2, 3], 2),
          h.li.children(h.span.class('pagination-docs-ellipsis').children('…')),
          h.li.children(
            h.a
              .class('pagination-docs-link')
              .attr('href', '#')
              .children('التالي'),
          ),
        ),
    )

const RowsSelect = Html.component({
  name: 'DocsPaginationRowsSelect',
  model: Schema.Struct({ value: Schema.String }),
  message: Message,
}).make({
  init: () => ({ value: '10' }),
  update: {
    ChangedPage: $ => $.model,
    ChangedRows: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) =>
    h.div.class('pagination-docs-icons').children(
      h.div.class('pagination-docs-field').children(
        h.label
          .class('pagination-docs-label')
          .attr('for', 'select-rows-per-page')
          .children('Rows per page'),
        h.div.class('pagination-docs-select-wrap').children(
          NativeSelect(h, {
            id: 'select-rows-per-page',
            value: model.value,
            onChange: value => Message.ChangedRows({ value }),
            options: ['10', '25', '50', '100'].map(value => ({
              value,
              label: value,
            })),
          }),
        ),
      ),
      h.nav
        .class('pagination-docs-nav', 'pagination-docs-compact')
        .attr('aria-label', 'Pagination')
        .children(
          h.ul.class('pagination-docs-list').children(
            h.li.children(
              h.a
                .class('pagination-docs-link')
                .attrs({ href: '#', 'aria-label': 'Previous' })
                .children(Icon(h, { name: 'chevron-left', size: 'sm' })),
            ),
            h.li.children(
              h.a
                .class('pagination-docs-link')
                .attrs({ href: '#', 'aria-label': 'Next' })
                .children(Icon(h, { name: 'chevron-right', size: 'sm' })),
            ),
          ),
        ),
    ),
})

const icons: DocsExampleImplementation['view'] = (h, context) =>
  RowsSelect(h, { key: `${context.idPrefix}-rows` })

const source = exampleApplicationSource({
  imports: `import { Pagination } from '@/ui/effect/ui'
import './pagination.css'`,
  body: `Pagination(h, {
  page: 6,
  totalPages: 12,
  siblingCount: 1,
  boundaryCount: 1,
  navigation: { kind: 'link', href: page => \`/invoices?page=\${page}\` },
  ariaLabel: 'Invoice pages',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Pagination } from '@/ui/effect/ui'

Pagination(h, { page: 1, totalPages: 5, navigation: { kind: 'link', href: page => \`?page=\${page}\` } })`,
  examples: [
    { title: 'Addressable pages', view: link(6, 12, 1), source },
    { title: 'In-place results', view: action(2), source },
    { title: 'Compact neighborhood', view: link(6, 12, 0), source },
    { title: 'Disabled boundary', view: action(1), source },
    { title: 'Simple', view: simple, source },
    { title: 'Icons Only', view: icons, source },
    { title: 'RTL', view: rtl, source },
  ],
})
