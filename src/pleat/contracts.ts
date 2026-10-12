import type { Style } from '@pleat/core'

/**
 * The only styles accepted at a component call site: properties that position
 * a component in its parent without changing its color, typography, internal
 * spacing, shape, or interaction states. Visual changes belong in a named
 * component variant instead.
 *
 * Pleat styles are opaque, so this contract is documentation-level: the same
 * property allowlist as the StyleX port applies (aspectRatio, alignSelf,
 * flexBasis/Grow/Shrink, gridArea/Column/Row, height/width, justifySelf,
 * margins, max/min sizes, order).
 */
export type ComponentLayoutStyle = Style.Style

export const BUTTON_VARIANTS = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]

export const BUTTON_SIZES = [
  'default',
  'xs',
  'sm',
  'lg',
  'icon',
  'icon-xs',
  'icon-sm',
  'icon-lg',
] as const

export type ButtonSize = (typeof BUTTON_SIZES)[number]

export const BADGE_VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
] as const

export type BadgeVariant = (typeof BADGE_VARIANTS)[number]

/** Fails typechecking when a style map and its public union drift apart. */
export type HasExactlyKeys<Actual, Expected extends PropertyKey> =
  Exclude<keyof Actual, Expected> extends never
    ? Exclude<Expected, keyof Actual> extends never
      ? true
      : false
    : false

export type Assert<T extends true> = T
