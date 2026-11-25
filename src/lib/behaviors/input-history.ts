import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Render from 'foldkit/render'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import { isComposing } from './text-dom'

export const Model = Schema.Struct({
  id: Schema.String,
  maybeCurrentKey: Schema.Option(Schema.String),
  draft: Schema.String,
  edits: Schema.Record(Schema.String, Schema.String),
})

export type Model = typeof Model.Type

export const Direction = Schema.Literals(['up', 'down'])

export type Direction = typeof Direction.Type

export const Message = defineMessageUnion({
  RequestedNavigation: { direction: Direction, value: Schema.String },
  Reset: {},
  CompletedMoveCaret: {},
})

export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  RestoredValue: { value: Schema.String },
})

export type OutMessage = typeof OutMessage.Type

export type Inputs = Readonly<{
  entries: ReadonlyArray<string>
  getEntryKey?: (entry: string, index: number) => string
}>

export const init = ({ id }: Readonly<{ id: string }>): Model => ({
  id,
  maybeCurrentKey: Option.none(),
  draft: '',
  edits: {},
})

export const defaultEntryKey = (entry: string, index: number): string =>
  JSON.stringify([index, entry])

const navigationStep = (
  model: Model,
  { entries, getEntryKey = defaultEntryKey }: Inputs,
  direction: Direction,
): Option.Option<
  Readonly<{ keys: ReadonlyArray<string>; current: number; next: number }>
> => {
  const keys = entries.map(getEntryKey)
  const found = Option.match(model.maybeCurrentKey, {
    onNone: () => -1,
    onSome: key => keys.indexOf(key),
  })
  const current = found < 0 ? keys.length : found
  const next = current + (direction === 'up' ? -1 : 1)
  return next < 0 || next > keys.length
    ? Option.none()
    : Option.some({ keys, current, next })
}

export const canNavigate = (
  model: Model,
  inputs: Inputs,
  direction: Direction,
): boolean => Option.isSome(navigationStep(model, inputs, direction))

export const navigate = (
  model: Model,
  direction: Direction,
  value: string,
  inputs: Inputs,
): Option.Option<Readonly<{ model: Model; value: string }>> => {
  const step = navigationStep(model, inputs, direction)
  if (Option.isNone(step)) return Option.none()
  const { keys, current, next } = step.value
  const { entries } = inputs
  const draft = current === entries.length ? value : model.draft
  const edits =
    current < entries.length && Option.isSome(model.maybeCurrentKey)
      ? { ...model.edits, [model.maybeCurrentKey.value]: value }
      : model.edits
  const maybeCurrentKey = Option.fromNullishOr(keys[next])
  return Option.some({
    model: { ...model, maybeCurrentKey, draft, edits },
    value: Option.match(maybeCurrentKey, {
      onNone: () => draft,
      onSome: key =>
        Object.hasOwn(edits, key) ? (edits[key] ?? '') : (entries[next] ?? ''),
    }),
  })
}

export const MoveCaretToEnd = Command.define('InputHistoryMoveCaretToEnd', {
  args: { id: Schema.String },
  messages: [Message.CompletedMoveCaret],
  execute: ({ id }) =>
    Render.afterCommit.pipe(
      Effect.andThen(
        Effect.sync(() => {
          const field = document.getElementById(id)
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement
          ) {
            try {
              field.setSelectionRange(field.value.length, field.value.length)
            } catch {
              /* Unsupported input selection API. */
            }
          }
          return Message.CompletedMoveCaret()
        }),
      ),
    ),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const update = (
  model: Model,
  message: Message,
  inputs: Inputs,
): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    Reset: () => ({ model: init({ id: model.id }) }),
    CompletedMoveCaret: () => ({ model }),
    RequestedNavigation: ({ direction, value }) => {
      const result = navigate(model, direction, value, inputs)
      return Option.match(result, {
        onNone: () => ({ model }),
        onSome: result => ({
          model: result.model,
          commands: [MoveCaretToEnd({ id: model.id })],
          outMessage: OutMessage.RestoredValue({ value: result.value }),
        }),
      })
    },
  })

export type EdgeOptions = Readonly<{
  atEdge?: (direction: Direction) => boolean
  caretLine?: (
    field: HTMLTextAreaElement,
    offset: number,
  ) => Option.Option<number>
}>

export const measureCaretLine = (
  field: HTMLTextAreaElement,
  offset: number,
): Option.Option<number> => {
  if (!field.isConnected || field.clientWidth === 0) return Option.none()
  const doc = field.ownerDocument
  const computed = doc.defaultView?.getComputedStyle(field)
  if (computed === undefined) return Option.none()
  const mirror = doc.createElement('div')
  for (const property of Array.from(computed)) {
    mirror.style.setProperty(property, computed.getPropertyValue(property))
  }
  Object.assign(mirror.style, {
    display: 'block',
    position: 'absolute',
    visibility: 'hidden',
    top: '0',
    left: '-99999px',
    height: 'auto',
    minHeight: '0',
    maxHeight: 'none',
    overflow: 'hidden',
    boxSizing: 'content-box',
    width: `${field.clientWidth - parseFloat(computed.paddingLeft) - parseFloat(computed.paddingRight)}px`,
    whiteSpace: field.wrap === 'off' ? 'pre' : 'pre-wrap',
    overflowWrap: 'break-word',
  })
  const marker = doc.createElement('span')
  marker.textContent = '\u200b'
  mirror.append(field.value.slice(0, offset), marker, field.value.slice(offset))
  doc.body.append(mirror)
  try {
    return Option.some(marker.getBoundingClientRect().top)
  } finally {
    mirror.remove()
  }
}

export const keyDirection = (
  event: Pick<
    KeyboardEvent,
    | 'key'
    | 'altKey'
    | 'ctrlKey'
    | 'metaKey'
    | 'shiftKey'
    | 'isComposing'
    | 'keyCode'
    | 'defaultPrevented'
  >,
  field: Element,
  { atEdge, caretLine = measureCaretLine }: EdgeOptions = {},
): Option.Option<Direction> => {
  const direction =
    event.key === 'ArrowUp'
      ? 'up'
      : event.key === 'ArrowDown'
        ? 'down'
        : undefined
  if (
    direction === undefined ||
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isComposing(event) ||
    field.getAttribute('aria-expanded') === 'true' ||
    field.hasAttribute('data-open') ||
    field.hasAttribute('readonly') ||
    field.hasAttribute('disabled')
  )
    return Option.none()
  if (field.localName === 'input') {
    const type = field.getAttribute('type') ?? 'text'
    if (!['text', 'search', 'url', 'tel'].includes(type.toLowerCase()))
      return Option.none()
    return atEdge === undefined || atEdge(direction)
      ? Option.some(direction)
      : Option.none()
  }
  const view = field.ownerDocument.defaultView
  if (view !== null && field instanceof view.HTMLTextAreaElement) {
    if (field.selectionStart !== field.selectionEnd) return Option.none()
    if (atEdge !== undefined)
      return atEdge(direction) ? Option.some(direction) : Option.none()
    const caret = field.selectionStart
    const end = direction === 'up' ? 0 : field.value.length
    if (caret === end) return Option.some(direction)
    const between =
      direction === 'up'
        ? field.value.slice(0, caret)
        : field.value.slice(caret)
    if (between.includes('\n')) return Option.none()
    const line = caretLine(field, caret)
    if (Option.isNone(line)) return Option.none()
    const edgeLine = caretLine(field, end)
    return Option.isSome(edgeLine) && line.value === edgeLine.value
      ? Option.some(direction)
      : Option.none()
  }
  return atEdge?.(direction) === true ? Option.some(direction) : Option.none()
}

export const create = (options: EdgeOptions = {}) => {
  const ObserveInputHistory = Mount.defineStream('ObserveInputHistory', {
    messages: [Message.RequestedNavigation],
    execute: ({ element, viewStateChanges }) =>
      Stream.switchMap(viewStateChanges, state =>
        state === 'Paused'
          ? Stream.never
          : Stream.callback<typeof Message.RequestedNavigation.Type>(queue =>
              Effect.gen(function* () {
                yield* Effect.acquireRelease(
                  Effect.sync(() => {
                    const onKeyDown = (event: Event) => {
                      const view = element.ownerDocument.defaultView
                      if (
                        view === null ||
                        !(event instanceof view.KeyboardEvent)
                      )
                        return
                      const maybeDirection = keyDirection(
                        event,
                        element,
                        options,
                      )
                      if (Option.isNone(maybeDirection)) return
                      const direction = maybeDirection.value
                      if (!element.hasAttribute(`data-history-${direction}`))
                        return
                      const value =
                        'value' in element && typeof element.value === 'string'
                          ? element.value
                          : (element.textContent ?? '')
                      event.preventDefault()
                      Queue.offerUnsafe(
                        queue,
                        Message.RequestedNavigation({ direction, value }),
                      )
                    }
                    element.addEventListener('keydown', onKeyDown)
                    return onKeyDown
                  }),
                  onKeyDown =>
                    Effect.sync(() =>
                      element.removeEventListener('keydown', onKeyDown),
                    ),
                )
                return yield* Effect.never
              }),
            ),
      ),
  })
  return {
    mount: ObserveInputHistory,
    attributes: <Msg>(
      model: Model,
      inputs: Inputs,
      send: (message: Message) => Msg,
      h: HtmlBuilder<Msg>,
    ) => [
      ...(canNavigate(model, inputs, 'up')
        ? [h.DataAttribute('history-up', '')]
        : []),
      ...(canNavigate(model, inputs, 'down')
        ? [h.DataAttribute('history-down', '')]
        : []),
      h.OnMount(Mount.mapMessage(ObserveInputHistory(), send)),
    ],
  }
}

export const { attributes } = create()
