import { Command, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Popover, Slider } from '@effect/ui-kit'
import { Effect, Option, Queue, Schema, Stream } from 'effect'

import {
  colorFormats,
  colorToString,
  hsvToRgb,
  parseColorString,
  rgbToHsv,
  type HsvColor,
} from './color-math'
export * from './color-math'

const Hsv = Schema.Struct({
  h: Schema.Number,
  s: Schema.Number,
  v: Schema.Number,
  a: Schema.Number,
})
const Format = Schema.Literals(colorFormats)
const Message = UiSchema.TaggedEnum({
  Edited: { text: Schema.String },
  Committed: {},
  FormattingChanged: { format: Format },
  Chosen: { text: Schema.String },
  Previewed: { text: Schema.NullOr(Schema.String) },
  ChangedArea: { saturation: Schema.Number, value: Schema.Number },
  ChangedHue: { hue: Schema.Number },
  ChangedAlpha: { alpha: Schema.Number },
  Opened: { triggerId: Schema.NullOr(Schema.String) },
  Closed: {},
  EyeDropperAvailable: {},
  SamplingRequested: {},
  SamplingCanceled: {},
})
type Message = typeof Message.Type
const Events = UiSchema.TaggedEnum({
  Picked: { color: Schema.String },
  OpenChanged: { open: Schema.Boolean },
})

const read = (text: string | undefined) =>
  text === undefined
    ? undefined
    : Option.getOrUndefined(Option.map(parseColorString(text), rgbToHsv))
const hex = (color: HsvColor) => colorToString(hsvToRgb(color), 'hex')
const bounded = (value: number) => Math.min(100, Math.max(0, value))

const Area = Mount.makeStream(
  'CreaseColorPickerArea',
  { args: {} },
  (target: HTMLDivElement) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        let pointer: number | undefined
        const disabled = () => target.getAttribute('aria-disabled') === 'true'
        const emit = (saturation: number, value: number) =>
          Queue.offerUnsafe(
            queue,
            Message.ChangedArea({
              saturation: bounded(saturation),
              value: bounded(value),
            }),
          )
        const pick = (event: PointerEvent) => {
          const rect = target.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0)
            emit(
              (100 * (event.clientX - rect.left)) / rect.width,
              (100 * (rect.bottom - event.clientY)) / rect.height,
            )
        }
        const down = (event: PointerEvent) => {
          if (event.button !== 0 || pointer !== undefined || disabled()) return
          target.focus()
          target.setPointerCapture(event.pointerId)
          pointer = event.pointerId
          pick(event)
        }
        const move = (event: PointerEvent) => {
          if (pointer === event.pointerId && !disabled()) pick(event)
        }
        const stop = (event: PointerEvent) => {
          if (pointer !== event.pointerId) return
          pointer = undefined
          if (target.hasPointerCapture(event.pointerId))
            target.releasePointerCapture(event.pointerId)
        }
        const key = (event: KeyboardEvent) => {
          if (disabled() || event.ctrlKey || event.metaKey || event.altKey)
            return
          const step = event.shiftKey || event.key.startsWith('Page') ? 10 : 1
          const dx =
            event.key === 'ArrowLeft'
              ? -step
              : event.key === 'ArrowRight'
                ? step
                : 0
          const dy = ['ArrowDown', 'PageDown'].includes(event.key)
            ? -step
            : ['ArrowUp', 'PageUp'].includes(event.key)
              ? step
              : 0
          if (dx === 0 && dy === 0) return
          event.preventDefault()
          emit(
            Number(target.dataset.saturation) + dx,
            Number(target.dataset.value) + dy,
          )
        }
        const controller = new AbortController()
        const { signal } = controller
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            target.addEventListener('pointerdown', down, { signal })
            target.addEventListener('pointermove', move, { signal })
            target.addEventListener('pointerup', stop, { signal })
            target.addEventListener('pointercancel', stop, { signal })
            target.addEventListener('lostpointercapture', stop, { signal })
            target.addEventListener('keydown', key, { signal })
          }),
          () =>
            Effect.sync(() => {
              controller.abort()
              if (pointer !== undefined && target.hasPointerCapture(pointer))
                target.releasePointerCapture(pointer)
            }),
        )
        return yield* Effect.never
      }),
    ),
)
const DetectSampler = Mount.makeStream(
  'DetectCreaseEyeDropper',
  { args: {} },
  (target: HTMLDivElement) =>
    typeof target.ownerDocument.defaultView?.EyeDropper === 'function'
      ? Stream.make(Message.EyeDropperAvailable())
      : Stream.empty,
)
const Sample = Command.make(
  'CreasePickPixel',
  { args: {}, mode: 'switch' },
  () =>
    Effect.tryPromise(async () => {
      const EyeDropper = window.EyeDropper
      if (EyeDropper === undefined) return null
      return (await new EyeDropper().open()).sRGBHex
    }).pipe(
      Effect.match({
        onSuccess: text =>
          text === null ? Message.SamplingCanceled() : Message.Chosen({ text }),
        onFailure: () => Message.SamplingCanceled(),
      }),
    ),
)

const Props = Schema.Struct({
  value: Schema.optional(Schema.String),
  defaultValue: Schema.optional(Schema.String),
  defaultFormat: Schema.optional(Format),
  open: Schema.optional(Schema.Boolean),
  disabled: Schema.optional(Schema.Boolean),
})
const Model = Schema.Struct({
  color: Hsv,
  draft: Schema.NullOr(Schema.String),
  error: Schema.Boolean,
  format: Format,
  open: Schema.Boolean,
  triggerId: Schema.NullOr(Schema.String),
  sampler: Schema.Boolean,
  preview: Schema.NullOr(Hsv),
})
const effective = (props: typeof Props.Type, model: typeof Model.Type) => {
  const parsed = read(props.value)
  return parsed === undefined || hex(parsed) === hex(model.color)
    ? model.color
    : parsed
}
const number = (value: number | readonly number[]) =>
  typeof value === 'number' ? value : (value[0] ?? 0)

export const ColorPickerBehavior = Html.component({
  name: 'CreaseColorPicker',
  props: Props,
  model: Model,
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({
    color: read(props.value ?? props.defaultValue) ?? {
      h: 0,
      s: 100,
      v: 100,
      a: 1,
    },
    draft: null,
    error: false,
    format: props.defaultFormat ?? 'hex',
    open: false,
    triggerId: null,
    sampler: false,
    preview: null,
  }),
  update: {
    Edited: ($, { text }) => $.evolve({ draft: text, error: false }),
    Committed: $ => {
      if ($.model.draft === null || $.props.disabled) return $.model
      const color = read($.model.draft)
      return color === undefined
        ? $.evolve({ error: true })
        : $.evolve({ color, draft: null, error: false }).emit(
            Events.Picked({ color: hex(color) }),
          )
    },
    FormattingChanged: ($, { format }) =>
      $.evolve({ format, draft: null, error: false }),
    Chosen: ($, { text }) => {
      if ($.props.disabled) return $.model
      const color = read(text)
      return color === undefined
        ? $.model
        : $.evolve({ color, draft: null, error: false, preview: null }).emit(
            Events.Picked({ color: hex(color) }),
          )
    },
    Previewed: ($, { text }) =>
      $.evolve({
        preview:
          text === null || $.props.disabled ? null : (read(text) ?? null),
      }),
    ChangedArea: ($, { saturation, value }) => {
      if ($.props.disabled) return $.model
      const color = { ...effective($.props, $.model), s: saturation, v: value }
      return $.evolve({ color, draft: null, error: false }).emit(
        Events.Picked({ color: hex(color) }),
      )
    },
    ChangedHue: ($, { hue }) => {
      if ($.props.disabled) return $.model
      const color = { ...effective($.props, $.model), h: hue === 360 ? 0 : hue }
      return $.evolve({ color, draft: null, error: false }).emit(
        Events.Picked({ color: hex(color) }),
      )
    },
    ChangedAlpha: ($, { alpha }) => {
      if ($.props.disabled) return $.model
      const color = { ...effective($.props, $.model), a: alpha / 100 }
      return $.evolve({ color, draft: null, error: false }).emit(
        Events.Picked({ color: hex(color) }),
      )
    },
    Opened: ($, { triggerId }) =>
      $.evolve({ open: true, triggerId }).emit(
        Events.OpenChanged({ open: true }),
      ),
    Closed: $ =>
      $.evolve({ open: false, preview: null }).emit(
        Events.OpenChanged({ open: false }),
      ),
    EyeDropperAvailable: $ => $.evolve({ sampler: true }),
    SamplingRequested: $ =>
      $.props.disabled ? $.model : $.run(Sample.make({})),
    SamplingCanceled: $ => $.model,
  },
  parts: (p, model) => {
    const color = effective(p.props, model)
    const disabled = p.props.disabled === true
    const root = p.part('div', element => element.onMount(DetectSampler()))
    const area = p.part('div', element =>
      element.onMount(Area()).attrs({
        role: 'slider',
        tabindex: disabled ? '-1' : '0',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': String(Math.round(color.s)),
        'aria-valuetext': `Saturation ${Math.round(color.s)}%, brightness ${Math.round(color.v)}%`,
        'aria-disabled': disabled ? 'true' : undefined,
        'data-saturation': String(color.s),
        'data-value': String(color.v),
      }),
    )
    const text = p.part('input', element =>
      element
        .value(model.draft ?? colorToString(hsvToRgb(color), model.format))
        .disabled(disabled)
        .attr('aria-invalid', model.error ? 'true' : undefined)
        .on('input', ({ value }) => Message.Edited({ text: value }))
        .on('blur', Message.Committed())
        .on(
          'keydown',
          ({ key, composing }) =>
            key === 'Enter' && !composing ? Message.Committed() : undefined,
          { preventDefault: true },
        ),
    )
    const format = p.part('select', element =>
      element.disabled(disabled).on('change', ({ value }) => {
        const format = colorFormats.find(format => format === value)
        return format === undefined
          ? undefined
          : Message.FormattingChanged({ format })
      }),
    )
    const sample = p.part('button', element =>
      element
        .attr('type', 'button')
        .disabled(disabled)
        .on('click', Message.SamplingRequested()),
    )
    const preset = p.part('button', (element, value: string) =>
      element
        .attr('type', 'button')
        .disabled(disabled)
        .on('click', Message.Chosen({ text: value }))
        .on('mouseenter', Message.Previewed({ text: value }))
        .on('mouseleave', Message.Previewed({ text: null })),
    )
    return p.child(Popover, {
      props: {
        open: p.props.open ?? model.open,
        triggerId: model.triggerId,
        align: 'start',
        sideOffset: 6,
      },
      onEmit: {
        RequestedOpen: ({ triggerId }) => Message.Opened({ triggerId }),
        RequestedClose: () => Message.Closed(),
        Settled: () => undefined,
      },
      parts: popup =>
        p.child(Slider, {
          key: 'hue',
          props: { value: color.h, min: 0, max: 359, step: 1, disabled },
          onEmit: {
            Moved: ({ value }) => Message.ChangedHue({ hue: number(value) }),
            Committed: () => undefined,
          },
          parts: hue =>
            p.child(Slider, {
              key: 'alpha',
              props: {
                value: color.a * 100,
                min: 0,
                max: 100,
                step: 1,
                disabled,
              },
              onEmit: {
                Moved: ({ value }) =>
                  Message.ChangedAlpha({ alpha: number(value) }),
                Committed: () => undefined,
              },
              parts: alpha => ({
                root,
                popup,
                area,
                text,
                format,
                sample,
                preset,
                hue,
                alpha,
                color,
                hex: hex(color),
                swatch: hex(model.preview ?? color),
                formatValue: model.format,
                sampler: model.sampler,
                error: model.error,
                disabled,
              }),
            }),
        }),
    })
  },
})
