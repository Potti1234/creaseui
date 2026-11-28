import { Mount } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { OTPField, OTPFieldEvents, OTPFieldProps } from '@effect/ui-kit'
import { Effect, Queue, Redacted, Schema, Stream } from 'effect'

export type {
  OTPFieldEvents,
  OTPFieldProps,
  OTPFieldValidationType,
} from '@effect/ui-kit'

const Pattern = Schema.Struct({ source: Schema.String, flags: Schema.String })
export type InputOtpPattern = typeof Pattern.Type

export const normalizeInputOtp = (
  value: string,
  length: number,
  pattern: RegExp,
) =>
  Array.from(value)
    .filter(character => {
      pattern.lastIndex = 0
      return pattern.test(character)
    })
    .slice(0, Math.max(0, Math.trunc(length)))
    .join('')

/** Filter text before the kit allocates it across its slots. */
const GuardPattern = Mount.makeStream(
  'GuardCreaseOtpPattern',
  { args: Pattern.fields },
  (root: HTMLDivElement, { source, flags }, changes) =>
    Stream.callback<OTPFieldEvents>(queue =>
      Effect.gen(function* () {
        const window = root.ownerDocument.defaultView
        if (window === null) return yield* Effect.never
        let pattern = new RegExp(source, flags)
        const inputTarget = (event: Event) => {
          const target = event.composedPath()[0]
          return target instanceof HTMLInputElement &&
            root.contains(target) &&
            !target.disabled &&
            !target.readOnly
            ? target
            : undefined
        }
        const clean = (value: string) =>
          normalizeInputOtp(value, Infinity, pattern)
        const reject = (
          value: string,
          reason: 'input-change' | 'input-paste',
        ) =>
          Queue.offerUnsafe(
            queue,
            OTPFieldEvents.Rejected({ value: Redacted.make(value), reason }),
          )
        const beforeInput = (event: InputEvent) => {
          if (
            inputTarget(event) === undefined ||
            event.data === null ||
            event.data === '' ||
            event.isComposing ||
            !event.inputType.startsWith('insert') ||
            clean(event.data) !== ''
          )
            return
          event.preventDefault()
          event.stopPropagation()
          reject(event.data, 'input-change')
        }
        const paste = (event: ClipboardEvent) => {
          const input = inputTarget(event)
          const text = event.clipboardData?.getData('text/plain')
          if (input === undefined || text === undefined) return
          const value = clean(text)
          if (value === text) return
          event.preventDefault()
          event.stopPropagation()
          reject(text, 'input-paste')
          if (value === '') return
          const data = new DataTransfer()
          data.setData('text/plain', value)
          input.dispatchEvent(
            new ClipboardEvent('paste', {
              bubbles: true,
              cancelable: true,
              composed: true,
              clipboardData: data,
            }),
          )
        }
        const filterInput = (event: Event) => {
          const input = inputTarget(event)
          if (
            input === undefined ||
            (event instanceof InputEvent && event.isComposing)
          )
            return
          const text = input.value
          const value = clean(text)
          if (text === value) return
          input.value = value
          reject(text, 'input-change')
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            // Capture before Effect UI delegates these events from its app root.
            window.addEventListener('beforeinput', beforeInput, true)
            window.addEventListener('paste', paste, true)
            window.addEventListener('input', filterInput, true)
          }),
          () =>
            Effect.sync(() => {
              window.removeEventListener('beforeinput', beforeInput, true)
              window.removeEventListener('paste', paste, true)
              window.removeEventListener('input', filterInput, true)
            }),
        )
        yield* changes.pipe(
          Stream.runForEach(next =>
            Effect.sync(() => {
              pattern = new RegExp(next.source, next.flags)
            }),
          ),
          Effect.forkScoped,
        )
        return yield* Effect.never
      }),
    ),
)

/** Keep the kit's slot navigation, controlled completion, and form integration. */
export const InputOtpBehavior = Html.component({
  name: 'CreaseInputOtp',
  props: Schema.Struct({
    ...OTPFieldProps.fields,
    pattern: Schema.optional(Pattern),
  }),
  model: Schema.Null,
  message: OTPFieldEvents,
  events: OTPFieldEvents,
  restore: false,
}).make({
  init: () => null,
  update: {
    Updated: ($, event) => {
      if ($.props.pattern === undefined) return $.emit(event)
      const pattern = new RegExp($.props.pattern.source, $.props.pattern.flags)
      const raw = Redacted.value(event.value)
      const value = normalizeInputOtp(raw, $.props.length, pattern)
      if (value === raw) return $.emit(event)
      const updated = OTPFieldEvents.Updated({
        ...event,
        value: Redacted.make(value),
      })
      return event.reason === 'input-change' || event.reason === 'input-paste'
        ? $.emit(
            OTPFieldEvents.Rejected({
              value: event.value,
              reason: event.reason,
            }),
          ).emit(updated)
        : $.emit(updated)
    },
    Completed: ($, event) => $.emit(event),
    Rejected: ($, event) => $.emit(event),
  },
  parts: p => {
    const { pattern, value, length, validationType, inputMode, ...props } =
      p.props
    const accepted =
      pattern === undefined
        ? value
        : Redacted.make(
            normalizeInputOtp(
              Redacted.value(value),
              length,
              new RegExp(pattern.source, pattern.flags),
            ),
          )
    const guard =
      pattern === undefined
        ? null
        : p.part('div', element => element.onMount(GuardPattern(pattern)))
    return p.child(OTPField, {
      props: {
        ...props,
        length,
        value: accepted,
        validationType: pattern === undefined ? validationType : 'none',
        inputMode: inputMode ?? (pattern === undefined ? undefined : 'text'),
      },
      onEmit: event => event,
      parts: otp => ({ ...otp, guard }),
    })
  },
})
