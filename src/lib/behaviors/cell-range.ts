import { Schema } from 'effect'

export const Cell = Schema.Struct({ row: Schema.Int, column: Schema.Int })
export type Cell = typeof Cell.Type

export const Range = Schema.Struct({ anchor: Cell, end: Cell })
export type Range = typeof Range.Type

export const start = (cell: Cell): Range => ({ anchor: cell, end: cell })

export const extend = (range: Range, end: Cell): Range => ({
  anchor: range.anchor,
  end,
})

export type Bounds = Readonly<{
  top: number
  bottom: number
  left: number
  right: number
}>

export const bounds = (anchor: Cell, end: Cell): Bounds | undefined => {
  if (
    [anchor.row, end.row, anchor.column, end.column].some(
      index => !Number.isSafeInteger(index) || index < 0,
    )
  )
    return undefined

  return {
    top: Math.min(anchor.row, end.row),
    bottom: Math.max(anchor.row, end.row),
    left: Math.min(anchor.column, end.column),
    right: Math.max(anchor.column, end.column),
  }
}

export const contains = (range: Bounds | undefined, cell: Cell): boolean =>
  range !== undefined &&
  cell.row >= range.top &&
  cell.row <= range.bottom &&
  cell.column >= range.left &&
  cell.column <= range.right

const difference = (
  range: Bounds | undefined,
  overlap: Bounds | undefined,
): ReadonlyArray<Bounds> => {
  if (!range) return []
  if (!overlap) return [range]
  return [
    { ...range, bottom: overlap.top - 1 },
    { ...range, top: overlap.bottom + 1 },
    { ...overlap, left: range.left, right: overlap.left - 1 },
    { ...overlap, left: overlap.right + 1, right: range.right },
  ].filter(part => part.top <= part.bottom && part.left <= part.right)
}

/** Return disjoint changed rectangles so a grid can skip its unchanged cells. */
export const byCellRange = (previous?: Bounds, current?: Bounds) => {
  const top = Math.max(previous?.top ?? Infinity, current?.top ?? Infinity)
  const left = Math.max(previous?.left ?? Infinity, current?.left ?? Infinity)
  const bottom = Math.min(previous?.bottom ?? -1, current?.bottom ?? -1)
  const right = Math.min(previous?.right ?? -1, current?.right ?? -1)
  const overlap =
    top <= bottom && left <= right ? { top, left, bottom, right } : undefined
  return {
    entered: difference(current, overlap),
    left: difference(previous, overlap),
  }
}

export const cellRangeMessage = (range?: Bounds): string => {
  if (!range) return 'Selection cleared.'
  const rows = range.bottom - range.top + 1
  const columns = range.right - range.left + 1
  const cells = rows * columns
  if (cells === 1) return '1 cell selected.'
  return `${cells} cells selected across ${rows} ${rows === 1 ? 'row' : 'rows'} and ${columns} ${columns === 1 ? 'column' : 'columns'}.`
}

export const isMultiCell = (range?: Bounds): boolean =>
  range !== undefined &&
  (range.top !== range.bottom || range.left !== range.right)

export const cellsToText = (
  rows: ReadonlyArray<ReadonlyArray<string>>,
): string =>
  rows
    .map(row =>
      row
        .map(value =>
          /[\t\r\n"]/.test(value)
            ? '"' + value.replaceAll('"', '""') + '"'
            : value,
        )
        .join('\t'),
    )
    .join('\n')

export const textToCells = (text: string): Array<Array<string>> => {
  const rows: Array<Array<string>> = [[]]
  let row = rows[0]!
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index++) {
    const character = text[index]!
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"'
        index++
      } else if (character === '"') quoted = false
      else value += character
    } else if (character === '"' && value === '') {
      quoted = true
    } else if (character === '\t') {
      row.push(value)
      value = ''
    } else if (character === '\r' || character === '\n') {
      row.push(value)
      row = []
      rows.push(row)
      value = ''
      if (character === '\r' && text[index + 1] === '\n') index++
    } else {
      value += character
    }
  }
  if (row.length > 0 || value !== '' || rows.length === 1) row.push(value)
  else rows.pop()
  return rows
}
