import { Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Span = Schema.Struct({
  id: Schema.String,
  track: Schema.String,
  start: Schema.Finite,
  end: Schema.Finite,
})
export type Span = typeof Span.Type

const PointerAction = Schema.Literals(['draw', 'move', 'resize'])
const SpanAction = Schema.Union([PointerAction, Schema.Literal('delete')])
export type SpanAction = typeof SpanAction.Type
const Reason = Schema.Literals([
  'drag',
  'move-key',
  'remove-press',
  'imperative',
])
const Edge = Schema.Literals(['start', 'end'])
const Point = Schema.Struct({ x: Schema.Finite, y: Schema.Finite })
const TrackRect = Schema.Struct({
  track: Schema.String,
  left: Schema.Finite,
  top: Schema.Finite,
  width: Schema.Finite,
  height: Schema.Finite,
  rtl: Schema.Boolean,
})
export type TrackRect = typeof TrackRect.Type

const pointerCases = {
  PressedTrack: { rect: TrackRect, point: Point, pointerId: Schema.Number },
  PressedSpan: {
    id: Schema.String,
    edge: Schema.Option(Edge),
    rect: TrackRect,
    point: Point,
    pointerId: Schema.Number,
  },
  MovedPointer: {
    rects: Schema.Array(TrackRect),
    point: Point,
    pointerId: Schema.Number,
  },
  ReleasedPointer: { pointerId: Schema.Number },
  CancelledPointer: { pointerId: Schema.Number },
  CancelledDrag: {},
}

export const PointerMessage = defineMessageUnion(pointerCases)
export type PointerMessage = typeof PointerMessage.Type
export const DRAG_THRESHOLD = 3

type Geometry = Readonly<{
  axis?: 'x' | 'y'
  min?: number
  max?: number
  step?: number
  minSize?: number
  maxSize?: number
}>

export type Options<S extends Span> = Geometry &
  Readonly<{
    tracks?: ReadonlyArray<string>
    overlap?: boolean
    size?: number
    create?: (span: Omit<Span, 'id'>) => Option.Option<S>
    isDisabled?: (span: S) => boolean
  }>

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const cleanNumber = (value: number): number => Number(value.toPrecision(15))

const limits = ({
  min = 0,
  max = 100,
  step = 1,
  minSize = step,
  maxSize = max - min,
}: Geometry) => {
  const range = Math.max(0, max - min)
  const stride = step > 0 ? step : 1
  const shortest = Math.min(range, Math.max(stride, minSize))
  return {
    min,
    max: Math.max(min, max),
    step: stride,
    shortest,
    longest: clamp(maxSize, shortest, range),
  }
}

const snap = (
  value: number,
  geometry: Geometry,
  round: (value: number) => number = Math.round,
): number => {
  const { min, max, step } = limits(geometry)
  const count = round(Number(((value - min) / step).toPrecision(14)))
  return clamp(cleanNumber(min + count * step), min, max)
}

const fit = <S extends Span>(
  span: S,
  keep: 'start' | 'end' | 'size',
  geometry: Geometry,
): S => {
  const { min, max, shortest, longest } = limits(geometry)
  if (keep === 'start') {
    const start = clamp(span.start, min, cleanNumber(max - shortest))
    return {
      ...span,
      start,
      end: clamp(
        span.end,
        cleanNumber(start + shortest),
        Math.min(max, cleanNumber(start + longest)),
      ),
    }
  }
  if (keep === 'end') {
    const end = clamp(span.end, cleanNumber(min + shortest), max)
    return {
      ...span,
      end,
      start: clamp(
        span.start,
        Math.max(min, cleanNumber(end - longest)),
        cleanNumber(end - shortest),
      ),
    }
  }
  const size = clamp(cleanNumber(span.end - span.start), shortest, longest)
  const start = clamp(span.start, min, cleanNumber(max - size))
  return { ...span, start, end: Math.min(max, cleanNumber(start + size)) }
}

const rawValueAt = (
  rect: TrackRect,
  point: typeof Point.Type,
  geometry: Geometry,
): number => {
  const { min, max } = limits(geometry)
  const horizontal = geometry.axis === 'x'
  const length = horizontal ? rect.width : rect.height
  const offset = horizontal ? point.x - rect.left : point.y - rect.top
  const fraction = length > 0 ? clamp(offset / length, 0, 1) : 0
  return min + (horizontal && rect.rtl ? 1 - fraction : fraction) * (max - min)
}

export const valueAt = (
  rect: TrackRect,
  point: typeof Point.Type,
  geometry: Geometry = {},
): number => snap(rawValueAt(rect, point, geometry), geometry)

const nearestTrack = (
  rects: ReadonlyArray<TrackRect>,
  point: typeof Point.Type,
  axis: Geometry['axis'],
): TrackRect | undefined => {
  let nearest: TrackRect | undefined
  let distance = Infinity
  for (const rect of rects) {
    const horizontal = axis === 'x'
    const start = horizontal ? rect.top : rect.left
    const end = start + (horizontal ? rect.height : rect.width)
    const offset = horizontal ? point.y : point.x
    const candidate = Math.abs(offset - clamp(offset, start, end))
    if (candidate < distance) {
      nearest = rect
      distance = candidate
    }
  }
  return nearest
}

export const isSpanFree = (spans: ReadonlyArray<Span>, span: Span): boolean =>
  spans.every(
    other =>
      other.id === span.id ||
      other.track !== span.track ||
      other.end <= span.start ||
      other.start >= span.end,
  )

export type Lane = Readonly<{ lane: number; lanes: number }>

export const stackSpans = (
  spans: ReadonlyArray<Span>,
): ReadonlyMap<string, Lane> => {
  const result = new Map<string, Lane>()
  const tracks = new Map<string, Span[]>()
  for (const span of spans) {
    const track = tracks.get(span.track)
    if (track) track.push(span)
    else tracks.set(span.track, [span])
  }
  for (const track of tracks.values()) {
    track.sort((a, b) => a.start - b.start || b.end - a.end)
    let group: Array<Readonly<{ id: string; lane: number }>> = []
    let ends: number[] = []
    let groupEnd = -Infinity
    const finish = () => {
      for (const { id, lane } of group)
        result.set(id, { lane, lanes: ends.length })
      group = []
      ends = []
      groupEnd = -Infinity
    }
    for (const span of track) {
      if (span.start >= groupEnd) finish()
      const free = ends.findIndex(end => end <= span.start)
      const lane = free === -1 ? ends.length : free
      ends[lane] = span.end
      group.push({ id: span.id, lane })
      groupEnd = Math.max(groupEnd, span.end)
    }
    finish()
  }
  return result
}

export const spanStyle = (
  span: Span,
  geometry: Geometry = {},
  lane?: Lane,
): string => {
  const { min, max } = limits(geometry)
  const from = (span.start - min) / (max - min || 1)
  const size = (span.end - span.start) / (max - min || 1)
  const percent = (value: number) => `${Math.round(value * 1e4) / 100}%`
  const [along, length, across, breadth] =
    geometry.axis === 'x'
      ? ['inset-inline-start', 'width', 'top', 'height']
      : ['top', 'height', 'inset-inline-start', 'width']
  const placement = lane
    ? `;${across}:${percent(lane.lane / lane.lanes)};${breadth}:${percent(1 / lane.lanes)}`
    : ''
  return `position:absolute;${along}:${percent(from)};${length}:${percent(size)}${placement};--span-start:${from};--span-size:${size}`
}

export const spansMessage = (
  type: SpanAction | 'cancel',
  label: string,
): string => {
  if (type === 'draw') return `Added ${label}.`
  if (type === 'delete') return `Deleted ${label}.`
  if (type === 'cancel') return `Put back ${label}.`
  return `${label}.`
}

const replace = <S extends Span>(
  spans: ReadonlyArray<S>,
  span: S,
): ReadonlyArray<S> =>
  spans.some(other => other.id === span.id)
    ? spans.map(other => (other.id === span.id ? span : other))
    : [...spans, span]

const sameRange = (a: Span, b: Span): boolean =>
  a.start === b.start && a.end === b.end && a.track === b.track

export const create = <S extends Span>(span: Schema.Codec<S>) => {
  const Model = Schema.Struct({
    spans: Schema.Array(span),
    drag: Schema.Option(
      Schema.Struct({
        original: span,
        preview: Schema.Option(span),
        action: PointerAction,
        edge: Schema.Option(Edge),
        pointerId: Schema.Number,
        origin: Point,
        anchor: Schema.Finite,
        started: Schema.Boolean,
      }),
    ),
  })
  type Model = typeof Model.Type
  type Drag = Option.Option.Value<Model['drag']>

  const Message = defineMessageUnion({
    ...pointerCases,
    PressedKey: {
      id: Schema.String,
      key: Schema.String,
      shift: Schema.Boolean,
      rtl: Schema.Boolean,
    },
    ReflectedSpans: { spans: Schema.Array(span) },
    RemovedSpan: { id: Schema.String },
  })
  type Message = typeof Message.Type

  const OutMessage = defineMessageUnion({
    ChangedSpans: {
      spans: Schema.Array(span),
      span,
      reason: Reason,
      action: SpanAction,
      movedTrack: Schema.Boolean,
    },
    CancelledEdit: { span },
  })
  type OutMessage = typeof OutMessage.Type
  type Result = Update.ReturnWithOutMessage<Model, Message, OutMessage>

  const init = (spans: ReadonlyArray<S> = []): Model => ({
    spans: [...spans],
    drag: Option.none(),
  })
  const spans = (model: Model): ReadonlyArray<S> =>
    model.drag.pipe(
      Option.flatMap(({ preview }) => preview),
      Option.match({
        onNone: () => model.spans,
        onSome: preview => replace(model.spans, preview),
      }),
    )
  const spansOn = (model: Model, track: string): ReadonlyArray<S> =>
    spans(model).filter(span => span.track === track)
  const action = (
    model: Model,
    id: string,
  ): Option.Option<typeof PointerAction.Type> =>
    model.drag.pipe(
      Option.filter(drag => drag.started && drag.original.id === id),
      Option.map(drag => drag.action),
    )
  const spanAttrs = (model: Model, id: string) => {
    const active = Option.getOrUndefined(action(model, id))
    return {
      'data-span-id': id,
      ...(active === 'move' ? { 'data-dragging': '' } : {}),
      ...(active === 'resize' ? { 'data-resizing': '' } : {}),
      ...(active === 'draw' ? { 'data-drawing': '' } : {}),
    }
  }

  const allowed = (model: Model, span: S, options: Options<S>): boolean =>
    options.overlap !== false || isSpanFree(model.spans, span)

  const commit = (
    model: Model,
    span: S,
    reason: typeof Reason.Type,
    action: SpanAction,
  ): Result => {
    const previous = model.spans.find(other => other.id === span.id)
    const next =
      action === 'delete'
        ? model.spans.filter(other => other.id !== span.id)
        : replace(model.spans, span)
    return {
      model: { ...model, spans: next },
      outMessage: OutMessage.ChangedSpans({
        spans: next,
        span,
        reason,
        action,
        movedTrack: previous !== undefined && previous.track !== span.track,
      }),
    }
  }

  const remove = (
    model: Model,
    id: string,
    reason: typeof Reason.Type,
  ): Result => {
    const span = model.spans.find(other => other.id === id)
    if (!span) return { model }
    return commit(
      Option.exists(model.drag, drag => drag.original.id === id)
        ? { ...model, drag: Option.none() }
        : model,
      span,
      reason,
      'delete',
    )
  }

  const edit = (
    model: Model,
    id: string,
    patch: Partial<Omit<S, 'id'>>,
    options: Options<S> = {},
  ): Result => {
    const span = model.spans.find(other => other.id === id)
    if (!span) return { model }
    const keep =
      patch.start === undefined
        ? 'start'
        : patch.end === undefined
          ? 'end'
          : 'size'
    const next = fit({ ...span, ...patch, id }, keep, options)
    if (!allowed(model, next, options)) return { model }
    const result = commit(model, next, 'imperative', 'move')
    return { ...result, model: reflect(model, result.model.spans, options) }
  }

  const reflect = (
    model: Model,
    spans: ReadonlyArray<S>,
    options: Options<S>,
  ): Model => {
    const next = { ...model, spans }
    if (Option.isNone(model.drag)) return next
    const drag = model.drag.value
    const current = spans.find(other => other.id === drag.original.id)
    if (drag.action === 'draw' ? current !== undefined : current === undefined)
      return { ...next, drag: Option.none() }
    if (
      Option.exists(drag.preview, preview => !allowed(next, preview, options))
    )
      return { ...next, drag: Option.none() }
    const preview = current
      ? Option.map(drag.preview, preview => ({
          ...current,
          track: preview.track,
          start: preview.start,
          end: preview.end,
        }))
      : drag.preview
    return { ...next, drag: Option.some({ ...drag, preview }) }
  }

  const propose = (
    drag: Drag,
    rects: ReadonlyArray<TrackRect>,
    point: typeof Point.Type,
    options: Options<S>,
  ): S | undefined => {
    const { original, anchor } = drag
    const rect =
      (drag.action === 'move'
        ? nearestTrack(rects, point, options.axis)
        : undefined) ?? rects.find(({ track }) => track === original.track)
    if (!rect) return undefined
    const at = rawValueAt(rect, point, options)
    if (drag.action === 'draw') {
      return at >= anchor
        ? fit(
            { ...original, start: anchor, end: snap(at, options, Math.ceil) },
            'start',
            options,
          )
        : fit(
            { ...original, start: snap(at, options, Math.floor) },
            'end',
            options,
          )
    }
    if (drag.action === 'resize') {
      return Option.exists(drag.edge, edge => edge === 'start')
        ? fit({ ...original, start: snap(at, options) }, 'end', options)
        : fit({ ...original, end: snap(at, options) }, 'start', options)
    }
    const start = snap(at - anchor, options)
    return fit(
      {
        ...original,
        track: rect.track,
        start,
        end: start + original.end - original.start,
      },
      'size',
      options,
    )
  }

  const keydown = (
    model: Model,
    { id, key, shift, rtl }: Extract<Message, { _tag: 'PressedKey' }>,
    options: Options<S>,
  ): Result => {
    const span = model.spans.find(other => other.id === id)
    if (!span || Option.isSome(model.drag) || options.isDisabled?.(span))
      return { model }
    if (key === 'Delete' || key === 'Backspace')
      return remove(model, id, 'remove-press')
    const [left, right] = rtl
      ? ['ArrowRight', 'ArrowLeft']
      : ['ArrowLeft', 'ArrowRight']
    const [back, forward, before, after] =
      options.axis === 'x'
        ? [left, right, 'ArrowUp', 'ArrowDown']
        : ['ArrowUp', 'ArrowDown', left, right]
    let next = span
    let action: SpanAction = 'move'
    if (key === back || key === forward) {
      const delta = limits(options).step * (key === forward ? 1 : -1)
      if (shift) {
        action = 'resize'
        next = fit(
          { ...span, end: cleanNumber(span.end + delta) },
          'start',
          options,
        )
      } else {
        const start = cleanNumber(span.start + delta)
        next = fit(
          { ...span, start, end: start + span.end - span.start },
          'size',
          options,
        )
      }
    } else if (!shift && (key === before || key === after)) {
      const order = options.tracks ?? [
        ...new Set(model.spans.map(({ track }) => track)),
      ]
      const index = order.indexOf(span.track)
      const track =
        index < 0 ? undefined : order[index + (key === after ? 1 : -1)]
      if (track !== undefined) next = { ...span, track }
    }
    return sameRange(span, next) || !allowed(model, next, options)
      ? { model }
      : commit(model, next, 'move-key', action)
  }

  const cancel = (model: Model): Result => {
    if (Option.isNone(model.drag)) return { model }
    const drag = model.drag.value
    return {
      model: { ...model, drag: Option.none() },
      ...(drag.started && drag.action !== 'draw'
        ? { outMessage: OutMessage.CancelledEdit({ span: drag.original }) }
        : {}),
    }
  }

  const update = (
    model: Model,
    message: Message,
    options: Options<S> = {},
  ): Result =>
    Message.match<Result>(message, {
      PressedTrack: ({ rect, point, pointerId }) => {
        if (Option.isSome(model.drag) || !options.create) return { model }
        const start = snap(
          rawValueAt(rect, point, options),
          options,
          Math.floor,
        )
        const { max, step } = limits(options)
        const end = Math.min(max, cleanNumber(start + step))
        const original = Option.getOrUndefined(
          options.create({ track: rect.track, start, end }),
        )
        return !original || model.spans.some(({ id }) => id === original.id)
          ? { model }
          : {
              model: {
                ...model,
                drag: Option.some({
                  original: { ...original, track: rect.track, start, end },
                  preview: Option.none(),
                  action: 'draw',
                  edge: Option.none(),
                  pointerId,
                  origin: point,
                  anchor: start,
                  started: false,
                }),
              },
            }
      },
      PressedSpan: ({ id, edge, rect, point, pointerId }) => {
        const original = model.spans.find(other => other.id === id)
        if (
          Option.isSome(model.drag) ||
          !original ||
          original.track !== rect.track ||
          options.isDisabled?.(original)
        )
          return { model }
        const anchor = rawValueAt(rect, point, options) - original.start
        return {
          model: {
            ...model,
            drag: Option.some({
              original,
              preview: Option.none(),
              action: Option.isNone(edge) ? 'move' : 'resize',
              edge,
              pointerId,
              origin: point,
              anchor,
              started: false,
            }),
          },
        }
      },
      MovedPointer: ({ rects, point, pointerId }) => {
        if (
          Option.isNone(model.drag) ||
          model.drag.value.pointerId !== pointerId
        )
          return { model }
        const drag = model.drag.value
        if (
          !drag.started &&
          Math.max(
            Math.abs(point.x - drag.origin.x),
            Math.abs(point.y - drag.origin.y),
          ) < DRAG_THRESHOLD
        )
          return { model }
        const proposed = propose(drag, rects, point, options)
        const current = model.spans.find(other => other.id === drag.original.id)
        const next =
          proposed && current
            ? {
                ...current,
                track: proposed.track,
                start: proposed.start,
                end: proposed.end,
              }
            : proposed
        const preview =
          next && allowed(model, next, options)
            ? Option.some(next)
            : drag.preview
        return {
          model: {
            ...model,
            drag: Option.some({ ...drag, started: true, preview }),
          },
        }
      },
      ReleasedPointer: ({ pointerId }) => {
        if (
          Option.isNone(model.drag) ||
          model.drag.value.pointerId !== pointerId
        )
          return { model }
        const drag = model.drag.value
        const released = { ...model, drag: Option.none() }
        const candidate =
          !drag.started && drag.action === 'draw' && options.size !== undefined
            ? fit(
                {
                  ...drag.original,
                  start: drag.anchor,
                  end: drag.anchor + options.size,
                },
                'size',
                options,
              )
            : Option.getOrUndefined(drag.preview)
        return candidate && allowed(model, candidate, options)
          ? commit(released, candidate, 'drag', drag.action)
          : { model: released }
      },
      CancelledPointer: ({ pointerId }) =>
        Option.exists(model.drag, drag => drag.pointerId === pointerId)
          ? cancel(model)
          : { model },
      CancelledDrag: () => cancel(model),
      PressedKey: key => keydown(model, key, options),
      ReflectedSpans: ({ spans }) => ({
        model: reflect(model, spans, options),
      }),
      RemovedSpan: ({ id }) => remove(model, id, 'imperative'),
    })

  return {
    Model,
    Message,
    OutMessage,
    init,
    update,
    edit,
    spans,
    spansOn,
    action,
    spanAttrs,
  }
}
