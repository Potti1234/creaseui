import { Effect, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Render from 'foldkit/render'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

export const Model = Schema.Struct({
  id: Schema.String,
  currentKey: Schema.NullOr(Schema.String),
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
  currentKey: null,
  draft: '',
  edits: {},
})

export const defaultEntryKey = (entry: string, index: number): string =>
  JSON.stringify([index, entry])

const navigationStep = (
  model: Model,
  { entries, getEntryKey = defaultEntryKey }: Inputs,
  direction: Direction,
):
  | Readonly<{ keys: ReadonlyArray<string>; current: number; next: number }>
  | undefined => {
  const keys = entries.map(getEntryKey)
  const found = model.currentKey === null ? -1 : keys.indexOf(model.currentKey)
  const current = found < 0 ? keys.length : found
  const next = current + (direction === 'up' ? -1 : 1)
  return next < 0 || next > keys.length ? undefined : { keys, current, next }
}

export const canNavigate = (
  model: Model,
  inputs: Inputs,
  direction: Direction,
): boolean => navigationStep(model, inputs, direction) !== undefined

export const navigate = (
  model: Model,
  direction: Direction,
  value: string,
  inputs: Inputs,
): Readonly<{ model: Model; value: string }> | undefined => {
  const step = navigationStep(model, inputs, direction)
  if (step === undefined) return undefined
  const { keys, current, next } = step
  const { entries } = inputs
  const draft = current === entries.length ? value : model.draft
  const edits =
    current < entries.length && model.currentKey !== null
      ? { ...model.edits, [model.currentKey]: value }
      : model.edits
  const key = keys[next] ?? null
  return {
    model: { ...model, currentKey: key, draft, edits },
    value:
      key === null
        ? draft
        : Object.hasOwn(edits, key)
          ? (edits[key] ?? '')
          : (entries[next] ?? ''),
  }
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
      return result === undefined
        ? { model }
        : {
            model: result.model,
            commands: [MoveCaretToEnd({ id: model.id })],
            outMessage: OutMessage.RestoredValue({ value: result.value }),
          }
    },
  })

export type EdgeOptions = Readonly<{
  atEdge?: (direction: Direction) => boolean
  caretLine?: (field: HTMLTextAreaElement, offset: number) => number | undefined
}>

export const measureCaretLine = (
  field: HTMLTextAreaElement,
  offset: number,
): number | undefined => {
  if (!field.isConnected || field.clientWidth === 0) return undefined
  const doc = field.ownerDocument
  const computed = doc.defaultView?.getComputedStyle(field)
  if (computed === undefined) return undefined
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
    return marker.getBoundingClientRect().top
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
): Direction | undefined => {
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
    event.isComposing ||
    event.keyCode === 229 ||
    field.getAttribute('aria-expanded') === 'true' ||
    field.hasAttribute('data-open') ||
    field.hasAttribute('readonly') ||
    field.hasAttribute('disabled')
  )
    return undefined
  if (field.localName === 'input') {
    const type = field.getAttribute('type') ?? 'text'
    if (!['text', 'search', 'url', 'tel'].includes(type.toLowerCase()))
      return undefined
    return atEdge === undefined || atEdge(direction) ? direction : undefined
  }
  const view = field.ownerDocument.defaultView
  if (view !== null && field instanceof view.HTMLTextAreaElement) {
    if (field.selectionStart !== field.selectionEnd) return undefined
    if (atEdge !== undefined) return atEdge(direction) ? direction : undefined
    const caret = field.selectionStart
    const end = direction === 'up' ? 0 : field.value.length
    if (caret === end) return direction
    const between =
      direction === 'up'
        ? field.value.slice(0, caret)
        : field.value.slice(caret)
    if (between.includes('\n')) return undefined
    const line = caretLine(field, caret)
    return line !== undefined && line === caretLine(field, end)
      ? direction
      : undefined
  }
  return atEdge?.(direction) === true ? direction : undefined
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
                      const direction = keyDirection(event, element, options)
                      if (direction === undefined) return
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
