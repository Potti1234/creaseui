import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

export const SPACING_STEPS = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10] as const
export type SpacingStep = (typeof SPACING_STEPS)[number]

export const spacingToPx: Readonly<Record<SpacingStep, number>> = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
}

export type CollapseFrom = 'start' | 'end'
export type OverflowBehavior = 'observeSelf' | 'observeParent'

// =============================================================================
// computeOverflow — verbatim port of astryx's pure helper
// =============================================================================

export type ComputeOverflowInput = Readonly<{
  widths: ReadonlyArray<number>
  gap: number
  availableWidth: number
  indicatorWidth: number
  minVisibleItems: number
  maxVisibleItems?: number
  maxRows?: number
  collapseFrom: CollapseFrom
}>

export type ComputeOverflowResult = Readonly<{
  visibleCount: number
  rows: number
}>

const clamp = (value: number, min: number, max: number): number =>
  Math.max(Math.min(value, max), min)

const resolveBounds = (
  itemCount: number,
  minVisibleItems: number,
  maxVisibleItems: number | undefined,
): Readonly<{ floor: number; ceiling: number }> => ({
  floor: Math.max(0, Math.min(minVisibleItems, itemCount)),
  ceiling: Math.max(
    0,
    Math.min(
      maxVisibleItems === undefined ? itemCount : maxVisibleItems,
      itemCount,
    ),
  ),
})

/* Single-line greedy fit: admits items until the next wouldn't fit, reserving
   indicator space for every non-final admitted item. */
const computeSingleLineFit = (
  orderedWidths: ReadonlyArray<number>,
  gap: number,
  availableWidth: number,
  indicatorWidth: number,
  floor: number,
  ceiling: number,
): number => {
  let totalWidth = 0
  let count = 0
  for (let i = 0; i < orderedWidths.length; i++) {
    if (count >= ceiling) {
      break
    }
    const itemWidth = orderedWidths[i] ?? 0
    const gapWidth = i > 0 ? gap : 0
    const candidateWidth = totalWidth + itemWidth + gapWidth
    const isLastItem = i === orderedWidths.length - 1
    const reservedWidth = isLastItem
      ? 0
      : indicatorWidth + (count > 0 || indicatorWidth > 0 ? gap : 0)
    if (candidateWidth + reservedWidth > availableWidth && count >= floor) {
      break
    }
    totalWidth = candidateWidth
    count++
  }
  return count
}

/* Pack items into rows of `availableWidth`, reserving indicator space on the
   last allowed row. */
const packRows = (
  orderedWidths: ReadonlyArray<number>,
  gap: number,
  availableWidth: number,
  indicatorReserve: number,
  maxRows: number,
): Readonly<{ placed: number; rows: number }> => {
  let placed = 0
  let row = 1
  let rowWidth = 0
  for (let i = 0; i < orderedWidths.length; i++) {
    const w = orderedWidths[i] ?? 0
    const isFirstInRow = rowWidth === 0
    const candidate = isFirstInRow ? w : rowWidth + gap + w
    const onLastRow = row === maxRows
    const reserve =
      onLastRow && indicatorReserve > 0 ? indicatorReserve + gap : 0
    if (candidate + reserve <= availableWidth) {
      rowWidth = candidate
      placed++
      continue
    }
    if (isFirstInRow) {
      if (onLastRow && reserve > 0) {
        break
      }
      rowWidth = candidate
      placed++
      continue
    }
    if (row >= maxRows) {
      break
    }
    row++
    rowWidth = 0
    i--
  }
  return { placed, rows: row }
}

const countRows = (
  orderedWidths: ReadonlyArray<number>,
  gap: number,
  availableWidth: number,
): number => {
  if (orderedWidths.length === 0) {
    return 0
  }
  let rows = 1
  let rowWidth = 0
  for (let i = 0; i < orderedWidths.length; i++) {
    const w = orderedWidths[i] ?? 0
    const isFirstInRow = rowWidth === 0
    const candidate = isFirstInRow ? w : rowWidth + gap + w
    if (candidate <= availableWidth || isFirstInRow) {
      rowWidth = candidate
    } else {
      rows++
      rowWidth = w
    }
  }
  return rows
}

const computeMultiRowFit = (
  orderedWidths: ReadonlyArray<number>,
  gap: number,
  availableWidth: number,
  indicatorWidth: number,
  maxRows: number,
): Readonly<{ count: number; rows: number }> => {
  const n = orderedWidths.length
  if (n === 0) {
    return { count: 0, rows: 0 }
  }
  const packAll = packRows(orderedWidths, gap, availableWidth, 0, maxRows)
  if (packAll.placed === n) {
    return { count: n, rows: packAll.rows }
  }
  const packWithIndicator = packRows(
    orderedWidths,
    gap,
    availableWidth,
    indicatorWidth,
    maxRows,
  )
  const count = packWithIndicator.placed
  const rows = countRows(orderedWidths.slice(0, count), gap, availableWidth)
  return { count, rows: Math.max(count > 0 ? 1 : 0, rows) }
}

export const computeOverflow = (
  input: ComputeOverflowInput,
): ComputeOverflowResult => {
  const {
    widths,
    gap,
    availableWidth,
    indicatorWidth,
    minVisibleItems,
    maxVisibleItems,
    maxRows,
    collapseFrom,
  } = input
  const itemCount = widths.length
  if (itemCount === 0) {
    return { visibleCount: 0, rows: 0 }
  }
  const { floor, ceiling } = resolveBounds(
    itemCount,
    minVisibleItems,
    maxVisibleItems,
  )
  const orderedWidths =
    collapseFrom === 'end' ? [...widths] : [...widths].reverse()
  const multiRow = maxRows !== undefined && maxRows > 1
  if (!multiRow) {
    const fitCount = computeSingleLineFit(
      orderedWidths,
      gap,
      availableWidth,
      indicatorWidth,
      floor,
      ceiling,
    )
    const visibleCount = clamp(fitCount, floor, ceiling)
    return { visibleCount, rows: visibleCount > 0 ? 1 : 0 }
  }
  const { count, rows } = computeMultiRowFit(
    orderedWidths,
    gap,
    availableWidth,
    indicatorWidth,
    maxRows,
  )
  const visibleCount = clamp(count, floor, ceiling)
  const resolvedRows =
    visibleCount === count
      ? rows
      : countRows(orderedWidths.slice(0, visibleCount), gap, availableWidth)
  return {
    visibleCount,
    rows: visibleCount > 0 ? Math.max(1, resolvedRows) : 0,
  }
}

const Direction = Schema.Literals(['start', 'end'])
const Measurement = Schema.Struct({
  itemCount: Schema.Number,
  collapseFrom: Direction,
  visibleCount: Schema.Number,
  rows: Schema.Number,
  rowHeight: Schema.Number,
})
const Message = UiSchema.TaggedEnum({ Measured: Measurement.fields })
const Events = UiSchema.TaggedEnum({
  OverflowChanged: { hiddenIndices: Schema.Array(Schema.Number) },
})

export const collapsedIndices = (
  itemCount: number,
  visibleCount: number,
  collapseFrom: CollapseFrom,
): readonly number[] => {
  const hidden = Math.max(0, itemCount - visibleCount)
  const offset = collapseFrom === 'end' ? itemCount - hidden : 0
  return Array.from({ length: hidden }, (_, index) => index + offset)
}

export const ObserveOverflow = Mount.makeStream(
  'ObserveCreaseOverflow',
  { args: {} },
  (root: HTMLDivElement) =>
    Stream.callback<typeof Message.Type>(queue =>
      Effect.gen(function* () {
        const window = root.ownerDocument.defaultView
        if (window === null) return yield* Effect.never
        let reportKey = ''
        let indicatorWidth = 0
        let indicatorItemCount = -1
        let frame = 0
        const observed = new Set<Element>()
        const numberFrom = (name: string) => {
          const value = root.getAttribute(name)
          if (value === null) return undefined
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : undefined
        }
        const measure = () => {
          frame = 0
          const parent =
            root.getAttribute('data-overflow-behavior') === 'observeParent'
              ? (root.parentElement ?? root)
              : root
          const children = Array.from(root.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          )
          const items = children.filter(child =>
            child.hasAttribute('data-overflow-item'),
          )
          const indicator = children.find(child =>
            child.hasAttribute('data-overflow-indicator'),
          )
          const targets = new Set<Element>([root, parent, ...items])
          if (indicator !== undefined) targets.add(indicator)
          observed.forEach(target => {
            if (targets.has(target)) return
            resize.unobserve(target)
            observed.delete(target)
          })
          targets.forEach(target => {
            if (observed.has(target)) return
            resize.observe(target)
            observed.add(target)
          })
          const style = window.getComputedStyle(parent)
          const availableWidth = Math.max(
            0,
            parent.clientWidth -
              (Number.parseFloat(style.paddingLeft) || 0) -
              (Number.parseFloat(style.paddingRight) || 0),
          )
          const collapseFrom: CollapseFrom =
            root.getAttribute('data-overflow-collapse-from') === 'start'
              ? 'start'
              : 'end'
          const indicatorBounds = indicator?.getBoundingClientRect()
          if (indicatorItemCount !== items.length || indicator === undefined) {
            indicatorItemCount = items.length
            indicatorWidth = 0
          }
          indicatorWidth = Math.max(indicatorWidth, indicatorBounds?.width ?? 0)
          const itemBounds = items.map(item => item.getBoundingClientRect())
          const maxVisibleItems = numberFrom('data-overflow-max')
          const maxRows = numberFrom('data-overflow-max-rows')
          const measured = {
            ...computeOverflow({
              widths: itemBounds.map(bounds => bounds.width),
              gap: numberFrom('data-overflow-gap') ?? 0,
              availableWidth,
              indicatorWidth,
              minVisibleItems: numberFrom('data-overflow-min') ?? 0,
              ...(maxVisibleItems === undefined ? {} : { maxVisibleItems }),
              ...(maxRows === undefined ? {} : { maxRows }),
              collapseFrom,
            }),
            itemCount: items.length,
            collapseFrom,
            rowHeight: itemBounds.reduce(
              (height, bounds) => Math.max(height, bounds.height),
              indicatorBounds?.height ?? 0,
            ),
          }
          const nextKey = JSON.stringify(measured)
          if (nextKey === reportKey) return
          reportKey = nextKey
          Queue.offerUnsafe(queue, Message.Measured(measured))
        }
        const schedule = () => {
          if (frame === 0) frame = window.requestAnimationFrame(measure)
        }
        const resize = new ResizeObserver(schedule)
        const mutations = new MutationObserver(schedule)
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            mutations.observe(root, {
              childList: true,
              subtree: true,
              attributeFilter: [
                'data-overflow-behavior',
                'data-overflow-collapse-from',
                'data-overflow-gap',
                'data-overflow-max',
                'data-overflow-min',
                'data-overflow-max-rows',
              ],
            })
            measure()
          }),
          () =>
            Effect.sync(() => {
              resize.disconnect()
              mutations.disconnect()
              if (frame !== 0) window.cancelAnimationFrame(frame)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

const count = (value: number, minimum = 0) =>
  Number.isFinite(value) ? Math.max(minimum, Math.trunc(value)) : minimum

export const OverflowListBehavior = Html.component({
  name: 'CreaseOverflowList',
  props: Schema.Struct({
    itemCount: Schema.Number,
    gap: Schema.optional(Schema.Number),
    minVisibleItems: Schema.optional(Schema.Number),
    maxVisibleItems: Schema.optional(Schema.Number),
    maxRows: Schema.optional(Schema.Number),
    collapseFrom: Schema.optional(Direction),
    behavior: Schema.optional(
      Schema.Literals(['observeSelf', 'observeParent']),
    ),
  }),
  model: Schema.Struct({
    measurement: Schema.NullOr(Measurement),
    hiddenIndices: Schema.Array(Schema.Number),
  }),
  message: Message,
  events: Events,
}).make({
  init: () => ({ measurement: null, hiddenIndices: [] }),
  update: {
    Measured: ($, { _tag: _, ...measurement }) => {
      const hiddenIndices = collapsedIndices(
        measurement.itemCount,
        measurement.visibleCount,
        measurement.collapseFrom,
      )
      const next = $.evolve({ measurement, hiddenIndices })
      return hiddenIndices.length === $.model.hiddenIndices.length &&
        hiddenIndices.every((index, at) => index === $.model.hiddenIndices[at])
        ? next
        : next.emit(Events.OverflowChanged({ hiddenIndices }))
    },
  },
  parts: (p, model) => {
    const collapseFrom = p.props.collapseFrom ?? 'end'
    const itemCount = count(p.props.itemCount)
    const gap = Math.max(0, p.props.gap ?? 8)
    const maxRows = count(p.props.maxRows ?? 1, 1)
    const minVisibleItems = count(p.props.minVisibleItems ?? 0)
    const initialCount = Math.min(
      itemCount,
      Math.max(minVisibleItems, count(p.props.maxVisibleItems ?? itemCount)),
    )
    const measurement =
      model.measurement?.itemCount === itemCount &&
      model.measurement.collapseFrom === collapseFrom
        ? model.measurement
        : null
    const hiddenIndices = collapsedIndices(
      itemCount,
      measurement?.visibleCount ?? initialCount,
      collapseFrom,
    )
    return {
      collapseFrom,
      gap,
      hiddenIndices,
      maxRows,
      rows: measurement?.rows ?? Number(itemCount > 0),
      rowHeight: measurement?.rowHeight ?? 0,
      root: p.part('div', element =>
        element
          .attrs({
            'data-overflow-behavior': p.props.behavior ?? 'observeSelf',
            'data-overflow-collapse-from': collapseFrom,
            'data-overflow-gap': String(gap),
            'data-overflow-min': String(minVisibleItems),
            'data-overflow-max':
              p.props.maxVisibleItems === undefined
                ? undefined
                : String(count(p.props.maxVisibleItems)),
            'data-overflow-max-rows': String(maxRows),
            'data-multiline': maxRows > 1 ? '' : undefined,
          })
          .onMount(ObserveOverflow()),
      ),
    }
  },
})
