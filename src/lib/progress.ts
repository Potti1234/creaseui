import type { Attribute, HtmlBuilder } from 'foldkit/html'

export type ProgressState = 'determinate' | 'indeterminate'
export type NormalizedProgress = Readonly<{
  value: number | null
  max: number
  state: ProgressState
  percentage: number | null
}>

export const normalizeProgress = (
  value: number | null,
  max = 100,
): NormalizedProgress => {
  const normalizedMax = Number.isFinite(max) && max > 0 ? max : 100
  if (value === null)
    return {
      value: null,
      max: normalizedMax,
      state: 'indeterminate',
      percentage: null,
    }
  const normalizedValue = Number.isFinite(value)
    ? Math.min(normalizedMax, Math.max(0, value))
    : 0
  return {
    value: normalizedValue,
    max: normalizedMax,
    state: 'determinate',
    percentage: (normalizedValue / normalizedMax) * 100,
  }
}

export const progressLabelId = (id: string): string => `${id}-label`

export const progressAttributes = <Msg>(
  props: Readonly<{
    id?: string
    value: number | null
    max: number
    ariaLabel?: string
    valueText?: string
  }>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Attribute<Msg>> => [
  ...(props.id === undefined ? [] : [h.Id(props.id)]),
  h.Role('progressbar'),
  ...(props.value === null
    ? []
    : [
        h.AriaValuemin(0),
        h.AriaValuemax(props.max),
        h.AriaValuenow(props.value),
      ]),
  ...(props.valueText === undefined ? [] : [h.AriaValuetext(props.valueText)]),
  ...(props.ariaLabel !== undefined
    ? [h.AriaLabel(props.ariaLabel)]
    : props.id === undefined
      ? []
      : [h.AriaLabelledBy(progressLabelId(props.id))]),
]

export const progressStateAttributes = <Msg>(
  value: number | null,
  max: number,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Attribute<Msg>> =>
  value === null
    ? [
        h.DataAttribute('state', 'indeterminate'),
        h.DataAttribute('indeterminate', ''),
      ]
    : [
        h.DataAttribute('value', String(value)),
        h.DataAttribute('min', '0'),
        h.DataAttribute('max', String(max)),
        h.DataAttribute('state', value >= max ? 'complete' : 'loading'),
      ]
