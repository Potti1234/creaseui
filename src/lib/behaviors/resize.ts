export type Box = Readonly<{
  x: number
  y: number
  width: number
  height: number
}>
export type Handle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'move'
type Size = Readonly<{ width: number; height: number }>
export type Limits = Readonly<{
  min?: Size
  max?: Size
  bounds?: Readonly<{
    left: number
    right: number
    top: number
    bottom: number
  }>
  aspect?: number
}>

export const clampTo = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export const resizeBox = (
  box: Box,
  handle: Handle,
  dx: number,
  dy: number,
  limits: Limits = {},
): Box => {
  const {
    left = -Infinity,
    right = Infinity,
    top = -Infinity,
    bottom = Infinity,
  } = limits.bounds ?? {}
  if (handle === 'move') {
    return {
      ...box,
      x: clampTo(box.x + dx, left, Math.max(left, right - box.width)),
      y: clampTo(box.y + dy, top, Math.max(top, bottom - box.height)),
    }
  }

  const west = handle.includes('w')
  const east = handle.includes('e')
  const north = handle.includes('n')
  const south = handle.includes('s')
  const horizontal = west || east
  const vertical = north || south
  const anchorX = west ? box.x + box.width : box.x
  const anchorY = north ? box.y + box.height : box.y
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  const roomX = Math.min(
    limits.max?.width ?? Infinity,
    west
      ? anchorX - left
      : east
        ? right - anchorX
        : 2 * Math.min(centerX - left, right - centerX),
  )
  const roomY = Math.min(
    limits.max?.height ?? Infinity,
    north
      ? anchorY - top
      : south
        ? bottom - anchorY
        : 2 * Math.min(centerY - top, bottom - centerY),
  )
  const minWidth = limits.min?.width ?? 1
  const minHeight = limits.min?.height ?? 1
  let width = box.width + (west ? -dx : east ? dx : 0)
  let height = box.height + (north ? -dy : south ? dy : 0)
  const ratio = limits.aspect

  if (ratio !== undefined && Number.isFinite(ratio) && ratio > 0) {
    const useWidth =
      horizontal &&
      (!vertical ||
        Math.abs(width - box.width) / Math.max(box.width, 1) >=
          Math.abs(height - box.height) / Math.max(box.height, 1))
    width = clampTo(
      useWidth ? width : height * ratio,
      Math.max(minWidth, minHeight * ratio),
      Math.min(roomX, roomY * ratio),
    )
    height = width / ratio
  } else {
    if (horizontal) width = clampTo(width, minWidth, roomX)
    if (vertical) height = clampTo(height, minHeight, roomY)
  }

  return {
    x: west ? anchorX - width : east ? anchorX : centerX - width / 2,
    y: north ? anchorY - height : south ? anchorY : centerY - height / 2,
    width,
    height,
  }
}
