import { Style } from '@pleat/core'
import type { Declarations, Properties } from '@pleat/core'

/**
 * The only Pleat properties accepted at a component call site.
 *
 * These properties position a component in its parent without changing the
 * component's color, typography, internal spacing, shape, or interaction
 * states. Visual changes belong in a named component variant instead.
 */
export type ComponentLayoutProperties = Pick<
  Properties,
  | 'aspectRatio'
  | 'alignSelf'
  | 'flexBasis'
  | 'flexGrow'
  | 'flexShrink'
  | 'gridArea'
  | 'gridColumn'
  | 'gridColumnEnd'
  | 'gridColumnStart'
  | 'gridRow'
  | 'gridRowEnd'
  | 'gridRowStart'
  | 'height'
  | 'justifySelf'
  | 'margin'
  | 'marginBlock'
  | 'marginBlockEnd'
  | 'marginBlockStart'
  | 'marginBottom'
  | 'marginInline'
  | 'marginInlineEnd'
  | 'marginInlineStart'
  | 'marginLeft'
  | 'marginRight'
  | 'marginTop'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'order'
  | 'width'
>

declare const componentLayoutBrand: unique symbol

/**
 * A {@link Style.Style} proven to contain only {@link ComponentLayoutProperties}.
 * Only {@link layoutStyle} produces this type, so a raw `Style.make` result —
 * which may restyle the component — is rejected at the call site.
 */
export type ComponentLayoutStyle = Style.Style & {
  readonly [componentLayoutBrand]: 'ComponentLayoutStyle'
}

const LAYOUT_PROPERTY_NAMES: ReadonlySet<string> = new Set([
  'aspectRatio',
  'alignSelf',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'height',
  'justifySelf',
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'order',
  'width',
])

/**
 * The only way to construct a {@link ComponentLayoutStyle}: the property
 * allowlist is enforced at the type level by {@link ComponentLayoutProperties}
 * and at runtime for untyped callers.
 */
export const layoutStyle = (
  declarations: ComponentLayoutProperties,
): ComponentLayoutStyle => {
  for (const property of Object.keys(declarations)) {
    if (!LAYOUT_PROPERTY_NAMES.has(property)) {
      throw new Error(
        `layoutStyle only accepts parent-layout properties, got "${property}"`,
      )
    }
  }
  return Style.make(declarations as Declarations) as ComponentLayoutStyle
}

type _RawStyleIsNotLayout = Assert<
  Style.Style extends ComponentLayoutStyle ? false : true
>

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
