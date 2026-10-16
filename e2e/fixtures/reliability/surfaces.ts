import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'

/* R3 surfaces-and-data fixture: a Card holding a Table, from each kit. */
type Part = <Msg>(
  props: Readonly<{ children: ReadonlyArray<Html | string> }>,
  h: HtmlBuilder<Msg>,
) => Html

export type SurfacesKit = Readonly<{
  card: Part
  cardHeader: Part
  cardTitle: <Msg>(
    props: Readonly<{
      element: 'h3'
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  cardDescription: Part
  cardContent: Part
  table: Part
  tableHeader: Part
  tableBody: Part
  tableRow: Part
  tableHead: <Msg>(
    props: Readonly<{
      scope: 'col'
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  tableCell: Part
}>

const ROWS = [
  ['INV001', 'Paid', '$250.00'],
  ['INV002', 'Pending', '$150.00'],
  ['INV003', 'Unpaid', '$350.00'],
] as const

const Model = S.Struct({})
type Model = typeof Model.Type

const view =
  (kit: SurfacesKit) =>
  (_model: Model, h: HtmlBuilder<never>): Html =>
    h.section(
      [h.Id('surfaces-data')],
      [
        kit.card(
          {
            children: [
              kit.cardHeader(
                {
                  children: [
                    kit.cardTitle({ element: 'h3', children: ['Invoices'] }, h),
                    kit.cardDescription({ children: ['Recent billing.'] }, h),
                  ],
                },
                h,
              ),
              kit.cardContent(
                {
                  children: [
                    kit.table(
                      {
                        children: [
                          kit.tableHeader(
                            {
                              children: [
                                kit.tableRow(
                                  {
                                    children: [
                                      'Invoice',
                                      'Status',
                                      'Amount',
                                    ].map(label =>
                                      kit.tableHead(
                                        { scope: 'col', children: [label] },
                                        h,
                                      ),
                                    ),
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          kit.tableBody(
                            {
                              children: ROWS.map(row =>
                                kit.tableRow(
                                  {
                                    children: row.map(value =>
                                      kit.tableCell({ children: [value] }, h),
                                    ),
                                  },
                                  h,
                                ),
                              ),
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    )

export const runSurfacesData = (kit: SurfacesKit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: {} }),
      update: (model: Model) => ({ model }),
      view: view(kit),
      container: document.getElementById('surfaces-root'),
      devTools: false,
    }),
  )
