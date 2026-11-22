const valid = (distance: number, dimension: number, coefficient: number) =>
  Number.isFinite(distance) &&
  Number.isFinite(dimension) &&
  Number.isFinite(coefficient) &&
  dimension > 0 &&
  coefficient > 0

export const rubberBand = (
  overshoot: number,
  dimension: number,
  coefficient = 0.55,
): number => {
  if (!valid(overshoot, dimension, coefficient) || overshoot <= 0) return 0
  return (1 - 1 / ((overshoot * coefficient) / dimension + 1)) * dimension
}

export const rubberBandInverse = (
  shown: number,
  dimension: number,
  coefficient = 0.55,
): number => {
  if (!valid(shown, dimension, coefficient) || shown <= 0) return 0
  const ratio = Math.min(shown / dimension, 0.999999)
  return ((1 / (1 - ratio) - 1) * dimension) / coefficient
}

export const rubberBandSlope = (
  overshoot: number,
  dimension: number,
  coefficient = 0.55,
): number => {
  if (!valid(overshoot, dimension, coefficient)) return 0
  if (overshoot <= 0) return 1
  const base = (overshoot * coefficient) / dimension + 1
  return coefficient / (base * base)
}
