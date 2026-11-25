/** A one-dimensional layout. Offsets are logical pixels along the scroll axis. */
export type Layout = Readonly<{
  count: number
  totalSize: number
  offsetAt: (index: number) => number
}>

export type Range = Readonly<{
  startIndex: number
  endIndex: number
  before: number
  after: number
}>

const extent = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0

export const uniform = (count: number, itemSize: number): Layout => {
  const length = Math.trunc(Math.min(extent(count), Number.MAX_SAFE_INTEGER))
  const size = extent(itemSize)
  return {
    count: length,
    totalSize: length * size,
    offsetAt: index => Math.max(0, Math.min(index, length)) * size,
  }
}

export const variable = <Item>(
  items: ReadonlyArray<Item>,
  itemToSize: (item: Item, index: number) => number,
): Layout => {
  const offsets = [0]
  let totalSize = 0
  items.forEach((item, index) => {
    totalSize += extent(itemToSize(item, index))
    offsets.push(totalSize)
  })
  return {
    count: items.length,
    totalSize,
    offsetAt: index =>
      offsets[Math.max(0, Math.min(index, items.length))] ?? totalSize,
  }
}

// Item boundaries are monotone. Search them independently for each viewport edge.
const firstBoundary = (
  layout: Layout,
  matches: (offset: number) => boolean,
) => {
  let low = 0
  let high = layout.count + 1
  while (low < high) {
    const midpoint = low + Math.floor((high - low) / 2)
    if (matches(layout.offsetAt(midpoint))) high = midpoint
    else low = midpoint + 1
  }
  return low
}

export const range = (
  layout: Layout,
  scrollOffset: number,
  viewportSize: number,
  overscan: number,
): Range => {
  const start = extent(scrollOffset)
  const end = start + extent(viewportSize)
  const buffer = Math.trunc(extent(overscan))
  const startIndex = Math.max(
    0,
    firstBoundary(layout, offset => offset > start) - 1 - buffer,
  )
  const endIndex = Math.max(
    startIndex,
    Math.min(
      layout.count,
      firstBoundary(layout, offset => offset >= end) + buffer,
    ),
  )
  return {
    startIndex,
    endIndex,
    before: layout.offsetAt(startIndex),
    after: layout.totalSize - layout.offsetAt(endIndex),
  }
}
