import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  bookFieldDefinitions,
  BOOKS,
  configFor,
  initialFiltersFor,
  powerSearchFixtures,
  type PowerSearchFixture,
} from '@/docs/components/pages/power-search/shared';
import * as PowerSearch from '@/ui/power-search';
import * as Table from '@/ui/table';

const toFilters = (
  value: unknown,
): ReadonlyArray<PowerSearch.PowerSearchFilter> =>
  value as ReadonlyArray<PowerSearch.PowerSearchFilter>;

const Got = defineMessageUnion({
  GotPowerSearchMessage: { message: PowerSearch.Message },
});
type Got = typeof Got.Type;
const Model = S.Struct({
  _docsPage: S.Literal('power-search'),
  search: PowerSearch.Model,
  filters: S.Array(S.Unknown),
  configKey: S.String,
});
type Model = typeof Model.Type;

const WIDTH_CLASS: Record<PowerSearchFixture['maxWidth'], string> = {
  300: 'w-full max-w-[300px]',
  360: 'w-full max-w-[360px]',
  400: 'w-full max-w-[400px]',
  500: 'w-full max-w-[500px]',
};

const internalFor = (
  configKey: string,
): { config: PowerSearch.InternalPowerSearchConfig; resultCount: (filters: ReadonlyArray<PowerSearch.PowerSearchFilter>) => number | null } => {
  if (configKey === 'books') {
    const { config: generated, applyFilters } = PowerSearch.createPowerSearchConfig(
      bookFieldDefinitions,
      'Books',
    );
    const config = PowerSearch.createInternalConfig(generated);
    return {
      config,
      resultCount: (filters) => applyFilters(filters, BOOKS).length,
    };
  }
  const key = configKey as Exclude<PowerSearchFixture['configKey'], 'books'>;
  return { config: PowerSearch.createInternalConfig(configFor(key)), resultCount: () => null };
};

const genreLabel = (genre: string): string =>
  (
    bookFieldDefinitions.find((f) => f.key === 'genre')?.enumValues ?? []
  ).find((g: { value: string; label: string }) => g.value === genre)?.label ??
  genre;

const powerSearchView = (
  fixture: PowerSearchFixture,
  model: Model,
  h: HtmlBuilder<Got>,
): Html => {
  const { config } = internalFor(model.configKey);
  const filters =
    toFilters(model.filters);
  const count = internalFor(model.configKey).resultCount(filters);
  return PowerSearch.powerSearch(
    {
      model: model.search,
      toParentMessage: (message) => Got.GotPowerSearchMessage({ message }),
      filters,
      config,
      placeholder: fixture.placeholder,
      ...(fixture.hasClear === true ? { hasClear: true } : {}),
      ...(count === null ? {} : { resultCount: count }),
      class: WIDTH_CLASS[fixture.maxWidth] ?? 'w-full max-w-[400px]',
    },
    h,
  );
};

const fixtureView = (
  fixture: PowerSearchFixture,
  model: Model,
  h: HtmlBuilder<Got>,
): Html => {
  const search = powerSearchView(fixture, model, h);
  if (model.configKey !== 'books') {
    return search;
  }
  const { applyFilters } = PowerSearch.createPowerSearchConfig(
    bookFieldDefinitions,
    'Books',
  );
  const rows = applyFilters(
    toFilters(model.filters),
    BOOKS,
  ).map((book) =>
    Table.tableRow(
      {
        children: [
          Table.tableCell({ class: 'w-2/5', children: [book.title] }, h),
          Table.tableCell({ class: 'w-2/5', children: [book.author] }, h),
          Table.tableCell(
            { class: 'w-28', children: [String(book.year)] },
            h,
          ),
          Table.tableCell(
            { class: 'w-36', children: [genreLabel(book.genre)] },
            h,
          ),
        ],
      },
      h,
    ),
  );
  return h.div([h.Class('flex w-full max-w-lg flex-col gap-4')], [
    search,
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
  ]);
};

export const powerSearchTailwindPreviewProgram = definePreviewProgram<
  Model,
  Got
>({
  Model,
  Message: Got,
  init: (index) => {
    const fixture = powerSearchFixtures[index] ?? powerSearchFixtures[0];
    return {
      _docsPage: 'power-search',
      search: PowerSearch.init({ id: `docs-power-search-${String(index)}` }),
      filters: [...initialFiltersFor(fixture.configKey)],
      configKey: fixture.configKey,
    };
  },
  update: (model, message) => {
    switch (message._tag) {
      case 'GotPowerSearchMessage': {
        const { config, resultCount } = internalFor(model.configKey);
        const filters =
          toFilters(model.filters);
        const next = PowerSearch.update(
          model.search,
          message.message,
          config,
          filters,
          resultCount(filters),
        );
        const nextFilters =
          next.outMessage?._tag === 'ChangedPowerSearch'
            ? (toFilters(next.outMessage.filters))
            : filters;
        return {
          model: {
            ...model,
            search: next.model,
            filters: [...nextFilters],
          },
          commands: Command.mapMessages(next.commands ?? [], (inner) =>
            Got.GotPowerSearchMessage({ message: inner }),
          ),
        };
      }
    }
  },
  view: (index, model, h) => {
    const fixture = powerSearchFixtures[index] ?? powerSearchFixtures[0];
    return fixtureView(fixture, model, h);
  },
});
