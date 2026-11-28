import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { DropdownMenu, Icon, Table } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const invoices = [
  ['INV001', 'Paid', '$250.00', 'Credit Card'],
  ['INV002', 'Pending', '$150.00', 'PayPal'],
  ['INV003', 'Unpaid', '$350.00', 'Bank Transfer'],
  ['INV004', 'Paid', '$450.00', 'Credit Card'],
  ['INV005', 'Paid', '$550.00', 'PayPal'],
  ['INV006', 'Pending', '$200.00', 'Bank Transfer'],
  ['INV007', 'Unpaid', '$300.00', 'Credit Card'],
] as const
const rtlInvoices = [
  ['INV001', 'مدفوع', '$250.00', 'بطاقة ائتمانية'],
  ['INV002', 'قيد الانتظار', '$150.00', 'PayPal'],
  ['INV003', 'غير مدفوع', '$350.00', 'تحويل بنكي'],
  ['INV004', 'مدفوع', '$450.00', 'بطاقة ائتمانية'],
  ['INV005', 'مدفوع', '$550.00', 'PayPal'],
  ['INV006', 'قيد الانتظار', '$200.00', 'تحويل بنكي'],
  ['INV007', 'غير مدفوع', '$300.00', 'بطاقة ائتمانية'],
] as const
const actionRows = [
  ['Wireless Mouse', '$29.99'],
  ['Mechanical Keyboard', '$129.99'],
  ['USB-C Hub', '$49.99'],
] as const

const invoiceTable =
  (rtl: boolean, footerOnly: boolean): DocsExampleImplementation['view'] =>
  h =>
    Table(h, {
      children: table => {
        const rows = (rtl ? rtlInvoices : invoices).slice(
          0,
          footerOnly ? 3 : undefined,
        )
        const heads = rtl
          ? ['الفاتورة', 'الحالة', 'الطريقة', 'المبلغ']
          : ['Invoice', 'Status', 'Method', 'Amount']
        const body = [
          table.caption({
            children: [
              rtl
                ? 'قائمة بفواتيرك الأخيرة.'
                : 'A list of your recent invoices.',
            ],
          }),
          table.header({
            children: [
              table.row({
                children: [
                  table.head({
                    className: 'w-[100px]',
                    children: [heads[0] ?? ''],
                  }),
                  table.head({ children: [heads[1] ?? ''] }),
                  table.head({ children: [heads[2] ?? ''] }),
                  table.head({
                    className: 'text-right',
                    children: [heads[3] ?? ''],
                  }),
                ],
              }),
            ],
          }),
          table.body({
            children: rows.map(([invoice, status, amount, method]) =>
              table.row({
                children: [
                  table.cell({ className: 'font-medium', children: [invoice] }),
                  table.cell({ children: [status] }),
                  table.cell({ children: [method] }),
                  table.cell({ className: 'text-right', children: [amount] }),
                ],
              }),
            ),
          }),
          table.footer({
            children: [
              table.row({
                children: [
                  table.cell({
                    colspan: 3,
                    children: [rtl ? 'المجموع' : 'Total'],
                  }),
                  table.cell({
                    className: 'text-right',
                    children: ['$2,500.00'],
                  }),
                ],
              }),
            ],
          }),
        ]
        return body
      },
    }) as unknown as View.Input<DocsMessage>

const rtlTable: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .attr('dir', 'rtl')
    .children(
      invoiceTable(true, false)(h, context),
    ) as unknown as View.Input<DocsMessage>

const inventory =
  (empty = false): DocsExampleImplementation['view'] =>
  h =>
    Table(h, {
      className: 'max-w-xl',
      children: table => [
        table.caption({
          children: [
            empty
              ? 'Filtered component inventory.'
              : 'Foldkit ownership by component.',
          ],
        }),
        table.header({
          children: [
            table.row({
              children: [
                table.head({ children: ['Component'] }),
                table.head({ children: ['State'] }),
              ],
            }),
          ],
        }),
        table.body({
          children: empty
            ? [
                table.row({
                  children: [
                    table.cell({
                      colspan: 2,
                      className: 'h-24 text-center text-muted-foreground',
                      children: ['No components match this filter.'],
                    }),
                  ],
                }),
              ]
            : [
                ['Accordion', 'Stateful'],
                ['Button', 'Stateless'],
                ['Dialog', 'Stateful'],
              ].map(([name, state]) =>
                table.row({
                  children: [
                    table.head({
                      scope: 'row',
                      className: 'font-medium',
                      children: [name],
                    }),
                    table.cell({ children: [state] }),
                  ],
                }),
              ),
        }),
      ],
    }) as unknown as View.Input<DocsMessage>

const dense: DocsExampleImplementation['view'] = h =>
  Table(h, {
    className: 'min-w-[44rem] text-xs',
    children: table => [
      table.caption({
        children: ['Deployment inventory with intentionally wide columns.'],
      }),
      table.header({
        children: [
          table.row({
            children: [
              'Service',
              'Owner',
              'Region',
              'Status',
              'Last deployment',
            ].map(label =>
              table.head({ className: 'h-8 p-1', children: [label] }),
            ),
          }),
        ],
      }),
      table.body({
        children: [
          table.row({
            children: [
              table.head({
                scope: 'row',
                className: 'p-1',
                children: ['Documentation'],
              }),
              ...['Platform', 'Europe', 'Healthy', 'Today at 10:42'].map(
                value => table.cell({ className: 'p-1', children: [value] }),
              ),
            ],
          }),
        ],
      }),
    ],
  }) as unknown as View.Input<DocsMessage>

const MenuMessage = UiSchema.TaggedEnum({
  RequestedOpenMenu: {},
  RequestedCloseMenu: {},
})
const RowMenu = Html.component({
  name: 'DocsTableRowMenu',
  props: Schema.Struct({ keyPrefix: Schema.String, product: Schema.String }),
  model: Schema.Struct({ open: Schema.Boolean }),
  message: MenuMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    RequestedOpenMenu: $ => $.evolve({ open: true }),
    RequestedCloseMenu: $ => $.evolve({ open: false }),
  },
  view: (h, model) =>
    h.div.class('flex justify-end').children(
      DropdownMenu(h, {
        key: `${h.props.keyPrefix}-menu`,
        label: `${h.props.product} menu`,
        trigger: h.button
          .class(
            'inline-flex size-8 items-center justify-center rounded-md border-0 bg-transparent hover:bg-accent',
          )
          .attrs({ type: 'button', 'aria-label': 'Open menu' })
          .children(
            Icon(h, { name: 'ellipsis', size: 'sm' }),
            h.span.class('sr-only').children('Open menu'),
          ),
        props: {
          open: model.open,
          align: 'end',
          items: [
            { value: 'edit', label: 'Edit' },
            { value: 'duplicate', label: 'Duplicate' },
            { value: 'delete', label: 'Delete' },
          ],
        },
        decorateItem: item =>
          item.value === 'delete'
            ? { tone: 'destructive' as const, separatorBefore: true }
            : {},
        onEmit: {
          RequestedOpen: () => MenuMessage.RequestedOpenMenu(),
          RequestedClose: () => MenuMessage.RequestedCloseMenu(),
          Picked: () => MenuMessage.RequestedCloseMenu(),
          Highlighted: () => undefined,
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
      }),
    ),
})

const actions: DocsExampleImplementation['view'] = (h, context) =>
  Table(h, {
    children: table => [
      table.header({
        children: [
          table.row({
            children: [
              table.head({ children: ['Product'] }),
              table.head({ children: ['Price'] }),
              table.head({ className: 'text-right', children: ['Actions'] }),
            ],
          }),
        ],
      }),
      table.body({
        children: actionRows.map(([product, price], index) =>
          table.row({
            children: [
              table.cell({ className: 'font-medium', children: [product] }),
              table.cell({ children: [price] }),
              table.cell({
                children: [
                  RowMenu(h, {
                    key: `${context.idPrefix}-row-menu-${String(index)}`,
                    props: {
                      keyPrefix: `${context.idPrefix}-${String(index)}`,
                      product,
                    },
                  }),
                ],
              }),
            ],
          }),
        ),
      }),
    ],
  }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { Table } from '@/ui/effect/ui'`,
  body: `Table(h, {
  children: table => [
    table.header({ children: [headerRow] }),
    table.body({ children: rows }),
  ],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Table } from '@/ui/effect/ui'\n\nTable(h, { children })`,
  examples: [
    { title: 'Basic', view: invoiceTable(false, false), source },
    { title: 'Footer', view: invoiceTable(false, true), source },
    { title: 'Actions', view: actions, source },
    { title: 'RTL', view: rtlTable, source },
    { title: 'Component Inventory', view: inventory(), source },
    { title: 'Dense overflow', view: dense, source },
    { title: 'Empty body', view: inventory(true), source },
  ],
})
