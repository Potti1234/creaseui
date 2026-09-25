import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type ButtonBehaviorProps,
  type ButtonLinkBehaviorProps,
  renderButton,
  renderButtonLink,
} from '@/lib/button'
import type {
  Assert,
  ButtonSize,
  ButtonVariant,
  ComponentLayoutStyle,
  HasExactlyKeys,
} from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export type { ButtonSize, ButtonVariant } from './contracts'

const base = stylex.create({
  root: {
    borderColor: {
      default: tokens.transparent,
      ':focus-visible': tokens.ring,
    },
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 0,
    gap: '0.5rem',
    alignItems: 'center',
    appearance: 'none',
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-visible': tokens.focusRingShadow,
    },
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    transform: {
      default: 'none',
      ':active': interactionTokens.pressTransform,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionDuration: {
      default: interactionTokens.motionFast,
      '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone,
    },
    transitionProperty: 'background-color, color, border-color, box-shadow, transform',
    transitionTimingFunction: interactionTokens.easingStandard,
    whiteSpace: 'nowrap',
  },
  disabled: {
    cursor: interactionTokens.cursorDisabled,
    opacity: 0.5,
    pointerEvents: 'none',
  },
})

const variants = stylex.create({
  default: {
    backgroundColor: {
      default: tokens.primary,
      ':hover': tokens.buttonPrimaryHover,
    },
    color: tokens.primaryForeground,
  },
  destructive: {
    backgroundColor: {
      default: tokens.softDestructiveSurface,
      ':hover': tokens.softDestructiveHover,
    },
    color: tokens.destructive,
  },
  outline: {
    borderColor: tokens.border,
    borderWidth: 1,
    backgroundColor: {
      default: tokens.background,
      ':hover': tokens.muted,
    },
    boxShadow: tokens.shadowSm,
    color: tokens.foreground,
  },
  secondary: {
    backgroundColor: {
      default: tokens.secondary,
      ':hover': tokens.buttonSecondaryHover,
    },
    color: tokens.secondaryForeground,
  },
  ghost: {
    backgroundColor: {
      default: tokens.transparent,
      ':hover': tokens.mutedHover,
    },
    color: {
      default: tokens.foreground,
      ':hover': tokens.foreground,
    },
  },
  link: {
    backgroundColor: tokens.transparent,
    color: tokens.primary,
    textDecorationLine: {
      default: 'none',
      ':hover': 'underline',
    },
    textUnderlineOffset: '4px',
  },
})

const sizes = stylex.create({
  default: {
    gap: '0.375rem',
    paddingInline: '0.625rem',
    height: '2.25rem',
  },
  xs: {
    borderRadius: foundationTokens.radiusSm,
    gap: '0.25rem',
    paddingInline: '0.5rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    height: '1.5rem',
  },
  sm: {
    borderRadius: foundationTokens.radiusSm,
    gap: '0.25rem',
    paddingInline: '0.625rem',
    height: '2rem',
  },
  lg: {
    gap: '0.375rem',
    paddingInline: '0.625rem',
    height: '2.5rem',
  },
  icon: {
    paddingInline: 0,
    height: '2.25rem',
    width: '2.25rem',
  },
  'icon-xs': {
    borderRadius: foundationTokens.radiusSm,
    paddingInline: 0,
    height: '1.5rem',
    width: '1.5rem',
  },
  'icon-sm': {
    borderRadius: foundationTokens.radiusSm,
    paddingInline: 0,
    height: '2rem',
    width: '2rem',
  },
  'icon-lg': {
    paddingInline: 0,
    height: '2.5rem',
    width: '2.5rem',
  },
})

/* Upstream tightens horizontal padding when an icon sits at an edge
   (has-data-[icon=inline-*]); StyleX cannot select descendants, so the
   docs pass `iconInset` explicitly. */
const iconInset = stylex.create({
  startCompact: { paddingInlineStart: '0.375rem' },
  startRoomy: { paddingInlineStart: '0.5rem' },
  endCompact: { paddingInlineEnd: '0.375rem' },
  endRoomy: { paddingInlineEnd: '0.5rem' },
})

const shape = stylex.create({
  rounded: { borderRadius: foundationTokens.radiusFull },
})

type _VariantMapIsExhaustive = Assert<HasExactlyKeys<typeof variants, ButtonVariant>>
type _SizeMapIsExhaustive = Assert<HasExactlyKeys<typeof sizes, ButtonSize>>

const iconInsetFor = (size: ButtonSize, inset: 'start' | 'end') => {
  const compact = size === 'xs' || size === 'sm'
  return inset === 'start'
    ? compact
      ? iconInset.startCompact
      : iconInset.startRoomy
    : compact
      ? iconInset.endCompact
      : iconInset.endRoomy
}

export type ButtonProps<Msg> = ButtonBehaviorProps<Msg> & Readonly<{
  variant?: ButtonVariant
  size?: ButtonSize
  /** Edge-icon padding compensation matching has-data-[icon=inline-*]. */
  iconInset?: 'start' | 'end'
  /** Fully rounded pill shape (upstream `rounded-full`). */
  rounded?: boolean
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

/** The full visual recipe for embedding the button look on another element
   (e.g. a DropdownMenu trigger). Prefer `button()` in normal use. */
export const buttonVisualStyles = ({
  variant = 'default',
  size = 'default',
}: Readonly<{ variant?: ButtonVariant; size?: ButtonSize }> = {}): ReadonlyArray<StaticStyles> => [
  base.root,
  variants[variant],
  sizes[size],
]

export const button = <Msg>(props: ButtonProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const size = props.size ?? 'default'
  return renderButton(
    props,
    [h.Class(className(base.root, variants[props.variant ?? 'default'], sizes[size], (props.isDisabled === true || props.isLoading === true) && base.disabled, props.rounded === true && shape.rounded, ...(props.iconInset === undefined ? [] : [iconInsetFor(size, props.iconInset)]), props.layoutStyle))],
    h,
  )
}

export type ButtonLinkProps = ButtonLinkBehaviorProps & Readonly<{
  variant?: ButtonVariant
  size?: ButtonSize
  /** Edge-icon padding compensation matching has-data-[icon=inline-*]. */
  iconInset?: 'start' | 'end'
  /** Fully rounded pill shape (upstream `rounded-full`). */
  rounded?: boolean
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

export const buttonLink = <Msg>(
  props: ButtonLinkProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const size = props.size ?? 'default'
  return renderButtonLink(
    props,
    [h.Class(className(base.root, variants[props.variant ?? 'default'], sizes[size], props.rounded === true && shape.rounded, ...(props.iconInset === undefined ? [] : [iconInsetFor(size, props.iconInset)]), props.layoutStyle))],
    h,
  )
}
