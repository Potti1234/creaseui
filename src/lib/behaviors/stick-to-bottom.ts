// Adapted from ui-sdk's StickToBottom (Copyright 2026 Vercel, Inc.).
// SPDX-License-Identifier: Apache-2.0

import { Effect, Option, Queue, Schema as S, Stream } from 'effect'
import type { Update } from 'foldkit'
import { Command } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

const Metrics = {
  scrollTop: S.Number,
  scrollHeight: S.Number,
  clientHeight: S.Number,
}
type Metrics = { readonly [K in keyof typeof Metrics]: number }
const Direction = S.Literals(['start', 'end'])
const Observation = S.Literals(['mount', 'user', 'content', 'resize'])

export const Model = S.Struct({
  ...Metrics,
  id: S.String,
  threshold: S.Number,
  isReady: S.Boolean,
  isFollowing: S.Boolean,
  hasNewMessages: S.Boolean,
  scrollVersion: S.Int,
  pendingScrollVersion: S.Option(S.Int),
  adjustedScrollTop: S.Option(S.Number),
  prependDistance: S.Option(S.Number),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  Scrolled: Metrics,
  ObservedMessageScrollerViewport: {
    ...Metrics,
    reason: Observation,
    anchorShift: S.optional(S.Number),
    anchorTop: S.optional(S.Number),
  },
  RequestedScroll: { direction: Direction },
  Released: {},
  RequestedPrepend: {},
  CompletedMessageScrollerScrollTo: { version: S.Number },
})
export type Message = typeof Message.Type

export const init = (
  id: string,
  options: Readonly<{ initial?: boolean; threshold?: number }> = {},
): Model => ({
  id,
  scrollTop: 0,
  scrollHeight: 0,
  clientHeight: 0,
  threshold: Math.max(0, options.threshold ?? 24),
  isReady: false,
  isFollowing: options.initial ?? true,
  hasNewMessages: false,
  scrollVersion: 0,
  pendingScrollVersion: Option.none(),
  adjustedScrollTop: Option.none(),
  prependDistance: Option.none(),
})

const maxScrollTop = (metrics: Metrics): number =>
  Math.max(0, metrics.scrollHeight - metrics.clientHeight)

export const distanceFromBottom = (metrics: Metrics): number =>
  Math.max(0, maxScrollTop(metrics) - metrics.scrollTop)

export const isAtBottom = (model: Model): boolean =>
  distanceFromBottom(model) <= model.threshold

const Target = S.Union([Direction, S.Number])
const ScrollTo = Command.define('MessageScrollerScrollTo', {
  args: { id: S.String, target: Target, version: S.Int, instant: S.Boolean },
  messages: [Message.CompletedMessageScrollerScrollTo],
  execute: ({ id, target, version, instant }) =>
    Effect.sync(() => {
      const viewport = document.getElementById(`${id}-viewport`)
      if (!(viewport instanceof HTMLElement)) return
      const reduced = viewport.ownerDocument.defaultView?.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      viewport.scrollTo({
        top:
          target === 'end'
            ? viewport.scrollHeight - viewport.clientHeight
            : target === 'start'
              ? 0
              : target,
        behavior: instant || reduced ? 'instant' : 'smooth',
      })
    }).pipe(Effect.as(Message.CompletedMessageScrollerScrollTo({ version }))),
})

type UpdateReturn = Update.Return<Model, Message>

const scrollTo = (
  model: Model,
  target: typeof Target.Type,
  instant: boolean,
): UpdateReturn => {
  const version = model.scrollVersion + 1
  return {
    model: {
      ...model,
      scrollVersion: version,
      pendingScrollVersion: Option.some(version),
    },
    commands: [ScrollTo({ id: model.id, target, version, instant })],
  }
}

const observe = (
  model: Model,
  metrics: Metrics,
  reason: typeof Observation.Type,
  anchorShift: number,
  anchorTop?: number,
): UpdateReturn => {
  const next = {
    ...model,
    scrollTop: metrics.scrollTop,
    scrollHeight: metrics.scrollHeight,
    clientHeight: metrics.clientHeight,
    isReady: Option.isNone(model.pendingScrollVersion) || model.isReady,
  }
  const wasAdjusted = Option.exists(
    model.adjustedScrollTop,
    top => Math.abs(top - next.scrollTop) <= 1,
  )
  if (reason === 'user') {
    const atBottom = isAtBottom(next)
    const movement = next.scrollTop - model.scrollTop
    return {
      model: {
        ...next,
        isFollowing: wasAdjusted
          ? model.isFollowing
          : movement < -1 && !atBottom
            ? false
            : movement > 0 && atBottom
              ? true
              : model.isFollowing,
        hasNewMessages: !atBottom && model.hasNewMessages,
        adjustedScrollTop: Option.none(),
      },
    }
  }

  const heightChanged = next.scrollHeight !== model.scrollHeight
  const restoring = heightChanged && Option.isSome(model.prependDistance)
  if (
    !restoring &&
    model.isFollowing &&
    (reason === 'mount' ||
      heightChanged ||
      next.clientHeight !== model.clientHeight)
  ) {
    return distanceFromBottom(next) > 1
      ? scrollTo({ ...next, isReady: model.isReady }, 'end', true)
      : { model: next }
  }

  // A shorter list may clamp scrollTop before the observer reads it.
  const previousTop = Option.getOrElse(
    model.adjustedScrollTop,
    () => model.scrollTop,
  )
  const clamped =
    heightChanged &&
    maxScrollTop(next) < previousTop &&
    distanceFromBottom(next) <= 1
  const baseTop = clamped ? previousTop : next.scrollTop
  const canAnchor =
    (restoring || !model.isFollowing) &&
    (clamped || wasAdjusted || Math.abs(next.scrollTop - model.scrollTop) <= 1)
  const target =
    canAnchor && (anchorTop !== undefined || Math.abs(anchorShift) >= 1)
      ? (anchorTop ?? baseTop + anchorShift)
      : restoring && Option.isSome(model.prependDistance)
        ? maxScrollTop(next) - model.prependDistance.value
        : next.scrollTop
  const top = Math.max(0, Math.min(maxScrollTop(next), target))
  const hasNewMessages =
    !next.isFollowing &&
    !isAtBottom({ ...next, scrollTop: top }) &&
    (model.hasNewMessages ||
      (!restoring &&
        next.scrollHeight - anchorShift - model.scrollHeight > 1 &&
        model.isReady))
  const adjusted = {
    ...next,
    hasNewMessages,
    prependDistance: restoring ? Option.none() : model.prependDistance,
  }
  return Math.abs(top - next.scrollTop) >= 1
    ? scrollTo({ ...adjusted, adjustedScrollTop: Option.some(top) }, top, true)
    : { model: adjusted }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Scrolled':
      return observe(model, message, 'user', 0)
    case 'ObservedMessageScrollerViewport':
      return observe(
        model,
        message,
        message.reason,
        message.anchorShift ?? 0,
        message.anchorTop,
      )
    case 'Released':
      return {
        model: {
          ...model,
          isFollowing: false,
          adjustedScrollTop: Option.none(),
        },
      }
    case 'RequestedPrepend':
      return {
        model: {
          ...model,
          prependDistance: Option.some(distanceFromBottom(model)),
        },
      }
    case 'RequestedScroll':
      return scrollTo(
        {
          ...model,
          isFollowing: message.direction === 'end',
          hasNewMessages: message.direction === 'start' && model.hasNewMessages,
          adjustedScrollTop: Option.none(),
          prependDistance: Option.none(),
        },
        message.direction,
        false,
      )
    case 'CompletedMessageScrollerScrollTo':
      return Option.contains(model.pendingScrollVersion, message.version)
        ? {
            model: {
              ...model,
              pendingScrollVersion: Option.none(),
              isReady: true,
            },
          }
        : { model }
  }
}

const rowsOf = (viewport: HTMLElement): HTMLCollection => {
  let container: Element = viewport
  let child = container.firstElementChild
  while (container.childElementCount === 1 && child?.firstElementChild) {
    container = child
    child = container.firstElementChild
  }
  return container.children
}

const firstVisibleRow = (
  rows: HTMLCollection,
  box: DOMRect,
): Element | null => {
  let found: Element | null = null
  let left = 0
  let right = rows.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    let i = mid
    let row = rows.item(i)
    while (i < right && row?.getClientRects().length === 0) row = rows.item(++i)
    const rect = row?.getClientRects().length
      ? row.getBoundingClientRect()
      : null
    if (rect === null || rect.top >= box.bottom) right = mid - 1
    else if (rect.bottom <= box.top) left = i + 1
    else {
      found = row
      right = mid - 1
    }
  }
  return found
}

type ViewportMessage =
  | typeof Message.ObservedMessageScrollerViewport.Type
  | typeof Message.Released.Type

const observeViewport = (
  element: HTMLElement,
  emit: (message: ViewportMessage) => void,
): (() => void) => {
  // The row reference is mount-local; follow and the correction policy live in the model.
  let anchor:
    | { row: Element; offset: number; viewportOffset: number }
    | undefined
  let previousMetrics: Metrics | undefined
  const sample = (event: typeof Observation.Type) => {
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    const scrollTop = element.scrollTop
    const previous = previousMetrics
    const sizeChanged =
      previous !== undefined &&
      (previous.scrollHeight !== scrollHeight ||
        previous.clientHeight !== clientHeight)
    const sameMetrics = !sizeChanged && previous?.scrollTop === scrollTop
    if (event === 'user' && sameMetrics) return
    // Layout can clamp scrollTop before ResizeObserver delivers its callback.
    const reason = event === 'user' && sizeChanged ? 'resize' : event
    previousMetrics = { scrollHeight, clientHeight, scrollTop }
    const box = element.getBoundingClientRect()
    const offsetOf = (row: Element) =>
      row.getBoundingClientRect().top - box.top + scrollTop
    const geometry = reason === 'resize' || reason === 'content'
    const retained =
      geometry &&
      anchor !== undefined &&
      element.contains(anchor.row) &&
      anchor.row.getClientRects().length > 0
        ? anchor
        : undefined
    const anchorShift =
      retained === undefined ? 0 : offsetOf(retained.row) - retained.offset
    const anchorTop =
      retained === undefined
        ? undefined
        : offsetOf(retained.row) - retained.viewportOffset
    const row = retained?.row ?? firstVisibleRow(rowsOf(element), box)
    if (row === null) anchor = undefined
    else {
      const offset = offsetOf(row)
      anchor = {
        row,
        offset,
        viewportOffset: retained?.viewportOffset ?? offset - scrollTop,
      }
    }
    if (sameMetrics && anchorShift === 0) return
    emit(
      Message.ObservedMessageScrollerViewport({
        reason,
        anchorShift,
        ...(anchorTop === undefined || Math.abs(anchorTop - scrollTop) < 1
          ? {}
          : { anchorTop }),
        scrollTop,
        scrollHeight,
        clientHeight,
      }),
    )
  }

  const view = element.ownerDocument.defaultView
  const resize = view?.ResizeObserver
    ? new view.ResizeObserver(() => sample('resize'))
    : undefined
  let watched = new Set<Element>()
  const watchRows = () => {
    if (resize === undefined) return
    const next = new Set([
      element,
      ...Array.from(element.children),
      ...Array.from(rowsOf(element)),
    ])
    for (const node of watched) if (!next.has(node)) resize.unobserve(node)
    for (const node of next) if (!watched.has(node)) resize.observe(node)
    watched = next
  }
  const mutation = view?.MutationObserver
    ? new view.MutationObserver(() => {
        watchRows()
        sample('content')
      })
    : undefined
  const onScroll = () => sample('user')
  const release = () => {
    if (element.scrollTop > 0) emit(Message.Released())
  }
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && event.deltaY < 0) release()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (
      event.target === element &&
      (['ArrowUp', 'PageUp', 'Home'].includes(event.key) ||
        (event.key === ' ' && event.shiftKey))
    )
      release()
  }

  const anchoring = element.style.getPropertyValue('overflow-anchor')
  const priority = element.style.getPropertyPriority('overflow-anchor')
  element.style.setProperty('overflow-anchor', 'none')
  element.addEventListener('scroll', onScroll, { passive: true })
  element.addEventListener('wheel', onWheel, { passive: true })
  element.addEventListener('keydown', onKeyDown)
  watchRows()
  mutation?.observe(element, {
    childList: true,
    subtree: true,
    characterData: true,
  })
  sample('mount')
  return () => {
    element.removeEventListener('scroll', onScroll)
    element.removeEventListener('wheel', onWheel)
    element.removeEventListener('keydown', onKeyDown)
    resize?.disconnect()
    mutation?.disconnect()
    if (anchoring === '') element.style.removeProperty('overflow-anchor')
    else element.style.setProperty('overflow-anchor', anchoring, priority)
  }
}

export const ObserveMessageScroller = Mount.defineStream(
  'ObserveMessageScroller',
  {
    messages: [Message.ObservedMessageScrollerViewport, Message.Released],
    execute: ({ element }) =>
      Stream.callback<ViewportMessage>(queue =>
        Effect.gen(function* () {
          yield* Effect.acquireRelease(
            Effect.sync(() =>
              element instanceof HTMLElement
                ? observeViewport(element, message =>
                    Queue.offerUnsafe(queue, message),
                  )
                : undefined,
            ),
            cleanup => Effect.sync(() => cleanup?.()),
          )
          return yield* Effect.never
        }),
      ),
  },
)

export const viewportMount = <Msg>(
  toParentMessage: (message: Message) => Msg,
) => Mount.mapMessage(ObserveMessageScroller(), toParentMessage)
