import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  NumberField,
  NumberFieldEvents,
  NumberFieldProps,
} from '@effect/ui-kit'
import { Effect, Queue, Schema, Stream } from 'effect'

export type {
  NumberFieldEvents,
  NumberFieldFormat,
  NumberFieldProps,
} from '@effect/ui-kit'

/** A complete fractional draft is invalid in integer mode. Let the kit
 * handle incomplete signs, locale accents, range checks and formatting. */
export const isFractionalNumberInput = (
  value: string,
  locale?: string,
): boolean => {
  const formatter = new Intl.NumberFormat(locale)
  const sample = formatter.formatToParts(-12345.6)
  const decimal = sample.find(part => part.type === 'decimal')?.value ?? '.'
  const group = sample.find(part => part.type === 'group')?.value
  const minusSign = sample.find(part => part.type === 'minusSign')?.value ?? '-'
  let text = value.trim().replace(/[\s\p{Bidi_Control}]/gu, '')
  if (group !== undefined && group !== decimal)
    text = text.replaceAll(group, '')
  text = text.replaceAll(decimal, '.').replaceAll(minusSign, '-')
  const digits = new Intl.NumberFormat(locale, { useGrouping: false })
  for (let n = 0; n <= 9; n += 1) {
    const formatted = digits.format(n)
    if (formatted !== String(n)) text = text.replaceAll(formatted, String(n))
  }
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return false
  const parsed = Number(text)
  return Number.isFinite(parsed) && !Number.isInteger(parsed)
}

const Message = UiSchema.TaggedEnum({
  FocusChanged: { focused: Schema.Boolean },
  NumberEvent: { event: NumberFieldEvents },
})
type Message = typeof Message.Type

const Observe = Mount.makeStream(
  'ObserveCreaseNumberInput',
  { args: {} },
  (root: HTMLDivElement) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const inputTarget = (event: Event) =>
          event.target instanceof HTMLInputElement &&
          event.target.type === 'text'
            ? event.target
            : undefined
        const focus = (event: FocusEvent) => {
          if (inputTarget(event) !== undefined) {
            Queue.offerUnsafe(
              queue,
              Message.FocusChanged({ focused: event.type === 'focusin' }),
            )
          }
        }
        const invalid = (value: string) =>
          root.hasAttribute('data-integer-only') &&
          isFractionalNumberInput(value, root.dataset.numberLocale)
        const beforeInput = (event: InputEvent) => {
          const input = inputTarget(event)
          if (
            input === undefined ||
            event.data === null ||
            event.isComposing ||
            !event.inputType.startsWith('insert')
          )
            return
          const start = input.selectionStart ?? input.value.length
          const end = input.selectionEnd ?? start
          if (
            !invalid(
              input.value.slice(0, start) + event.data + input.value.slice(end),
            )
          )
            return
          event.preventDefault()
          event.stopPropagation()
        }
        const input = (event: Event) => {
          const target = inputTarget(event)
          if (
            target === undefined ||
            (event instanceof InputEvent && event.isComposing) ||
            !invalid(target.value)
          )
            return
          // Autofill and some browser input methods cannot cancel beforeinput.
          target.value = target.dataset.numberInputDraft ?? ''
          event.stopPropagation()
        }
        const paste = (event: ClipboardEvent) => {
          const text = event.clipboardData?.getData('text/plain')
          if (
            inputTarget(event) === undefined ||
            text === undefined ||
            !invalid(text)
          )
            return
          event.preventDefault()
          event.stopPropagation()
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            root.addEventListener('focusin', focus)
            root.addEventListener('focusout', focus)
            root.addEventListener('beforeinput', beforeInput, true)
            root.addEventListener('input', input, true)
            root.addEventListener('paste', paste, true)
          }),
          () =>
            Effect.sync(() => {
              root.removeEventListener('focusin', focus)
              root.removeEventListener('focusout', focus)
              root.removeEventListener('beforeinput', beforeInput, true)
              root.removeEventListener('input', input, true)
              root.removeEventListener('paste', paste, true)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

export const NumberInputBehavior = Html.component({
  name: 'CreaseNumberInput',
  props: Schema.Struct({
    ...NumberFieldProps.fields,
    integerOnly: Schema.optional(Schema.Boolean),
    customDisplay: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ focused: Schema.Boolean }),
  message: Message,
  events: NumberFieldEvents,
}).make({
  init: () => ({ focused: false }),
  update: {
    FocusChanged: ($, { focused }) => $.evolve({ focused }),
    NumberEvent: ($, { event }) =>
      $.props.integerOnly &&
      event.value !== null &&
      !Number.isInteger(event.value)
        ? $.model
        : $.emit(event),
  },
  parts: (p, model) => {
    const { integerOnly, customDisplay, ...props } = p.props
    const observe = p.part('div', element =>
      integerOnly || customDisplay
        ? element
            .attrs({
              'data-integer-only': integerOnly ? '' : undefined,
              'data-number-locale':
                typeof props.locale === 'string'
                  ? props.locale
                  : props.locale?.[0],
            })
            .onMount(Observe())
        : element,
    )
    return p.child(NumberField, {
      props: {
        ...props,
        step:
          integerOnly &&
          (props.step === undefined ||
            props.step <= 0 ||
            !Number.isInteger(props.step))
            ? 1
            : props.step,
      },
      onEmit: event => Message.NumberEvent({ event }),
      parts: field => ({
        ...field,
        observe,
        focused: model.focused,
        displayValue: (formatValue?: (value: number) => string) =>
          model.focused || formatValue === undefined || field.value === null
            ? field.inputValue
            : formatValue(field.value),
      }),
    })
  },
})
