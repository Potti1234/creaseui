export type Cell = Readonly<{ row: number; column: number }>

export type Bounds = Readonly<{
  top: number
  bottom: number
  left: number
  right: number
}>

export const bounds = (anchor: Cell, end: Cell): Bounds | undefined => {
  if (anchor.row < 0 || end.row < 0 || anchor.column < 0 || end.column < 0)
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
