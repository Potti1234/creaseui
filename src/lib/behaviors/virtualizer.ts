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
import { supportsHiddenUntilFound } from './findable'

export { Layout }

const Orientation = Schema.Literals(['vertical', 'horizontal'])
const ItemSizes = Schema.Record(Schema.String, Schema.Number)
const itemKeyAttribute = 'virtual-list-measure-key'
const containerAttribute = 'virtual-list-id'
const findIndexAttribute = 'virtual-list-find-index'
const findKeyAttribute = 'virtual-list-find-key'

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
  orientation: Schema.optionalKey(Orientation),
  itemSizes: Schema.optionalKey(ItemSizes),
  measurementVersion: Schema.optionalKey(Schema.Number),
  scrollMargin: Schema.optionalKey(Schema.Number),
  stickyScrollMargin: Schema.optionalKey(Schema.Boolean),
  preserveScrollAnchor: Schema.optionalKey(Schema.Boolean),
  findInPage: Schema.optionalKey(Schema.Boolean),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ScrolledContainer: { scrollTop: Schema.Number },
  MeasuredContainer: { containerHeight: Schema.Number },
  CompletedApplyScroll: { version: Schema.Number },
  MeasuredItems: { sizes: ItemSizes, version: Schema.Number },
  FoundItem: { key: Schema.String, index: Schema.Number },
})
export type Message = typeof Message.Type

export type InitConfig = Readonly<
  {
    id: string
    orientation?: typeof Orientation.Type
    initialScrollTop?: number
    initialScrollOffset?: number
    measureItems?: boolean
    scrollMargin?: number
    stickyScrollMargin?: boolean
    preserveScrollAnchor?: boolean
    findInPage?: boolean
  } & ({ rowHeightPx: number } | { estimatedItemSize: number })
>

export const init = (config: InitConfig): Model => ({
  id: config.id,
  rowHeightPx:
    'estimatedItemSize' in config
      ? config.estimatedItemSize
      : config.rowHeightPx,
  scrollTop: config.initialScrollOffset ?? config.initialScrollTop ?? 0,
  measurement: Measurement.Unmeasured(),
  pendingScroll: PendingScroll.Idle(),
  pendingScrollVersion: 0,
  ...(config.orientation === undefined
    ? {}
    : { orientation: config.orientation }),
  ...(config.measureItems ? { itemSizes: {}, measurementVersion: 0 } : {}),
  ...(config.scrollMargin === undefined
    ? {}
    : { scrollMargin: config.scrollMargin }),
  ...(config.stickyScrollMargin ? { stickyScrollMargin: true } : {}),
  ...(config.preserveScrollAnchor ? { preserveScrollAnchor: true } : {}),
  ...(config.findInPage ? { findInPage: true } : {}),
})

const scrollMargin = (model: Model): number =>
  Number.isFinite(model.scrollMargin) ? Math.max(0, model.scrollMargin ?? 0) : 0

const horizontalSign = (element: HTMLElement): number =>
  getComputedStyle(element).direction === 'rtl' ? -1 : 1

const observeFindMatches = (
  container: HTMLElement,
  emit: (message: Message) => void,
) => {
  const matched = (event: Event) => {
    const target = event.target
    if (
      !(target instanceof HTMLElement) ||
      target.closest(`[data-${containerAttribute}]`) !== container
    )
      return
    const key = target.getAttribute(`data-${findKeyAttribute}`)
    const index = target.getAttribute(`data-${findIndexAttribute}`)
    if (key !== null && index !== null && Number.isSafeInteger(Number(index))) {
      emit(Message.FoundItem({ key, index: Number(index) }))
    }
  }
  container.addEventListener('beforematch', matched, true)
  return () => container.removeEventListener('beforematch', matched, true)
}

const observeItems = (
  container: HTMLElement,
  horizontal: boolean,
  emit: (sizes: typeof ItemSizes.Type) => void,
) => {
  const rows = new Map<Element, string>()
  const ownerSelector = `[data-${containerAttribute}]`
  const keyAttribute = `data-${itemKeyAttribute}`
  const resize = new ResizeObserver(entries => {
    const sizes: Array<[string, number]> = []
    for (const { target } of entries) {
      const key = rows.get(target)
      if (
        key === undefined ||
        target.getAttribute(keyAttribute) !== key ||
        target.closest(ownerSelector) !== container ||
        !target.isConnected
      )
        continue
      // offsetWidth/Height measure the layout border box without CSS transforms.
      if (!(target instanceof HTMLElement)) continue
      const size = horizontal ? target.offsetWidth : target.offsetHeight
      if (size > 0) sizes.push([key, size])
    }
    if (sizes.length > 0) emit(Object.fromEntries(sizes))
  })

  return {
    reconcile: () => {
      const next = new Map<Element, string>()
      for (const row of container.querySelectorAll(`[${keyAttribute}]`)) {
        const key = row.getAttribute(keyAttribute)
        if (key !== null && row.closest(ownerSelector) === container)
          next.set(row, key)
      }
      for (const [row, key] of rows) {
        if (next.get(row) === key) continue
        resize.unobserve(row)
        rows.delete(row)
      }
      for (const [row, key] of next) {
        if (rows.has(row)) continue
        rows.set(row, key)
        resize.observe(row, { box: 'border-box' })
      }
    },
    dispose: () => {
      resize.disconnect()
      rows.clear()
    },
  }
}

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  containerEvents: entry(
    {
      id: Schema.String,
      horizontal: Schema.Boolean,
      version: Schema.optionalKey(Schema.Number),
      findInPage: Schema.optionalKey(Schema.Boolean),
    },
    {
      modelToDependencies: model => ({
        id: model.id,
        horizontal: model.orientation === 'horizontal',
        ...(model.measurementVersion === undefined
          ? {}
          : { version: model.measurementVersion }),
        ...(model.findInPage ? { findInPage: true } : {}),
      }),
      dependenciesToStream: ({ id, horizontal, version, findInPage }) =>
        Stream.callback(queue =>
          Effect.acquireRelease(
            Effect.sync(() => {
              let observed: HTMLElement | null = null
              let cleanup: (() => void) | undefined
              let items: ReturnType<typeof observeItems> | undefined
              let frame: number | undefined

              const reconcile = () => {
                const element = document.getElementById(id)
                if (element === observed) {
                  items?.reconcile()
                  return
                }
                cleanup?.()
                cleanup = undefined
                observed = element
                if (element === null) return

                const scrolled = () => {
                  Queue.offerUnsafe(
                    queue,
                    Message.ScrolledContainer({
                      scrollTop: horizontal
                        ? Math.max(
                            0,
                            element.scrollLeft * horizontalSign(element),
                          )
                        : element.scrollTop,
                    }),
                  )
                }
                const resize = new ResizeObserver(() => {
                  if (observed === element) {
                    Queue.offerUnsafe(
                      queue,
                      Message.MeasuredContainer({
                        containerHeight: horizontal
                          ? element.clientWidth
                          : element.clientHeight,
                      }),
                    )
                  }
                })
                element.addEventListener('scroll', scrolled, { passive: true })
                resize.observe(element)
                const stopFind =
                  findInPage && supportsHiddenUntilFound(element.ownerDocument)
                    ? observeFindMatches(element, message =>
                        Queue.offerUnsafe(queue, message),
                      )
                    : undefined
                if (version !== undefined) {
                  items = observeItems(element, horizontal, sizes =>
                    Queue.offerUnsafe(
                      queue,
                      Message.MeasuredItems({ sizes, version }),
                    ),
                  )
                  items.reconcile()
                }
                cleanup = () => {
                  resize.disconnect()
                  element.removeEventListener('scroll', scrolled)
                  stopFind?.()
                  items?.dispose()
                  items = undefined
                }
              }

              reconcile()
              const mutations = new MutationObserver(records => {
                if (frame !== undefined) return
                const element = observed
                if (
                  element?.isConnected &&
                  (version === undefined ||
                    !records.some(record => element.contains(record.target)))
                )
                  return
                frame = requestAnimationFrame(() => {
                  frame = undefined
                  reconcile()
                })
              })
              mutations.observe(document.documentElement, {
                childList: true,
                subtree: true,
                ...(version === undefined
                  ? {}
                  : {
                      attributes: true,
                      attributeFilter: [`data-${itemKeyAttribute}`],
                    }),
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
  return Option.map(visibleRange(model, layout, overscan), result => ({
    startIndex: result.startIndex,
    endIndex: result.endIndex,
    topSpacerHeight: result.before,
    bottomSpacerHeight: result.after,
  }))
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

export type DynamicInputs<Item> = Readonly<{
  items: ReadonlyArray<Item>
  itemToKey: (item: Item, index: number) => string
  estimateItemSize?: (item: Item, index: number) => number
}>

export const dynamicLayout = <Item>(
  model: Model,
  { items, itemToKey, estimateItemSize }: DynamicInputs<Item>,
): Layout.Layout =>
  Layout.variable(items, (item, index) => {
    const key = itemToKey(item, index)
    const sizes = model.itemSizes
    const measured =
      sizes !== undefined && Object.hasOwn(sizes, key) ? sizes[key] : undefined
    return measured ?? estimateItemSize?.(item, index) ?? model.rowHeightPx
  })

/** Mark the scroller and intrinsically sized items in a custom view. */
export const measurementAttributes = <Msg>(h: HtmlBuilder<Msg>) => ({
  container: (id: string) => h.DataAttribute(containerAttribute, id),
  item: (key: string) => h.DataAttribute(itemKeyAttribute, key),
})

export const resetMeasurements = (model: Model): Model =>
  model.measurementVersion === undefined
    ? model
    : {
        ...model,
        itemSizes: {},
        measurementVersion: model.measurementVersion + 1,
      }

export const ApplyScroll = Command.define('ApplyScroll', {
  args: {
    id: Schema.String,
    scrollTop: Schema.Number,
    version: Schema.Number,
    horizontal: Schema.optionalKey(Schema.Boolean),
    expectedOffset: Schema.optionalKey(Schema.Number),
  },
  messages: [Message.CompletedApplyScroll],
  execute: ({ id, scrollTop, version, horizontal, expectedOffset }) =>
    Effect.sync(() => {
      const element = document.getElementById(id)
      if (element !== null) {
        const sign = horizontal ? horizontalSign(element) : 1
        const currentOffset = horizontal
          ? element.scrollLeft * sign
          : element.scrollTop
        if (
          expectedOffset === undefined ||
          Math.abs(currentOffset - expectedOffset) <= 1
        ) {
          if (horizontal) element.scrollLeft = scrollTop * sign
          else element.scrollTop = scrollTop
        }
      }
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
  leadingContent?: Html
  keep?: ReadonlyArray<number>
  findable?: (item: Item, index: number) => string | ReadonlyArray<string>
}>

/** Keep the visible range separate from the sorted rows to mount. */
export const renderedIndices = (
  range: Layout.Range,
  itemCount: number,
  keep: ReadonlyArray<number> = [],
): ReadonlyArray<number> => {
  const visible = Array.from(
    { length: range.endIndex - range.startIndex },
    (_, index) => index + range.startIndex,
  )
  const retained = keep.filter(
    index =>
      Number.isInteger(index) &&
      index >= 0 &&
      index < itemCount &&
      (index < range.startIndex || index >= range.endIndex),
  )
  return retained.length === 0
    ? visible
    : [...new Set([...visible, ...retained])].sort((a, b) => a - b)
}

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
  const horizontal = model.orientation === 'horizontal'
  const dynamic = model.measurementVersion !== undefined
  const findable =
    model.findInPage &&
    inputs.findable !== undefined &&
    supportsHiddenUntilFound()
      ? inputs.findable
      : undefined
  const attributes = measurementAttributes(h)
  const container = (children: Html[]) =>
    h.keyed('ul')(
      model.id,
      [
        ...childAttributes([
          h.Id(model.id),
          h.Role('list'),
          attributes.container(model.id),
          h.Style({
            overflow: 'auto',
            'list-style': 'none',
            margin: '0',
            padding: '0',
            ...(dynamic && model.preserveScrollAnchor
              ? { 'overflow-anchor': 'none' }
              : {}),
            ...(horizontal ? { display: 'flex' } : {}),
          }),
          ...(containerClassName === undefined
            ? []
            : [h.Class(containerClassName)]),
        ]),
        ...containerAttributes,
      ],
      children,
    )
  const axisSize = (size: number) =>
    horizontal ? { flex: 'none', width: `${size}px` } : { height: `${size}px` }
  const leading =
    scrollMargin(model) > 0
      ? [
          h.keyed('li')(
            `virtualizer:${model.id}:leading`,
            [
              h.Role('presentation'),
              h.Style({
                ...axisSize(scrollMargin(model)),
                ...(model.stickyScrollMargin
                  ? {
                      position: 'sticky',
                      'z-index': '1',
                      [horizontal ? 'inset-inline-start' : 'top']: '0',
                    }
                  : {}),
              }),
            ],
            inputs.leadingContent === undefined ? [] : [inputs.leadingContent],
          ),
        ]
      : []

  if (model.measurement._tag === 'Unmeasured') return container(leading)
  const layout = dynamic
    ? dynamicLayout(model, {
        items,
        itemToKey: inputs.itemToKey,
        ...(inputs.itemToRowHeightPx === undefined
          ? {}
          : { estimateItemSize: inputs.itemToRowHeightPx }),
      })
    : inputs.itemToRowHeightPx === undefined
      ? Layout.uniform(items.length, model.rowHeightPx)
      : Layout.variable(items, inputs.itemToRowHeightPx)
  const range = measuredRange(
    model,
    layout,
    overscan,
    model.measurement.containerHeight,
  )
  const positions = renderedIndices(range, items.length, inputs.keep)
  const spacer = (edge: string, start: number, end: number) => {
    const size = layout.offsetAt(end) - layout.offsetAt(start)
    if (findable === undefined || start === end) {
      return h.keyed('li')(`${model.id}-${edge}-spacer`, [
        h.Role('presentation'),
        h.Style(axisSize(size)),
      ])
    }
    const matches: Html[] = []
    for (let index = start; index < end; index += 1) {
      const item = items[index]!
      const content = findable(item, index)
      const text = typeof content === 'string' ? content : content.join(' ')
      if (text === '') continue
      const key = inputs.itemToKey(item, index)
      matches.push(
        h.keyed('div')(
          key,
          [
            h.Attribute('hidden', 'until-found'),
            h.DataAttribute(findIndexAttribute, String(index)),
            h.DataAttribute(findKeyAttribute, key),
          ],
          [text],
        ),
      )
    }
    return h.keyed('li')(
      `${model.id}-${edge}-spacer`,
      [
        h.Role('presentation'),
        h.Style({ ...axisSize(size), position: 'relative' }),
      ],
      [
        h.div(
          [
            h.AriaHidden(true),
            h.Style({
              position: 'absolute',
              'inset-inline-start': '0',
              'inset-block-start': '0',
              'inline-size': '0',
              'block-size': '0',
              overflow: 'clip',
              'pointer-events': 'none',
            }),
          ],
          matches,
        ),
      ],
    )
  }
  const renderItem = (item: Item, position: number) => {
    const key = inputs.itemToKey(item, position)
    const size = layout.offsetAt(position + 1) - layout.offsetAt(position)
    return h.keyed(rowElement)(
      key,
      [
        h.Role('listitem'),
        h.DataAttribute('virtual-list-item-index', String(position)),
        h.AriaSetsize(items.length),
        h.AriaPosinset(position + 1),
        ...(dynamic ? [attributes.item(key)] : []),
        h.Style({
          display: 'grid',
          ...(horizontal ? { flex: 'none' } : {}),
          ...(dynamic
            ? {}
            : { [horizontal ? 'width' : 'height']: `${size}px` }),
        }),
      ],
      [inputs.itemToView(item, position)],
    )
  }
  const first = positions[0] ?? range.startIndex
  const children = [...leading, spacer('top', 0, first)]
  let next = first
  for (const position of positions) {
    if (position > next) {
      children.push(spacer(`gap-${position}`, next, position))
    }
    children.push(renderItem(items[position]!, position))
    next = position + 1
  }
  children.push(spacer('bottom', next, layout.count))
  return container(children)
}

export const view = <Item>() =>
  defineView<Model, Message, ViewInputs<Item>>(renderWindow)

const applyScroll = (
  model: Model,
  index: number,
  scrollTop: number,
  expectedOffset?: number,
): Update.Return<Model, Message> => {
  const version = model.pendingScrollVersion + 1
  return {
    model: {
      ...model,
      pendingScrollVersion: version,
      pendingScroll: PendingScroll.ScrollingToIndex({ index, version }),
    },
    commands: [
      ApplyScroll({
        id: model.id,
        scrollTop,
        version,
        ...(model.orientation === 'horizontal' ? { horizontal: true } : {}),
        ...(expectedOffset === undefined ? {} : { expectedOffset }),
      }),
    ],
  }
}

const correctAnchor = <Item>(
  before: Model,
  after: Model,
  inputs: DynamicInputs<Item> | undefined,
): Update.Return<Model, Message> => {
  if (
    !before.preserveScrollAnchor ||
    inputs === undefined ||
    before.pendingScroll._tag !== 'Idle' ||
    before.measurement._tag !== 'Measured' ||
    before.measurement.containerHeight <= 0
  )
    return { model: after }
  const viewport = before.measurement.containerHeight
  const previousLayout = dynamicLayout(before, inputs)
  const { startIndex, endIndex } = measuredRange(
    before,
    previousLayout,
    0,
    viewport,
  )
  if (startIndex >= endIndex) return { model: after }
  const nextLayout = dynamicLayout(after, inputs)
  const shift =
    nextLayout.offsetAt(startIndex) - previousLayout.offsetAt(startIndex)
  if (shift === 0) return { model: after }
  const maxOffset = Math.max(
    0,
    scrollMargin(after) + nextLayout.totalSize - viewport,
  )
  const target = Math.max(0, Math.min(before.scrollTop + shift, maxOffset))
  return target === before.scrollTop
    ? { model: after }
    : applyScroll(after, startIndex, target, before.scrollTop)
}

export const updateWithLayout = <Item>(
  model: Model,
  message: Message,
  inputs?: DynamicInputs<Item>,
): Update.Return<Model, Message> =>
  Message.match(message, {
    ScrolledContainer: ({ scrollTop }) => ({ model: { ...model, scrollTop } }),
    FoundItem: ({ key, index }) => {
      if (!model.findInPage || inputs === undefined) return { model }
      const item = inputs.items[index]
      const currentIndex =
        index in inputs.items && inputs.itemToKey(item!, index) === key
          ? index
          : inputs.items.findIndex(
              (item, position) => inputs.itemToKey(item, position) === key,
            )
      return currentIndex < 0
        ? { model }
        : scrollToIndexLayout(
            model,
            dynamicLayout(model, inputs),
            currentIndex,
            { align: 'center' },
          )
    },
    MeasuredItems: ({ sizes, version }) => {
      if (model.measurementVersion !== version) return { model }
      const changes = Object.entries(sizes).filter(
        ([key, size]) =>
          Number.isFinite(size) &&
          size > 0 &&
          (!Object.hasOwn(model.itemSizes ?? {}, key) ||
            model.itemSizes?.[key] !== size),
      )
      return changes.length === 0
        ? { model }
        : correctAnchor(
            model,
            {
              ...model,
              itemSizes: { ...model.itemSizes, ...Object.fromEntries(changes) },
            },
            inputs,
          )
    },
    MeasuredContainer: ({ containerHeight }) => {
      const measured = {
        ...model,
        measurement: Measurement.Measured({ containerHeight }),
      }
      return model.measurement._tag === 'Unmeasured' && model.scrollTop !== 0
        ? applyScroll(
            measured,
            Math.floor(
              Math.max(0, model.scrollTop - scrollMargin(model)) /
                model.rowHeightPx,
            ),
            model.scrollTop,
          )
        : { model: measured }
    },
    CompletedApplyScroll: ({ version }) =>
      version === model.pendingScrollVersion
        ? { model: { ...model, pendingScroll: PendingScroll.Idle() } }
        : { model },
  })

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => updateWithLayout(model, message)

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
  const margin = scrollMargin(model)
  const occlusion =
    measured && model.stickyScrollMargin ? Math.min(margin, viewport) : 0
  const start = top + margin - occlusion
  const end = top + margin + height - viewport
  const target =
    align === 'start'
      ? start
      : align === 'center'
        ? (start + end) / 2
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
): Update.Return<Model, Message> =>
  items.length === 0 || !Number.isFinite(index)
    ? { model }
    : scrollToIndexLayout(
        model,
        Layout.variable(items, itemToRowHeightPx),
        index,
        options,
      )

/** Use the same computed layout for windowing and programmatic scrolling. */
export const scrollToIndexLayout = (
  model: Model,
  layout: Layout.Layout,
  index: number,
  options: ScrollOptions = {},
): Update.Return<Model, Message> => {
  if (layout.count === 0 || !Number.isFinite(index)) return { model }
  const clamped = Math.max(0, Math.min(Math.trunc(index), layout.count - 1))
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

export const visibleRange = (
  model: Model,
  layout: Layout.Layout,
  overscan: number,
): Option.Option<Layout.Range> =>
  model.measurement._tag === 'Unmeasured'
    ? Option.none()
    : Option.some(
        measuredRange(
          model,
          layout,
          overscan,
          model.measurement.containerHeight,
        ),
      )

const measuredRange = (
  model: Model,
  layout: Layout.Layout,
  overscan: number,
  viewport: number,
): Layout.Range => {
  const margin = scrollMargin(model)
  const occlusion = model.stickyScrollMargin ? Math.min(margin, viewport) : 0
  const start = Math.max(0, model.scrollTop + occlusion - margin)
  const end = Math.max(0, model.scrollTop + viewport - margin)
  return Layout.range(layout, start, end - start, overscan)
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
