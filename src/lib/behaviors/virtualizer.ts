/* DOM observation and the list view contract adapted from @foldkit/ui 0.164.0.

MIT License

Copyright (c) 2025 Devin Jameson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { Effect, Option, Queue, Schema, Stream } from 'effect'
import { Command, Subscription, type Update } from 'foldkit'
import {
  childAttributes,
  type ChildAttribute,
  type Html,
  type HtmlBuilder,
  type TagName,
} from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineTaggedUnion } from 'foldkit/schema'
import { defineView } from 'foldkit/submodel'

import * as Layout from './virtualizer-layout'

export { Layout }

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

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  containerEvents: entry(
    { id: Schema.String },
    {
      modelToDependencies: model => ({ id: model.id }),
      dependenciesToStream: ({ id }) =>
        Stream.callback(queue =>
          Effect.acquireRelease(
            Effect.sync(() => {
              let observed: HTMLElement | null = null
              let cleanup: (() => void) | undefined
              let frame: number | undefined

              const reconcile = () => {
                const element = document.getElementById(id)
                if (element === observed) return
                cleanup?.()
                cleanup = undefined
                observed = element
                if (element === null) return

                const scrolled = () => {
                  Queue.offerUnsafe(
                    queue,
                    Message.ScrolledContainer({ scrollTop: element.scrollTop }),
                  )
                }
                const resize = new ResizeObserver(entries => {
                  const size = entries.at(-1)?.contentRect.height
                  if (observed === element && size !== undefined) {
                    Queue.offerUnsafe(
                      queue,
                      Message.MeasuredContainer({ containerHeight: size }),
                    )
                  }
                })
                element.addEventListener('scroll', scrolled, { passive: true })
                resize.observe(element)
                cleanup = () => {
                  resize.disconnect()
                  element.removeEventListener('scroll', scrolled)
                }
              }

              reconcile()
              const mutations = new MutationObserver(() => {
                if (observed?.isConnected || frame !== undefined) return
                frame = requestAnimationFrame(() => {
                  frame = undefined
                  reconcile()
                })
              })
              mutations.observe(document.documentElement, {
                childList: true,
                subtree: true,
              })
              return () => {
                mutations.disconnect()
                if (frame !== undefined) cancelAnimationFrame(frame)
                observed = null
                cleanup?.()
              }
            }),
            dispose => Effect.sync(dispose),
          ).pipe(Effect.andThen(Effect.never)),
        ),
    },
  ),
}))

const windowFor = (
  model: Model,
  layout: Layout.Layout,
  overscan: number,
): Option.Option<VisibleWindow> => {
  if (model.measurement._tag === 'Unmeasured') return Option.none()
  const result = Layout.range(
    layout,
    model.scrollTop,
    model.measurement.containerHeight,
    overscan,
  )
  return Option.some({
    startIndex: result.startIndex,
    endIndex: result.endIndex,
    topSpacerHeight: result.before,
    bottomSpacerHeight: result.after,
  })
}

export const visibleWindow = (
  model: Model,
  itemCount: number,
  overscan: number,
): Option.Option<VisibleWindow> =>
  windowFor(model, Layout.uniform(itemCount, model.rowHeightPx), overscan)

export const visibleWindowVariable = <Item>(
  model: Model,
  items: ReadonlyArray<Item>,
  itemToRowHeightPx: (item: Item, index: number) => number,
  overscan: number,
): Option.Option<VisibleWindow> =>
  model.measurement._tag === 'Unmeasured'
    ? Option.none()
    : windowFor(model, Layout.variable(items, itemToRowHeightPx), overscan)

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

const renderWindow = <Item>(
  model: Model,
  inputs: ViewInputs<Item>,
  h: HtmlBuilder<Message>,
): Html => {
  const {
    items,
    overscan = 5,
    rowElement = 'li',
    containerAttributes = [],
    containerClassName,
  } = inputs
  const container = (children: Html[]) =>
    h.keyed('ul')(
      model.id,
      [
        ...childAttributes([
          h.Id(model.id),
          h.Role('list'),
          h.DataAttribute('virtual-list-id', model.id),
          h.Style({
            overflow: 'auto',
            'list-style': 'none',
            margin: '0',
            padding: '0',
          }),
          ...(containerClassName === undefined
            ? []
            : [h.Class(containerClassName)]),
        ]),
        ...containerAttributes,
      ],
      children,
    )
  if (model.measurement._tag === 'Unmeasured') return container([])

  const layout =
    inputs.itemToRowHeightPx === undefined
      ? Layout.uniform(items.length, model.rowHeightPx)
      : Layout.variable(items, inputs.itemToRowHeightPx)
  const { startIndex, endIndex, before, after } = Layout.range(
    layout,
    model.scrollTop,
    model.measurement.containerHeight,
    overscan,
  )
  const spacer = (edge: 'top' | 'bottom', size: number) =>
    h.keyed('li')(`${model.id}-${edge}-spacer`, [
      h.Role('presentation'),
      h.Style({ height: `${size}px` }),
    ])
  const rows = items.slice(startIndex, endIndex).map((item, index) => {
    const position = startIndex + index
    const size = layout.offsetAt(position + 1) - layout.offsetAt(position)
    return h.keyed(rowElement)(
      inputs.itemToKey(item, position),
      [
        h.Role('listitem'),
        h.DataAttribute('virtual-list-item-index', String(position)),
        h.AriaSetsize(items.length),
        h.AriaPosinset(position + 1),
        h.Style({ display: 'grid', height: `${size}px` }),
      ],
      [inputs.itemToView(item, position)],
    )
  })
  return container([spacer('top', before), ...rows, spacer('bottom', after)])
}

export const view = <Item>() =>
  defineView<Model, Message, ViewInputs<Item>>(renderWindow)

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
  const layout = Layout.variable(items, itemToRowHeightPx)
  const top = layout.offsetAt(clamped)
  return scroll(
    model,
    clamped,
    top,
    layout.offsetAt(clamped + 1) - top,
    layout.totalSize,
    options,
  )
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
