import { Option } from 'effect'
import type { ChildAttribute } from 'foldkit/html'
import { Slider as SliderPrimitive } from '@foldkit/ui'

export type NormalizedRange = Readonly<{
  min: number
  max: number
  step: number
}>

export const normalizeRange = (
  firstBound: number,
  secondBound: number,
  requestedStep = 1,
): NormalizedRange => ({
  min: Math.min(firstBound, secondBound),
  max: Math.max(firstBound, secondBound),
  step: Number.isFinite(requestedStep) && requestedStep > 0 ? requestedStep : 1,
})

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(Number.isFinite(value) ? value : min, max))

export const clampRangeValue = (value: number, min: number, max: number): number =>
  clamp(value, min, max)

/* Decimal precision of a step/bound, matching Base UI's getDecimalPrecision:
   sub-1 magnitudes are measured via exponential notation so both the mantissa
   decimals and the exponent count (1.5e-8 -> 9, 1e-8 -> 8, 0.05 -> 2). */
const decimalPlaces = (value: number): number => {
  if (value === 0) return 0
  if (Math.abs(value) < 1) {
    const [mantissa, exponent] = value.toExponential().split('e-')
    return (mantissa?.split('.')[1]?.length ?? 0) + Number(exponent)
  }
  return value.toString().split('.')[1]?.length ?? 0
}

export const snapRangeValue = (
  value: number,
  range: NormalizedRange,
): number => {
  const snapped = range.min + Math.round((value - range.min) / range.step) * range.step
  const precision = Math.max(decimalPlaces(range.min), decimalPlaces(range.step))
  return Number(clamp(snapped, range.min, range.max).toFixed(precision))
}

export const normalizeRangeValues = (
  values: readonly [number, number],
  range: NormalizedRange,
): readonly [number, number] => {
  const first = snapRangeValue(values[0], range)
  const second = snapRangeValue(values[1], range)
  return first <= second ? [first, second] : [second, first]
}

export const updateRangeValue = (
  values: readonly [number, number],
  index: 0 | 1,
  nextValue: number,
  range: NormalizedRange,
): readonly [number, number] => {
  const next = snapRangeValue(nextValue, range)
  return index === 0
    ? [Math.min(next, values[1]), values[1]]
    : [values[0], Math.max(next, values[0])]
}

export const normalizeMultiValues = (
  values: readonly number[],
  range: NormalizedRange,
): readonly number[] =>
  values.map((value) => snapRangeValue(value, range)).sort((a, b) => a - b)

export const updateMultiValue = (
  values: readonly number[],
  index: number,
  nextValue: number,
  range: NormalizedRange,
): readonly number[] => {
  const lowerBound = index === 0 ? range.min : (values[index - 1] ?? range.min)
  const upperBound =
    index === values.length - 1 ? range.max : (values[index + 1] ?? range.max)
  const next = clamp(snapRangeValue(nextValue, range), lowerBound, upperBound)
  return values.map((value, i) => (i === index ? next : value))
}

/* Reads the attribute tag of a ChildAttribute bundle member so a skin can
   replace one primitive handler (e.g. the thumb keydown) while keeping the
   rest of the bundle. */
export const childAttributeTag = (attribute: ChildAttribute): string | undefined => {
  const value = attribute.attribute
  return typeof value === 'object' && value !== null && '_tag' in value &&
      typeof value._tag === 'string'
    ? value._tag
    : undefined
}

// SINGLE-THUMB MODEL
/* Base UI's default largeStep. The primitive hard-codes page moves to step*10;
   carrying largeStep on the model lets update honor a configured grid. */
export const DEFAULT_LARGE_STEP = 10

export type Model = SliderPrimitive.Model & Readonly<{ largeStep?: number }>
export type InitConfig = SliderPrimitive.InitConfig & Readonly<{ largeStep?: number }>

export const init = (config: InitConfig): Model => ({
  ...SliderPrimitive.init(config),
  largeStep: config.largeStep ?? DEFAULT_LARGE_STEP,
})

export const snapAndClamp = (
  value: number,
  min: number,
  max: number,
  step: number,
): number => snapRangeValue(value, normalizeRange(min, max, step))

export type KeyboardDirection = SliderPrimitive.PressedKeyboardNavigation['direction']

/* Base UI key mapping: Shift promotes an arrow move to a largeStep move, so it
   shares the Page direction used by PageUp/PageDown. */
export const sliderKeyDirection = (
  key: string,
  shiftKey: boolean,
): Option.Option<KeyboardDirection> => {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return Option.some(shiftKey ? 'PageIncrement' : 'StepIncrement')
    case 'ArrowLeft':
    case 'ArrowDown':
      return Option.some(shiftKey ? 'PageDecrement' : 'StepDecrement')
    case 'PageUp':
      return Option.some('PageIncrement')
    case 'PageDown':
      return Option.some('PageDecrement')
    case 'Home':
      return Option.some('Min')
    case 'End':
      return Option.some('Max')
    default:
      return Option.none()
  }
}

/* Base UI's getNewValue: add increment to the (already step-rounded) value and
   correct to the coarsest precision among value, increment, and min — without
   snapping the result to the step grid. */
const stepTowards = (
  thumbValue: number,
  increment: number,
  direction: 1 | -1,
  range: NormalizedRange,
): number => {
  const next = thumbValue + increment * direction
  const precision = Math.max(
    decimalPlaces(thumbValue),
    decimalPlaces(increment),
    decimalPlaces(range.min),
  )
  return clamp(Number(next.toFixed(precision)), range.min, range.max)
}

/* Base UI keyboard move: the current value is rounded onto the step grid
   first, then one `step` (arrows) or `largeStep` (PageUp/PageDown, Shift+arrow)
   is applied in the requested direction. */
export const nextKeyboardValue = (
  value: number,
  direction: KeyboardDirection,
  range: NormalizedRange,
  largeStep: number,
): number => {
  switch (direction) {
    case 'Min':
      return range.min
    case 'Max':
      return range.max
    case 'StepIncrement':
    case 'StepDecrement':
    case 'PageIncrement':
    case 'PageDecrement': {
      const isPage = direction === 'PageIncrement' || direction === 'PageDecrement'
      const sign = direction === 'StepIncrement' || direction === 'PageIncrement' ? 1 : -1
      return stepTowards(
        snapRangeValue(value, range),
        isPage ? largeStep : range.step,
        sign,
        range,
      )
    }
  }
}

type UpdateResult = Readonly<{
  model: Model
  commands?: ReturnType<typeof SliderPrimitive.update>['commands']
  outMessage?: typeof SliderPrimitive.OutMessage.Type | undefined
}>

/* Wraps the primitive update with Base UI semantics: keyboard moves honor
   largeStep and exponent steps, and pointer-driven value snaps are recomputed
   with snapRangeValue (the primitive's snapAndClamp cannot parse e-notation
   steps). Model transitions still come from the primitive. */
export const update = (
  model: Model,
  message: typeof SliderPrimitive.Message.Type,
): UpdateResult => {
  const range = { min: model.min, max: model.max, step: model.step }
  if (message._tag === 'PressedKeyboardNavigation') {
    const next = nextKeyboardValue(
      message.value,
      message.direction,
      range,
      model.largeStep ?? DEFAULT_LARGE_STEP,
    )
    return next === message.value
      ? { model }
      : {
          model,
          outMessage: SliderPrimitive.OutMessage.ChangedValue({ value: next }),
        }
  }
  const result = SliderPrimitive.update(model, message)
  if (result.outMessage?._tag !== 'ChangedValue') return result
  if (message._tag === 'MovedDragPointer') {
    return {
      ...result,
      outMessage: SliderPrimitive.OutMessage.ChangedValue({
        value: snapRangeValue(message.value, range),
      }),
    }
  }
  if (message._tag === 'PressedPointer') {
    const snapped = snapRangeValue(message.value, range)
    return {
      ...result,
      outMessage:
        snapped === message.originValue
          ? undefined
          : SliderPrimitive.OutMessage.ChangedValue({ value: snapped }),
    }
  }
  return result
}
