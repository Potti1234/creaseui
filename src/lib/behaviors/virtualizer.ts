import { VirtualList } from '@foldkit/ui'
import { Effect, type Option, Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import type { ChildAttribute, Html, TagName } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineTaggedUnion } from 'foldkit/schema'
import type { View as SubmodelView } from 'foldkit/submodel'
import type { Subscriptions } from 'foldkit/subscription'

const Measurement = defineTaggedUnion({
  Unmeasured: {},
  Measured: { containerHeight: Schema.Number },
})

const PendingScroll = defineTaggedUnion({
  Idle: {},
  ScrollingToIndex: { index: Schema.Number, version: Schema.Number },
})

export const Model = Schema.Struct({
  id: Schema.String,
  rowHeightPx: Schema.Number,
  scrollTop: Schema.Number,
  measurement: Measurement,
  pendingScroll: PendingScroll,
  pendingScrollVersion: Schema.Number,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ScrolledContainer: { scrollTop: Schema.Number },
  MeasuredContainer: { containerHeight: Schema.Number },
  CompletedApplyScroll: { version: Schema.Number },
})
export type Message = typeof Message.Type

export type InitConfig = Readonly<{
  id: string
  rowHeightPx: number
  initialScrollTop?: number
}>

export const init = ({
  id,
  rowHeightPx,
  initialScrollTop = 0,
}: InitConfig): Model => ({
  id,
  rowHeightPx,
  scrollTop: initialScrollTop,
  measurement: Measurement.Unmeasured(),
  pendingScroll: PendingScroll.Idle(),
  pendingScrollVersion: 0,
})

// Keep Foldkit's window calculations and spacer rendering together.
export const subscriptions = VirtualList.subscriptions satisfies Subscriptions<
  Model,
  Message
>
export const visibleWindow: (
  model: Model,
  itemCount: number,
  overscan: number,
) => Option.Option<VisibleWindow> = VirtualList.visibleWindow
export const visibleWindowVariable: <Item>(
  model: Model,
  items: ReadonlyArray<Item>,
  itemToRowHeightPx: (item: Item, index: number) => number,
  overscan: number,
) => Option.Option<VisibleWindow> = VirtualList.visibleWindowVariable
export const view: <Item>() => SubmodelView<Model, Message, ViewInputs<Item>> =
  VirtualList.view

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

export type VisibleWindow = Readonly<{
  startIndex: number
  endIndex: number
  topSpacerHeight: number
  bottomSpacerHeight: number
}>

export type ViewInputs<Item> = Readonly<{
  items: ReadonlyArray<Item>
  itemToKey: (item: Item, index: number) => string
  itemToView: (item: Item, index: number) => Html
  itemToRowHeightPx?: (item: Item, index: number) => number
  overscan?: number
  rowElement?: Exclude<TagName, 'textarea'>
  containerClassName?: string
  containerAttributes?: ReadonlyArray<ChildAttribute>
}>

const applyScroll = (
  model: Model,
  index: number,
  scrollTop: number,
): Update.Return<Model, Message> => {
  const version = model.pendingScrollVersion + 1
  return {
    model: {
      ...model,
      pendingScrollVersion: version,
      pendingScroll: PendingScroll.ScrollingToIndex({ index, version }),
    },
    commands: [ApplyScroll({ id: model.id, scrollTop, version })],
  }
}

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  Message.match(message, {
    ScrolledContainer: ({ scrollTop }) => ({ model: { ...model, scrollTop } }),
    MeasuredContainer: ({ containerHeight }) => {
      const measured = {
        ...model,
        measurement: Measurement.Measured({ containerHeight }),
      }
      return model.measurement._tag === 'Unmeasured' && model.scrollTop !== 0
        ? applyScroll(
            measured,
            Math.floor(model.scrollTop / model.rowHeightPx),
            model.scrollTop,
          )
        : { model: measured }
    },
    CompletedApplyScroll: ({ version }) =>
      version === model.pendingScrollVersion
        ? { model: { ...model, pendingScroll: PendingScroll.Idle() } }
        : { model },
  })

export type ScrollOptions = Readonly<{
  align?: 'start' | 'center' | 'end' | 'auto'
}>

const scroll = (
  model: Model,
  index: number,
  top: number,
  height: number,
  total: number,
  options: ScrollOptions,
): Update.Return<Model, Message> => {
  const measured = model.measurement._tag === 'Measured'
  const viewport = measured ? model.measurement.containerHeight : 0
  const align = measured ? (options.align ?? 'auto') : 'start'
  const start = top
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
  const scrollTop = Math.max(0, Math.min(target, Math.max(0, total - viewport)))
  if (align === 'auto' && scrollTop === model.scrollTop) return { model }
  return applyScroll(model, index, scrollTop)
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
