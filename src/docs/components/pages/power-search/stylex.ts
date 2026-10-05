import { className } from '@/stylex/style'
import { previewLayout } from '@/docs/components/preview-layout.stylex'
import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  bookFieldDefinitions,
  BOOKS,
  configFor,
  powerSearchFixtures,
} from '@/docs/components/pages/power-search/shared'
import * as PowerSearch from '@/stylex/power-search'
import * as Table from '@/stylex/table'

interface PreviewShape {
  readonly search: PowerSearch.Model
  readonly filters: ReadonlyArray<unknown>
  readonly configKey: string
}

const widthStyle = stylex.create({
  w300: { maxWidth: '18.75rem', width: '100%' },
  w360: { maxWidth: '22.5rem', width: '100%' },
  w400: { maxWidth: '25rem', width: '100%' },
  w500: { maxWidth: '31.25rem', width: '100%' },
})

const widthFor = (px: number) =>
  px === 300
    ? widthStyle.w300
    : px === 360
      ? widthStyle.w360
      : px === 500
        ? widthStyle.w500
        : widthStyle.w400

const cellStyles = stylex.create({
  wide: { width: '40%' },
  year: { width: '7rem' },
  genre: { width: '9rem' },
})

const genreLabel = (genre: string): string =>
  (bookFieldDefinitions.find(f => f.key === 'genre')?.enumValues ?? []).find(
    (g: { value: string; label: string }) => g.value === genre,
  )?.label ?? genre

export const powerSearchStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const preview = model as PreviewShape
  const fixture = powerSearchFixtures[index] ?? powerSearchFixtures[0]
  const toSearch = (message: PowerSearch.Message): Msg =>
    onMessageJson(JSON.stringify({ _tag: 'GotPowerSearchMessage', message }))
  const filters =
    preview.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>

  if (fixture.configKey === 'books') {
    const { config: generated, applyFilters } =
      PowerSearch.createPowerSearchConfig(bookFieldDefinitions, 'Books')
    const config = PowerSearch.createInternalConfig(generated)
    const rows = applyFilters(filters, BOOKS).map(book =>
      Table.tableRow(
        {
          children: [
            Table.tableCell(
              { layoutStyle: cellStyles.wide, children: [book.title] },
              h,
            ),
            Table.tableCell(
              { layoutStyle: cellStyles.wide, children: [book.author] },
              h,
            ),
            Table.tableCell(
              { layoutStyle: cellStyles.year, children: [String(book.year)] },
              h,
            ),
            Table.tableCell(
              {
                layoutStyle: cellStyles.genre,
                children: [genreLabel(book.genre)],
              },
              h,
            ),
          ],
        },
        h,
      ),
    )
    return h.div(
      [h.Class(className(previewLayout.search))],
      [
        PowerSearch.powerSearch(
          {
            model: preview.search,
            toParentMessage: toSearch,
            filters,
            config,
            placeholder: fixture.placeholder,
            resultCount: rows.length,
            layoutStyle: widthFor(fixture.maxWidth),
          },
          h,
        ),
        Table.table(
          {
            children: [
              Table.tableHeader(
                {
                  children: [
                    Table.tableRow(
                      {
                        children: [
                          Table.tableHead({ children: ['Title'] }, h),
                          Table.tableHead({ children: ['Author'] }, h),
                          Table.tableHead({ children: ['Year'] }, h),
                          Table.tableHead({ children: ['Genre'] }, h),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Table.tableBody({ children: rows }, h),
            ],
          },
          h,
        ),
      ],
    )
  }

  return PowerSearch.powerSearch(
    {
      model: preview.search,
      toParentMessage: toSearch,
      filters,
      config: PowerSearch.createInternalConfig(configFor(fixture.configKey)),
      placeholder: fixture.placeholder,
      layoutStyle: widthFor(fixture.maxWidth),
    },
    h,
  )
}
