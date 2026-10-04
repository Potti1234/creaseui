import type { DocsExample } from '@/docs/components/page-definition'
import { foldkitApplication } from '@/docs/components/pages/authored-page'
import type { PowerSearchConfig, PowerSearchFilter } from '@/ui/power-search'

export type PowerSearchFixture = Readonly<{
  /** .doc.mjs displayName */
  title: string
  /** .doc.mjs description */
  description: string
  configKey: 'showcase' | 'content' | 'preset' | 'full' | 'books'
  placeholder: string
  hasClear?: boolean
  /** astryx `style={{width}}` on the component. */
  maxWidth: number
}>

/* Configs ported verbatim from the five astryx example blocks under
   packages/cli/assets/templates/blocks/components/PowerSearch/. */

const statusValues = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
]

const statusValues4 = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'closed', label: 'Closed' },
]

const priorityValues = [
  { value: 'p0', label: 'P0 — Critical' },
  { value: 'p1', label: 'P1 — High' },
  { value: 'p2', label: 'P2 — Medium' },
  { value: 'p3', label: 'P3 — Low' },
]

const users = [
  { id: 'user-1', label: 'Alice Johnson' },
  { id: 'user-2', label: 'Bob Smith' },
  { id: 'user-3', label: 'Charlie Brown' },
  { id: 'user-4', label: 'Diana Prince' },
]

const userSource = {
  search: (query: string) =>
    users.filter(user =>
      user.label.toLowerCase().includes(query.toLowerCase()),
    ),
  bootstrap: () => users,
}

const genreValues = [
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mystery' },
]

export const BOOKS: ReadonlyArray<
  Readonly<{
    id: string
    title: string
    author: string
    year: number
    genre: string
  }>
> = [
  {
    id: '1',
    title: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    genre: 'sci-fi',
  },
  {
    id: '2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genre: 'romance',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    genre: 'sci-fi',
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    genre: 'fantasy',
  },
  {
    id: '5',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    genre: 'non-fiction',
  },
]

const showcaseConfig: PowerSearchConfig = {
  name: 'BasicSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: { type: 'enum', values: statusValues },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
      ],
    },
  ],
}

const contentConfig: PowerSearchConfig = {
  name: 'ContentSearch',
  contentSearchFieldKey: 'title',
  fields: [
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
        {
          key: 'not_contains',
          label: 'does not contain',
          value: { type: 'string' },
        },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: { type: 'enum', values: statusValues },
        },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: { type: 'enum', values: priorityValues },
        },
      ],
    },
  ],
}

const presetConfig: PowerSearchConfig = {
  name: 'TaskSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: { type: 'enum', values: statusValues4 },
        },
        {
          key: 'is_not',
          label: 'is not',
          value: { type: 'enum', values: statusValues4 },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: { type: 'enum', values: priorityValues },
        },
      ],
    },
  ],
}

const fullConfig: PowerSearchConfig = {
  name: 'FullSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'any_of',
      operators: [
        {
          key: 'any_of',
          label: 'is any of',
          value: { type: 'enum_list', values: statusValues4 },
        },
        {
          key: 'none_of',
          label: 'is none of',
          value: { type: 'enum_list', values: statusValues4 },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
        {
          key: 'not_contains',
          label: 'does not contain',
          value: { type: 'string' },
        },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: { type: 'enum', values: priorityValues },
        },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      defaultOperator: 'any_of',
      operators: [
        {
          key: 'any_of',
          label: 'is any of',
          value: { type: 'entity_list', searchSource: userSource },
        },
      ],
    },
  ],
}

/** SearchWithTable uses createPowerSearchConfig (astryx usePowerSearchConfig). */
export const bookFieldDefinitions = [
  { key: 'title', type: 'string', label: 'Title' },
  { key: 'author', type: 'string', label: 'Author' },
  { key: 'year', type: 'number', label: 'Publication Year' },
  { key: 'genre', type: 'enum', label: 'Genre', enumValues: genreValues },
] as const

export const configFor = (
  key: PowerSearchFixture['configKey'],
): PowerSearchConfig =>
  key === 'content'
    ? contentConfig
    : key === 'preset'
      ? presetConfig
      : key === 'full'
        ? fullConfig
        : showcaseConfig

export const initialFiltersFor = (
  key: PowerSearchFixture['configKey'],
): ReadonlyArray<PowerSearchFilter> => {
  if (key === 'showcase') {
    return [
      {
        field: 'status',
        operator: 'is',
        value: { type: 'enum', value: 'open' },
      },
      {
        field: 'title',
        operator: 'contains',
        value: { type: 'string', value: 'dashboard' },
      },
    ]
  }
  if (key === 'preset') {
    return [
      {
        field: 'status',
        operator: 'is',
        value: { type: 'enum', value: 'open' },
      },
      {
        field: 'priority',
        operator: 'is',
        value: { type: 'enum', value: 'p1' },
      },
    ]
  }
  return []
}

export const powerSearchFixtures: Readonly<
  [PowerSearchFixture, ...Array<PowerSearchFixture>]
> = [
  {
    title: 'Power Search',
    description:
      'Token-based filter bar with enum and text fields, pre-populated with sample filters.',
    configKey: 'showcase',
    placeholder: 'Search by status, title...',
    maxWidth: 400,
  },
  {
    title: 'PowerSearch — Content Search',
    description:
      'Power search with contentSearchFieldKey so free-text input maps to a title field automatically.',
    configKey: 'content',
    placeholder: 'Type to search by title, or pick a field...',
    maxWidth: 300,
  },
  {
    title: 'PowerSearch — Preset Filters',
    description:
      'Power search initialized with pre-set filter tokens for status and priority.',
    configKey: 'preset',
    placeholder: 'Add more filters...',
    maxWidth: 360,
  },
  {
    title: 'PowerSearch — Full Featured',
    description:
      'Power search with multiple field types: enum, multi-select, entity, and text filters.',
    configKey: 'full',
    placeholder: 'Search...',
    maxWidth: 300,
  },
  {
    title: 'PowerSearch — Search with Table',
    description:
      'Composition of PowerSearch with Table using createPowerSearchConfig to auto-generate config and filter data.',
    configKey: 'books',
    placeholder: 'Filter books by title, author, year, genre...',
    maxWidth: 500,
  },
]

// =============================================================================
// Generated example source
// =============================================================================

const CONFIG_SOURCE: Record<PowerSearchFixture['configKey'], string> = {
  showcase: `const STATUS_VALUES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
]
const CONFIG: PowerSearch.PowerSearchConfig = {
  name: 'BasicSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        { key: 'is', label: 'is', value: { type: 'enum', values: STATUS_VALUES } },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
      ],
    },
  ],
}`,
  content: `const STATUS_VALUES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
]
const PRIORITY_VALUES = [
  { value: 'p0', label: 'P0 — Critical' },
  { value: 'p1', label: 'P1 — High' },
  { value: 'p2', label: 'P2 — Medium' },
  { value: 'p3', label: 'P3 — Low' },
]
const CONFIG: PowerSearch.PowerSearchConfig = {
  name: 'ContentSearch',
  contentSearchFieldKey: 'title',
  fields: [
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
        { key: 'not_contains', label: 'does not contain', value: { type: 'string' } },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        { key: 'is', label: 'is', value: { type: 'enum', values: STATUS_VALUES } },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        { key: 'is', label: 'is', value: { type: 'enum', values: PRIORITY_VALUES } },
      ],
    },
  ],
}`,
  preset: `const STATUS_VALUES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'closed', label: 'Closed' },
]
const PRIORITY_VALUES = [
  { value: 'p0', label: 'P0 — Critical' },
  { value: 'p1', label: 'P1 — High' },
  { value: 'p2', label: 'P2 — Medium' },
  { value: 'p3', label: 'P3 — Low' },
]
const CONFIG: PowerSearch.PowerSearchConfig = {
  name: 'TaskSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        { key: 'is', label: 'is', value: { type: 'enum', values: STATUS_VALUES } },
        { key: 'is_not', label: 'is not', value: { type: 'enum', values: STATUS_VALUES } },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        { key: 'is', label: 'is', value: { type: 'enum', values: PRIORITY_VALUES } },
      ],
    },
  ],
}`,
  full: `const STATUS_VALUES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'closed', label: 'Closed' },
]
const PRIORITY_VALUES = [
  { value: 'p0', label: 'P0 — Critical' },
  { value: 'p1', label: 'P1 — High' },
  { value: 'p2', label: 'P2 — Medium' },
  { value: 'p3', label: 'P3 — Low' },
]
const USERS: ReadonlyArray<PowerSearch.SearchableItem> = [
  { id: 'user-1', label: 'Alice Johnson' },
  { id: 'user-2', label: 'Bob Smith' },
  { id: 'user-3', label: 'Charlie Brown' },
  { id: 'user-4', label: 'Diana Prince' },
]
const USER_SOURCE: PowerSearch.SearchSource = {
  search: query => USERS.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => USERS,
}
const CONFIG: PowerSearch.PowerSearchConfig = {
  name: 'FullSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'any_of',
      operators: [
        { key: 'any_of', label: 'is any of', value: { type: 'enum_list', values: STATUS_VALUES } },
        { key: 'none_of', label: 'is none of', value: { type: 'enum_list', values: STATUS_VALUES } },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
        { key: 'not_contains', label: 'does not contain', value: { type: 'string' } },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        { key: 'is', label: 'is', value: { type: 'enum', values: PRIORITY_VALUES } },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      defaultOperator: 'any_of',
      operators: [
        { key: 'any_of', label: 'is any of', value: { type: 'entity_list', searchSource: USER_SOURCE } },
      ],
    },
  ],
}`,
  books: `const GENRE_VALUES = [
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mystery' },
]
const FIELD_DEFS = [
  { key: 'title', type: 'string', label: 'Title' },
  { key: 'author', type: 'string', label: 'Author' },
  { key: 'year', type: 'number', label: 'Publication Year' },
  { key: 'genre', type: 'enum', label: 'Genre', enumValues: GENRE_VALUES },
] as const
const { config: CONFIG, applyFilters } = PowerSearch.createPowerSearchConfig(
  FIELD_DEFS,
  'Books',
)`,
}

const INITIAL_FILTERS: Record<string, string> = {
  showcase: `[
    { field: 'status', operator: 'is', value: { type: 'enum', value: 'open' } },
    { field: 'title', operator: 'contains', value: { type: 'string', value: 'dashboard' } },
  ]`,
  preset: `[
    { field: 'status', operator: 'is', value: { type: 'enum', value: 'open' } },
    { field: 'priority', operator: 'is', value: { type: 'enum', value: 'p1' } },
  ]`,
}

const BOOKS_DATA = `const BOOKS = [
  { id: '1', title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'sci-fi' },
  { id: '2', title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, genre: 'romance' },
  { id: '3', title: '1984', author: 'George Orwell', year: 1949, genre: 'sci-fi' },
  { id: '4', title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'fantasy' },
  { id: '5', title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'non-fiction' },
]`

const powerSearchSource = (
  fixture: PowerSearchFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const isStyleX = renderer === 'stylex'
  const ns = 'PowerSearch'
  const isBooks = fixture.configKey === 'books'
  const layoutProp = isStyleX ? 'layoutStyle' : 'class'
  const layoutValue = isStyleX
    ? 'exampleStyles.searchWidth'
    : `'w-full max-w-[${fixture.maxWidth}px]'`

  const initialFilters = INITIAL_FILTERS[fixture.configKey] ?? '[]'
  const viewBody = isBooks
    ? `const filtered = applyFilters(model.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>, BOOKS)
  const rows = filtered.map(book =>
    Table.tableRow(
      {
        children: [
          Table.tableCell(${isStyleX ? '{ layoutStyle: exampleStyles.wide' : "{ class: 'w-2/5'"}, children: [book.title] }, h),
          Table.tableCell(${isStyleX ? '{ layoutStyle: exampleStyles.wide' : "{ class: 'w-2/5'"}, children: [book.author] }, h),
          Table.tableCell(${isStyleX ? '{ layoutStyle: exampleStyles.year' : "{ class: 'w-28'"}, children: [String(book.year)] }, h),
          Table.tableCell(${isStyleX ? '{ layoutStyle: exampleStyles.genre' : "{ class: 'w-36'"}, children: [genreLabel(book.genre)] }, h),
        ],
      },
      h,
    ),
  )
  return {
    title: 'PowerSearch — Search with Table',
    body: h.main(
      [h.Class('flex min-h-screen items-start justify-center p-8')],
      [
        h.div(
          [h.Class('flex w-full max-w-lg flex-col gap-4')],
          [
            ${ns}.powerSearch(
              {
                model: model.search,
                toParentMessage: message => GotPowerSearchMessage({ message }),
                filters: model.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>,
                config: INTERNAL,
                placeholder: '${fixture.placeholder}',
                resultCount: filtered.length,
                ${layoutProp}: ${layoutValue},
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
        ),
      ],
    ),
  }`
    : `return {
    title: '${fixture.title}',
    body: h.main(
      [h.Class('flex min-h-screen items-start justify-center p-8')],
      [
        ${ns}.powerSearch(
          {
            model: model.search,
            toParentMessage: message => GotPowerSearchMessage({ message }),
            filters: model.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>,
            config: INTERNAL,
            placeholder: '${fixture.placeholder}',
            ${layoutProp}: ${layoutValue},
          },
          h,
        ),
      ],
    ),
  }`

  return foldkitApplication({
    title: `PowerSearch — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${isStyleX ? "import * as stylex from '@stylexjs/stylex'\n" : ''}import * as ${ns} from '@/${isStyleX ? 'stylex' : 'ui'}/power-search'${
      isBooks
        ? `
import * as Table from '@/${isStyleX ? 'stylex' : 'ui'}/table'`
        : ''
    }`,
    model: `${
      isStyleX
        ? `const exampleStyles = stylex.create({
  searchWidth: { width: '${fixture.maxWidth / 16}rem' },${
    isBooks
      ? `
  wide: { width: '40%' },
  year: { width: '7rem' },
  genre: { width: '9rem' },`
      : ''
  }
})
`
        : ''
    }export const Model = S.Struct({
  search: ${ns}.Model,
  filters: S.Array(S.Unknown),
})
export type Model = typeof Model.Type`,
    messages: `export const GotPowerSearchMessage = taggedStruct('GotPowerSearchMessage', {
  message: ${ns}.Message,
})
export const Message = S.Union([GotPowerSearchMessage])
export type Message = typeof Message.Type`,
    init: `${CONFIG_SOURCE[fixture.configKey]}
${isBooks ? `\n${BOOKS_DATA}\n` : ''}
const INTERNAL = ${ns}.createInternalConfig(CONFIG)

export const init = (): Update.Return<Model, Message> => ({
  model: {
    search: ${ns}.init({ id: 'power-search' }),
    filters: ${initialFilters},
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotPowerSearchMessage': {
      const resultCount = ${isBooks ? 'applyFilters(model.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>, BOOKS).length' : 'null'}
      const next = ${ns}.update(
        model.search,
        message.message,
        INTERNAL,
        model.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>,
        resultCount,
      )
      const filters =
        next.outMessage?._tag === 'ChangedPowerSearch'
          ? (next.outMessage.filters as ReadonlyArray<PowerSearch.PowerSearchFilter>)
          : model.filters
      return {
        model: { ...model, search: next.model, filters: [...filters] },
        commands: Command.mapMessages(next.commands ?? [], inner =>
          GotPowerSearchMessage({ message: inner })),
      }
    }
  }
}`,
    view: `${
      isBooks
        ? `const genreLabel = (genre: string): string =>
  GENRE_VALUES.find(g => g.value === genre)?.label ?? genre

`
        : ''
    }export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  ${viewBody}
}`,
  })
}

export const powerSearchExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  powerSearchFixtures.map((fixture, index) => ({
    title: fixture.title,
    keepIdsCanonical: index === 0,
    description: fixture.description,
    code: powerSearchSource(fixture, renderer),
  }))
