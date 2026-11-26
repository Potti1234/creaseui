import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Option, Schema as S } from 'effect'

export type TimeValue = string

const pad2 = (n: number): string => n.toString().padStart(2, '0')

/** Parses "HH:MM" or "HH:MM:SS" into minutes-since-midnight (+ seconds). */
export const parseISOTime = (
  value: string,
): Readonly<{ minutes: number; seconds: number }> | null => {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/u.exec(value.trim())
  if (match === null) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = match[3] === undefined ? 0 : Number(match[3])
  if (hours > 23 || minutes > 59 || seconds > 59) return null
  return { minutes: hours * 60 + minutes, seconds }
}

/** "HH:MM" or "HH:MM:SS" from minutes-since-midnight. */
export const formatISOTime = (
  minutes: number,
  seconds = 0,
  includeSeconds = false,
): string =>
  `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(((minutes % 60) + 60) % 60)}${includeSeconds ? `:${pad2(seconds)}` : ''}`

export const formatDisplayTime = (
  value: string,
  options: Readonly<{
    hourFormat: '12h' | '24h'
    hasSeconds?: boolean | undefined
  }>,
): string => {
  const parsed = parseISOTime(value)
  if (parsed === null) return value
  const hours = Math.floor(parsed.minutes / 60)
  const minutes = parsed.minutes % 60
  const secondsPart =
    options.hasSeconds === true ? `:${pad2(parsed.seconds)}` : ''
  if (options.hourFormat === '24h') {
    return `${pad2(hours)}:${pad2(minutes)}${secondsPart}`
  }
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${pad2(minutes)}${secondsPart} ${period}`
}

/** astryx's flexible time parser: "2:30 PM", "2pm", "1430", "14:30:45". */
export const parseTimeInput = (
  input: string,
  includeSeconds: boolean,
): TimeValue | null => {
  const text = input.trim().toLowerCase()
  if (text === '') return null

  const meridiem = /([ap])\.?m?\.?$/u.exec(text)
  const meridiemShift = meridiem === null ? null : meridiem[1] === 'p'
  const core = meridiem === null ? text : text.slice(0, meridiem.index).trim()

  let hours: number | null = null
  let minutes = 0
  let seconds = 0

  const colonMatch = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/u.exec(core)
  const digitsMatch = /^(\d{3,6})$/u.exec(core)
  const singleMatch = /^(\d{1,2})$/u.exec(core)

  if (colonMatch !== null && core.includes(':')) {
    hours = Number(colonMatch[1])
    minutes = colonMatch[2] === undefined ? 0 : Number(colonMatch[2])
    seconds = colonMatch[3] === undefined ? 0 : Number(colonMatch[3])
  } else if (digitsMatch !== null) {
    const digits = digitsMatch[1] ?? ''
    const pad = digits.length % 2 === 0 ? digits : `0${digits}`
    hours = Number(pad.slice(0, 2))
    minutes = Number(pad.slice(2, 4))
    seconds = pad.length >= 6 ? Number(pad.slice(4, 6)) : 0
  } else if (singleMatch !== null) {
    hours = Number(singleMatch[1])
  } else {
    return null
  }

  if (hours === null || hours > 24 || minutes > 59 || seconds > 59) return null
  if (seconds > 0 && !includeSeconds) return null

  if (meridiemShift !== null) {
    if (hours > 12) return null
    if (meridiemShift) {
      hours = hours === 12 ? 12 : hours + 12
    } else {
      hours = hours === 12 ? 0 : hours
    }
  }
  if (hours === 24) hours = 0

  return formatISOTime(hours * 60 + minutes, seconds, includeSeconds)
}

/** Minute-of-day comparison for range checks. */
export const compareTime = (a: TimeValue, b: TimeValue): number => {
  const left = parseISOTime(a)
  const right = parseISOTime(b)
  if (left === null || right === null) return 0
  return left.minutes - right.minutes
}

export const isTimeInRange = (
  value: TimeValue,
  min: TimeValue | undefined,
  max: TimeValue | undefined,
): boolean =>
  (min === undefined || compareTime(value, min) >= 0) &&
  (max === undefined || compareTime(value, max) <= 0)

/** Shifts a time by `delta` minutes, wrapping inside the 24h day. */
export const adjustTime = (
  value: TimeValue,
  delta: number,
): TimeValue | null => {
  const parsed = parseISOTime(value)
  if (parsed === null) return null
  const minutes = (((parsed.minutes + delta) % 1440) + 1440) % 1440
  return formatISOTime(minutes, parsed.seconds, parsed.seconds > 0)
}

/** Parses any supported typed input AND reports whether it landed in range. */
export const resolveTimeDraft = (
  text: string,
  options: Readonly<{
    includeSeconds: boolean
    min?: TimeValue | undefined
    max?: TimeValue | undefined
  }>,
): Option.Option<TimeValue> => {
  const parsed = parseTimeInput(text, options.includeSeconds)
  if (parsed === null || !isTimeInRange(parsed, options.min, options.max)) {
    return Option.none()
  }
  return Option.some(parsed)
}

export type TimeInputCommit =
  | Readonly<{ kind: 'commit'; value: TimeValue }>
  | Readonly<{ kind: 'clear' }>
  | Readonly<{ kind: 'revert' }>

/** Blur/Enter resolution for the pending draft. */
export const resolveTimeInputCommit = (
  pendingInput: string | undefined,
  options: Readonly<{
    includeSeconds: boolean
    hasClear?: boolean | undefined
    min?: TimeValue | undefined
    max?: TimeValue | undefined
  }>,
): TimeInputCommit => {
  if (pendingInput === undefined) return { kind: 'revert' }
  if (pendingInput.trim() === '') {
    return { kind: 'clear' }
  }
  const resolved = resolveTimeDraft(pendingInput, options)
  return Option.match(resolved, {
    onSome: value => ({ kind: 'commit', value }) as TimeInputCommit,
    onNone: () => ({ kind: 'revert' }) as TimeInputCommit,
  })
}

/* --- Submodel ----------------------------------------------------------- */

export const TimePart = S.Literals(['hour', 'minute', 'second', 'period'])
export type TimePart = typeof TimePart.Type

export type TimePickerOptions = Readonly<{
  hourFormat: '12h' | '24h'
  hasSeconds: boolean
  min?: string | undefined
  max?: string | undefined
}>

/** Changes one segment, preserving the others and respecting the time window. */
export const resolveTimePart = (
  value: string | null | undefined,
  part: TimePart,
  selected: string,
  options: TimePickerOptions,
): string | null => {
  const base = parseISOTime(value ?? '') ??
    parseISOTime(options.min ?? '') ?? {
      minutes: 0,
      seconds: 0,
    }
  let hour = Math.floor(base.minutes / 60)
  let minute = base.minutes % 60
  let second = options.hasSeconds ? base.seconds : 0
  const number = /^\d{1,2}$/u.test(selected) ? Number(selected) : NaN
  switch (part) {
    case 'hour':
      if (options.hourFormat === '12h') {
        if (number < 1 || number > 12 || !Number.isInteger(number)) return null
        hour = (number % 12) + (hour >= 12 ? 12 : 0)
      } else {
        if (number < 0 || number > 23 || !Number.isInteger(number)) return null
        hour = number
      }
      break
    case 'minute':
    case 'second':
      if (number < 0 || number > 59 || !Number.isInteger(number)) return null
      if (part === 'minute') minute = number
      else if (options.hasSeconds) second = number
      else return null
      break
    case 'period':
      if (selected !== 'AM' && selected !== 'PM') return null
      hour = (hour % 12) + (selected === 'PM' ? 12 : 0)
      break
  }
  const candidate = hour * 3600 + minute * 60 + second
  const secondsOf = (time: string | undefined, fallback: number): number => {
    const parsed = parseISOTime(time ?? '')
    return parsed === null ? fallback : parsed.minutes * 60 + parsed.seconds
  }
  const minimumSeconds = secondsOf(options.min, 0)
  const maximumSeconds = secondsOf(options.max, 86399)
  const minimum = options.hasSeconds
    ? minimumSeconds
    : Math.ceil(minimumSeconds / 60) * 60
  const maximum = options.hasSeconds
    ? maximumSeconds
    : Math.floor(maximumSeconds / 60) * 60
  if (minimum > maximum) return null
  const clamped = Math.min(maximum, Math.max(minimum, candidate))
  // Hours at the edge of a window remain selectable, e.g. 10:00 -> 10:15.
  // Other segments never silently change the value the user just selected.
  if (clamped !== candidate) {
    if (part === 'hour' && Math.floor(clamped / 3600) !== hour) return null
    if (part === 'period' && clamped >= 43200 !== hour >= 12) return null
    if (part === 'minute' || part === 'second') return null
  }
  return formatISOTime(
    Math.floor(clamped / 60),
    clamped % 60,
    options.hasSeconds,
  )
}

export const timePartValue = (
  value: string | null | undefined,
  part: TimePart,
  hourFormat: '12h' | '24h',
): Option.Option<string> => {
  const parsed = parseISOTime(value ?? '')
  if (parsed === null) return Option.none()
  const hour = Math.floor(parsed.minutes / 60)
  switch (part) {
    case 'hour':
      return Option.some(pad2(hourFormat === '12h' ? hour % 12 || 12 : hour))
    case 'minute':
      return Option.some(pad2(parsed.minutes % 60))
    case 'second':
      return Option.some(pad2(parsed.seconds))
    case 'period':
      return Option.some(hour >= 12 ? 'PM' : 'AM')
  }
}

export const timePartOptions = (
  part: TimePart,
  hourFormat: '12h' | '24h',
): ReadonlyArray<string> =>
  part === 'period'
    ? ['AM', 'PM']
    : Array.from(
        { length: part === 'hour' ? (hourFormat === '12h' ? 12 : 24) : 60 },
        (_, index) =>
          pad2(index + (part === 'hour' && hourFormat === '12h' ? 1 : 0)),
      )

const TimeProps = S.Struct({
  value: S.NullOr(S.String),
  min: S.optional(S.String),
  max: S.optional(S.String),
  hourFormat: S.optional(S.Literals(['12h', '24h'])),
  hasSeconds: S.optional(S.Boolean),
  increment: S.optional(S.Int.check(S.isGreaterThan(0))),
  disabled: S.optional(S.Boolean),
  readOnly: S.optional(S.Boolean),
  required: S.optional(S.Boolean),
  name: S.optional(S.String),
  form: S.optional(S.String),
})
export type TimeProps = typeof TimeProps.Type

const Message = UiSchema.TaggedEnum({
  Edited: { draft: S.String },
  Committed: {},
  Reset: {},
  Cleared: {},
  Stepped: { direction: S.Literals([-1, 1]) },
  ChangedPart: { part: TimePart, value: S.String },
})
const Events = UiSchema.TaggedEnum({
  Committed: { value: S.NullOr(S.String) },
})
export type TimeEvents = typeof Events.Type
const pickerOptions = (props: TimeProps): TimePickerOptions => ({
  hourFormat: props.hourFormat ?? '12h',
  hasSeconds: props.hasSeconds ?? false,
  min: props.min,
  max: props.max,
})

export const TimeInputBehavior = Html.component({
  name: 'CreaseTimeInput',
  props: TimeProps,
  model: S.Struct({ draft: S.NullOr(S.String) }),
  message: Message,
  events: Events,
}).make({
  init: () => ({ draft: null }),
  update: {
    Edited: ($, { draft }) => $.evolve({ draft }),
    Reset: $ => $.evolve({ draft: null }),
    Cleared: $ =>
      $.evolve({ draft: null }).emit(Events.Committed({ value: null })),
    Committed: $ => {
      const result = resolveTimeInputCommit($.model.draft ?? undefined, {
        includeSeconds: $.props.hasSeconds ?? false,
        min: $.props.min,
        max: $.props.max,
      })
      const reset = $.evolve({ draft: null })
      return result.kind === 'revert'
        ? reset
        : reset.emit(
            Events.Committed({
              value: result.kind === 'clear' ? null : result.value,
            }),
          )
    },
    Stepped: ($, { direction }) => {
      const base =
        parseTimeInput($.model.draft ?? '', $.props.hasSeconds ?? false) ??
        $.props.value ??
        $.props.min ??
        '00:00'
      const next = adjustTime(base, direction * ($.props.increment ?? 1))
      if (next === null || !isTimeInRange(next, $.props.min, $.props.max))
        return $.model
      const time = parseISOTime(next)
      return time === null
        ? $.model
        : $.evolve({ draft: null }).emit(
            Events.Committed({
              value: formatISOTime(
                time.minutes,
                time.seconds,
                $.props.hasSeconds,
              ),
            }),
          )
    },
    ChangedPart: ($, { part, value }) => {
      const next = resolveTimePart(
        $.props.value,
        part,
        value,
        pickerOptions($.props),
      )
      return next === null ? $.model : $.emit(Events.Committed({ value: next }))
    },
  },
  parts: (p, { draft }) => {
    const { value, disabled, readOnly, required, name, form } = p.props
    const opts = pickerOptions(p.props)
    const locked = disabled || readOnly
    const visible =
      draft ?? (value === null ? '' : formatDisplayTime(value, opts))
    return {
      visible,
      value,
      invalid:
        draft !== null &&
        draft.trim() !== '' &&
        Option.isNone(
          resolveTimeDraft(draft, {
            includeSeconds: opts.hasSeconds,
            min: opts.min,
            max: opts.max,
          }),
        ),
      pickerOptions: opts,
      input: p.part('input', input =>
        input
          .attrs({
            type: 'text',
            form,
            required: required ? '' : undefined,
            readonly: readOnly ? '' : undefined,
          })
          .disabled(disabled === true)
          .value(visible)
          .on('input', ({ value }) =>
            locked ? undefined : Message.Edited({ draft: value }),
          )
          .on('blur', () => (locked ? undefined : Message.Committed()))
          .on(
            'keydown',
            ({ key, alt, ctrl, composing, meta }) => {
              if (locked || alt || ctrl || composing || meta) return undefined
              switch (key) {
                case 'Enter':
                  return draft === null ? undefined : Message.Committed()
                case 'Escape':
                  return draft === null ? undefined : Message.Reset()
                case 'ArrowUp':
                  return Message.Stepped({ direction: 1 })
                case 'ArrowDown':
                  return Message.Stepped({ direction: -1 })
                default:
                  return undefined
              }
            },
            { preventDefault: true },
          ),
      ),
      segment: p.part('select', (element, part: TimePart) =>
        element
          .disabled(Boolean(locked))
          .value(
            Option.getOrElse(
              timePartValue(value, part, opts.hourFormat),
              () => '',
            ),
          )
          .on('change', ({ value }) =>
            locked ? undefined : Message.ChangedPart({ part, value }),
          ),
      ),
      clear: p.part('button', button =>
        button
          .attr('type', 'button')
          .disabled(Boolean(locked))
          .on('click', () => (locked ? undefined : Message.Cleared())),
      ),
      submitted: p.part('input', input =>
        input
          .attrs({ type: 'hidden', name, form })
          .disabled(disabled === true)
          .value(value ?? ''),
      ),
    }
  },
})
