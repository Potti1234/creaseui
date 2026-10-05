import { reset } from '@/stylex/reset'
import { Command, type Update } from 'foldkit'
import { Effect, Option, Queue, Schema as S, Stream } from 'effect'
import * as Mount from 'foldkit/mount'
import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { foundationTokens } from './foundations-tokens.stylex'
import { tokens } from './tokens.stylex'
import { astryxTextStylex } from './astryx-text'

/* Ported from Meta Astryx PowerSearch (packages/core) — a faceted filter
   search bar: filter pills ("Status: is Open"), a typeahead input whose menu
   offers fields → operators → literal values (and free-text content search),
   and an edit popover with field/operator/value rows + Delete/Cancel/Apply.

   astryx leans on Tokenizer, Typeahead, Selector, NumberInput, DateInput and
   TreeList, none of which exist here; each is inlined below in crease styling
   (dropdown listboxes, chip rows, native date/number/time inputs). The
   nested-filter editor supports one level of sub-filters (astryx recurses via
   TreeList). i18n is inlined to astryx's en catalog strings.
   ReactNode callbacks port to Html; the SearchSource contract is kept. */

// =============================================================================
// Types (astryx types.ts)
// =============================================================================

export type EnumItem = Readonly<{ value: string; label: string }>

export type PowerSearchEntity = Readonly<{
  id: string
  label: string
  photo?: string
}>

export type SearchableItem = Readonly<{
  id: string
  label: string
  photo?: string
  auxiliaryData?: unknown
}>

/** astryx Typeahead SearchSource: filter a pool, or list it when no query. */
export type SearchSource = Readonly<{
  search: (query: string) => ReadonlyArray<SearchableItem>
  bootstrap?: () => ReadonlyArray<SearchableItem>
}>

export type DateTimeRangePart =
  | Readonly<{ type: 'NOW' }>
  | Readonly<{ type: 'ABSOLUTE'; unixSeconds: number }>
  | Readonly<{
      type: 'RELATIVE'
      backValue: number
      unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
    }>

export type DateTimeRange = Readonly<{
  start: DateTimeRangePart
  end: DateTimeRangePart
}>

export type OperatorValue =
  | Readonly<{ type: 'empty' }>
  | Readonly<{ type: 'string'; searchSource?: SearchSource }>
  | Readonly<{ type: 'string_list'; searchSource?: SearchSource }>
  | Readonly<{ type: 'integer' }>
  | Readonly<{ type: 'float' }>
  | Readonly<{ type: 'time' }>
  | Readonly<{ type: 'date_absolute' }>
  | Readonly<{
      type: 'date_relative'
      presets?: ReadonlyArray<RelativeDateFilterPreset>
    }>
  | Readonly<{ type: 'date_range' }>
  | Readonly<{ type: 'enum'; values: ReadonlyArray<EnumItem> }>
  | Readonly<{ type: 'enum_list'; values: ReadonlyArray<EnumItem> }>
  | Readonly<{ type: 'entity_list'; searchSource?: SearchSource }>
  | Readonly<{ type: 'custom' }>
  | Readonly<{ type: 'nested'; fields: ReadonlyArray<PowerSearchField> }>

export type RelativeDateFilterPreset = Readonly<{
  key: string
  label: string
  range: DateTimeRange
}>

export type PowerSearchOperator = Readonly<{
  key: string
  value: OperatorValue
}> &
  (Readonly<{ label: string }> | Readonly<{ i18nKey: string }>)

export type PowerSearchField = Readonly<{
  key: string
  label: string
  operators: ReadonlyArray<PowerSearchOperator>
  icon?: string
  defaultOperator?: string
  group?: string
  description?: string
  typeaheadAliases?: ReadonlyArray<string>
  typeaheadMinQueryLength?: number
  /** When false, "<field> <value>" literal suggestions are suppressed. */
  isValueMatchAllowed?: boolean
}>

export type FilterValue =
  | Readonly<{ type: 'empty' }>
  | Readonly<{ type: 'string'; value: string }>
  | Readonly<{ type: 'string_list'; value: ReadonlyArray<string> }>
  | Readonly<{ type: 'integer'; value: number }>
  | Readonly<{ type: 'float'; value: number }>
  | Readonly<{ type: 'time'; value: number }>
  | Readonly<{ type: 'date_absolute'; unixSeconds: number }>
  | Readonly<{ type: 'date_relative'; value: string }>
  | Readonly<{ type: 'date_range'; value: DateTimeRange }>
  | Readonly<{ type: 'enum'; value: string }>
  | Readonly<{ type: 'enum_list'; value: ReadonlyArray<string> }>
  | Readonly<{ type: 'entity_list'; value: ReadonlyArray<PowerSearchEntity> }>
  | Readonly<{ type: 'custom'; value: unknown }>
  | Readonly<{
      type: 'nested'
      value: ReadonlyArray<PowerSearchFilter>
    }>

export type PowerSearchFilter = Readonly<{
  field: string
  operator: string
  value: FilterValue
  isReadOnly?: boolean
}>

export type PartialFilter = Readonly<{
  field: string
  operator?: string
  value?: FilterValue
}>

export type PowerSearchConfig = Readonly<{
  name: string
  fields: ReadonlyArray<PowerSearchField>
  contentSearchFieldKey?: string
}>

export type PowerSearchChangeType = 'add' | 'edit' | 'remove'

// =============================================================================
// i18n (astryx en catalog, inlined)
// =============================================================================

const OPERATOR_I18N: Readonly<Record<string, string>> = {
  '@astryx.powersearch.operator.contains': 'contains',
  '@astryx.powersearch.operator.notContains': 'does not contain',
  '@astryx.powersearch.operator.startsWith': 'starts with',
  '@astryx.powersearch.operator.notStartsWith': 'does not start with',
  '@astryx.powersearch.operator.endsWith': 'ends with',
  '@astryx.powersearch.operator.notEndsWith': 'does not end with',
  '@astryx.powersearch.operator.is': 'is',
  '@astryx.powersearch.operator.isNot': 'is not',
  '@astryx.powersearch.operator.equals': 'is',
  '@astryx.powersearch.operator.notEquals': 'is not',
  '@astryx.powersearch.operator.greaterThan': 'is greater than',
  '@astryx.powersearch.operator.lessThan': 'is less than',
  '@astryx.powersearch.operator.greaterThanOrEqual':
    'is greater than or equal to',
  '@astryx.powersearch.operator.lessThanOrEqual': 'is less than or equal to',
  '@astryx.powersearch.operator.before': 'is before',
  '@astryx.powersearch.operator.after': 'is after',
  '@astryx.powersearch.operator.between': 'is between',
  '@astryx.powersearch.operator.isTrue': 'is true',
  '@astryx.powersearch.operator.isFalse': 'is false',
  '@astryx.powersearch.operator.isAnyOf': 'is any of',
  '@astryx.powersearch.operator.isNoneOf': 'is none of',
}

export const resolveOperatorLabel = (operator: PowerSearchOperator): string => {
  if ('label' in operator) {
    return operator.label
  }
  const i18nKey = (operator as Readonly<{ i18nKey: string }>).i18nKey
  return OPERATOR_I18N[i18nKey] ?? i18nKey
}

const UI = {
  searchLabel: 'Search',
  placeholder: 'Search…',
  editorField: 'Field',
  editorOperator: 'Operator',
  addFilter: '+ Add filter',
  removeFilter: 'Remove filter',
  deleteLabel: 'Delete',
  cancelLabel: 'Cancel',
  applyLabel: 'Apply',
  valueLabel: 'Value',
  valuesLabel: 'Values',
  timeLabel: 'Time',
  dateLabel: 'Date',
  relativeDateLabel: 'Relative date',
  startDateLabel: 'Start date',
  endDateLabel: 'End date',
  entitiesLabel: 'Entities',
  searchPlaceholder: 'Search…',
  enterValuePlaceholder: 'Enter value…',
  addValuesPlaceholder: 'Add values…',
  enterNumberPlaceholder: 'Enter number…',
  selectValuesPlaceholder: 'Select values…',
  dateRangeLabel: 'date range',
} as const

const itemsCount = (n: number): string => `${n} ${n === 1 ? 'item' : 'items'}`
const entitiesCount = (n: number): string =>
  `${n} ${n === 1 ? 'entity' : 'entities'}`
const filtersCount = (n: number): string =>
  `${n} ${n === 1 ? 'filter' : 'filters'}`

// =============================================================================
// Internal config (astryx useInternalConfig)
// =============================================================================

export type InternalPowerSearchConfig = Readonly<{
  name: string
  fields: ReadonlyArray<PowerSearchField>
  contentSearchFieldKey?: string
  fieldsByKey: ReadonlyMap<string, PowerSearchField>
  /** The portion of the fields array that precedes contentSearchFieldKey
      (astryx excludes the content-search field from field browsing). */
  nonContentSearchFields: ReadonlyArray<PowerSearchField>
  contentSearchField?: PowerSearchField
}>

export const createInternalConfig = (
  config: PowerSearchConfig,
): InternalPowerSearchConfig => {
  const fieldsByKey = new Map<string, PowerSearchField>()
  const nonContentSearchFields: PowerSearchField[] = []
  let contentSearchField: PowerSearchField | undefined
  for (const field of config.fields) {
    fieldsByKey.set(field.key, field)
    if (field.key === config.contentSearchFieldKey) {
      contentSearchField = field
    } else {
      nonContentSearchFields.push(field)
    }
  }
  return {
    name: config.name,
    fields: config.fields,
    fieldsByKey,
    nonContentSearchFields,
    ...(config.contentSearchFieldKey !== undefined
      ? { contentSearchFieldKey: config.contentSearchFieldKey }
      : {}),
    ...(contentSearchField !== undefined ? { contentSearchField } : {}),
  }
}

const resolveOperator = (
  config: InternalPowerSearchConfig,
  fieldKey: string,
  operatorKey: string,
): PowerSearchOperator | undefined =>
  config.fieldsByKey
    .get(fieldKey)
    ?.operators.find(operator => operator.key === operatorKey)

const defaultOperator = (
  field: PowerSearchField,
): PowerSearchOperator | undefined =>
  field.operators.find(operator => operator.key === field.defaultOperator) ??
  field.operators[0]

const defaultFilterValue = (
  operatorValue: OperatorValue,
): FilterValue | undefined => {
  switch (operatorValue.type) {
    case 'empty':
      return { type: 'empty' }
    case 'string_list':
      return { type: 'string_list', value: [] }
    case 'enum_list':
      return { type: 'enum_list', value: [] }
    case 'entity_list':
      return { type: 'entity_list', value: [] }
    case 'nested':
      return { type: 'nested', value: [] }
    default:
      return undefined
  }
}

// =============================================================================
// Date helpers (astryx resolveDateTimeRangePart + date input conversions)
// =============================================================================

const SECONDS_BY_UNIT: Readonly<Record<string, number>> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
}

export const resolveDateTimeRangePart = (
  part: DateTimeRangePart,
  nowSeconds: number = Date.now() / 1000,
): number => {
  switch (part.type) {
    case 'NOW':
      return Math.floor(nowSeconds)
    case 'ABSOLUTE':
      return part.unixSeconds
    case 'RELATIVE':
      return Math.floor(
        nowSeconds - part.backValue * (SECONDS_BY_UNIT[part.unit] ?? 1),
      )
  }
}

/** unixSeconds → `YYYY-MM-DD` (local time) for <input type="date">. */
const unixSecondsToDateInput = (unixSeconds: number): string => {
  const date = new Date(unixSeconds * 1000)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** `YYYY-MM-DD` → unixSeconds at local midnight (astryx DateInput epoch). */
const dateInputToUnixSeconds = (value: string): number | undefined => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined
  }
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  return Math.floor(date.getTime() / 1000)
}

/** Seconds since midnight → `HH:MM`. */
const secondsToTimeInput = (seconds: number): string => {
  const hours = `${Math.floor(seconds / 3600) % 24}`.padStart(2, '0')
  const minutes = `${Math.floor((seconds % 3600) / 60)}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

const timeInputToSeconds = (value: string): number | undefined => {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return undefined
  }
  const [hours, minutes] = value.split(':').map(Number)
  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60
}

const RELATIVE_DATE_PRESETS: ReadonlyArray<
  Readonly<{ key: string; label: string }>
> = [
  { key: '1d_ago', label: '1 day ago' },
  { key: '7d_ago', label: '7 days ago' },
  { key: '14d_ago', label: '14 days ago' },
  { key: '30d_ago', label: '30 days ago' },
  { key: '60d_ago', label: '60 days ago' },
  { key: '90d_ago', label: '90 days ago' },
  { key: '120d_ago', label: '120 days ago' },
  { key: '1w_ago', label: '1 week ago' },
  { key: '2w_ago', label: '2 weeks ago' },
  { key: '4w_ago', label: '4 weeks ago' },
  { key: '1m_ago', label: '1 month ago' },
  { key: '3m_ago', label: '3 months ago' },
  { key: '6m_ago', label: '6 months ago' },
  { key: '1d_from_now', label: '1 day from now' },
  { key: '7d_from_now', label: '7 days from now' },
  { key: '30d_from_now', label: '30 days from now' },
]

// =============================================================================
// formatFilterValue (astryx formatFilterValue.ts, en locale)
// =============================================================================

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value

const formatDateCompact = (unixSeconds: number): string =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(unixSeconds * 1000))

const formatDateDetailed = (unixSeconds: number): string =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(unixSeconds * 1000))

const formatTime = (seconds: number): string =>
  `${`${Math.floor(seconds / 3600) % 24}`.padStart(2, '0')}:${`${Math.floor(
    (seconds % 3600) / 60,
  )}`.padStart(2, '0')}`

export const formatFilterValue = (
  config: InternalPowerSearchConfig,
  operatorValue: OperatorValue,
  filterValue: FilterValue | undefined,
  maxLength: number,
): string => {
  if (filterValue === undefined) {
    return ''
  }
  const listLabel = (
    value: unknown,
    resolveLabel: (v: string) => string | undefined,
  ): string | undefined => {
    if (typeof value === 'string') {
      return resolveLabel(value)
    }
    return undefined
  }
  const enumLabel = (value: string): string => {
    if (operatorValue.type === 'enum' || operatorValue.type === 'enum_list') {
      return (
        operatorValue.values.find(item => item.value === value)?.label ?? value
      )
    }
    return value
  }

  switch (filterValue.type) {
    case 'empty':
      return ''
    case 'string':
      return truncate(filterValue.value, maxLength)
    case 'string_list': {
      const values = filterValue.value
      if (values.length <= 2) {
        return truncate(values.join(', '), maxLength)
      }
      return itemsCount(values.length)
    }
    case 'integer':
    case 'float':
      return `${filterValue.value}`
    case 'time':
      return formatTime(filterValue.value)
    case 'date_absolute':
      return formatDateDetailed(filterValue.unixSeconds)
    case 'date_relative':
      return truncate(
        RELATIVE_DATE_PRESETS.find(preset => preset.key === filterValue.value)
          ?.label ?? filterValue.value,
        maxLength,
      )
    case 'date_range':
      return UI.dateRangeLabel
    case 'enum':
      return truncate(
        listLabel(filterValue.value, enumLabel) ?? filterValue.value,
        maxLength,
      )
    case 'enum_list': {
      const values = filterValue.value
      if (values.length <= 2) {
        return truncate(values.map(enumLabel).join(', '), maxLength)
      }
      return itemsCount(values.length)
    }
    case 'entity_list': {
      const entities = filterValue.value
      if (entities.length <= 2) {
        return truncate(
          entities.map(entity => entity.label).join(', '),
          maxLength,
        )
      }
      return entitiesCount(entities.length)
    }
    case 'nested':
      return filtersCount(filterValue.value.length)
    case 'custom':
      return ''
  }
}

// =============================================================================
// Suggestion pipeline (astryx usePowerSearchSource)
// =============================================================================

export type PowerSearchSuggestion =
  | Readonly<{ kind: 'group'; label: string }>
  | Readonly<{ kind: 'field'; field: PowerSearchField }>
  | Readonly<{
      kind: 'operator'
      field: PowerSearchField
      operator: PowerSearchOperator
      label: string
    }>
  | Readonly<{
      kind: 'value'
      field: PowerSearchField
      operator: PowerSearchOperator
      value: FilterValue
      label: string
    }>
  | Readonly<{ kind: 'content'; query: string }>

const fieldSortWeight = (field: PowerSearchField): number =>
  field.group === undefined ? 0 : 1

/** Resolves "<operator> <value>" or bare "<value>" text into committed
    FilterValue items for a field (astryx resolveValueMatches). */
const resolveValueMatches = (
  field: PowerSearchField,
  valueText: string,
  limit: number,
): ReadonlyArray<PowerSearchSuggestion> => {
  const out: PowerSearchSuggestion[] = []
  const text = valueText.trim()
  if (text === '') {
    return out
  }
  for (const operator of field.operators) {
    if (out.length >= limit) {
      break
    }
    const opLabel = resolveOperatorLabel(operator)
    const rest = text.toLowerCase().startsWith(`${opLabel.toLowerCase()} `)
      ? text.slice(opLabel.length).trim()
      : text
    const typedAgainstOperator = rest !== text || out.length === 0
    if (!typedAgainstOperator) {
      continue
    }
    switch (operator.value.type) {
      case 'enum':
      case 'enum_list': {
        for (const item of operator.value.values) {
          if (out.length >= limit) {
            break
          }
          if (
            item.label.toLowerCase().includes(rest.toLowerCase()) ||
            item.value.toLowerCase().includes(rest.toLowerCase())
          ) {
            out.push({
              kind: 'value',
              field,
              operator,
              label: `${field.label} ${opLabel} ${item.label}`,
              value:
                operator.value.type === 'enum'
                  ? { type: 'enum', value: item.value }
                  : { type: 'enum_list', value: [item.value] },
            })
          }
        }
        break
      }
      case 'string': {
        if (field.isValueMatchAllowed !== false) {
          out.push({
            kind: 'value',
            field,
            operator,
            label: `${field.label} ${opLabel} "${rest}"`,
            value: { type: 'string', value: rest },
          })
        }
        break
      }
      case 'integer':
      case 'float': {
        const parsed = Number(rest)
        if (rest !== '' && Number.isFinite(parsed)) {
          out.push({
            kind: 'value',
            field,
            operator,
            label: `${field.label} ${opLabel} ${rest}`,
            value: {
              type: operator.value.type === 'integer' ? 'integer' : 'float',
              value:
                operator.value.type === 'integer' ? Math.trunc(parsed) : parsed,
            },
          })
        }
        break
      }
      default:
        break
    }
  }
  return out
}

/** astryx's combined "<field> <op> [value]" matcher over the raw query. */
const computeSuggestions = (
  config: InternalPowerSearchConfig,
  query: string,
  maxResults: number,
): ReadonlyArray<PowerSearchSuggestion> => {
  const trimmed = query.trim()
  const fields = config.nonContentSearchFields

  if (trimmed === '') {
    // Browse mode: ungrouped fields first, then group headers + members.
    const out: PowerSearchSuggestion[] = []
    const sorted = [...fields].sort(
      (a, b) => fieldSortWeight(a) - fieldSortWeight(b),
    )
    const seenGroups = new Set<string>()
    for (const field of sorted) {
      if (field.group !== undefined && !seenGroups.has(field.group)) {
        seenGroups.add(field.group)
        out.push({ kind: 'group', label: field.group })
      }
      out.push({ kind: 'field', field })
    }
    return out.slice(0, maxResults)
  }

  const lower = trimmed.toLowerCase()
  const out: PowerSearchSuggestion[] = []

  // 1. A leading "<field> " prefix shifts the query into operator/value space.
  const fieldPrefix = fields
    .filter(field => lower.startsWith(`${field.label.toLowerCase()} `))
    .sort((a, b) => b.label.length - a.label.length)[0]

  if (fieldPrefix !== undefined) {
    const rest = trimmed.slice(fieldPrefix.label.length).trim()
    for (const operator of fieldPrefix.operators) {
      const opLabel = resolveOperatorLabel(operator)
      if (
        rest === '' ||
        opLabel.toLowerCase().startsWith(rest.toLowerCase()) ||
        `${fieldPrefix.label.toLowerCase()} ${opLabel.toLowerCase()}`.includes(
          lower,
        )
      ) {
        out.push({
          kind: 'operator',
          field: fieldPrefix,
          operator,
          label: `${fieldPrefix.label} ${opLabel}`,
        })
      }
    }
    out.push(...resolveValueMatches(fieldPrefix, rest, maxResults - out.length))
    return out.slice(0, maxResults)
  }

  // 2. Plain text → field matches (label / key / typeahead aliases).
  const fieldMatches = fields.filter(field => {
    const minLength = field.typeaheadMinQueryLength ?? 1
    if (lower.length < minLength) {
      return false
    }
    const candidates = [
      field.label,
      field.key,
      ...(field.typeaheadAliases ?? []),
    ]
    return candidates.some(candidate => candidate.toLowerCase().includes(lower))
  })
  for (const field of fieldMatches) {
    out.push({ kind: 'field', field })
  }

  // 3. Literal "<field> <value>" suggestions across fields.
  for (const field of fieldMatches) {
    out.push(...resolveValueMatches(field, trimmed, maxResults - out.length))
    if (out.length >= maxResults) {
      break
    }
  }

  // 4. Content search fallback.
  const exactFieldMatch = fields.some(
    field => field.label.toLowerCase() === lower,
  )
  if (!exactFieldMatch && config.contentSearchField !== undefined) {
    out.push({ kind: 'content', query: trimmed })
  }

  return out.slice(0, maxResults)
}

// =============================================================================
// Filter application (astryx usePowerSearchConfig)
// =============================================================================

type FieldDefinitionType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'enum_list'
  | 'string_list'

export type FieldDefinition = Readonly<{
  key: string
  type: FieldDefinitionType
  label?: string
  enumValues?: ReadonlyArray<EnumItem>
}>

const i18nOp = (
  key: string,
  i18nKey: string,
  value: OperatorValue,
): PowerSearchOperator => ({ key, i18nKey, value })

/** astryx's default operator sets per FieldDefinition.type. */
const operatorsForDefinition = (
  definition: FieldDefinition,
): {
  defaultOperator: string
  operators: ReadonlyArray<PowerSearchOperator>
} => {
  switch (definition.type) {
    case 'string':
      return {
        defaultOperator: 'contains',
        operators: [
          i18nOp('contains', '@astryx.powersearch.operator.contains', {
            type: 'string',
          }),
          i18nOp('not_contains', '@astryx.powersearch.operator.notContains', {
            type: 'string',
          }),
          i18nOp('starts_with', '@astryx.powersearch.operator.startsWith', {
            type: 'string',
          }),
          i18nOp(
            'not_starts_with',
            '@astryx.powersearch.operator.notStartsWith',
            { type: 'string' },
          ),
          i18nOp('ends_with', '@astryx.powersearch.operator.endsWith', {
            type: 'string',
          }),
          i18nOp('not_ends_with', '@astryx.powersearch.operator.notEndsWith', {
            type: 'string',
          }),
          i18nOp('is', '@astryx.powersearch.operator.is', { type: 'string' }),
          i18nOp('is_not', '@astryx.powersearch.operator.isNot', {
            type: 'string',
          }),
        ],
      }
    case 'number':
      return {
        defaultOperator: 'equals',
        operators: [
          i18nOp('equals', '@astryx.powersearch.operator.equals', {
            type: 'float',
          }),
          i18nOp('not_equals', '@astryx.powersearch.operator.notEquals', {
            type: 'float',
          }),
          i18nOp('greater_than', '@astryx.powersearch.operator.greaterThan', {
            type: 'float',
          }),
          i18nOp('less_than', '@astryx.powersearch.operator.lessThan', {
            type: 'float',
          }),
          i18nOp(
            'greater_than_or_equal',
            '@astryx.powersearch.operator.greaterThanOrEqual',
            { type: 'float' },
          ),
          i18nOp(
            'less_than_or_equal',
            '@astryx.powersearch.operator.lessThanOrEqual',
            { type: 'float' },
          ),
        ],
      }
    case 'date':
      return {
        defaultOperator: 'after',
        operators: [
          i18nOp('before', '@astryx.powersearch.operator.before', {
            type: 'date_absolute',
          }),
          i18nOp('after', '@astryx.powersearch.operator.after', {
            type: 'date_absolute',
          }),
          i18nOp('between', '@astryx.powersearch.operator.between', {
            type: 'date_range',
          }),
        ],
      }
    case 'boolean':
      return {
        defaultOperator: 'is_true',
        operators: [
          i18nOp('is_true', '@astryx.powersearch.operator.isTrue', {
            type: 'empty',
          }),
          i18nOp('is_false', '@astryx.powersearch.operator.isFalse', {
            type: 'empty',
          }),
        ],
      }
    case 'enum': {
      const values = definition.enumValues ?? []
      return {
        defaultOperator: 'is',
        operators: [
          i18nOp('is', '@astryx.powersearch.operator.is', {
            type: 'enum',
            values,
          }),
          i18nOp('is_not', '@astryx.powersearch.operator.isNot', {
            type: 'enum',
            values,
          }),
          i18nOp('is_any_of', '@astryx.powersearch.operator.isAnyOf', {
            type: 'enum_list',
            values,
          }),
          i18nOp('is_none_of', '@astryx.powersearch.operator.isNoneOf', {
            type: 'enum_list',
            values,
          }),
        ],
      }
    }
    case 'enum_list': {
      const values = definition.enumValues ?? []
      return {
        defaultOperator: 'is_any_of',
        operators: [
          i18nOp('is_any_of', '@astryx.powersearch.operator.isAnyOf', {
            type: 'enum_list',
            values,
          }),
          i18nOp('is_none_of', '@astryx.powersearch.operator.isNoneOf', {
            type: 'enum_list',
            values,
          }),
        ],
      }
    }
    case 'string_list':
      return {
        defaultOperator: 'is_any_of',
        operators: [
          i18nOp('is_any_of', '@astryx.powersearch.operator.isAnyOf', {
            type: 'string_list',
          }),
          i18nOp('is_none_of', '@astryx.powersearch.operator.isNoneOf', {
            type: 'string_list',
          }),
        ],
      }
  }
}

const matchesFilter = (
  row: Record<string, unknown>,
  filter: PowerSearchFilter,
): boolean => {
  const fieldValue = row[filter.field]
  const { operator, value: filterValue } = filter

  const toStringValues = (value: unknown): string[] | null => {
    if (typeof value === 'string') {
      return [value]
    }
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      return value as string[]
    }
    return null
  }
  const toUnixSeconds = (value: unknown): number | null => {
    if (value instanceof Date) {
      return Math.floor(value.getTime() / 1000)
    }
    if (typeof value === 'number') {
      return value
    }
    return null
  }

  switch (filterValue.type) {
    case 'empty': {
      if (operator === 'is_true') {
        return Boolean(fieldValue) === true
      }
      if (operator === 'is_false') {
        return Boolean(fieldValue) === false
      }
      return true
    }
    case 'string': {
      if (typeof fieldValue !== 'string') {
        return false
      }
      const source = fieldValue.toLowerCase()
      const target = filterValue.value.toLowerCase()
      switch (operator) {
        case 'contains':
          return source.includes(target)
        case 'not_contains':
          return !source.includes(target)
        case 'starts_with':
          return source.startsWith(target)
        case 'not_starts_with':
          return !source.startsWith(target)
        case 'ends_with':
          return source.endsWith(target)
        case 'not_ends_with':
          return !source.endsWith(target)
        case 'is':
          return source === target
        case 'is_not':
          return source !== target
        default:
          return true
      }
    }
    case 'integer':
    case 'float': {
      if (typeof fieldValue !== 'number') {
        return false
      }
      const target = filterValue.value
      switch (operator) {
        case 'equals':
          return fieldValue === target
        case 'not_equals':
          return fieldValue !== target
        case 'greater_than':
          return fieldValue > target
        case 'less_than':
          return fieldValue < target
        case 'greater_than_or_equal':
          return fieldValue >= target
        case 'less_than_or_equal':
          return fieldValue <= target
        default:
          return true
      }
    }
    case 'date_absolute': {
      const timestamp = toUnixSeconds(fieldValue)
      if (timestamp === null) {
        return false
      }
      if (operator === 'before') {
        return timestamp < filterValue.unixSeconds
      }
      if (operator === 'after') {
        return timestamp > filterValue.unixSeconds
      }
      return true
    }
    case 'date_range': {
      const timestamp = toUnixSeconds(fieldValue)
      if (timestamp === null) {
        return false
      }
      if (operator === 'between') {
        const nowSeconds = Date.now() / 1000
        const start = resolveDateTimeRangePart(
          filterValue.value.start,
          nowSeconds,
        )
        const end = resolveDateTimeRangePart(filterValue.value.end, nowSeconds)
        return timestamp >= start && timestamp <= end
      }
      return true
    }
    case 'enum': {
      if (typeof fieldValue !== 'string') {
        return false
      }
      if (operator === 'is' || operator === 'is_any_of') {
        return fieldValue === filterValue.value
      }
      if (operator === 'is_not' || operator === 'is_none_of') {
        return fieldValue !== filterValue.value
      }
      return true
    }
    case 'enum_list':
    case 'string_list': {
      const values = toStringValues(fieldValue)
      if (values === null) {
        return false
      }
      if (operator === 'is_any_of' || operator === 'any_of') {
        return values.some(value => filterValue.value.includes(value))
      }
      if (operator === 'is_none_of' || operator === 'none_of') {
        return values.every(value => !filterValue.value.includes(value))
      }
      return true
    }
    case 'entity_list':
    case 'custom':
    case 'nested':
    case 'time':
    case 'date_relative':
      return true
  }
}

/** astryx createPowerSearchConfig / usePowerSearchConfig (memoization elided:
    the foldkit port is a pure factory — call it once per config). */
export const createPowerSearchConfig = (
  definitions: ReadonlyArray<FieldDefinition>,
  configName?: string,
): {
  config: PowerSearchConfig
  applyFilters: <Row extends Record<string, unknown>>(
    filters: ReadonlyArray<PowerSearchFilter>,
    data: ReadonlyArray<Row>,
  ) => Row[]
} => {
  const fields: PowerSearchField[] = definitions.map(definition => ({
    key: definition.key,
    label: definition.label ?? definition.key,
    ...operatorsForDefinition(definition),
  }))

  const config: PowerSearchConfig = {
    name: configName ?? 'PowerSearchConfig',
    fields,
  }

  const applyFilters = <Row extends Record<string, unknown>>(
    filters: ReadonlyArray<PowerSearchFilter>,
    data: ReadonlyArray<Row>,
  ): Row[] => {
    if (filters.length === 0) {
      return [...data]
    }
    return data.filter(row =>
      filters.every(filter =>
        matchesFilter(row as Record<string, unknown>, filter),
      ),
    )
  }

  return { config, applyFilters }
}

// =============================================================================
// Model
// =============================================================================

type PopoverState = 'idle' | 'adding' | 'editing'
const PopoverState = S.Literals(['idle', 'adding', 'editing'])

/** One row of the nested-filter editor (first level only — PORT-NOTE:
    astryx recurses arbitrarily via TreeList). */
const SubFilter = S.Struct({
  field: S.String,
  operator: S.NullOr(S.String),
  value: S.NullOr(S.Unknown),
})
type SubFilter = typeof SubFilter.Type

export const Model = S.Struct({
  id: S.String,
  query: S.String,
  isMenuOpen: S.Boolean,
  highlightedIndex: S.Number,
  popoverState: PopoverState,
  editingFilterIndex: S.Number,
  partialField: S.NullOr(S.String),
  partialOperator: S.NullOr(S.String),
  /** Draft FilterValue being edited (untyped in the schema — update writes
      only well-formed FilterValues). */
  draftValue: S.NullOr(S.Unknown),
  subFilters: S.Array(SubFilter),
  /** id → label for entity_list drafts (astryx entityRoundTripRef). */
  entityLabels: S.Record(S.String, S.String),
  editorQuery: S.String,
  /** Which editor listbox is open ('field'|'operator'|'enum'|'relative'|
      'enumList'|'entityList'|'subField-N'|'subOp-N'|'sub-N'). */
  editorMenu: S.NullOr(S.String),
  announcement: S.String,
  lastResultCountText: S.NullOr(S.String),
})
export type Model = typeof Model.Type

export const init = (config: { id: string }): Model => ({
  id: config.id,
  query: '',
  isMenuOpen: false,
  highlightedIndex: -1,
  popoverState: 'idle',
  editingFilterIndex: -1,
  partialField: null,
  partialOperator: null,
  draftValue: null,
  subFilters: [],
  entityLabels: {},
  editorQuery: '',
  editorMenu: null,
  announcement: '',
  lastResultCountText: null,
})

// =============================================================================
// Messages
// =============================================================================

export const Message = defineMessageUnion({
  ChangedPowerSearchQuery: { value: S.String },
  FocusedPowerSearchInput: {},
  PressedPowerSearchInputKey: { key: S.String },
  HighlightedPowerSearchItem: { index: S.Number },
  ClickedPowerSearchItem: { index: S.Number },
  ClickedEditFilterToken: { index: S.Number },
  ClickedRemoveFilterToken: { index: S.Number },
  ClickedClearPowerSearch: {},
  ClosedPowerSearchSurface: { targetInside: S.Boolean },
  SelectedEditorField: { fieldKey: S.String },
  SelectedEditorOperator: { operatorKey: S.String },
  ChangedEditorInput: { value: S.String },
  ChangedEditorDraft: { value: S.Unknown },
  ChangedEditorQuery: { value: S.String },
  SetEditorMenu: { menu: S.NullOr(S.String) },
  PressedEditorKey: { key: S.String },
  ClickedEditorSave: {},
  ClickedEditorDelete: {},
  ClickedEditorCancel: {},
  AddedNestedSubFilter: {},
  RemovedNestedSubFilter: { index: S.Number },
  ChangedNestedField: { index: S.Number, fieldKey: S.String },
  ChangedNestedOperator: { index: S.Number, operatorKey: S.String },
  ChangedNestedInput: { index: S.Number, value: S.String },
  ChangedNestedDraft: { index: S.Number, value: S.Unknown },
  CompletedFocusPowerSearchInput: {},
  CompletedFocusPowerSearchEditor: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ChangedPowerSearch: {
    filters: S.Unknown,
    changeType: S.String,
    index: S.NullOr(S.Number),
  },
})
export type OutMessage = typeof OutMessage.Type

// =============================================================================
// Commands / Mount
// =============================================================================

const FocusPowerSearchInput = Command.define('FocusPowerSearchInput', {
  args: { rootId: S.String },
  messages: [Message.CompletedFocusPowerSearchInput],
  execute: ({ rootId }) =>
    Effect.sync(() => {
      document
        .getElementById(rootId)
        ?.querySelector<HTMLInputElement>('[data-power-search-input]')
        ?.focus()
    }).pipe(Effect.as(Message.CompletedFocusPowerSearchInput())),
})

const FocusPowerSearchEditor = Command.define('FocusPowerSearchEditor', {
  args: { rootId: S.String },
  messages: [Message.CompletedFocusPowerSearchEditor],
  execute: ({ rootId }) =>
    Effect.sync(() => {
      const editor = document
        .getElementById(rootId)
        ?.querySelector<HTMLElement>('[data-power-search-editor]')
      const first = editor?.querySelector<HTMLElement>(
        'input:not(:disabled), button:not(:disabled), select:not(:disabled)',
      )
      first?.focus()
    }).pipe(Effect.as(Message.CompletedFocusPowerSearchEditor())),
})

/** Document-level pointerdown → close the menu/popover when the press lands
    outside the component root (astryx usePopover light-dismiss). */
const ObservePowerSearchDismiss = Mount.defineStream(
  'ObservePowerSearchDismiss',
  {
    messages: [Message.ClosedPowerSearchSurface],
    execute: () =>
      Stream.callback<typeof Message.ClosedPowerSearchSurface.Type>(queue =>
        Effect.gen(function* () {
          const handle = yield* Effect.acquireRelease(
            Effect.sync(() => {
              const listener = (event: PointerEvent) => {
                Queue.offerUnsafe(
                  queue,
                  Message.ClosedPowerSearchSurface({
                    targetInside:
                      event.target instanceof Element &&
                      event.target.closest('[data-power-search-root]') !== null,
                  }),
                )
              }
              document.addEventListener('pointerdown', listener)
              return listener
            }),
            listener =>
              Effect.sync(() => {
                document.removeEventListener('pointerdown', listener)
              }),
          )
          void handle
          return yield* Effect.never
        }),
      ),
  },
)

// =============================================================================
// Update
// =============================================================================

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

type FilterChange = Readonly<{
  filters: ReadonlyArray<PowerSearchFilter>
  changeType: PowerSearchChangeType
  index: number | null
}>

const emitChange = (
  model: Model,
  change: FilterChange,
  commands: Update.Commands<Message> = [],
): UpdateReturn => ({
  model,
  commands,
  outMessage: OutMessage.ChangedPowerSearch({
    filters: [...change.filters],
    changeType: change.changeType,
    index: change.index === null ? null : change.index,
  }),
})

const resultCountText = (resultCount: number | null): string | null =>
  resultCount === null
    ? null
    : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`

/** astryx useAnnounce on resultCountText changes. */
const announceResultCount = (
  model: Model,
  resultCount: number | null,
): Model => {
  const text = resultCountText(resultCount)
  if (text === model.lastResultCountText) {
    return model
  }
  return {
    ...model,
    lastResultCountText: text,
    announcement: text ?? '',
  }
}

const blankEditor: Pick<
  Model,
  | 'partialField'
  | 'partialOperator'
  | 'draftValue'
  | 'subFilters'
  | 'editorQuery'
  | 'editorMenu'
> = {
  partialField: null,
  partialOperator: null,
  draftValue: null,
  subFilters: [],
  editorQuery: '',
  editorMenu: null,
}

const openAddingPopover = (
  model: Model,
  field: PowerSearchField,
  operator: PowerSearchOperator | undefined,
): Model => {
  const resolvedOperator = operator ?? defaultOperator(field)
  const nestedField =
    resolvedOperator !== undefined && resolvedOperator.value.type === 'nested'
      ? resolvedOperator.value.fields[0]
      : undefined
  return {
    ...model,
    ...blankEditor,
    query: '',
    popoverState: 'adding',
    editingFilterIndex: -1,
    partialField: field.key,
    partialOperator: resolvedOperator?.key ?? null,
    draftValue:
      resolvedOperator === undefined
        ? null
        : (defaultFilterValue(resolvedOperator.value) ?? null),
    subFilters:
      resolvedOperator !== undefined && resolvedOperator.value.type === 'nested'
        ? [
            {
              field: nestedField?.key ?? '',
              operator: nestedField
                ? (defaultOperator(nestedField)?.key ?? null)
                : null,
              value: null,
            },
          ]
        : [],
  }
}

const openEditingPopover = (
  model: Model,
  config: InternalPowerSearchConfig,
  filters: ReadonlyArray<PowerSearchFilter>,
  index: number,
): Model => {
  const filter = filters[index]
  if (filter === undefined) {
    return model
  }
  const operator = resolveOperator(config, filter.field, filter.operator)
  const subFilters: SubFilter[] =
    filter.value.type === 'nested'
      ? filter.value.value.map(sub => ({
          field: sub.field,
          operator: sub.operator === '' ? null : sub.operator,
          value: sub.value,
        }))
      : []
  const entityLabels: Record<string, string> = {}
  if (filter.value.type === 'entity_list') {
    for (const entity of filter.value.value) {
      entityLabels[entity.id] = entity.label
    }
  }
  void operator
  return {
    ...model,
    ...blankEditor,
    popoverState: 'editing',
    editingFilterIndex: index,
    partialField: filter.field,
    partialOperator: filter.operator,
    draftValue: filter.value,
    subFilters,
    entityLabels,
  }
}

/** A draft is committable once field+operator are picked and the value is
    present for its type (astryx Apply-enable rule). */
const isDraftComplete = (
  config: InternalPowerSearchConfig,
  model: Model,
): boolean => {
  if (model.partialField === null || model.partialOperator === null) {
    return false
  }
  const operator = resolveOperator(
    config,
    model.partialField,
    model.partialOperator,
  )
  if (operator === undefined) {
    return false
  }
  if (operator.value.type === 'nested') {
    return model.subFilters.some(
      sub => sub.field !== '' && sub.operator !== null && sub.value !== null,
    )
  }
  const draft = model.draftValue as FilterValue | null
  if (draft === null) {
    return false
  }
  switch (draft.type) {
    case 'string_list':
    case 'enum_list':
    case 'entity_list':
      return draft.value.length > 0
    case 'nested':
      return draft.value.length > 0
    case 'empty':
      return true
    default:
      return true
  }
}

const subFilterValue = (
  config: InternalPowerSearchConfig,
  sub: SubFilter,
): FilterValue | null => {
  if (sub.value !== null) {
    return sub.value as FilterValue
  }
  const field = config.fieldsByKey.get(sub.field)
  const operator = field?.operators.find(op => op.key === sub.operator)
  if (operator === undefined) {
    return null
  }
  return defaultFilterValue(operator.value) ?? null
}

const commitEditor = (
  model: Model,
  config: InternalPowerSearchConfig,
  filters: ReadonlyArray<PowerSearchFilter>,
): UpdateReturn => {
  if (model.partialField === null || model.partialOperator === null) {
    return { model, commands: [] }
  }
  const operator = resolveOperator(
    config,
    model.partialField,
    model.partialOperator,
  )
  let value: FilterValue | null
  if (operator?.value.type === 'nested') {
    const subs: PowerSearchFilter[] = []
    for (const sub of model.subFilters) {
      if (sub.field === '' || sub.operator === null) {
        continue
      }
      const resolved = subFilterValue(config, sub)
      if (resolved !== null) {
        subs.push({ field: sub.field, operator: sub.operator, value: resolved })
      }
    }
    value = { type: 'nested', value: subs }
  } else {
    value = model.draftValue as FilterValue | null
  }
  if (value === null || !isDraftComplete(config, model)) {
    return { model, commands: [] }
  }
  const next: PowerSearchFilter = {
    field: model.partialField,
    operator: model.partialOperator,
    value,
  }
  const closed: Model = {
    ...model,
    ...blankEditor,
    popoverState: 'idle',
    editingFilterIndex: -1,
  }
  const focus = [FocusPowerSearchInput({ rootId: model.id })]
  if (model.popoverState === 'editing' && model.editingFilterIndex >= 0) {
    const nextFilters = filters.map((filter, index) =>
      index === model.editingFilterIndex ? next : filter,
    )
    return emitChange(
      closed,
      {
        filters: nextFilters,
        changeType: 'edit',
        index: model.editingFilterIndex,
      },
      focus,
    )
  }
  const index = filters.length
  return emitChange(
    closed,
    { filters: [...filters, next], changeType: 'add', index },
    focus,
  )
}

const cancelEditor = (model: Model): UpdateReturn => ({
  model: {
    ...model,
    ...blankEditor,
    popoverState: 'idle',
    editingFilterIndex: -1,
  },
  commands: [FocusPowerSearchInput({ rootId: model.id })],
})

export const update = (
  model: Model,
  message: Message,
  config: InternalPowerSearchConfig,
  filters: ReadonlyArray<PowerSearchFilter>,
  resultCount: number | null = null,
): UpdateReturn => {
  const done = (next: Model, commands: Update.Commands<Message> = []) =>
    ({
      model: announceResultCount(next, resultCount),
      commands,
    }) as UpdateReturn
  const doneWithChange = (
    next: Model,
    change: FilterChange,
    commands: Update.Commands<Message> = [],
  ) => emitChange(announceResultCount(next, resultCount), change, commands)

  switch (message._tag) {
    case 'ChangedPowerSearchQuery': {
      return done({
        ...model,
        query: message.value,
        isMenuOpen: true,
        highlightedIndex: -1,
      })
    }
    case 'FocusedPowerSearchInput': {
      if (model.popoverState !== 'idle') {
        return done(model)
      }
      return done({ ...model, isMenuOpen: true })
    }
    case 'PressedPowerSearchInputKey': {
      const suggestions = computeSuggestions(config, model.query, 10)
      switch (message.key) {
        case 'ArrowDown': {
          const selectable = suggestions
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item.kind !== 'group')
          if (selectable.length === 0) {
            return done(model)
          }
          const nextIndex =
            selectable.find(({ index }) => index > model.highlightedIndex)
              ?.index ??
            selectable[0]?.index ??
            -1
          return done({ ...model, highlightedIndex: nextIndex })
        }
        case 'ArrowUp': {
          const selectable = suggestions
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item.kind !== 'group')
          if (selectable.length === 0) {
            return done(model)
          }
          const previous = [...selectable]
            .reverse()
            .find(({ index }) => index < model.highlightedIndex)
          return done({
            ...model,
            highlightedIndex:
              previous?.index ?? selectable[selectable.length - 1]?.index ?? -1,
          })
        }
        case 'Enter': {
          if (model.highlightedIndex >= 0) {
            return update(
              model,
              Message.ClickedPowerSearchItem({
                index: model.highlightedIndex,
              }),
              config,
              filters,
              resultCount,
            )
          }
          return done({ ...model, isMenuOpen: false })
        }
        case 'Escape': {
          return done({ ...model, isMenuOpen: false, highlightedIndex: -1 })
        }
        case 'Backspace': {
          if (model.query !== '' || filters.length === 0) {
            return done(model)
          }
          // astryx Tokenizer: Backspace on an empty input removes the last
          // editable token.
          const lastEditable = [...filters]
            .map((filter, index) => ({ filter, index }))
            .reverse()
            .find(({ filter }) => filter.isReadOnly !== true)
          if (lastEditable === undefined) {
            return done(model)
          }
          const nextFilters = filters.filter(
            (_, index) => index !== lastEditable.index,
          )
          return doneWithChange(model, {
            filters: nextFilters,
            changeType: 'remove',
            index: lastEditable.index,
          })
        }
        default:
          return done(model)
      }
    }
    case 'HighlightedPowerSearchItem': {
      return done({ ...model, highlightedIndex: message.index })
    }
    case 'ClickedPowerSearchItem': {
      const suggestions = computeSuggestions(config, model.query, 10)
      const item = suggestions[message.index]
      if (item === undefined) {
        return done(model)
      }
      switch (item.kind) {
        case 'field': {
          // astryx: committing a field rewrites the query so the menu
          // re-lists that field's operators.
          return done({
            ...model,
            query: `${item.field.label} `,
            isMenuOpen: true,
            highlightedIndex: -1,
          })
        }
        case 'operator': {
          if (item.operator.value.type === 'empty') {
            const next: PowerSearchFilter = {
              field: item.field.key,
              operator: item.operator.key,
              value: { type: 'empty' },
            }
            return doneWithChange(
              { ...model, query: '', isMenuOpen: true },
              {
                filters: [...filters, next],
                changeType: 'add',
                index: filters.length,
              },
              [FocusPowerSearchInput({ rootId: model.id })],
            )
          }
          return done(
            {
              ...openAddingPopover(model, item.field, item.operator),
              isMenuOpen: false,
            },
            [FocusPowerSearchEditor({ rootId: model.id })],
          )
        }
        case 'value': {
          const next: PowerSearchFilter = {
            field: item.field.key,
            operator: item.operator.key,
            value: item.value,
          }
          return doneWithChange(
            { ...model, query: '', isMenuOpen: true },
            {
              filters: [...filters, next],
              changeType: 'add',
              index: filters.length,
            },
            [FocusPowerSearchInput({ rootId: model.id })],
          )
        }
        case 'content': {
          const field = config.contentSearchField
          const operator =
            field === undefined
              ? undefined
              : (field.operators.find(op => op.value.type === 'string') ??
                defaultOperator(field))
          if (field === undefined || operator === undefined) {
            return done(model)
          }
          const next: PowerSearchFilter = {
            field: field.key,
            operator: operator.key,
            value: { type: 'string', value: item.query },
          }
          return doneWithChange(
            { ...model, query: '', isMenuOpen: true },
            {
              filters: [...filters, next],
              changeType: 'add',
              index: filters.length,
            },
            [FocusPowerSearchInput({ rootId: model.id })],
          )
        }
        case 'group':
          return done(model)
      }
      break
    }
    case 'ClickedEditFilterToken': {
      const next = openEditingPopover(model, config, filters, message.index)
      return done({ ...next, isMenuOpen: false }, [
        FocusPowerSearchEditor({ rootId: model.id }),
      ])
    }
    case 'ClickedRemoveFilterToken': {
      const nextFilters = filters.filter((_, index) => index !== message.index)
      return doneWithChange(model, {
        filters: nextFilters,
        changeType: 'remove',
        index: message.index,
      })
    }
    case 'ClickedClearPowerSearch': {
      const nextFilters = filters.filter(filter => filter.isReadOnly === true)
      return doneWithChange(
        { ...model, query: '' },
        {
          filters: nextFilters,
          changeType: 'remove',
          index: null,
        },
      )
    }
    case 'ClosedPowerSearchSurface': {
      if (message.targetInside) {
        return done(model)
      }
      if (model.popoverState !== 'idle') {
        return cancelEditor(model)
      }
      return done({ ...model, isMenuOpen: false, highlightedIndex: -1 })
    }
    case 'SelectedEditorField': {
      const field = config.fieldsByKey.get(message.fieldKey)
      if (field === undefined) {
        return done(model)
      }
      const operator = defaultOperator(field)
      return done({
        ...model,
        partialField: field.key,
        partialOperator: operator?.key ?? null,
        draftValue:
          operator === undefined
            ? null
            : (defaultFilterValue(operator.value) ?? null),
        subFilters: [],
        editorQuery: '',
        editorMenu: null,
      })
    }
    case 'SelectedEditorOperator': {
      const operator = resolveOperator(
        config,
        model.partialField ?? '',
        message.operatorKey,
      )
      if (operator === undefined) {
        return done(model)
      }
      return done({
        ...model,
        partialOperator: operator.key,
        draftValue: defaultFilterValue(operator.value) ?? null,
        subFilters:
          operator.value.type === 'nested'
            ? [
                {
                  field: operator.value.fields[0]?.key ?? '',
                  operator: null,
                  value: null,
                },
              ]
            : [],
        editorQuery: '',
        editorMenu: null,
      })
    }
    case 'ChangedEditorInput': {
      const operator = resolveOperator(
        config,
        model.partialField ?? '',
        model.partialOperator ?? '',
      )
      if (operator === undefined) {
        return done(model)
      }
      const raw = message.value
      let draft: FilterValue | null = null
      switch (operator.value.type) {
        case 'string':
          draft = { type: 'string', value: raw }
          break
        case 'integer':
          draft =
            raw === '' || !Number.isFinite(Number(raw))
              ? null
              : { type: 'integer', value: Math.trunc(Number(raw)) }
          break
        case 'float':
          draft =
            raw === '' || !Number.isFinite(Number(raw))
              ? null
              : { type: 'float', value: Number(raw) }
          break
        case 'time': {
          const seconds = timeInputToSeconds(raw)
          draft =
            seconds === undefined ? null : { type: 'time', value: seconds }
          break
        }
        case 'date_absolute': {
          const seconds = dateInputToUnixSeconds(raw)
          draft =
            seconds === undefined
              ? null
              : { type: 'date_absolute', unixSeconds: seconds }
          break
        }
        case 'date_relative':
          draft = raw === '' ? null : { type: 'date_relative', value: raw }
          break
        case 'custom':
          draft = raw === '' ? null : { type: 'custom', value: raw }
          break
        default:
          break
      }
      return done({ ...model, draftValue: draft })
    }
    case 'ChangedEditorDraft': {
      const operator = resolveOperator(
        config,
        model.partialField ?? '',
        model.partialOperator ?? '',
      )
      if (operator === undefined) {
        return done(model)
      }
      const draft = message.value as FilterValue
      // astryx enum Selector commits immediately and closes the popover.
      if (operator.value.type === 'enum' && draft.type === 'enum') {
        return update(
          { ...model, draftValue: draft },
          Message.ClickedEditorSave(),
          config,
          filters,
          resultCount,
        )
      }
      return done({
        ...model,
        draftValue: draft,
        editorQuery: '',
        editorMenu: null,
      })
    }
    case 'ChangedEditorQuery': {
      return done({
        ...model,
        editorQuery: message.value,
        editorMenu: 'entityList',
      })
    }
    case 'SetEditorMenu': {
      return done({ ...model, editorMenu: message.menu })
    }
    case 'PressedEditorKey': {
      switch (message.key) {
        case 'Escape':
          if (model.editorMenu !== null) {
            return done({ ...model, editorMenu: null })
          }
          return cancelEditor(model)
        case 'Enter':
          if (model.editorMenu !== null) {
            return done({ ...model, editorMenu: null })
          }
          return commitEditor(model, config, filters)
        default:
          return done(model)
      }
    }
    case 'ClickedEditorSave': {
      return commitEditor(model, config, filters)
    }
    case 'ClickedEditorDelete': {
      const next = {
        ...model,
        ...blankEditor,
        popoverState: 'idle' as const,
        editingFilterIndex: -1,
      }
      return doneWithChange(
        next,
        {
          filters: filters.filter(
            (_, index) => index !== model.editingFilterIndex,
          ),
          changeType: 'remove',
          index: model.editingFilterIndex,
        },
        [FocusPowerSearchInput({ rootId: model.id })],
      )
    }
    case 'ClickedEditorCancel': {
      return cancelEditor(model)
    }
    case 'AddedNestedSubFilter': {
      const operator = resolveOperator(
        config,
        model.partialField ?? '',
        model.partialOperator ?? '',
      )
      const nestedFields =
        operator?.value.type === 'nested' ? operator.value.fields : []
      const first = nestedFields[0]
      return done({
        ...model,
        subFilters: [
          ...model.subFilters,
          {
            field: first?.key ?? '',
            operator: first ? (defaultOperator(first)?.key ?? null) : null,
            value: null,
          },
        ],
      })
    }
    case 'RemovedNestedSubFilter': {
      return done({
        ...model,
        subFilters: model.subFilters.filter(
          (_, index) => index !== message.index,
        ),
      })
    }
    case 'ChangedNestedField':
    case 'ChangedNestedOperator':
    case 'ChangedNestedInput':
    case 'ChangedNestedDraft': {
      const sub = model.subFilters[message.index]
      if (sub === undefined) {
        return done(model)
      }
      let next: SubFilter = sub
      if (message._tag === 'ChangedNestedField') {
        const nestedOperator = resolveOperator(
          config,
          model.partialField ?? '',
          model.partialOperator ?? '',
        )
        const nestedFields =
          nestedOperator?.value.type === 'nested'
            ? nestedOperator.value.fields
            : []
        const field = nestedFields.find(
          candidate => candidate.key === message.fieldKey,
        )
        if (field === undefined) {
          return done(model)
        }
        const op = defaultOperator(field)
        next = {
          field: field.key,
          operator: op?.key ?? null,
          value: null,
        }
      } else if (message._tag === 'ChangedNestedOperator') {
        next = { ...sub, operator: message.operatorKey, value: null }
      } else {
        next = {
          ...sub,
          value:
            message._tag === 'ChangedNestedInput'
              ? message.value === ''
                ? null
                : { type: 'string', value: message.value }
              : message.value,
        }
      }
      return done({
        ...model,
        subFilters: model.subFilters.map((candidate, index) =>
          index === message.index ? next : candidate,
        ),
      })
    }
    case 'CompletedFocusPowerSearchInput':
    case 'CompletedFocusPowerSearchEditor': {
      return done(model)
    }
  }
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
    width: '100%',
  },
  bar: {
    borderColor: tokens.input,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '0.25rem',
    alignItems: 'center',
    backgroundColor: 'transparent',
    boxShadow: foundationTokens.shadowXs,
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: '2.25rem',
    paddingBottom: '0.25rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.25rem',
    width: '100%',
  },
  barOpen: {
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
  },
  barDisabled: {
    cursor: interactionTokens.cursorDisabled,
    opacity: 0.5,
  },
  searchIcon: {
    color: tokens.mutedForeground,
    flexShrink: 0,
    height: '1rem',
    width: '1rem',
  },
  chip: {
    borderRadius: tokens.controlRadius,
    gap: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.muted,
    color: tokens.foreground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    height: '1.5rem',
    maxWidth: '15rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },
  chipInteractive: {
    backgroundColor: {
      default: tokens.muted,
      ':hover': tokens.accent,
    },
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  chipEditing: {
    outlineColor: tokens.ring,
    outlineStyle: 'solid',
    outlineWidth: 1,
  },
  chipDimmed: {
    opacity: 0.5,
  },
  chipButton: {
    font: 'inherit',
    padding: 0,
    borderStyle: 'none',
    gap: '0.25rem',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: tokens.foreground,
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tokenLabel: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tokenValue: {
    overflow: 'hidden',
    fontWeight: 600,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    padding: 0,
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
  },
  iconXs: {
    height: '0.75rem',
    width: '0.75rem',
  },
  iconSm: {
    height: '0.875rem',
    width: '0.875rem',
  },
  iconMd: {
    height: '1rem',
    width: '1rem',
  },
  iconMuted: {
    color: tokens.mutedForeground,
    flexShrink: 0,
    height: '0.875rem',
    width: '0.875rem',
  },
  searchInput: {
    borderStyle: 'none',
    flex: '1',
    backgroundColor: 'transparent',
    color: tokens.foreground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    minWidth: '5rem',
  },
  resultText: {
    color: tokens.mutedForeground,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  menuContainer: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: tokens.cardRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: tokens.card,
    color: tokens.cardForeground,
    position: 'absolute',
    zIndex: 50,
    left: 0,
    marginTop: '0.25rem',
    maxHeight: '15rem',
    overflowY: 'auto',
    right: 0,
    top: '100%',
  },
  menuItem: {
    borderRadius: tokens.controlRadius,
    borderStyle: 'none',
    gap: '0.5rem',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: tokens.cardForeground,
    cursor: interactionTokens.cursorDefault,
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    textAlign: 'left',
    userSelect: 'none',
    paddingBottom: '0.375rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '0.375rem',
    width: '100%',
  },
  menuItemActive: {
    backgroundColor: tokens.accent,
    color: tokens.accentForeground,
  },
  menuItemLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuItemDescription: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginLeft: 'auto',
  },
  groupLabel: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
    paddingBottom: '0.25rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '0.5rem',
  },
  editorPopover: {
    borderColor: tokens.border,
    borderRadius: tokens.cardRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: tokens.card,
    color: tokens.cardForeground,
    position: 'absolute',
    zIndex: 50,
    left: 0,
    marginTop: '0.25rem',
    minWidth: '25rem',
    right: 0,
    top: '100%',
  },
  editorPad: {
    padding: '1rem',
    containerType: 'inline-size',
  },
  editorRow: {
    gap: '0.5rem',
    alignItems: 'flex-end',
    display: 'flex',
    flexWrap: {
      default: 'wrap',
      '@container (min-width: 24.9rem)': 'nowrap',
    },
  },
  fieldCell: {
    flex: '1',
    minWidth: '7rem',
  },
  fieldLabel: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
    marginBottom: '0.25rem',
  },
  inputControl: {
    borderColor: tokens.input,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: 'transparent',
    color: tokens.foreground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    height: '2rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    width: '100%',
  },
  selectTrigger: {
    padding: 0,
    gap: '0.5rem',
    alignItems: 'center',
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'left',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },
  selectTriggerLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  selectPlaceholder: {
    color: tokens.mutedForeground,
  },
  relativeWrap: {
    position: 'relative',
  },
  chipsWrap: {
    gap: '0.25rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    height: 'auto',
    minHeight: '2rem',
    paddingBottom: '0.25rem',
    paddingTop: '0.25rem',
  },
  chipTailInput: {
    borderStyle: 'none',
    flex: '1',
    backgroundColor: 'transparent',
    color: tokens.foreground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    outlineStyle: 'none',
    minWidth: '4rem',
  },
  chipTailButton: {
    borderStyle: 'none',
    flex: '1',
    backgroundColor: 'transparent',
    color: tokens.mutedForeground,
    cursor: interactionTokens.cursorAction,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    outlineStyle: 'none',
    textAlign: 'left',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
  },
  editorFooter: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '0.75rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
  },
  ghostButton: {
    borderRadius: tokens.controlRadius,
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
    },
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    height: '2rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
  },
  primaryButton: {
    borderRadius: tokens.controlRadius,
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: {
      default: tokens.primary,
      ':hover': tokens.primaryHover,
    },
    color: tokens.primaryForeground,
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    height: '2rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
  },
  primaryButtonDisabled: {
    cursor: interactionTokens.cursorDisabled,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  buttonRow: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
  },
  nestedRows: {
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.75rem',
  },
  addFilterButton: {
    padding: 0,
    borderStyle: 'none',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    cursor: interactionTokens.cursorAction,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
  },
  removeSubButton: {
    padding: 0,
    alignItems: 'center',
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: '2rem',
    width: '2rem',
  },
  subRow: {
    gap: '0.5rem',
    alignItems: 'flex-end',
    display: 'flex',
  },
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: 1,
    width: 1,
  },
})

export type PowerSearchProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  /** Controlled filter list (astryx `filters` prop + `onChange`). */
  filters: ReadonlyArray<PowerSearchFilter>
  config: InternalPowerSearchConfig
  placeholder?: string
  /** Max characters of the formatted value inside a token. @default 40 */
  valueMaxLength?: number
  resultCount?: number
  /** astryx `hasClear`. @default false */
  hasClear?: boolean
  isDisabled?: boolean
  /** Content rendered after the input, before the clear button. */
  endContent?: Html
  layoutStyle?: ComponentLayoutStyle
}>

type ToParent<Msg> = (message: Message) => Msg

type Ctx<Msg> = Readonly<{
  model: Model
  config: InternalPowerSearchConfig
  toParent: ToParent<Msg>
  h: HtmlBuilder<Msg>
}>

const menuItemIcon = <Msg>(
  item: PowerSearchSuggestion,
  ctx: Ctx<Msg>,
): Html => {
  const name =
    item.kind === 'field'
      ? (item.field.icon ?? 'menu')
      : item.kind === 'operator'
        ? 'menu'
        : 'search'
  return Icon.icon(name, { class: className(styles.iconMuted) }, ctx.h)
}

const menu = <Msg>(ctx: Ctx<Msg>): Html => {
  const { model, h, toParent } = ctx
  const suggestions = computeSuggestions(ctx.config, model.query, 10)
  if (suggestions.length === 0) {
    return h.empty
  }
  return h.div(
    [
      h.Class(className(styles.menuContainer)),
      h.Role('listbox'),
      h.AriaLabel('Suggestions'),
    ],
    suggestions.map((item, index) => {
      const highlighted = index === model.highlightedIndex
      if (item.kind === 'group') {
        return h.div(
          [h.Key(`group-${item.label}`), h.Class(className(styles.groupLabel))],
          [item.label],
        )
      }
      const label =
        item.kind === 'field'
          ? item.field.label
          : item.kind === 'operator'
            ? item.label
            : item.kind === 'value'
              ? item.label
              : `"${item.query}"`
      const description =
        item.kind === 'field' ? item.field.description : undefined
      return h.button(
        [
          h.Key(`item-${index}`),
          h.Type('button'),
          h.Role('option'),
          h.AriaSelected(highlighted),
          h.Class(
            className(
              reset.button,
              styles.menuItem,
              ...(highlighted ? [styles.menuItemActive] : []),
            ),
          ),
          h.OnMouseEnter(
            toParent(Message.HighlightedPowerSearchItem({ index })),
          ),
          h.OnClick(toParent(Message.ClickedPowerSearchItem({ index }))),
        ],
        [
          menuItemIcon(item, ctx),
          h.span([h.Class(className(styles.menuItemLabel))], [label]),
          ...(description === undefined
            ? []
            : [
                h.span(
                  [h.Class(className(styles.menuItemDescription))],
                  [description],
                ),
              ]),
        ],
      )
    }),
  )
}

type EditorMenuKey = string

const editorSelect = <Msg>(
  ctx: Ctx<Msg>,
  args: Readonly<{
    menuKey: EditorMenuKey
    label: string
    options: ReadonlyArray<Readonly<{ value: string; label: string }>>
    selected: string | null
    placeholder?: string
    onPick: (value: string) => Message
  }>,
): Html => {
  const { model, h, toParent } = ctx
  const isOpen = model.editorMenu === args.menuKey
  const current = args.options.find(option => option.value === args.selected)
  return h.div(
    [h.Class(className(styles.fieldCell))],
    [
      h.div([h.Class(className(styles.fieldLabel))], [args.label]),
      h.div(
        [h.Class(className(styles.relativeWrap))],
        [
          h.button(
            [
              h.Type('button'),
              h.Class(
                className(
                  reset.button,
                  styles.inputControl,
                  styles.selectTrigger,
                ),
              ),
              h.OnClick(
                toParent(
                  Message.SetEditorMenu({ menu: isOpen ? null : args.menuKey }),
                ),
              ),
            ],
            [
              h.span(
                [
                  h.Class(
                    className(
                      styles.selectTriggerLabel,
                      ...(current === undefined
                        ? [styles.selectPlaceholder]
                        : []),
                    ),
                  ),
                ],
                [
                  current?.label ??
                    args.placeholder ??
                    UI.selectValuesPlaceholder,
                ],
              ),
              Icon.icon(
                'chevron-down',
                { class: className(styles.iconMuted) },
                h,
              ),
            ],
          ),
          ...(isOpen
            ? [
                h.div(
                  [h.Class(className(styles.menuContainer)), h.Role('listbox')],
                  args.options.map(option =>
                    h.button(
                      [
                        h.Key(option.value),
                        h.Type('button'),
                        h.Role('option'),
                        h.AriaSelected(option.value === args.selected),
                        h.Class(
                          className(
                            reset.button,
                            styles.menuItem,
                            ...(option.value === args.selected
                              ? [styles.menuItemActive]
                              : []),
                          ),
                        ),
                        h.OnClick(toParent(args.onPick(option.value))),
                      ],
                      [option.label],
                    ),
                  ),
                ),
              ]
            : []),
        ],
      ),
    ],
  )
}

const editorChips = <Msg>(
  ctx: Ctx<Msg>,
  args: Readonly<{
    values: ReadonlyArray<Readonly<{ id: string; label: string }>>
    onRemove: (id: string) => Message
    tail: Html
  }>,
): Html => {
  const { h, toParent } = ctx
  return h.div(
    [h.Class(className(styles.inputControl, styles.chipsWrap))],
    [
      ...args.values.map(item =>
        h.span(
          [h.Key(item.id), h.Class(className(styles.chip))],
          [
            item.label,
            h.button(
              [
                h.Type('button'),
                h.Class(className(reset.button, styles.iconButton)),
                h.AriaLabel(UI.removeFilter),
                h.OnClick(toParent(args.onRemove(item.id))),
              ],
              [Icon.icon('x', { class: className(styles.iconXs) }, h)],
            ),
          ],
        ),
      ),
      args.tail,
    ],
  )
}

const removeFromList = (
  draft: FilterValue | null,
  listType: 'string_list' | 'enum_list' | 'entity_list',
  id: string,
): FilterValue | null => {
  if (draft === null || draft.type !== listType) {
    return draft
  }
  if (draft.type === 'entity_list') {
    return {
      type: 'entity_list',
      value: draft.value.filter(entity => entity.id !== id),
    }
  }
  if (draft.type === 'enum_list' || draft.type === 'string_list') {
    return {
      type: draft.type,
      value: draft.value.filter(value => value !== id),
    }
  }
  return draft
}

const editorLabel = <Msg>(ctx: Ctx<Msg>, label: string, control: Html): Html =>
  ctx.h.div(
    [ctx.h.Class(className(styles.fieldCell))],
    [ctx.h.div([ctx.h.Class(className(styles.fieldLabel))], [label]), control],
  )

const editorValueControl = <Msg>(ctx: Ctx<Msg>): Html => {
  const { model, config, h, toParent } = ctx
  const operator = resolveOperator(
    config,
    model.partialField ?? '',
    model.partialOperator ?? '',
  )
  if (operator === undefined) {
    return h.empty
  }
  const opValue = operator.value
  if (opValue.type === 'empty') {
    return h.empty
  }
  const draft = model.draftValue as FilterValue | null
  const textInput = (inputType: string, value: string, placeholder: string) =>
    h.input([
      h.Type(inputType),
      h.Class(className(reset.input, styles.inputControl)),
      h.Value(value),
      h.Placeholder(placeholder),
      h.OnInput((value: string) =>
        toParent(Message.ChangedEditorInput({ value })),
      ),
    ])

  switch (opValue.type) {
    case 'string': {
      const value = draft?.type === 'string' ? draft.value : ''
      return editorLabel(
        ctx,
        UI.valueLabel,
        textInput('text', value, UI.enterValuePlaceholder),
      )
    }
    case 'integer':
    case 'float': {
      const value =
        draft !== null && (draft.type === 'integer' || draft.type === 'float')
          ? `${draft.value}`
          : ''
      return editorLabel(
        ctx,
        UI.valueLabel,
        textInput('number', value, UI.enterNumberPlaceholder),
      )
    }
    case 'time': {
      const value =
        draft?.type === 'time' ? secondsToTimeInput(draft.value) : ''
      return editorLabel(ctx, UI.timeLabel, textInput('time', value, ''))
    }
    case 'date_absolute': {
      const value =
        draft?.type === 'date_absolute'
          ? unixSecondsToDateInput(draft.unixSeconds)
          : ''
      return editorLabel(ctx, UI.dateLabel, textInput('date', value, ''))
    }
    case 'date_relative': {
      const options = RELATIVE_DATE_PRESETS.map(preset => ({
        value: preset.key,
        label: preset.label,
      }))
      return editorSelect(ctx, {
        menuKey: 'relative',
        label: UI.relativeDateLabel,
        options,
        selected: draft?.type === 'date_relative' ? draft.value : null,
        onPick: value =>
          Message.ChangedEditorDraft({
            value: { type: 'date_relative', value },
          }),
      })
    }
    case 'date_range': {
      const range = draft?.type === 'date_range' ? draft.value : undefined
      const start =
        range?.start.type === 'ABSOLUTE'
          ? unixSecondsToDateInput(range.start.unixSeconds)
          : ''
      const end =
        range?.end.type === 'ABSOLUTE'
          ? unixSecondsToDateInput(range.end.unixSeconds)
          : ''
      const toPart = (raw: string): DateTimeRangePart => {
        const seconds = dateInputToUnixSeconds(raw)
        return seconds === undefined
          ? { type: 'NOW' }
          : { type: 'ABSOLUTE', unixSeconds: seconds }
      }
      return h.div(
        [h.Class(className(styles.fieldCell))],
        [
          h.div(
            [h.Class(className(styles.buttonRow))],
            [
              editorLabel(
                ctx,
                UI.startDateLabel,
                h.input([
                  h.Type('date'),
                  h.Class(className(reset.input, styles.inputControl)),
                  h.Value(start),
                  h.OnInput((raw: string) =>
                    toParent(
                      Message.ChangedEditorDraft({
                        value: {
                          type: 'date_range',
                          value: {
                            start: toPart(raw),
                            end: range?.end ?? { type: 'NOW' },
                          },
                        },
                      }),
                    ),
                  ),
                ]),
              ),
              editorLabel(
                ctx,
                UI.endDateLabel,
                h.input([
                  h.Type('date'),
                  h.Class(className(reset.input, styles.inputControl)),
                  h.Value(end),
                  h.OnInput((raw: string) =>
                    toParent(
                      Message.ChangedEditorDraft({
                        value: {
                          type: 'date_range',
                          value: {
                            start: range?.start ?? {
                              type: 'ABSOLUTE',
                              unixSeconds: 0,
                            },
                            end: toPart(raw),
                          },
                        },
                      }),
                    ),
                  ),
                ]),
              ),
            ],
          ),
        ],
      )
    }
    case 'enum': {
      return editorSelect(ctx, {
        menuKey: 'enum',
        label: UI.valueLabel,
        options: opValue.values.map(item => ({
          value: item.value,
          label: item.label,
        })),
        selected: draft?.type === 'enum' ? draft.value : null,
        onPick: value =>
          Message.ChangedEditorDraft({ value: { type: 'enum', value } }),
      })
    }
    case 'enum_list': {
      const selected = draft?.type === 'enum_list' ? draft.value : []
      const remaining = opValue.values.filter(
        item => !selected.includes(item.value),
      )
      const isOpen = model.editorMenu === 'enumList'
      return h.div(
        [h.Class(className(styles.fieldCell))],
        [
          h.div([h.Class(className(styles.fieldLabel))], [UI.valuesLabel]),
          h.div(
            [h.Class(className(styles.relativeWrap))],
            [
              editorChips(ctx, {
                values: selected.map(value => ({
                  id: value,
                  label:
                    opValue.values.find(item => item.value === value)?.label ??
                    value,
                })),
                onRemove: id =>
                  Message.ChangedEditorDraft({
                    value: removeFromList(draft, 'enum_list', id),
                  }),
                tail: h.button(
                  [
                    h.Type('button'),
                    h.Class(className(reset.button, styles.chipTailButton)),
                    h.OnClick(
                      toParent(
                        Message.SetEditorMenu({
                          menu: isOpen ? null : 'enumList',
                        }),
                      ),
                    ),
                  ],
                  [selected.length === 0 ? UI.selectValuesPlaceholder : ''],
                ),
              }),
              ...(isOpen && remaining.length > 0
                ? [
                    h.div(
                      [h.Class(className(styles.menuContainer))],
                      remaining.map(item =>
                        h.button(
                          [
                            h.Key(item.value),
                            h.Type('button'),
                            h.Class(className(reset.button, styles.menuItem)),
                            h.OnClick(
                              toParent(
                                Message.ChangedEditorDraft({
                                  value: {
                                    type: 'enum_list',
                                    value: [...selected, item.value],
                                  },
                                }),
                              ),
                            ),
                          ],
                          [item.label],
                        ),
                      ),
                    ),
                  ]
                : []),
            ],
          ),
        ],
      )
    }
    case 'entity_list': {
      const selected = draft?.type === 'entity_list' ? draft.value : []
      const source = opValue.searchSource
      const pool =
        source === undefined
          ? []
          : model.editorQuery === ''
            ? [...(source.bootstrap?.() ?? [])]
            : [...source.search(model.editorQuery)]
      const suggestions = pool.filter(
        item => !selected.some(entity => entity.id === item.id),
      )
      const isOpen = model.editorMenu === 'entityList'
      return h.div(
        [h.Class(className(styles.fieldCell))],
        [
          h.div([h.Class(className(styles.fieldLabel))], [UI.entitiesLabel]),
          h.div(
            [h.Class(className(styles.relativeWrap))],
            [
              editorChips(ctx, {
                values: selected.map(entity => ({
                  id: entity.id,
                  label: entity.label,
                })),
                onRemove: id =>
                  Message.ChangedEditorDraft({
                    value: removeFromList(draft, 'entity_list', id),
                  }),
                tail: h.input([
                  h.Type('text'),
                  h.Class(className(reset.input, styles.chipTailInput)),
                  h.Value(model.editorQuery),
                  h.Placeholder(UI.searchPlaceholder),
                  h.OnInput((value: string) =>
                    toParent(Message.ChangedEditorQuery({ value })),
                  ),
                  h.OnFocus(
                    toParent(Message.SetEditorMenu({ menu: 'entityList' })),
                  ),
                ]),
              }),
              ...(isOpen && suggestions.length > 0
                ? [
                    h.div(
                      [h.Class(className(styles.menuContainer))],
                      suggestions.map(item =>
                        h.button(
                          [
                            h.Key(item.id),
                            h.Type('button'),
                            h.Class(className(reset.button, styles.menuItem)),
                            h.OnClick(
                              toParent(
                                Message.ChangedEditorDraft({
                                  value: {
                                    type: 'entity_list',
                                    value: [
                                      ...selected,
                                      { id: item.id, label: item.label },
                                    ],
                                  },
                                }),
                              ),
                            ),
                          ],
                          [item.label],
                        ),
                      ),
                    ),
                  ]
                : []),
            ],
          ),
        ],
      )
    }
    case 'string_list': {
      const selected = draft?.type === 'string_list' ? draft.value : []
      return h.div(
        [h.Class(className(styles.fieldCell))],
        [
          h.div([h.Class(className(styles.fieldLabel))], [UI.valuesLabel]),
          editorChips(ctx, {
            values: selected.map(value => ({ id: value, label: value })),
            onRemove: id =>
              Message.ChangedEditorDraft({
                value: removeFromList(draft, 'string_list', id),
              }),
            tail: h.input([
              h.Type('text'),
              h.Class(className(reset.input, styles.chipTailInput)),
              h.Value(model.editorQuery),
              h.Placeholder(UI.addValuesPlaceholder),
              h.OnInput((value: string) =>
                toParent(Message.ChangedEditorQuery({ value })),
              ),
              h.OnKeyDownPreventDefault((key: string) =>
                key === 'Enter' && model.editorQuery.trim() !== ''
                  ? Option.some(
                      toParent(
                        Message.ChangedEditorDraft({
                          value: {
                            type: 'string_list',
                            value: [...selected, model.editorQuery.trim()],
                          },
                        }),
                      ),
                    )
                  : key === 'Escape'
                    ? Option.some(toParent(Message.PressedEditorKey({ key })))
                    : Option.none(),
              ),
            ]),
          }),
        ],
      )
    }
    case 'nested':
    case 'custom':
      return h.empty
  }
}

const nestedEditor = <Msg>(ctx: Ctx<Msg>): Html => {
  const { model, config, h, toParent } = ctx
  const operator = resolveOperator(
    config,
    model.partialField ?? '',
    model.partialOperator ?? '',
  )
  if (operator === undefined || operator.value.type !== 'nested') {
    return h.empty
  }
  const fields = operator.value.fields
  return h.div(
    [h.Class(className(styles.nestedRows))],
    [
      ...model.subFilters.map((sub, index) => {
        const subField = fields.find(field => field.key === sub.field)
        const subOperator = subField?.operators.find(
          candidate => candidate.key === sub.operator,
        )
        const subOpValue = subOperator?.value
        const subValue = sub.value as FilterValue | null
        const valueControl = (() => {
          if (subField === undefined || subOpValue === undefined) {
            return h.empty
          }
          switch (subOpValue.type) {
            case 'enum':
            case 'enum_list':
              return editorSelect(ctx, {
                menuKey: `sub-${index}`,
                label: UI.valueLabel,
                options: subOpValue.values.map(item => ({
                  value: item.value,
                  label: item.label,
                })),
                selected: subValue?.type === 'enum' ? subValue.value : null,
                onPick: value =>
                  Message.ChangedNestedDraft({
                    index,
                    value: { type: 'enum', value },
                  }),
              })
            case 'integer':
            case 'float':
              return h.input([
                h.Type('number'),
                h.Class(className(reset.input, styles.inputControl)),
                h.Value(
                  subValue !== null &&
                    (subValue.type === 'integer' || subValue.type === 'float')
                    ? `${subValue.value}`
                    : '',
                ),
                h.Placeholder(UI.enterNumberPlaceholder),
                h.OnInput((value: string) =>
                  toParent(
                    Message.ChangedNestedDraft({
                      index,
                      value:
                        value === '' || !Number.isFinite(Number(value))
                          ? null
                          : subOpValue.type === 'integer'
                            ? {
                                type: 'integer',
                                value: Math.trunc(Number(value)),
                              }
                            : { type: 'float', value: Number(value) },
                    }),
                  ),
                ),
              ])
            default:
              return h.input([
                h.Type('text'),
                h.Class(className(reset.input, styles.inputControl)),
                h.Value(subValue?.type === 'string' ? subValue.value : ''),
                h.Placeholder(UI.enterValuePlaceholder),
                h.OnInput((value: string) =>
                  toParent(
                    Message.ChangedNestedDraft({
                      index,
                      value: value === '' ? null : { type: 'string', value },
                    }),
                  ),
                ),
              ])
          }
        })()
        return h.div(
          [h.Key(`sub-${index}`), h.Class(className(styles.subRow))],
          [
            editorSelect(ctx, {
              menuKey: `subField-${index}`,
              label: UI.editorField,
              options: fields.map(field => ({
                value: field.key,
                label: field.label,
              })),
              selected: sub.field === '' ? null : sub.field,
              onPick: fieldKey =>
                Message.ChangedNestedField({ index, fieldKey }),
            }),
            editorSelect(ctx, {
              menuKey: `subOp-${index}`,
              label: UI.editorOperator,
              options: (subField?.operators ?? []).map(candidate => ({
                value: candidate.key,
                label: resolveOperatorLabel(candidate),
              })),
              selected: sub.operator,
              onPick: operatorKey =>
                Message.ChangedNestedOperator({ index, operatorKey }),
            }),
            h.div(
              [h.Class(className(styles.fieldCell))],
              [
                h.div([h.Class(className(styles.fieldLabel))], [UI.valueLabel]),
                valueControl,
              ],
            ),
            h.button(
              [
                h.Type('button'),
                h.Class(
                  className(
                    reset.button,
                    styles.inputControl,
                    styles.removeSubButton,
                  ),
                ),
                h.AriaLabel(UI.removeFilter),
                h.OnClick(toParent(Message.RemovedNestedSubFilter({ index }))),
              ],
              [Icon.icon('x', { class: className(styles.iconSm) }, h)],
            ),
          ],
        )
      }),
      h.button(
        [
          h.Type('button'),
          h.Class(className(reset.button, styles.addFilterButton)),
          h.OnClick(toParent(Message.AddedNestedSubFilter())),
        ],
        [UI.addFilter],
      ),
    ],
  )
}

const editorPopover = <Msg>(ctx: Ctx<Msg>): Html => {
  const { model, config, h, toParent } = ctx
  const fields = config.nonContentSearchFields
  const field = config.fieldsByKey.get(model.partialField ?? '')
  const showOperator = field !== undefined && field.operators.length > 1
  const canApply = isDraftComplete(config, model)
  return h.div(
    [
      h.DataAttribute('power-search-editor', 'true'),
      h.Class(className(styles.editorPopover)),
      h.OnKeyDownPreventDefault((key: string) =>
        key === 'Escape' || key === 'Enter'
          ? Option.some(toParent(Message.PressedEditorKey({ key })))
          : Option.none(),
      ),
    ],
    [
      h.div(
        [h.Class(className(styles.editorPad))],
        [
          h.div(
            [h.Class(className(styles.editorRow))],
            [
              editorSelect(ctx, {
                menuKey: 'field',
                label: UI.editorField,
                options: fields.map(candidate => ({
                  value: candidate.key,
                  label: candidate.label,
                })),
                selected: model.partialField,
                onPick: fieldKey => Message.SelectedEditorField({ fieldKey }),
              }),
              ...(showOperator
                ? [
                    editorSelect(ctx, {
                      menuKey: 'operator',
                      label: UI.editorOperator,
                      options: (field?.operators ?? []).map(candidate => ({
                        value: candidate.key,
                        label: resolveOperatorLabel(candidate),
                      })),
                      selected: model.partialOperator,
                      onPick: operatorKey =>
                        Message.SelectedEditorOperator({ operatorKey }),
                    }),
                  ]
                : []),
              editorValueControl(ctx),
            ],
          ),
          nestedEditor(ctx),
        ],
      ),
      h.div(
        [h.Class(className(styles.editorFooter))],
        [
          model.popoverState === 'editing'
            ? h.button(
                [
                  h.Type('button'),
                  h.Class(className(reset.button, styles.ghostButton)),
                  h.OnClick(toParent(Message.ClickedEditorDelete())),
                ],
                [UI.deleteLabel],
              )
            : h.div([], []),
          h.div(
            [h.Class(className(styles.buttonRow))],
            [
              h.button(
                [
                  h.Type('button'),
                  h.Class(className(reset.button, styles.ghostButton)),
                  h.OnClick(toParent(Message.ClickedEditorCancel())),
                ],
                [UI.cancelLabel],
              ),
              h.button(
                [
                  h.Type('button'),
                  h.Class(
                    className(
                      reset.button,
                      styles.primaryButton,
                      ...(canApply ? [] : [styles.primaryButtonDisabled]),
                    ),
                  ),
                  h.Disabled(!canApply),
                  h.OnClick(toParent(Message.ClickedEditorSave())),
                ],
                [UI.applyLabel],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

const tokenPill = <Msg>(
  ctx: Ctx<Msg>,
  filter: PowerSearchFilter,
  index: number,
  valueMaxLength: number,
  isDisabled: boolean,
): Html => {
  const { model, config, h, toParent } = ctx
  const field = config.fieldsByKey.get(filter.field)
  const operator = resolveOperator(config, filter.field, filter.operator)
  if (field === undefined || operator === undefined) {
    return h.empty
  }
  const isReadOnly = filter.isReadOnly === true
  const isEditing =
    model.popoverState === 'editing' && model.editingFilterIndex === index
  const operatorLabel = resolveOperatorLabel(operator)
  const tokenLabel = `${field.label}${operatorLabel === '' ? '' : `: ${operatorLabel}`}`
  const valueMax = Math.max(
    valueMaxLength - field.label.length - operatorLabel.length,
    10,
  )
  const valueStr = formatFilterValue(
    config,
    operator.value,
    filter.value,
    valueMax,
  )
  return h.span(
    [
      h.Key(`token-${index}`),
      h.DataAttribute('power-search-token', `${index}`),
      h.Class(
        className(
          styles.chip,
          styles.chipInteractive,
          ...(isEditing ? [styles.chipEditing] : []),
          ...(model.popoverState !== 'idle' && !isEditing
            ? [styles.chipDimmed]
            : []),
        ),
      ),
    ],
    [
      h.button(
        [
          h.Type('button'),
          h.Class(className(reset.button, styles.chipButton)),
          h.AriaDisabled(isDisabled),
          h.OnClick(toParent(Message.ClickedEditFilterToken({ index }))),
        ],
        [
          h.span([h.Class(className(styles.tokenLabel))], [tokenLabel]),
          ...(valueStr === ''
            ? []
            : [
                h.span(
                  [h.Class(className(styles.tokenValue))],
                  [` ${valueStr}`],
                ),
              ]),
        ],
      ),
      ...(!isReadOnly && !isDisabled
        ? [
            h.button(
              [
                h.Type('button'),
                h.Class(className(reset.button, styles.iconButton)),
                h.AriaLabel(UI.removeFilter),
                h.OnClick(
                  toParent(Message.ClickedRemoveFilterToken({ index })),
                ),
              ],
              [Icon.icon('x', { class: className(styles.iconXs) }, h)],
            ),
          ]
        : []),
    ],
  )
}

export const powerSearch = <Msg>(
  props: PowerSearchProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { model } = props
  const toParent = props.toParentMessage
  const filters = props.filters
  const ctx: Ctx<Msg> = {
    model,
    config: props.config,
    toParent,
    h,
  }
  const menuOpen =
    model.isMenuOpen &&
    model.popoverState === 'idle' &&
    props.isDisabled !== true
  const resultText = resultCountText(props.resultCount ?? null)

  return h.div(
    [
      h.Id(model.id),
      h.DataAttribute('power-search-root', 'true'),
      h.DataAttribute('slot', 'power-search'),
      h.Class(className(styles.root, props.layoutStyle)),
      h.OnMount(Mount.mapMessage(ObservePowerSearchDismiss(), toParent)),
    ],
    [
      h.div(
        [
          h.Role('group'),
          h.AriaLabel(UI.searchLabel),
          h.Class(
            className(
              styles.bar,
              ...(model.popoverState !== 'idle' ? [styles.barOpen] : []),
              ...(props.isDisabled === true ? [styles.barDisabled] : []),
            ),
          ),
        ],
        [
          Icon.icon('search', { class: className(styles.searchIcon) }, h),
          ...filters.map((filter, index) =>
            tokenPill(
              ctx,
              filter,
              index,
              props.valueMaxLength ?? 40,
              props.isDisabled === true,
            ),
          ),
          h.input([
            h.DataAttribute('power-search-input', 'true'),
            h.Type('text'),
            h.Role('combobox'),
            h.AriaExpanded(menuOpen),
            h.AriaLabel(UI.searchLabel),
            h.Class(className(reset.input, styles.searchInput)),
            h.Value(model.query),
            h.Placeholder(
              filters.length === 0 ? (props.placeholder ?? UI.placeholder) : '',
            ),
            h.Disabled(props.isDisabled === true),
            h.OnInput((value: string) =>
              toParent(Message.ChangedPowerSearchQuery({ value })),
            ),
            h.OnFocus(toParent(Message.FocusedPowerSearchInput())),
            h.OnKeyDownPreventDefault((key: string) =>
              key === 'ArrowDown' ||
              key === 'ArrowUp' ||
              key === 'Enter' ||
              key === 'Escape' ||
              key === 'Backspace'
                ? Option.some(
                    toParent(Message.PressedPowerSearchInputKey({ key })),
                  )
                : Option.none(),
            ),
          ]),
          ...(resultText !== null
            ? [
                h.span(
                  [
                    h.Class(
                      className(
                        styles.resultText,
                        ...astryxTextStylex({
                          type: 'supporting',
                          color: 'secondary',
                        }),
                      ),
                    ),
                  ],
                  [resultText],
                ),
              ]
            : []),
          ...(props.endContent === undefined ? [] : [props.endContent]),
          ...(props.hasClear === true &&
          (filters.some(filter => filter.isReadOnly !== true) ||
            model.query !== '')
            ? [
                h.button(
                  [
                    h.Type('button'),
                    h.Class(className(reset.button, styles.iconButton)),
                    h.AriaLabel('Clear'),
                    h.OnClick(toParent(Message.ClickedClearPowerSearch())),
                  ],
                  [Icon.icon('x', { class: className(styles.iconMd) }, h)],
                ),
              ]
            : []),
        ],
      ),
      ...(menuOpen ? [menu(ctx)] : []),
      ...(model.popoverState !== 'idle' ? [editorPopover(ctx)] : []),
      h.div(
        [h.AriaLive('polite'), h.Class(className(styles.srOnly))],
        [model.announcement],
      ),
    ],
  )
}
