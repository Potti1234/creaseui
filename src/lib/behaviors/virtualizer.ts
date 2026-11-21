import { VirtualList } from '@foldkit/ui'
import { Effect, Schema } from 'effect'
import { Command, type Update } from 'foldkit'

export const {
  Model,
  Message,
  init,
  update,
  subscriptions,
  visibleWindow,
  visibleWindowVariable,
  view,
} = VirtualList

export const ApplyScroll = Command.define('ApplyScroll', {
  args: { id: Schema.String, scrollTop: Schema.Number, version: Schema.Number },
  messages: [Message.CompletedApplyScroll],
  execute: ({ id, scrollTop, version }) =>
    Effect.sync(() => {
      const element = document.getElementById(id)
      if (element !== null) element.scrollTop = scrollTop
      return Message.CompletedApplyScroll({ version })
    }),
})

export type Model = VirtualList.Model
export type Message = VirtualList.Message
export type InitConfig = VirtualList.InitConfig
export type VisibleWindow = VirtualList.VisibleWindow
export type ViewInputs<Item> = VirtualList.ViewInputs<Item>

export type ScrollOptions = Readonly<{
  align?: 'start' | 'center' | 'end' | 'auto'
  scrollMargin?: number
}>

const scroll = (
  model: Model,
  index: number,
  top: number,
  height: number,
  total: number,
  options: ScrollOptions,
): Update.Return<Model, Message> => {
  const margin = Math.max(0, options.scrollMargin ?? 0)
  const measured = model.measurement._tag === 'Measured'
  const viewport = measured ? model.measurement.containerHeight : 0
  const align = measured ? (options.align ?? 'auto') : 'start'
  const start = top + margin
  const end = start + height - viewport
  const target =
    align === 'start'
      ? start
      : align === 'center'
        ? start + (height - viewport) / 2
        : align === 'end'
          ? end
          : start < model.scrollTop
            ? start
            : end > model.scrollTop
              ? Math.min(start, end)
              : model.scrollTop
  const scrollTop = Math.max(
    0,
    Math.min(target, Math.max(0, total + margin - viewport)),
  )
  if (align === 'auto' && scrollTop === model.scrollTop) return { model }
  const version = model.pendingScrollVersion + 1
  return {
    model: {
      ...model,
      pendingScrollVersion: version,
      pendingScroll: { _tag: 'ScrollingToIndex', index, version },
    },
    commands: [ApplyScroll({ id: model.id, scrollTop, version })],
  }
}

export const scrollToIndex = (
  model: Model,
  itemCount: number,
  index: number,
  options: ScrollOptions = {},
): Update.Return<Model, Message> => {
  if (!Number.isFinite(index) || !Number.isFinite(itemCount) || itemCount <= 0)
    return { model }
  const clamped = Math.max(0, Math.min(Math.trunc(index), itemCount - 1))
  return scroll(
    model,
    clamped,
    clamped * model.rowHeightPx,
    model.rowHeightPx,
    itemCount * model.rowHeightPx,
    options,
  )
}

export const scrollToIndexVariable = <Item>(
  model: Model,
  items: ReadonlyArray<Item>,
  itemToRowHeightPx: (item: Item, index: number) => number,
  index: number,
  options: ScrollOptions = {},
): Update.Return<Model, Message> => {
  if (items.length === 0 || !Number.isFinite(index)) return { model }
  const clamped = Math.max(0, Math.min(Math.trunc(index), items.length - 1))
  let top = 0
  let height = 0
  let total = 0
  items.forEach((item, position) => {
    const rowHeight = itemToRowHeightPx(item, position)
    if (position < clamped) top += rowHeight
    if (position === clamped) height = rowHeight
    total += rowHeight
  })
  return scroll(model, clamped, top, height, total, options)
}

export const isNearEnd = (
  window: VisibleWindow,
  itemCount: number,
  endThreshold = 5,
): boolean =>
  itemCount > 0 && window.endIndex >= itemCount - Math.max(0, endThreshold)

export const rowPosition = (index: number, itemCount: number) => ({
  'aria-posinset': index + 1,
  'aria-setsize': itemCount,
})
