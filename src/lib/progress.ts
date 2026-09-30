export type ProgressState = 'determinate' | 'indeterminate'
export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete'
export type NormalizedProgress = Readonly<{
  value: number | null
  max: number
  state: ProgressState
  status: ProgressStatus
  percentage: number | null
  defaultAriaValueText: string
}>

export const normalizeProgress = (value: number | null, max = 100): NormalizedProgress => {
  const normalizedMax = Number.isFinite(max) && max > 0 ? max : 100
  if (value === null)
    return {
      value: null,
      max: normalizedMax,
      state: 'indeterminate',
      status: 'indeterminate',
      percentage: null,
      defaultAriaValueText: 'indeterminate progress',
    }
  const normalizedValue = Number.isFinite(value) ? Math.min(normalizedMax, Math.max(0, value)) : 0
  const percentage = (normalizedValue / normalizedMax) * 100
  return {
    value: normalizedValue,
    max: normalizedMax,
    state: 'determinate',
    status: normalizedValue === normalizedMax ? 'complete' : 'progressing',
    percentage,
    defaultAriaValueText: (percentage / 100).toLocaleString(undefined, { style: 'percent' }),
  }
}
